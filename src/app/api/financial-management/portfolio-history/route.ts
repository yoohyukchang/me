import { NextResponse } from "next/server";
import { computeHistoryRows } from "@/lib/financial-management/portfolio-history";
import { listBenchmarkPrices } from "@/lib/financial-management/store/benchmark-prices";
import { listContributions } from "@/lib/financial-management/store/contributions";
import { listPortfolioHistory } from "@/lib/financial-management/store/portfolio-history";
import { BENCHMARK_SYMBOL } from "@/lib/financial-management/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [entries, contributions, prices] = await Promise.all([
    listPortfolioHistory(),
    listContributions(),
    listBenchmarkPrices(BENCHMARK_SYMBOL),
  ]);
  const rows = computeHistoryRows(entries, contributions, prices);
  return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store" } });
}
