import { NextResponse } from "next/server";
import { getUsdKrwRate } from "@/lib/financial-management/fx";
import { toUnifiedHoldings } from "@/lib/financial-management/holdings-view";
import { getCurrentHoldings } from "@/lib/financial-management/store/holdings";
import { listManualHoldings } from "@/lib/financial-management/store/manual-holdings";

export const dynamic = "force-dynamic";

export async function GET() {
  const [snapshot, manualHoldings] = await Promise.all([getCurrentHoldings(), listManualHoldings()]);

  const usdKrwRate = manualHoldings.some((h) => h.currency === "KRW")
    ? await getUsdKrwRate().catch(() => 0)
    : 0;

  const { holdings, totalValueUsd } = toUnifiedHoldings(snapshot ?? null, manualHoldings, usdKrwRate);

  const pricesAsOf =
    snapshot?.holdings
      .map((h) => h.institutionPriceAsOf)
      .filter((d): d is string => !!d)
      .sort()
      .at(-1) ?? null;

  return NextResponse.json(
    { holdings, totalValueUsd, lastSyncedAt: snapshot?.lastSyncedAt ?? null, pricesAsOf },
    { headers: { "Cache-Control": "no-store" } }
  );
}
