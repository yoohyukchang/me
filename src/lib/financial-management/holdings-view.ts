import { toUsd, type HoldingsSnapshot, type ManualHolding, type UnifiedHolding } from "./types";

/**
 * Merges Plaid's holdings (read-only, synced weekly) with manually-entered
 * holdings (any account Plaid can't reach — a Korean brokerage, for
 * example) into one provider-agnostic list. This is the only place that
 * needs to know both shapes exist; everything downstream (Views,
 * categorization, the pie chart, Portfolio Value) just sees `UnifiedHolding`.
 */
export function toUnifiedHoldings(
  snapshot: Pick<HoldingsSnapshot, "accounts" | "holdings" | "securities"> | null,
  manualHoldings: ManualHolding[],
  usdKrwRate: number
): { holdings: UnifiedHolding[]; totalValueUsd: number } {
  const holdings: UnifiedHolding[] = [];

  if (snapshot) {
    const securityById = new Map(snapshot.securities.map((s) => [s.securityId, s]));
    const accountById = new Map(snapshot.accounts.map((a) => [a.accountId, a]));
    for (const holding of snapshot.holdings) {
      const security = securityById.get(holding.securityId);
      const account = accountById.get(holding.accountId);
      holdings.push({
        holdingKey: holding.securityId,
        source: "plaid",
        ticker: security?.tickerSymbol ?? null,
        name: security?.name ?? holding.securityId,
        accountName: account?.name ?? "Fidelity",
        quantity: holding.quantity,
        price: holding.institutionPrice,
        value: holding.institutionValue,
        currency: "USD",
        valueUsd: holding.institutionValue,
      });
    }
  }

  for (const manual of manualHoldings) {
    const value = manual.shares * manual.price;
    holdings.push({
      holdingKey: manual.id,
      source: "manual",
      ticker: manual.ticker,
      name: manual.name,
      accountName: manual.accountName,
      quantity: manual.shares,
      price: manual.price,
      value,
      currency: manual.currency,
      valueUsd: toUsd(value, manual.currency, usdKrwRate),
    });
  }

  const totalValueUsd = holdings.reduce((sum, h) => sum + h.valueUsd, 0);
  return { holdings, totalValueUsd };
}
