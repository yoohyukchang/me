import { NextRequest, NextResponse } from "next/server";
import { reorderViews } from "@/lib/financial-management/store/views";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.orderedIds) || !body.orderedIds.every((id: unknown) => typeof id === "string")) {
    return NextResponse.json({ error: "orderedIds must be a string array" }, { status: 400 });
  }
  await reorderViews(body.orderedIds);
  return NextResponse.json({ ok: true });
}
