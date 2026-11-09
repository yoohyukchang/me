import { NextRequest, NextResponse } from "next/server";
import { reorderCategories } from "@/lib/financial-management/store/views";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ viewId: string }> }
) {
  const { viewId } = await params;
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.orderedIds) || !body.orderedIds.every((id: unknown) => typeof id === "string")) {
    return NextResponse.json({ error: "orderedIds must be a string array" }, { status: 400 });
  }
  await reorderCategories(viewId, body.orderedIds);
  return NextResponse.json({ ok: true });
}
