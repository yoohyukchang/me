export type FinnhubQuoteResult =
  | { status: "ok"; price: number }
  | { status: "unsupported" } // free plan doesn't cover this listing (e.g. non-U.S.)
  | { status: "no-data" }
  | { status: "error" };

export async function fetchFinnhubQuote(symbol: string, apiKey: string): Promise<FinnhubQuoteResult> {
  const url = new URL("https://finnhub.io/api/v1/quote");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("token", apiKey);

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    return { status: "error" };
  }

  if (res.status === 403) return { status: "unsupported" };
  if (!res.ok) return { status: "error" };

  const data = await res.json();
  // Finnhub signals "no data" via all-zero fields, not an HTTP error.
  if (typeof data.c !== "number" || (data.c === 0 && data.pc === 0)) {
    return { status: "no-data" };
  }
  return { status: "ok", price: data.c };
}
