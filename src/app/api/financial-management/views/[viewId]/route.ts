import { NextRequest, NextResponse } from "next/server";
import { deleteView, listViews, renameView } from "@/lib/financial-management/store/views";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ viewId: string }> }) {
  const { viewId } = await params;
  const body = await request.json().catch(() => null);
  if (typeof body?.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json({ error: "A view name is required" }, { status: 400 });
  }
  await renameView(viewId, body.name.trim());
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ viewId: string }> }) {
  const { viewId } = await params;
  const views = await listViews();
  if (views.length <= 1) {
    return NextResponse.json({ error: "At least one view must remain" }, { status: 400 });
  }
  await deleteView(viewId);
  return NextResponse.json({ ok: true });
}
