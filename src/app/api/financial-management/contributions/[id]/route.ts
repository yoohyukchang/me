import { NextRequest, NextResponse } from "next/server";
import { deleteContribution, updateContribution } from "@/lib/financial-management/store/contributions";
import { validDate } from "@/lib/financial-management/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const update: Record<string, unknown> = {};

  if (body?.date !== undefined) {
    if (!validDate(body.date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    update.date = body.date;
  }
  if (body?.amount !== undefined) {
    if (typeof body.amount !== "number" || !Number.isFinite(body.amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    update.amount = body.amount;
  }
  if (body?.currency !== undefined) {
    if (body.currency !== "USD" && body.currency !== "KRW") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }
    update.currency = body.currency;
  }
  if (body?.rate !== undefined) {
    if (typeof body.rate !== "number" || !Number.isFinite(body.rate) || body.rate <= 0) {
      return NextResponse.json({ error: "Invalid exchange rate" }, { status: 400 });
    }
    update.rate = body.rate;
  }
  if (body?.note !== undefined) {
    update.note = typeof body.note === "string" ? body.note.trim().slice(0, 200) : "";
  }

  await updateContribution(id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteContribution(id);
  return NextResponse.json({ ok: true });
}
