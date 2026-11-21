export type Granularity = "week" | "month";
export type RangePreset = "3m" | "6m" | "ytd" | "1y" | "all" | "custom";

export interface TimeFilter {
  granularity: Granularity;
  preset: RangePreset;
  /** Inclusive YYYY-MM-DD bounds, used only when preset is "custom". */
  from: string;
  to: string;
}

export const DEFAULT_TIME_FILTER: TimeFilter = { granularity: "week", preset: "all", from: "", to: "" };

function monthsBefore(today: string, months: number): string {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

function rangeStart(filter: TimeFilter, today: string): string {
  switch (filter.preset) {
    case "3m":
      return monthsBefore(today, 3);
    case "6m":
      return monthsBefore(today, 6);
    case "1y":
      return monthsBefore(today, 12);
    case "ytd":
      return `${today.slice(0, 4)}-01-01`;
    case "custom":
      return filter.from;
    case "all":
      return "";
  }
}

/**
 * Keeps the points inside the selected range, then — for "month" — only
 * the last snapshot of each calendar month. Snapshots are already weekly,
 * so "week" keeps every point. Returns ascending by date.
 */
export function applyTimeFilter<T extends { date: string }>(
  points: T[],
  filter: TimeFilter,
  today: string = new Date().toISOString().slice(0, 10)
): T[] {
  const start = rangeStart(filter, today);
  const end = filter.preset === "custom" && filter.to ? filter.to : "9999-12-31";
  const inRange = [...points]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((p) => p.date >= start && p.date <= end);
  if (filter.granularity === "week") return inRange;

  const lastByMonth = new Map<string, T>();
  for (const p of inRange) lastByMonth.set(p.date.slice(0, 7), p);
  return [...lastByMonth.values()];
}

/** Axis label: "Nov 2026" per month; "Nov 21" per week, with the year once the range spans years. */
export function formatAxisDate(date: string, granularity: Granularity, spansYears: boolean): string {
  const d = new Date(`${date}T00:00:00`);
  if (granularity === "month") return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: spansYears ? "numeric" : undefined });
}

export function spansYears(points: Array<{ date: string }>): boolean {
  return points.length > 0 && points[0].date.slice(0, 4) !== points[points.length - 1].date.slice(0, 4);
}
