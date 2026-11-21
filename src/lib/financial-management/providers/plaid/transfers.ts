import type { BalanceProvider } from "../types";
import { plaidClient } from "./client";

// /accounts/balance/get fetches the live balance directly from the
// institution and is always available regardless of which product the
// Item was linked with. Unlike /investments/holdings/get (Plaid's cached
// daily extraction, whose prices can lag a day), this reflects the
// institution's current account value.
export const plaidBalanceProvider: BalanceProvider = {
  async fetchAccountBalances(accessToken) {
    const response = await plaidClient.accounts.getBalance({ access_token: accessToken });
    return response.accounts.map((account) => ({
      accountId: account.account_id,
      name: account.name,
      subtype: account.subtype,
      current: account.balances.current ?? 0,
    }));
  },

  async fetchBalance(accessToken) {
    const balances = await this.fetchAccountBalances(accessToken);
    return balances.reduce((sum, b) => sum + b.current, 0);
  },
};
