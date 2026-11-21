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

export interface VestedSharesResult {
  lastDate: string;
  vestUpserts: Array<{ transactionId: string; accountId: string; quantity: number }>;
}

/** Contract for watching a stock-plan account's vest events. */
export interface VestingProvider {
  fetchVestedShares(
    accessToken: string,
    accounts: Account[],
    sinceDate: string | null
  ): Promise<VestedSharesResult>;
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
