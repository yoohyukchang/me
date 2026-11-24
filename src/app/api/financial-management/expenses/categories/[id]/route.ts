import { NextRequest, NextResponse } from "next/server";
import { deleteExpenseCategory, listExpenses, updateExpenseCategory } from "@/lib/financial-management/store/expenses";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const update: { name?: string; color?: string } = {};
  if (typeof body?.name === "string" && body.name.trim()) update.name = body.name.trim().slice(0, 60);
  if (typeof body?.color === "string" && /^#[0-9a-f]{6}$/i.test(body.color)) update.color = body.color;
  await updateExpenseCategory(id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inUse = (await listExpenses()).filter((t) => t.categoryId === id).length;
  if (inUse > 0) {
    return NextResponse.json({ error: `${inUse} transactions use this category` }, { status: 409 });
  }
  await deleteExpenseCategory(id);
  return NextResponse.json({ ok: true });
}
