import { NextRequest, NextResponse } from "next/server";
import type { ExpenseStatus, ExpenseTransaction } from "@/lib/financial-management/expenses";
import { getExpense, saveExpense } from "@/lib/financial-management/store/expenses";

const STATUS_BY_ACTION: Record<string, ExpenseStatus> = {
  APPROVE: "APPROVED",
  DEFER: "DEFERRED",
  EXCLUDE: "EXCLUDED",
  RESTORE: "PENDING_REVIEW",
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = typeof body?.action === "string" ? STATUS_BY_ACTION[body.action] : undefined;
  if (!status) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const row = await getExpense(id);
  if (!row) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  if (status === "APPROVED" && !row.categoryId) {
    return NextResponse.json({ error: "Choose a category first" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const next: ExpenseTransaction = { ...row, status, updatedAt: now };
  if (status === "APPROVED") {
    next.reviewedAt = now;
    delete next.revision;
  }
  await saveExpense(next, row.updatedAt);
  return NextResponse.json({ transaction: next });
}
