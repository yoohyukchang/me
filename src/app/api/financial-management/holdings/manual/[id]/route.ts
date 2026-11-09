import { NextRequest, NextResponse } from "next/server";
import { runFullSync } from "@/lib/financial-management/integrator/sync";
import { deleteManualHolding, updateManualHolding } from "@/lib/financial-management/store/manual-holdings";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const update: Record<string, unknown> = {};

  if (body?.ticker !== undefined) {
    if (typeof body.ticker !== "string" || body.ticker.trim().length === 0) {
      return NextResponse.json({ error: "Invalid ticker" }, { status: 400 });
    }
    update.ticker = body.ticker.trim().toUpperCase();
  }
  if (body?.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    update.name = body.name.trim();
  }
  if (body?.accountName !== undefined) {
    if (typeof body.accountName !== "string" || body.accountName.trim().length === 0) {
      return NextResponse.json({ error: "Invalid account name" }, { status: 400 });
    }
    update.accountName = body.accountName.trim();
  }
  if (body?.shares !== undefined) {
    if (typeof body.shares !== "number" || !Number.isFinite(body.shares) || body.shares < 0) {
      return NextResponse.json({ error: "Shares must be a non-negative number" }, { status: 400 });
    }
    update.shares = body.shares;
  }
  if (body?.price !== undefined) {
    if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
    }
    update.price = body.price;
  }
  if (body?.currency !== undefined) {
    if (body.currency !== "USD" && body.currency !== "KRW") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }
    update.currency = body.currency;
  }

  await updateManualHolding(id, update);
  await runFullSync();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteManualHolding(id);
  await runFullSync();
  return NextResponse.json({ ok: true });
}
