import { NextResponse } from "next/server";
import { getUsdKrwRate } from "@/lib/financial-management/fx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rate = await getUsdKrwRate();
    return NextResponse.json({ rate }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to fetch exchange rate" }, { status: 503 });
  }
}
