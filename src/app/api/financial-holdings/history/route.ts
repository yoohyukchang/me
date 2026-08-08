import { NextRequest, NextResponse } from "next/server";
import { createHistoryEntry, listHistoryEntries } from "@/lib/financial-holdings/data";

export async function GET() {
  const entries = await listHistoryEntries();
  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const date = body?.date;
  const netContribution = Number(body?.netContribution);
  const portfolioValue = Number(body?.portfolioValue);

  if (typeof date !== "string" || date.trim().length === 0) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }
  if (!Number.isFinite(netContribution)) {
    return NextResponse.json({ error: "Net contribution must be a number" }, { status: 400 });
  }
  if (!Number.isFinite(portfolioValue) || portfolioValue < 0) {
    return NextResponse.json({ error: "Portfolio value must be a non-negative number" }, { status: 400 });
  }

  const entry = await createHistoryEntry({
    date: date.trim(),
    netContribution,
    portfolioValue,
  });
  return NextResponse.json({ entry }, { status: 201 });
}
