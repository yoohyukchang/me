import { toUsd, type ContributionEntry, type PortfolioHistoryEntry } from "./types";

export interface PortfolioHistoryRow extends PortfolioHistoryEntry {
  netContribution: number;
  totalProfit: number;
  returnOnNetContribution: number;
}

/**
 * Net contribution as of any given date is the running total of every
 * contribution entry dated on or before it — computed here rather than
 * stored on the snapshot, so editing or backdating a contribution entry
 * instantly corrects every week's figures instead of requiring a rewrite
 * of historical snapshots.
 */
export function computeHistoryRows(
  entries: PortfolioHistoryEntry[],
  contributions: ContributionEntry[]
): PortfolioHistoryRow[] {
  const sortedContributions = [...contributions].sort((a, b) => a.date.localeCompare(b.date));

  return [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((entry) => {
      const netContribution = sortedContributions
        .filter((c) => c.date <= entry.date)
        .reduce((sum, c) => sum + toUsd(c.amount, c.currency, c.rate), 0);
      const totalProfit = entry.portfolioValue - netContribution;
      const returnOnNetContribution = netContribution !== 0 ? (totalProfit / netContribution) * 100 : 0;
      return { ...entry, netContribution, totalProfit, returnOnNetContribution };
    });
}
