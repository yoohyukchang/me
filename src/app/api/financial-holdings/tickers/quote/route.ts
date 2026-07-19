import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();
  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Price lookup is not configured (missing FINNHUB_API_KEY)" },
      { status: 500 }
    );
  }

  const url = new URL("https://finnhub.io/api/v1/quote");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("token", apiKey);

  let data: { c?: number; pc?: number };
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 403) {
      return NextResponse.json(
        {
          error: `Live prices for ${symbol} aren't available on the free Finnhub plan (non-U.S. listings need a paid plan) — enter the price manually.`,
        },
        { status: 502 }
      );
    }
    if (!res.ok) {
      return NextResponse.json({ error: `Price lookup failed for ${symbol}` }, { status: 502 });
    }
    data = await res.json();
  } catch {
    return NextResponse.json({ error: `Price lookup failed for ${symbol}` }, { status: 502 });
  }

  // Finnhub returns all-zero fields (rather than an HTTP error) for
  // symbols it has no data for.
  if (typeof data.c !== "number" || (data.c === 0 && data.pc === 0)) {
    return NextResponse.json({ error: `No price data found for ${symbol}` }, { status: 404 });
  }

  return NextResponse.json({ symbol, price: data.c });
}
