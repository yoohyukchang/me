import { NextRequest, NextResponse } from "next/server";
import { getBudgetCategory, updateBudgetCategory } from "@/lib/financial-holdings/data";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = body?.name;
  const archived = body?.archived;

  if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
    return NextResponse.json({ error: "Category name cannot be empty" }, { status: 400 });
  }
  if (archived !== undefined && typeof archived !== "boolean") {
    return NextResponse.json({ error: "archived must be true or false" }, { status: 400 });
  }

  const existing = await getBudgetCategory(id);
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  await updateBudgetCategory(id, {
    name: name !== undefined ? name.trim() : undefined,
    archived,
  });
  return NextResponse.json({ ok: true });
}
