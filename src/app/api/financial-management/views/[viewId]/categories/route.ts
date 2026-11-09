import { NextRequest, NextResponse } from "next/server";
import { nextPaletteColor } from "@/lib/financial-management/format";
import { createCategory, listCategories } from "@/lib/financial-management/store/views";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ viewId: string }> }) {
  const { viewId } = await params;
  const categories = await listCategories(viewId);
  return NextResponse.json({ categories }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ viewId: string }> }) {
  const { viewId } = await params;
  const body = await request.json().catch(() => null);
  if (typeof body?.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json({ error: "A category name is required" }, { status: 400 });
  }
  const existing = await listCategories(viewId);
  const color = typeof body.color === "string" ? body.color : nextPaletteColor(existing.length);
  const category = await createCategory(viewId, { name: body.name.trim(), color, order: existing.length });
  return NextResponse.json({ category }, { status: 201 });
}
