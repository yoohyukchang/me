import { getUsdKrwRate } from "../fx";
import { toUnifiedHoldings } from "../holdings-view";
import { plaidHoldingsProvider } from "../providers/plaid/holdings";
import { plaidBalanceProvider } from "../providers/plaid/transfers";
import { plaidInvestmentActivityProvider } from "../providers/plaid/investment-activity";
import { yahooBenchmarkProvider } from "../providers/yahoo/benchmark";
import * as benchmarkStore from "../store/benchmark-prices";
import * as contributionsStore from "../store/contributions";
import * as holdingsStore from "../store/holdings";
import * as manualHoldingsStore from "../store/manual-holdings";
import * as netWorthStore from "../store/net-worth";
import * as plaidItemsStore from "../store/plaid-items";
import * as portfolioHistoryStore from "../store/portfolio-history";
import { BENCHMARK_SYMBOL, classifyAccountKind, type HoldingsSnapshot, type PlaidItem } from "../types";
import { reconcileVestedShares } from "./vesting";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Syncs a single Plaid Item against its provider and persists the result.
 * Never throws for ordinary Plaid errors — a broken connection is recorded
 * on the item (login_required or error) so the rest of the run, and the UI,
 * can carry on; the caller only needs to know it finished.
 */
export async function syncItem(item: PlaidItem): Promise<void> {
  try {
    if (item.product === "investments") {
      const { accounts, holdings, securities } = await plaidHoldingsProvider.fetchHoldings(
        item.accessToken
      );

      // RSU vests never touch a bank, and Plaid/Fidelity reports no
      // vested-vs-unvested split for a stock-plan account, so this is the
      // only way Portfolio Value counts just the vested portion of a grant.
      const activity = await plaidInvestmentActivityProvider.fetchActivity(
        item.accessToken,
        accounts,
        item.investmentTransactionsSince
      );
      const { deltasByAccount, ledger: vestedSharesLedger } = reconcileVestedShares(
        item.vestedSharesLedger,
        activity.vestUpserts
      );
      const vestedSharesByAccount = { ...item.vestedSharesByAccount };
      for (const [accountId, change] of Object.entries(deltasByAccount)) {
        vestedSharesByAccount[accountId] = (vestedSharesByAccount[accountId] ?? 0) + change;
      }

      const stockPlanAccountIds = new Set(
        accounts.filter((a) => classifyAccountKind(a.subtype, a.name) === "stock_plan").map((a) => a.accountId)
      );
      const cashSecurityIds = new Set(securities.filter((s) => s.isCashEquivalent).map((s) => s.securityId));
      const adjustedHoldings = holdings.map((h) => {
        if (!stockPlanAccountIds.has(h.accountId) || cashSecurityIds.has(h.securityId)) return h;
        const vestedQuantity = Math.min(vestedSharesByAccount[h.accountId] ?? 0, h.quantity);
        return { ...h, institutionValue: vestedQuantity * h.institutionPrice };
      });
      const totalValue = adjustedHoldings.reduce((sum, h) => sum + h.institutionValue, 0);

      await holdingsStore.saveCurrentHoldings({
        accounts,
        holdings: adjustedHoldings,
        securities,
        totalValue,
        lastSyncedAt: new Date().toISOString(),
      });

      // Deposits, withdrawals, and 401(k) contributions are the contribution
      // ledger for these accounts; manual entries cover everything else.
      const accountNameById = new Map(accounts.map((a) => [a.accountId, a.name]));
      for (const flow of activity.cashFlows) {
        await contributionsStore.upsertPlaidContribution({
          ...flow,
          note: accountNameById.get(flow.accountId) ?? "Fidelity",
        });
      }

      await plaidItemsStore.recordSyncSuccess(item.itemId, {
        investmentTransactionsSince: activity.lastDate,
        vestedSharesByAccount,
        vestedSharesLedger,
      });
      return;
    }

    const currentBalance = await plaidBalanceProvider.fetchBalance(item.accessToken);
    await plaidItemsStore.recordSyncSuccess(item.itemId, { currentBalance });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    if (message.includes("ITEM_LOGIN_REQUIRED")) {
      await plaidItemsStore.markLoginRequired(item.itemId);
    } else {
      await plaidItemsStore.recordSyncFailure(item.itemId, message);
    }
  }
}

/** Syncs every linked item without recording any History/Net Worth snapshot. */
export async function syncAllItems(): Promise<void> {
  const items = await plaidItemsStore.listPlaidItems();
  await Promise.all(items.map(syncItem));
}

/** The daily run: refreshes the Portfolio Holdings snapshot only. */
export async function refreshInvestmentHoldings(): Promise<void> {
  const items = await plaidItemsStore.listPlaidItems();
  await Promise.all(items.filter((item) => item.product === "investments").map(syncItem));
}

