import { NextRequest, NextResponse } from "next/server";
import { syncItem } from "@/lib/financial-management/integrator/sync";
import { classifyItemWebhook, verifyWebhookSignature } from "@/lib/financial-management/providers/plaid/webhook";
import { getCurrentHoldings } from "@/lib/financial-management/store/holdings";
import { getPlaidItem, markLoginRequired } from "@/lib/financial-management/store/plaid-items";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("Plaid-Verification");

  if (!(await verifyWebhookSignature(rawBody, signature))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const outcome = classifyItemWebhook(JSON.parse(rawBody));
  if (outcome.kind === "login_required") {
    await markLoginRequired(outcome.itemId);
  } else if (outcome.kind === "data_ready") {
    // Only to backfill a freshly-linked Item whose holdings lagged; after that,
    // holdings refresh solely on the Saturday schedule.
    const current = await getCurrentHoldings();
    const item = await getPlaidItem(outcome.itemId);
    if (item && !current?.holdings.length) await syncItem(item);
  }

  return NextResponse.json({ ok: true });
}
