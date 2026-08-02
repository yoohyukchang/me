import type { NativePrice } from "../types";

const TICKER_PATTERN = /^(\d{6})\.(KS|KQ)$/;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Naver's public polling API backs naver.com's own finance pages, so it
// tolerates frequent polling far better than Yahoo/other unofficial
// endpoints. Still undocumented — no key, no formal contract.
export async function fetchNaverPrice(symbol: string): Promise<NativePrice | null> {
  const match = TICKER_PATTERN.exec(symbol);
  if (!match) return null;
  const code = match[1];

  try {
    const res = await fetch(`https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`, {
      cache: "no-store",
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const raw = data?.datas?.[0]?.closePriceRaw;
    const price = typeof raw === "string" ? Number(raw) : NaN;
    return Number.isFinite(price) && price > 0 ? { price, currency: "KRW" } : null;
  } catch {
    return null;
  }
}
