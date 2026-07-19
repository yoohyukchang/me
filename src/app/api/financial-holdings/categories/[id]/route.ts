import { NextRequest, NextResponse } from "next/server";
import {
  deleteCategory,
  getCategory,
  listStocks,
  updateCategory,
} from "@/lib/financial-holdings/data";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = body?.name;
  const color = body?.color;

  if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
    return NextResponse.json({ error: "Category name cannot be empty" }, { status: 400 });
  }
  if (color !== undefined && (typeof color !== "string" || color.trim().length === 0)) {
    return NextResponse.json({ error: "Category color cannot be empty" }, { status: 400 });
  }

  const existing = await getCategory(id);
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  await updateCategory(id, {
    name: name !== undefined ? name.trim() : undefined,
    color: color !== undefined ? color : undefined,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await getCategory(id);
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const stocks = await listStocks();
  if (stocks.some((stock) => stock.categoryId === id)) {
    return NextResponse.json(
      { error: "Move or delete the stocks in this category first" },
      { status: 409 }
    );
  }

  await deleteCategory(id);
  return NextResponse.json({ ok: true });
}
