import {
  refreshInvestmentHoldings,
  runWeeklySnapshot,
} from "../../src/lib/financial-management/integrator/sync";

export async function handler(event: { mode?: "daily" | "weekly" }): Promise<{ ok: true }> {
  if (event?.mode === "weekly") {
    await runWeeklySnapshot();
  } else {
    await refreshInvestmentHoldings();
  }
  return { ok: true };
}
