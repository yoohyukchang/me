import { NextRequest, NextResponse } from "next/server";
import { createLinkToken } from "@/lib/financial-management/providers/plaid/link";
import { getPlaidItem } from "@/lib/financial-management/store/plaid-items";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const webhookUrl = process.env.FINANCIAL_MANAGEMENT_PLAID_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook URL is not configured" }, { status: 503 });
  }

  if (body?.mode === "update") {
    if (typeof body.itemId !== "string") {
      return NextResponse.json({ error: "itemId is required for update mode" }, { status: 400 });
    }
    const item = await getPlaidItem(body.itemId);
    if (!item) return NextResponse.json({ error: "Unknown item" }, { status: 404 });

    const linkToken = await createLinkToken({
      product: item.product,
      webhookUrl,
      updateAccessToken: item.accessToken,
    });
    return NextResponse.json({ linkToken });
  }

  if (body?.product !== "investments" && body?.product !== "transactions") {
    return NextResponse.json({ error: "product must be investments or transactions" }, { status: 400 });
  }

  const linkToken = await createLinkToken({ product: body.product, webhookUrl });
  return NextResponse.json({ linkToken });
}
