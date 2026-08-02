import type { NativePrice } from "./types";

const CACHE_TTL_MS = 60 * 60 * 1000;
const rateCache = new Map<string, { rate: number; fetchedAt: number }>();

// Cached so bulk "refresh all" runs don't hit the FX API once per stock.
async function getUsdRate(currency: string): Promise<number | null> {
  if (currency === "USD") return 1;

  const cached = rateCache.get(currency);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.rate;

  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(currency)}&symbols=USD`,
      { cache: "no-store" }
    );
    if (!res.ok) return cached?.rate ?? null;

    const data = await res.json();
    const rate = data?.rates?.USD;
    if (typeof rate !== "number") return cached?.rate ?? null;

    rateCache.set(currency, { rate, fetchedAt: Date.now() });
    return rate;
  } catch {
    return cached?.rate ?? null;
  }
}

export async function convertToUsd(native: NativePrice): Promise<number | null> {
  const rate = await getUsdRate(native.currency);
  return rate === null ? null : Math.round(native.price * rate * 100) / 100;
}
