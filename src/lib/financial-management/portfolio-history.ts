import { toUsd, type ContributionEntry, type PortfolioHistoryEntry } from "./types";

export interface PortfolioHistoryRow extends PortfolioHistoryEntry {
  netContribution: number;
  totalProfit: number;
  returnOnNetContribution: number;
  /** What the same contributions would be worth in the benchmark index on this date; null without price data. */
  benchmarkValue: number | null;
}

/** Daily closes, ascending by date. */
type PriceSeries = Array<{ date: string; close: number }>;

function closeOnOrBefore(prices: PriceSeries, date: string): number | null {
  let result: number | null = null;
  for (const p of prices) {
    if (p.date > date) break;
    result = p.close;
  }
  return result;
}

/**
 * Benchmark value on `date`: every contribution dated on or before it buys
 * (or, if negative, sells) index units at that contribution date's close —
 * the last close on or before it, since a weekend deposit can't trade
 * earlier — and the units are valued at `date`'s close.
 */
export function benchmarkValueOn(
  date: string,
  contributions: ContributionEntry[],
  prices: PriceSeries
): number | null {
  const valuationClose = closeOnOrBefore(prices, date);
  if (valuationClose === null) return null;
  let units = 0;
  for (const c of contributions) {
    if (c.date > date) continue;
    const purchaseClose = closeOnOrBefore(prices, c.date) ?? prices[0].close;
    units += toUsd(c.amount, c.currency, c.rate) / purchaseClose;
  }
  return units * valuationClose;
}

/**
 * Net contribution as of any given date is the running total of every
 * contribution entry dated on or before it — computed here rather than
 * stored on the snapshot, so editing or backdating a contribution entry
 * instantly corrects every week's figures instead of requiring a rewrite
 * of historical snapshots. The benchmark value is derived the same way.
 */
export function computeHistoryRows(
  entries: PortfolioHistoryEntry[],
  contributions: ContributionEntry[],
  benchmarkPrices: PriceSeries = []
): PortfolioHistoryRow[] {
  const sortedContributions = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
  const sortedPrices = [...benchmarkPrices].sort((a, b) => a.date.localeCompare(b.date));

  return [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((entry) => {
      const netContribution = sortedContributions
        .filter((c) => c.date <= entry.date)
        .reduce((sum, c) => sum + toUsd(c.amount, c.currency, c.rate), 0);
      const totalProfit = entry.portfolioValue - netContribution;
      const returnOnNetContribution = netContribution !== 0 ? (totalProfit / netContribution) * 100 : 0;
      const benchmarkValue = benchmarkValueOn(entry.date, sortedContributions, sortedPrices);
      return { ...entry, netContribution, totalProfit, returnOnNetContribution, benchmarkValue };
    });
}
