import { NextRequest, NextResponse } from "next/server";
import { runFullSync } from "@/lib/financial-management/integrator/sync";
import { exchangePublicToken, getInstitution } from "@/lib/financial-management/providers/plaid/link";
import { createPlaidItem } from "@/lib/financial-management/store/plaid-items";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (typeof body?.publicToken !== "string") {
    return NextResponse.json({ error: "publicToken is required" }, { status: 400 });
  }
  if (body.product !== "investments" && body.product !== "transactions") {
    return NextResponse.json({ error: "product must be investments or transactions" }, { status: 400 });
  }

  const { accessToken, itemId } = await exchangePublicToken(body.publicToken);
  const { institutionId, institutionName } = await getInstitution(accessToken);

  await createPlaidItem({
    itemId,
    institutionId,
    institutionName,
    product: body.product,
    accessToken,
  });

  // Populate immediately rather than waiting for Saturday's scheduled run —
  // the full run also refreshes Portfolio History / Net Worth snapshots.
  await runFullSync();

  return NextResponse.json({ ok: true, institutionName }, { status: 201 });
}
