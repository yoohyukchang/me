import { NextRequest, NextResponse } from "next/server";
import { putBudgetMonth } from "@/lib/financial-holdings/data";
import type { BudgetAllocation } from "@/lib/financial-holdings/types";

const MONTH_ID_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!MONTH_ID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid month id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const year = Number(body?.year);
  const month = Number(body?.month);
  const income = Number(body?.income);
  const allocationsInput = body?.allocations;

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return NextResponse.json({ error: "year and month must be integers" }, { status: 400 });
  }
  const expectedId = `${year}-${String(month).padStart(2, "0")}`;
  if (expectedId !== id) {
    return NextResponse.json({ error: "year/month does not match the URL" }, { status: 400 });
  }
  if (!Number.isFinite(income) || income < 0) {
    return NextResponse.json({ error: "Income must be a non-negative number" }, { status: 400 });
  }
  if (!Array.isArray(allocationsInput)) {
    return NextResponse.json({ error: "allocations must be an array" }, { status: 400 });
  }

  const allocations: BudgetAllocation[] = [];
  for (const entry of allocationsInput) {
    const categoryId = entry?.categoryId;
    const percentage = Number(entry?.percentage);
    const spent = Number(entry?.spent);
    if (
      typeof categoryId !== "string" ||
      categoryId.trim().length === 0 ||
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      !Number.isFinite(spent) ||
      spent < 0
    ) {
      return NextResponse.json(
        { error: "Each allocation needs a valid categoryId, percentage, and spent" },
        { status: 400 }
      );
    }
    allocations.push({ categoryId, percentage, spent });
  }

  const savedMonth = await putBudgetMonth({ id, year, month, income, allocations });
  return NextResponse.json({ month: savedMonth });
}
