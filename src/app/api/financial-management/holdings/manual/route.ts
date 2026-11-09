import { NextRequest, NextResponse } from "next/server";
import { runFullSync } from "@/lib/financial-management/integrator/sync";
import {
  createManualHolding,
  listManualHoldings,
} from "@/lib/financial-management/store/manual-holdings";

export const dynamic = "force-dynamic";

export async function GET() {
  const holdings = await listManualHoldings();
  return NextResponse.json({ holdings }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (
    typeof body?.ticker !== "string" ||
    body.ticker.trim().length === 0 ||
    typeof body?.name !== "string" ||
    body.name.trim().length === 0 ||
    typeof body?.shares !== "number" ||
    !Number.isFinite(body.shares) ||
    body.shares < 0 ||
    typeof body?.price !== "number" ||
    !Number.isFinite(body.price) ||
    body.price < 0 ||
    (body.currency !== "USD" && body.currency !== "KRW")
  ) {
    return NextResponse.json({ error: "A valid ticker, name, shares, price, and currency are required" }, { status: 400 });
  }

  const existing = await listManualHoldings();
  const holding = await createManualHolding({
    ticker: body.ticker.trim().toUpperCase(),
    name: body.name.trim(),
    accountName: typeof body.accountName === "string" && body.accountName.trim() ? body.accountName.trim() : "Manual",
    shares: body.shares,
    price: body.price,
    currency: body.currency,
    order: existing.length,
  });
  await runFullSync();
  return NextResponse.json({ holding }, { status: 201 });
}
