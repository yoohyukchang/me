import { NextRequest, NextResponse } from "next/server";
import { removeItem } from "@/lib/financial-management/providers/plaid/link";
import { deletePlaidItem, getPlaidItem } from "@/lib/financial-management/store/plaid-items";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const item = await getPlaidItem(itemId);
  if (!item) return NextResponse.json({ error: "Unknown item" }, { status: 404 });

  try {
    await removeItem(item.accessToken);
  } catch {
    // Plaid may already consider the Item gone (e.g. already revoked) —
    // still clear our own record so the UI isn't stuck on a dead connection.
  }
  await deletePlaidItem(itemId);

  return NextResponse.json({ ok: true });
}
