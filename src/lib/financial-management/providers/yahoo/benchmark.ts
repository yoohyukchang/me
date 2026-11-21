import type { BenchmarkProvider } from "../types";

/**
 * Yahoo Finance's public chart endpoint — unofficial, but the only free
 * no-key source with the S&P 500 Total Return index (^SP500TR) that's
 * current through the latest close. (FRED has only the price index, a day
 * late; Stooq blocks non-browser clients.) Closes are stored as they're
 * fetched, so an outage only delays new weeks.
 */
export const yahooBenchmarkProvider: BenchmarkProvider = {
  async fetchDailyCloses(symbol, fromDate) {
    const period1 = Math.floor(Date.parse(`${fromDate}T00:00:00Z`) / 1000);
    const period2 = Math.floor(Date.now() / 1000);
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
      `?period1=${period1}&period2=${period2}&interval=1d`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`Benchmark fetch failed: ${res.status}`);

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    const timestamps: number[] = result?.timestamp ?? [];
    const closes: Array<number | null> = result?.indicators?.quote?.[0]?.close ?? [];
    const gmtOffset: number = result?.meta?.gmtoffset ?? 0;

    return timestamps.flatMap((ts, i) => {
      const close = closes[i];
      if (typeof close !== "number" || !Number.isFinite(close)) return [];
      // Timestamps mark the session open; shifting by the exchange's offset
      // gives the exchange-local trading date.
      const date = new Date((ts + gmtOffset) * 1000).toISOString().slice(0, 10);
      return [{ date, close }];
    });
  },
};
