import { runFullSync } from "../../src/lib/financial-management/integrator/sync";

export async function handler(): Promise<{ ok: true }> {
  await runFullSync();
  return { ok: true };
}
