import { NextRequest, NextResponse } from "next/server";
import { fetchFinnhubQuote } from "./providers/finnhub";
import { fetchNaverPrice } from "./providers/korea/naver";
import { convertToUsd } from "./providers/fx";

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

  const finnhub = await fetchFinnhubQuote(symbol, apiKey);
  if (finnhub.status === "ok") {
    return NextResponse.json({ symbol, price: finnhub.price });
  }
  if (finnhub.status === "error") {
    return NextResponse.json({ error: `Price lookup failed for ${symbol}` }, { status: 502 });
  }

  // finnhub.status is "unsupported" or "no-data" — try the Korea fallback.
  const native = await fetchNaverPrice(symbol);
  const price = native ? await convertToUsd(native) : null;
  if (price !== null) {
    return NextResponse.json({ symbol, price, source: "naver" });
  }

  if (finnhub.status === "unsupported") {
    return NextResponse.json(
      {
        error: `Live prices for ${symbol} aren't available on the free Finnhub plan, and the backup price source didn't return a price either — enter the price manually.`,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ error: `No price data found for ${symbol}` }, { status: 404 });
}
