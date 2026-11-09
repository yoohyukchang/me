import type { BalanceProvider } from "../types";
import { plaidClient } from "./client";

// /accounts/balance/get fetches the live balance directly from the
// institution and is always available regardless of which product the
// Item was linked with.
export const plaidBalanceProvider: BalanceProvider = {
  async fetchBalance(accessToken) {
    const response = await plaidClient.accounts.getBalance({ access_token: accessToken });
    return response.accounts.reduce((sum, account) => sum + (account.balances.current ?? 0), 0);
  },
};
