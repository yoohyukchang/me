import { plaidClient } from "./client";
import { classifyAccountKind } from "../../types";
import type { VestedSharesResult, VestingProvider } from "../types";

const BACKFILL_MONTHS = 24;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthsAgoISO(months: number): string {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.toISOString().slice(0, 10);
}

/**
 * Watches a stock-plan account's investment transactions for vest events —
 * Plaid's definition of type "transfer" is "a position changing with no
 * buy/sell activity," exactly what a vest is. Valued at quantity x price
 * (the fair-market value at vesting). Unlike a bank's cursor-based sync,
 * /investments/transactions/get is a plain date range, so each call just
 * advances from the last processed date with a one-day overlap.
 */
export const plaidVestingProvider: VestingProvider = {
  async fetchVestedShares(accessToken, accounts, sinceDate): Promise<VestedSharesResult> {
    const accountKindById = new Map(
      accounts.map((a) => [a.accountId, classifyAccountKind(a.subtype, a.name)])
    );
    const startDate = sinceDate ?? monthsAgoISO(BACKFILL_MONTHS);
    const endDate = todayISO();

    const vestUpserts: VestedSharesResult["vestUpserts"] = [];
    const page = await plaidClient.investments.getTransactions({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });

    for await (const transaction of page) {
      const kind = accountKindById.get(transaction.account_id);
      if (kind !== "stock_plan") continue;
      if (transaction.type === "transfer" && transaction.subtype === "transfer") {
        vestUpserts.push({
          transactionId: transaction.investment_transaction_id,
          accountId: transaction.account_id,
          quantity: Math.abs(transaction.quantity),
        });
      }
    }

    return { lastDate: endDate, vestUpserts };
  },
};
