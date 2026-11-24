import { NextResponse } from "next/server";
import { syncAllExpenses } from "@/lib/financial-management/integrator/expense-sync";
import { syncAllItems } from "@/lib/financial-management/integrator/sync";

// Update mode doesn't exchange a new access_token, so after a successful
// reconnect there's nothing to store — just re-run the sync so the item's
// status flips back to active and fresh data shows up right away.
export const maxDuration = 60;

export async function POST() {
  await syncAllItems();
  await syncAllExpenses();
  return NextResponse.json({ ok: true });
}
