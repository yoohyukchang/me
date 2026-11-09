import { NextRequest, NextResponse } from "next/server";
import { listAssignments, setAssignment } from "@/lib/financial-management/store/views";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ viewId: string }> }) {
  const { viewId } = await params;
  const assignments = await listAssignments(viewId);
  return NextResponse.json({ assignments }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ viewId: string }> }
) {
  const { viewId } = await params;
  const body = await request.json().catch(() => null);
  if (typeof body?.holdingKey !== "string" || typeof body?.categoryId !== "string") {
    return NextResponse.json({ error: "holdingKey and categoryId are required" }, { status: 400 });
  }
  const existing = await listAssignments(viewId);
  const current = existing.find((a) => a.holdingKey === body.holdingKey);
  const order = current?.order ?? existing.length;
  await setAssignment(viewId, body.holdingKey, body.categoryId, order);
  return NextResponse.json({ ok: true });
}
