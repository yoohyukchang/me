import { NextRequest, NextResponse } from "next/server";

interface FinnhubSearchResult {
  symbol: string;
  description: string;
  type: string;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Ticker search is not configured (missing FINNHUB_API_KEY)" },
      { status: 500 }
    );
  }

  const url = new URL("https://finnhub.io/api/v1/search");
  url.searchParams.set("q", q);
  url.searchParams.set("token", apiKey);

  let data: { result?: FinnhubSearchResult[] };
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "Ticker search failed" }, { status: 502 });
    }
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "Ticker search failed" }, { status: 502 });
  }

  const results = (data.result ?? [])
    .filter((item) => typeof item.symbol === "string")
    .slice(0, 8)
    .map((item) => ({
      symbol: item.symbol,
      name: item.description,
      type: item.type,
    }));

  return NextResponse.json({ results });
}
