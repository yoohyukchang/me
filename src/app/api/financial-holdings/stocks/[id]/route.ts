import { NextRequest, NextResponse } from "next/server";
import { deleteStock, getCategory, updateStock } from "@/lib/financial-holdings/data";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const update: {
    ticker?: string;
    name?: string;
    shares?: number;
    price?: number;
    categoryId?: string;
  } = {};

  if (body?.ticker !== undefined) {
    if (typeof body.ticker !== "string" || body.ticker.trim().length === 0) {
      return NextResponse.json({ error: "Ticker cannot be empty" }, { status: 400 });
    }
    update.ticker = body.ticker.trim().toUpperCase();
  }

  if (body?.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Stock name cannot be empty" }, { status: 400 });
    }
    update.name = body.name.trim();
  }

  if (body?.shares !== undefined) {
    const shares = Number(body.shares);
    if (!Number.isFinite(shares) || shares < 0) {
      return NextResponse.json({ error: "Shares must be a non-negative number" }, { status: 400 });
    }
    update.shares = shares;
  }

  if (body?.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
    }
    update.price = price;
  }

  if (body?.categoryId !== undefined) {
    if (typeof body.categoryId !== "string" || body.categoryId.trim().length === 0) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    const category = await getCategory(body.categoryId);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }
    update.categoryId = body.categoryId;
  }

  await updateStock(id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteStock(id);
  return NextResponse.json({ ok: true });
}
