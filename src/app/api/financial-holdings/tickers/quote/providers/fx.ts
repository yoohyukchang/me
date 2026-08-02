import type { NativePrice } from "./types";

async function getUsdRate(currency: string): Promise<number | null> {
  if (currency === "USD") return 1;

  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(currency)}&symbols=USD`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const rate = data?.rates?.USD;
    return typeof rate === "number" ? rate : null;
  } catch {
    return null;
  }
}

export async function convertToUsd(native: NativePrice): Promise<number | null> {
  const rate = await getUsdRate(native.currency);
  return rate === null ? null : Math.round(native.price * rate * 100) / 100;
}
