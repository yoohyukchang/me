import type { Account, Holding, Security } from "../types";

/**
 * Contract any brokerage/investment data source must implement — Plaid today,
 * a Korean brokerage later. The Integrator only ever talks to this
 * interface, never to a specific vendor SDK.
 */
export interface HoldingsProvider {
  fetchHoldings(accessToken: string): Promise<{
    accounts: Account[];
    holdings: Holding[];
    securities: Security[];
  }>;
}

export interface InvestmentActivityResult {
  lastDate: string;
  vestUpserts: Array<{ transactionId: string; accountId: string; quantity: number }>;
  /** Net external cash in (+) or out (−) per account per day — deposits, withdrawals, 401(k) contributions. */
  cashFlows: Array<{ accountId: string; date: string; amount: number }>;
}

/** Contract for an investment account's activity feed: vest events and external cash flows. */
export interface InvestmentActivityProvider {
  fetchActivity(
    accessToken: string,
    accounts: Account[],
    sinceDate: string | null
  ): Promise<InvestmentActivityResult>;
}

/** Contract for a benchmark index's daily closes. */
export interface BenchmarkProvider {
  fetchDailyCloses(symbol: string, fromDate: string): Promise<Array<{ date: string; close: number }>>;
}

export interface AccountBalance {
  accountId: string;
  name: string;
  subtype: string | null;
  current: number;
}

/** Contract for live, institution-reported balances — Net Worth and the weekly snapshots. */
export interface BalanceProvider {
  fetchBalance(accessToken: string): Promise<number>;
  fetchAccountBalances(accessToken: string): Promise<AccountBalance[]>;
}
