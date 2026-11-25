import { NextRequest, NextResponse } from "next/server";
import { syncItemExpenses } from "@/lib/financial-management/integrator/expense-sync";
import { syncItem } from "@/lib/financial-management/integrator/sync";
import { classifyItemWebhook, verifyWebhookSignature } from "@/lib/financial-management/providers/plaid/webhook";
import { getPlaidItem, markLoginRequired } from "@/lib/financial-management/store/plaid-items";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("Plaid-Verification");

  if (!(await verifyWebhookSignature(rawBody, signature))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const outcome = classifyItemWebhook(JSON.parse(rawBody));
  if (outcome.kind === "login_required") {
    await markLoginRequired(outcome.itemId);
  } else if (outcome.kind === "transactions_ready") {
    await syncItemExpenses(outcome.itemId);
  } else if (outcome.kind === "data_ready") {
    // Plaid sends a holdings and a transactions webhook together, so two of
    // these can overlap. That's safe: both write the same values.
    const item = await getPlaidItem(outcome.itemId);
    if (item?.product === "investments") await syncItem(item);
  }

  return NextResponse.json({ ok: true });
}
