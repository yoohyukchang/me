import { NextRequest, NextResponse } from "next/server";
import { syncAllExpenses } from "@/lib/financial-management/integrator/expense-sync";
import { syncAllItems } from "@/lib/financial-management/integrator/sync";
import { exchangePublicToken, getInstitution } from "@/lib/financial-management/providers/plaid/link";
import { createPlaidItem, listPlaidItems } from "@/lib/financial-management/store/plaid-items";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (typeof body?.publicToken !== "string") {
    return NextResponse.json({ error: "publicToken is required" }, { status: 400 });
  }
  if (body.product !== "investments" && body.product !== "transactions") {
    return NextResponse.json({ error: "product must be investments or transactions" }, { status: 400 });
  }

  // A second Item for the same bank can silently drop accounts from the first
  // (seen with Chase and BofA when the account selection differed).
  if (typeof body.institutionId === "string") {
    const existing = await listPlaidItems();
    if (existing.some((i) => i.institutionId === body.institutionId && i.product === body.product)) {
      return NextResponse.json(
        { error: 'This bank is already connected. Use "Manage accounts" on it instead.' },
        { status: 409 }
      );
    }
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

  // Populate holdings/balances immediately; History and Net Worth snapshots
  // are only ever recorded by the Saturday run.
  await syncAllItems();
  if (body.product === "transactions") await syncAllExpenses();

  return NextResponse.json({ ok: true, institutionName }, { status: 201 });
}
