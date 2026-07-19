import { NextRequest, NextResponse } from "next/server";
import { createCategory, listCategories } from "@/lib/financial-holdings/data";

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = body?.name;
  const color = body?.color;

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }
  if (typeof color !== "string" || color.trim().length === 0) {
    return NextResponse.json({ error: "Category color is required" }, { status: 400 });
  }

  const existing = await listCategories();
  const category = await createCategory({
    name: name.trim(),
    color,
    order: existing.length,
  });
  return NextResponse.json({ category }, { status: 201 });
}
