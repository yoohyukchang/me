import { NextResponse } from "next/server";
import { computeHistoryRows } from "@/lib/financial-management/portfolio-history";
import { listContributions } from "@/lib/financial-management/store/contributions";
import { listPortfolioHistory } from "@/lib/financial-management/store/portfolio-history";

export const dynamic = "force-dynamic";

export async function GET() {
  const [entries, contributions] = await Promise.all([listPortfolioHistory(), listContributions()]);
  const rows = computeHistoryRows(entries, contributions);
  return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store" } });
}
