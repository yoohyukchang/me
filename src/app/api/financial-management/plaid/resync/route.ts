import { NextResponse } from "next/server";
import { runFullSync } from "@/lib/financial-management/integrator/sync";

// Update mode doesn't exchange a new access_token, so after a successful
// reconnect there's nothing to store — just re-run the sync so the item's
// status flips back to active and fresh data shows up right away.
export async function POST() {
  await runFullSync();
  return NextResponse.json({ ok: true });
}