/**
 * Live value of an investment Item's accounts, as the institution reports it
 * right now. Stock-plan accounts are scaled down to their vested share using
 * the ratio the just-synced holdings snapshot applied, since the live balance
 * includes unvested shares.
 */
async function liveInvestmentValue(item: PlaidItem, snapshot: HoldingsSnapshot | undefined): Promise<number> {
  const balances = await plaidBalanceProvider.fetchAccountBalances(item.accessToken);
  let total = 0;
  for (const balance of balances) {
    if (classifyAccountKind(balance.subtype, balance.name) !== "stock_plan") {
      total += balance.current;
      continue;
    }
    const accountHoldings = snapshot?.holdings.filter((h) => h.accountId === balance.accountId) ?? [];
    const fullValue = accountHoldings.reduce((sum, h) => sum + h.quantity * h.institutionPrice, 0);
    const countedValue = accountHoldings.reduce((sum, h) => sum + h.institutionValue, 0);
    total += fullValue > 0 ? balance.current * (countedValue / fullValue) : balance.current;
  }
  return total;
}

/**
 * Stores benchmark daily closes from a week before the latest stored one
 * (overlap absorbs late corrections), or — when nothing is stored yet, or
 * a contribution is dated before the earliest stored close — from two
 * weeks before the earliest contribution.
 */
export async function refreshBenchmarkPrices(): Promise<void> {
  const [stored, contributions] = await Promise.all([
    benchmarkStore.listBenchmarkPrices(BENCHMARK_SYMBOL),
    contributionsStore.listContributions(),
  ]);
  const earliestNeeded = shiftDays(contributions[0]?.date ?? todayISO(), -14);
  const from =
    stored.length > 0 && stored[0].date <= earliestNeeded
      ? shiftDays(stored[stored.length - 1].date, -7)
      : earliestNeeded;
  const closes = await yahooBenchmarkProvider.fetchDailyCloses(BENCHMARK_SYMBOL, from);
  await benchmarkStore.saveBenchmarkPrices(closes.map((c) => ({ symbol: BENCHMARK_SYMBOL, ...c })));
}

/**
 * The Saturday run: syncs every item, then records this week's Portfolio
 * History and Net Worth snapshots from live institution balances (not the
 * holdings snapshot, whose prices can lag a day). The only writer of either
 * table.
 */
export async function runWeeklySnapshot(): Promise<void> {
  await syncAllItems();

  const refreshed = await plaidItemsStore.listPlaidItems();
  const activeTransferItems = refreshed.filter(
    (item) => item.product === "transactions" && item.status === "active"
  );

  // Two Items can share an institution name (e.g. a second Chase
  // connection) — disambiguate deterministically by itemId, so labels stay
  // stable across runs.
  const labelByItemId = new Map<string, string>();
  const nameCounts = new Map<string, number>();
  for (const item of [...activeTransferItems].sort((a, b) => a.itemId.localeCompare(b.itemId))) {
    const count = (nameCounts.get(item.institutionName) ?? 0) + 1;
    nameCounts.set(item.institutionName, count);
    labelByItemId.set(item.itemId, count > 1 ? `${item.institutionName} (${count})` : item.institutionName);
  }
  const depositoryBalances: Record<string, number> = {};
  for (const item of activeTransferItems) {
    if (item.currentBalance !== null) {
      depositoryBalances[labelByItemId.get(item.itemId)!] = item.currentBalance;
    }
  }

  const manualHoldings = await manualHoldingsStore.listManualHoldings();
  const fxRateUsdKrw = await getUsdKrwRate().catch(() => 0);
  const snapshot = await holdingsStore.getCurrentHoldings();
  const investmentItems = refreshed.filter((item) => item.product === "investments" && item.status === "active");
  const fidelityValue = (
    await Promise.all(investmentItems.map((item) => liveInvestmentValue(item, snapshot)))
  ).reduce((sum, v) => sum + v, 0);
  const { totalValueUsd: manualHoldingsValue } = toUnifiedHoldings(null, manualHoldings, fxRateUsdKrw);
  const portfolioValue = fidelityValue + manualHoldingsValue;

  const date = todayISO();
  await portfolioHistoryStore.recordPortfolioHistory({ date, portfolioValue });

  const depositoryTotal = Object.values(depositoryBalances).reduce((sum, v) => sum + v, 0);
  await netWorthStore.recordNetWorth({
    date,
    depositoryBalances,
    fidelityValue,
    total: depositoryTotal + fidelityValue,
    fxRateUsdKrw,
  });

  // Last, so a benchmark-source outage can't block the snapshots; a throw
  // here still fails the run, and the scheduler's retries re-record the
  // same (market-closed) Saturday values before trying again.
  await refreshBenchmarkPrices();
}
