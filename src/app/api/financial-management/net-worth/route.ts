import { NextResponse } from "next/server";
import { listNetWorth } from "@/lib/financial-management/store/net-worth";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await listNetWorth();
  return NextResponse.json({ entries }, { headers: { "Cache-Control": "no-store" } });
}
