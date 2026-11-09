export async function getUsdKrwRate(): Promise<number> {
  const res = await fetch(
    "https://api.frankfurter.dev/v1/latest?base=USD&symbols=KRW",
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("FX rate lookup failed");
  const data = await res.json();
  const rate = data?.rates?.KRW;
  if (typeof rate !== "number" || !Number.isFinite(rate)) {
    throw new Error("FX rate lookup returned no rate");
  }
  return rate;
}
