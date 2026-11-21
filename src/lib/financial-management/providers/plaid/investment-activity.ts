import { plaidClient } from "./client";
import { classifyAccountKind } from "../../types";
import type { InvestmentActivityProvider, InvestmentActivityResult } from "../types";

const BACKFILL_MONTHS = 24;
// Plaid can post an investment transaction days after its date, so each
// run re-reads a trailing window. Both consumers are idempotent against it:
// vests reconcile per transaction id, cash flows are re-summed per whole day.
const LOOKBACK_DAYS = 14;
const CASH_FLOW_SUBTYPES = new Set(["deposit", "withdrawal", "contribution"]);

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftISO(date: string, { months = 0, days = 0 }: { months?: number; days?: number }): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * One /investments/transactions/get pass feeding two things:
 *
 * - Vests: on a stock-plan account, Plaid type "transfer" ("a position
 *   changing with no buy/sell activity") is exactly a vest.
 * - External cash flows: type "cash" with subtype deposit/withdrawal/
 *   contribution on any non-stock-plan account, summed per account per
 *   day. Plaid's `amount` is positive for cash leaving the account, so the
 *   sign is flipped. Days that net to zero (Fidelity's account-verification
 *   micro-deposits) are dropped.
 */
export const plaidInvestmentActivityProvider: InvestmentActivityProvider = {
  async fetchActivity(accessToken, accounts, sinceDate): Promise<InvestmentActivityResult> {
    const accountKindById = new Map(
      accounts.map((a) => [a.accountId, classifyAccountKind(a.subtype, a.name)])
    );
    const endDate = todayISO();
    const startDate = sinceDate
      ? shiftISO(sinceDate, { days: -LOOKBACK_DAYS })
      : shiftISO(endDate, { months: -BACKFILL_MONTHS });

    const vestUpserts: InvestmentActivityResult["vestUpserts"] = [];
    const flowByAccountDay = new Map<string, { accountId: string; date: string; amount: number }>();
    const page = await plaidClient.investments.getTransactions({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });

    for await (const transaction of page) {
      const kind = accountKindById.get(transaction.account_id);
      if (kind === "stock_plan") {
        if (transaction.type === "transfer" && transaction.subtype === "transfer") {
          vestUpserts.push({
            transactionId: transaction.investment_transaction_id,
            accountId: transaction.account_id,
            quantity: Math.abs(transaction.quantity),
          });
        }
        continue;
      }
      if (transaction.type === "cash" && CASH_FLOW_SUBTYPES.has(transaction.subtype)) {
        const key = `${transaction.account_id}|${transaction.date}`;
        const flow = flowByAccountDay.get(key) ?? { accountId: transaction.account_id, date: transaction.date, amount: 0 };
        flow.amount -= transaction.amount;
        flowByAccountDay.set(key, flow);
      }
    }

    const cashFlows = [...flowByAccountDay.values()]
      .map((f) => ({ ...f, amount: Math.round(f.amount * 100) / 100 }))
      .filter((f) => f.amount !== 0);

    return { lastDate: endDate, vestUpserts, cashFlows };
  },
};
