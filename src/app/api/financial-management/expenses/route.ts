import { NextRequest, NextResponse } from "next/server";
import { createManualExpense, listExpenseCategories, listExpenses } from "@/lib/financial-management/store/expenses";
import { validDate } from "@/lib/financial-management/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [transactions, categories] = await Promise.all([listExpenses(), listExpenseCategories()]);
  return NextResponse.json({ transactions, categories }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (
    typeof body?.merchantName !== "string" ||
    body.merchantName.trim().length === 0 ||
    typeof body.originalAmount !== "number" ||
    !Number.isFinite(body.originalAmount) ||
    body.originalAmount <= 0 ||
    !validDate(body.date) ||
    typeof body.categoryId !== "string"
  ) {
    return NextResponse.json({ error: "A merchant, positive amount, date, and category are required" }, { status: 400 });
  }
  const transaction = await createManualExpense({
    merchantName: body.merchantName.trim().slice(0, 200),
    originalAmount: body.originalAmount,
    date: body.date,
    categoryId: body.categoryId,
    notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : "",
    isSubscription: body.isSubscription === true,
  });
  return NextResponse.json({ transaction }, { status: 201 });
}
