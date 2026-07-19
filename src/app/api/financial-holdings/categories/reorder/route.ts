import { NextRequest, NextResponse } from "next/server";
import { reorderCategories } from "@/lib/financial-holdings/data";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const orderedIds = body?.orderedIds;

  if (
    !Array.isArray(orderedIds) ||
    orderedIds.length === 0 ||
    orderedIds.some((id) => typeof id !== "string")
  ) {
    return NextResponse.json(
      { error: "orderedIds must be a non-empty array of strings" },
      { status: 400 }
    );
  }

  await reorderCategories(orderedIds);
  return NextResponse.json({ ok: true });
}
