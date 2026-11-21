import type { NetWorthEntry } from "./types";

/**
 * Each institution holds money for a different purpose, so Net Worth is
 * read as an allocation across purposes rather than a list of banks.
 * Order here is the fixed display/stack order and drives color assignment.
 */
const KNOWN_INSTITUTIONS: Array<{ institution: string; purpose: string }> = [
  { institution: "Bank of America", purpose: "Living expenses" },
  { institution: "Chase", purpose: "Leisure & travel" },
  { institution: "Fidelity", purpose: "Investing" },
];

const BUCKET_PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];

export interface BucketDefinition {
  institution: string;
  purpose: string | null;
  color: string;
}

export interface BucketAmount extends BucketDefinition {
  amount: number;
  percent: number;
}

export function bucketAmountsFor(entry: NetWorthEntry): Record<string, number> {
  return { ...entry.depositoryBalances, Fidelity: entry.fidelityValue };
}

/**
 * Stable bucket list across every snapshot, so an institution keeps its
 * color and position even in a snapshot where it's missing. Institutions
 * without a known purpose (a second Chase connection, a new bank) follow
 * the known ones alphabetically.
 */
export function bucketDefinitions(entries: NetWorthEntry[]): BucketDefinition[] {
  const seen = new Set(entries.flatMap((e) => Object.keys(bucketAmountsFor(e))));
  const known = KNOWN_INSTITUTIONS.filter((k) => seen.has(k.institution));
  const unknown = [...seen].filter((name) => !KNOWN_INSTITUTIONS.some((k) => k.institution === name)).sort();
  return [
    ...known.map((k) => ({ institution: k.institution, purpose: k.purpose })),
    ...unknown.map((institution) => ({ institution, purpose: null })),
  ].map((b, i) => ({ ...b, color: BUCKET_PALETTE[i % BUCKET_PALETTE.length] }));
}

export function bucketAmounts(definitions: BucketDefinition[], entry: NetWorthEntry): BucketAmount[] {
  const amounts = bucketAmountsFor(entry);
  const total = Object.values(amounts).reduce((sum, v) => sum + v, 0);
  return definitions.map((d) => {
    const amount = amounts[d.institution] ?? 0;
    return { ...d, amount, percent: total > 0 ? (amount / total) * 100 : 0 };
  });
}
