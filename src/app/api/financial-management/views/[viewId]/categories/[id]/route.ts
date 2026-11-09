import { NextRequest, NextResponse } from "next/server";
import { deleteCategory, updateCategory } from "@/lib/financial-management/store/views";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ viewId: string; id: string }> }
) {
  const { viewId, id } = await params;
  const body = await request.json().catch(() => null);
  const update: { name?: string; color?: string } = {};
  if (body?.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    update.name = body.name.trim();
  }
  if (body?.color !== undefined) {
    if (typeof body.color !== "string") {
      return NextResponse.json({ error: "Invalid color" }, { status: 400 });
    }
    update.color = body.color;
  }
  await updateCategory(viewId, id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ viewId: string; id: string }> }
) {
  const { viewId, id } = await params;
  await deleteCategory(viewId, id);
  return NextResponse.json({ ok: true });
}
