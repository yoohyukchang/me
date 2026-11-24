import {
  refreshInvestmentHoldings,
  runWeeklySnapshot,
} from "../../src/lib/financial-management/integrator/sync";
import { syncAllExpenses } from "../../src/lib/financial-management/integrator/expense-sync";

export async function handler(event: { mode?: "daily" | "weekly" }): Promise<{ ok: true }> {
  try {
    if (event?.mode === "weekly") {
      await runWeeklySnapshot();
    } else {
      await refreshInvestmentHoldings();
    }
  } finally {
    await syncAllExpenses();
  }
  return { ok: true };
}
