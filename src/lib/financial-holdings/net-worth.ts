export type Currency = "USD" | "KRW";
export type NetWorthSource = { id: string; name: string; kind: "asset" | "debt"; currency: Currency; amount: number; rate: number };
export type NetWorthSnapshot = { id: string; date: string; sources: NetWorthSource[]; order: number };

export function validSources(value: unknown): value is NetWorthSource[] {
  if (!Array.isArray(value) || value.length > 100) return false;
  const ids = new Set<string>();
  for (const source of value) {
    if (!source || typeof source.id !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(source.id) || ids.has(source.id)
      || typeof source.name !== "string" || !source.name.trim() || source.name.length > 100
      || !["asset", "debt"].includes(source.kind) || !["USD", "KRW"].includes(source.currency)
      || typeof source.amount !== "number" || !Number.isFinite(source.amount) || source.amount < 0
      || typeof source.rate !== "number" || !Number.isFinite(source.rate) || source.rate <= 0) return false;
    ids.add(source.id);
  }
  return (["USD", "KRW"] as const).every(currency => Number.isFinite(value.reduce((sum, source) => sum +
    (source.currency === currency ? source.amount : currency === "USD" ? source.amount / source.rate : source.amount * source.rate), 0)));
}

export function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
