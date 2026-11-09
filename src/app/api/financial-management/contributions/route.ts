import { NextRequest, NextResponse } from "next/server";
import { createContribution, listContributions } from "@/lib/financial-management/store/contributions";
import { validDate } from "@/lib/financial-management/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const contributions = await listContributions();
  return NextResponse.json({ contributions }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (
    !validDate(body?.date) ||
    typeof body?.amount !== "number" ||
    !Number.isFinite(body.amount) ||
    (body.currency !== "USD" && body.currency !== "KRW") ||
    typeof body?.rate !== "number" ||
    !Number.isFinite(body.rate) ||
    body.rate <= 0
  ) {
    return NextResponse.json(
      { error: "A valid date, amount, currency, and exchange rate are required" },
      { status: 400 }
    );
  }

  const contribution = await createContribution({
    date: body.date,
    amount: body.amount,
    currency: body.currency,
    rate: body.currency === "USD" ? 1 : body.rate,
    note: typeof body.note === "string" ? body.note.trim().slice(0, 200) : "",
  });
  return NextResponse.json({ contribution }, { status: 201 });
}
