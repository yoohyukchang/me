import { NextRequest, NextResponse } from "next/server";
import { createView, listViews } from "@/lib/financial-management/store/views";

export const dynamic = "force-dynamic";

export async function GET() {
  const views = await listViews();
  return NextResponse.json({ views }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (typeof body?.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json({ error: "A view name is required" }, { status: 400 });
  }
  const existing = await listViews();
  const view = await createView(body.name.trim(), existing.length);
  return NextResponse.json({ view }, { status: 201 });
}
