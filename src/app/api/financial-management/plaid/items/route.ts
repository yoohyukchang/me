import { NextResponse } from "next/server";
import { listPublicPlaidItems } from "@/lib/financial-management/store/plaid-items";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listPublicPlaidItems();
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
