import { NextRequest, NextResponse } from "next/server";
import { createBudgetCategory, listBudgetCategories } from "@/lib/financial-holdings/data";

export async function GET() {
  const categories = await listBudgetCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = body?.name;

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const categories = await listBudgetCategories();
  const order = categories.filter((category) => !category.archived).length;

  const category = await createBudgetCategory({ name: name.trim(), order });
  return NextResponse.json({ category }, { status: 201 });
}
