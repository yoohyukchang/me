import { NextResponse } from "next/server";
import { listBudgetMonths } from "@/lib/financial-holdings/data";

export async function GET() {
  const months = await listBudgetMonths();
  return NextResponse.json({ months });
}
