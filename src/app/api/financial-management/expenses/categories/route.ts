import { NextRequest, NextResponse } from "next/server";
import { createExpenseCategory } from "@/lib/financial-management/store/expenses";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";
  if (!name || typeof body?.color !== "string" || !/^#[0-9a-f]{6}$/i.test(body.color)) {
    return NextResponse.json({ error: "A name and color are required" }, { status: 400 });
  }
  const category = await createExpenseCategory(name, body.color);
  return NextResponse.json({ category }, { status: 201 });
}
