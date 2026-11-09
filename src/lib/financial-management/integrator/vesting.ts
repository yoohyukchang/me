export interface VestedSharesReconciliation {
  deltasByAccount: Record<string, number>;
  ledger: Record<string, number>;
}

/**
 * Folds newly-observed vest transactions into the previously-stored
 * per-transaction ledger, returning the change to apply to each account's
 * vested share count. Pure and side-effect free so it's testable without
 * hitting Plaid or Dynamo. Idempotent against re-processing the same
 * transaction (investments/transactions/get has no delta/removal concept
 * to reconcile against, unlike the bank side).
 */
export function reconcileVestedShares(
  previousLedger: Record<string, number>,
  upserts: Array<{ transactionId: string; accountId: string; quantity: number }>
): VestedSharesReconciliation {
  const ledger = { ...previousLedger };
  const deltasByAccount: Record<string, number> = {};

  for (const { transactionId, accountId, quantity } of upserts) {
    const delta = quantity - (ledger[transactionId] ?? 0);
    deltasByAccount[accountId] = (deltasByAccount[accountId] ?? 0) + delta;
    ledger[transactionId] = quantity;
  }

  return { deltasByAccount, ledger };
}
