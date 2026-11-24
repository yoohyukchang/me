import { NextResponse } from "next/server";
import { syncAllExpenses } from "@/lib/financial-management/integrator/expense-sync";
import { listPublicPlaidItems } from "@/lib/financial-management/store/plaid-items";

export const maxDuration = 60;

export async function POST() {
  await syncAllExpenses();
  const items = await listPublicPlaidItems();
  return NextResponse.json({ items: items.filter((i) => i.product === "transactions") });
}
