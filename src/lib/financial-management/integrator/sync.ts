import { getUsdKrwRate } from "../fx";
import { toUnifiedHoldings } from "../holdings-view";
import { plaidHoldingsProvider } from "../providers/plaid/holdings";
import { plaidBalanceProvider } from "../providers/plaid/transfers";
import { plaidVestingProvider } from "../providers/plaid/vesting";
import * as holdingsStore from "../store/holdings";
import * as manualHoldingsStore from "../store/manual-holdings";
import * as netWorthStore from "../store/net-worth";
import * as plaidItemsStore from "../store/plaid-items";
import * as portfolioHistoryStore from "../store/portfolio-history";
import { classifyAccountKind, type PlaidItem } from "../types";
import { reconcileVestedShares } from "./vesting";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
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
      const vestedResult = await plaidVestingProvider.fetchVestedShares(
        item.accessToken,
        accounts,
        item.investmentTransactionsSince
      );
      const { deltasByAccount, ledger: vestedSharesLedger } = reconcileVestedShares(
        item.vestedSharesLedger,
        vestedResult.vestUpserts
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

      await plaidItemsStore.recordSyncSuccess(item.itemId, {
        investmentTransactionsSince: vestedResult.lastDate,
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

/**
 * Runs every linked item, then derives this run's Portfolio History and Net
 * Worth snapshots from whatever synced successfully. The Lambda calls this
 * on the weekly schedule; the post-link exchange route calls it once inline
 * so a brand-new connection is populated immediately.
 */
export async function runFullSync(): Promise<void> {
  const items = await plaidItemsStore.listPlaidItems();
  await Promise.all(items.map(syncItem));

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
  const fidelityValue = (await holdingsStore.getCurrentHoldings())?.totalValue ?? 0;
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
}
