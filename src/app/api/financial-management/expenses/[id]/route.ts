import { NextRequest, NextResponse } from "next/server";
import type { ExpenseTransaction } from "@/lib/financial-management/expenses";
import { getExpense, saveExpense } from "@/lib/financial-management/store/expenses";
import { validDate } from "@/lib/financial-management/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const row = await getExpense(id);
  if (!row) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

  const next: ExpenseTransaction = { ...row, updatedAt: new Date().toISOString() };
  if (body?.merchantName !== undefined) {
    if (typeof body.merchantName !== "string" || body.merchantName.trim().length === 0) {
      return NextResponse.json({ error: "Invalid merchant" }, { status: 400 });
    }
    next.merchantName = body.merchantName.trim().slice(0, 200);
  }
  if (body?.originalAmount !== undefined) {
    if (typeof body.originalAmount !== "number" || !Number.isFinite(body.originalAmount) || body.originalAmount < 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    next.originalAmount = body.originalAmount;
  }
  if (body?.date !== undefined) {
    if (!validDate(body.date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    next.date = body.date;
  }
  if (typeof body?.categoryId === "string") next.categoryId = body.categoryId;
  if (typeof body?.notes === "string") next.notes = body.notes.trim().slice(0, 500);
  if (typeof body?.isSubscription === "boolean") next.isSubscription = body.isSubscription;

  await saveExpense(next, row.updatedAt);
  return NextResponse.json({ transaction: next });
}
