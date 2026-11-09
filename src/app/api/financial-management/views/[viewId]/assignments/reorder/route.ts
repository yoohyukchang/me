import { NextRequest, NextResponse } from "next/server";
import { reorderAssignments } from "@/lib/financial-management/store/views";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ viewId: string }> }
) {
  const { viewId } = await params;
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.orderedKeys) || !body.orderedKeys.every((k: unknown) => typeof k === "string")) {
    return NextResponse.json({ error: "orderedKeys must be a string array" }, { status: 400 });
  }
  await reorderAssignments(viewId, body.orderedKeys);
  return NextResponse.json({ ok: true });
}
