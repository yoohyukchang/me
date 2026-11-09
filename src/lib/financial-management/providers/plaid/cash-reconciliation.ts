import type { Holding, Security } from "../../types";

const CASH_EPSILON = 0.01;

/**
 * Confirmed against a real account: Plaid can report an account's balance
 * as fully correct (`balances.current`) while simply omitting a holdings
 * line item for its core/sweep cash position (SPAXX, in Fidelity's case)
 * — even though its own investment-transactions feed shows that cash's
 * activity. Reconciling each account's declared holdings total against
 * its reported balance, and representing any gap as an ordinary cash
 * holding, means Portfolio Value always matches what the institution says
 * the account is actually worth. No Plaid import here on purpose — kept
 * pure so it's testable without the SDK.
 */
export function reconcileCashHoldings(
  accountBalances: Array<{ accountId: string; currentBalance: number | null }>,
  holdings: Holding[],
  securities: Security[]
): { holdings: Holding[]; securities: Security[] } {
  const nextHoldings = [...holdings];
  const nextSecurities = [...securities];

  for (const { accountId, currentBalance } of accountBalances) {
    const declared = holdings
      .filter((h) => h.accountId === accountId)
      .reduce((sum, h) => sum + h.institutionValue, 0);
    const residual = (currentBalance ?? 0) - declared;
    if (residual > CASH_EPSILON) {
      const securityId = `cash-${accountId}`;
      nextSecurities.push({ securityId, tickerSymbol: null, name: "Cash & money market", isCashEquivalent: true });
      nextHoldings.push({
        securityId,
        accountId,
        quantity: residual,
        institutionPrice: 1,
        institutionValue: residual,
        vestedQuantity: null,
        vestedValue: null,
      });
    }
  }

  return { holdings: nextHoldings, securities: nextSecurities };
}
