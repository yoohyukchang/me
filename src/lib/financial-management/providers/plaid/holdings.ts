import type { Account, Holding, Security } from "../../types";
import type { HoldingsProvider } from "../types";
import { reconcileCashHoldings } from "./cash-reconciliation";
import { plaidClient } from "./client";

export const plaidHoldingsProvider: HoldingsProvider = {
  async fetchHoldings(accessToken: string) {
    const response = await plaidClient.investments.getHoldings({ access_token: accessToken });

    const accounts: Account[] = response.accounts.map((account) => ({
      accountId: account.account_id,
      itemId: response.item.item_id,
      institutionName: response.item.institution_name ?? "Fidelity",
      name: account.name,
      subtype: account.subtype,
    }));

    const securities: Security[] = response.securities.map((security) => ({
      securityId: security.security_id,
      tickerSymbol: security.ticker_symbol,
      name: security.name ?? security.ticker_symbol ?? security.security_id,
      isCashEquivalent: security.is_cash_equivalent ?? false,
    }));

    const holdings: Holding[] = response.holdings.map((holding) => ({
      securityId: holding.security_id,
      accountId: holding.account_id,
      quantity: holding.quantity,
      institutionPrice: holding.institution_price,
      institutionValue: holding.institution_value,
      vestedQuantity: holding.vested_quantity ?? null,
      vestedValue: holding.vested_value ?? null,
    }));

    const reconciled = reconcileCashHoldings(
      response.accounts.map((a) => ({ accountId: a.account_id, currentBalance: a.balances.current })),
      holdings,
      securities
    );

    return { accounts, holdings: reconciled.holdings, securities: reconciled.securities };
  },
};
