import { NextRequest, NextResponse } from "next/server";
import { createStock, getCategory, listStocks } from "@/lib/financial-holdings/data";

export async function GET() {
  const stocks = await listStocks();
  return NextResponse.json({ stocks });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const ticker = body?.ticker;
  const name = body?.name;
  const shares = Number(body?.shares);
  const price = Number(body?.price);
  const categoryId = body?.categoryId;

  if (typeof ticker !== "string" || ticker.trim().length === 0) {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
  }
  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Stock name is required" }, { status: 400 });
  }
  if (!Number.isFinite(shares) || shares < 0) {
    return NextResponse.json({ error: "Shares must be a non-negative number" }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
  }
  if (typeof categoryId !== "string" || categoryId.trim().length === 0) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }

  const category = await getCategory(categoryId);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const existingStocks = await listStocks();
  const order = existingStocks.filter((s) => s.categoryId === categoryId).length;
  const stock = await createStock({
    ticker: ticker.trim().toUpperCase(),
    name: name.trim(),
    shares,
    price,
    categoryId,
    order,
  });
  return NextResponse.json({ stock }, { status: 201 });
}
