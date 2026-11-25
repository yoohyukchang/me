import { toUsd, type Holding, type HoldingsSnapshot, type ManualHolding, type Security, type UnifiedHolding } from "./types";

const MAX_CLOSE_AGE_DAYS = 4; // a long weekend
const MAX_PRICE_RATIO = 2;

/**
 * The security's market close, when it's safe to price this holding with it.
 * Plaid's `institution_price` runs a close behind while `institution_price_as_of`
 * says today, so the close is preferred. Not when it's old, or so far from the
 * institution's price that a split has probably reached only one of them.
 */
function usableClose(holding: Holding, security: Security | undefined): { price: number; date: string } | null {
  const price = security?.closePrice;
  const date = security?.closePriceAsOf;
  if (!security || security.isCashEquivalent || !price || !date || holding.institutionPrice <= 0) return null;
  if (holding.institutionPriceAsOf) {
    const ageDays = (Date.parse(holding.institutionPriceAsOf) - Date.parse(date)) / 86_400_000;
    if (ageDays > MAX_CLOSE_AGE_DAYS) return null;
  }
  const ratio = price / holding.institutionPrice;
  if (ratio > MAX_PRICE_RATIO || ratio < 1 / MAX_PRICE_RATIO) return null;
  return { price, date };
}

/**
 * Merges Plaid's holdings (read-only, synced automatically) with manually-entered
 * holdings (any account Plaid can't reach — a Korean brokerage, for
 * example) into one provider-agnostic list. This is the only place that
 * needs to know both shapes exist; everything downstream (Views,
 * categorization, the pie chart, Portfolio Value) just sees `UnifiedHolding`.
 *
 * Closes are applied here, for display, never in the stored snapshot: cash is
 * derived from the institution's own balance and prices, and mixing in a
 * different close would distort it.
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
      const close = usableClose(holding, security);
      // Scaled rather than quantity × close, to keep a stock plan's vested share.
      const value = close ? holding.institutionValue * (close.price / holding.institutionPrice) : holding.institutionValue;
      holdings.push({
        holdingKey: holding.securityId,
        source: "plaid",
        ticker: security?.tickerSymbol ?? null,
        name: security?.name ?? holding.securityId,
        accountName: account?.name ?? "Fidelity",
        quantity: holding.quantity,
        price: close?.price ?? holding.institutionPrice,
        value,
        currency: "USD",
        valueUsd: value,
        closeDate: close?.date ?? null,
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
      closeDate: null,
    });
  }

  const totalValueUsd = holdings.reduce((sum, h) => sum + h.valueUsd, 0);
  return { holdings, totalValueUsd };
}
