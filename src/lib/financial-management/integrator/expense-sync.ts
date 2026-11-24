import { findMissingAccounts, mergeKnownAccounts, planExpenseSync } from "../expenses";
import { plaidTransactionsProvider } from "../providers/plaid/transactions";
import * as expensesStore from "../store/expenses";
import * as plaidItemsStore from "../store/plaid-items";
import type { PlaidItem } from "../types";

/**
 * Pulls one bank Item's transaction changes into the expense ledger. Never
 * throws: a failure is recorded on the Item (and shown on the Expenses tab)
 * so one broken bank can't stop the others. The cursor advances only after
 * every write succeeded, so a failed run is simply replayed.
 */
export async function syncItemExpenses(itemId: string): Promise<void> {
  const item = await plaidItemsStore.claimExpenseSync(itemId);
  if (!item) return;
  try {
    await runSync(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    console.error(`Expense sync failed for ${item.institutionName} (${itemId}): ${message}`);
    if (message.includes("ITEM_LOGIN_REQUIRED")) await plaidItemsStore.markLoginRequired(itemId);
    await plaidItemsStore.recordExpenseSyncFailure(itemId, message.split("\n")[0].slice(0, 300));
  }
}

async function runSync(item: PlaidItem): Promise<void> {
  const live = await plaidTransactionsProvider.fetchAccounts(item.accessToken);
  const known = item.knownAccounts ?? [];
  const accounts = mergeKnownAccounts(known, live);
  const { changes, nextCursor } = await plaidTransactionsProvider.fetchChanges(
    item.accessToken,
    item.transactionsCursor ?? null
  );

  if (changes.added.length + changes.modified.length + changes.removed.length > 0) {
    const existing = await expensesStore.listExpenses();
    const ops = planExpenseSync(existing, changes, accounts, item.institutionName, new Date().toISOString());
    for (const op of ops) await expensesStore.applyExpenseOp(op);
  }

  await plaidItemsStore.recordExpenseSyncSuccess(item.itemId, {
    transactionsCursor: nextCursor,
    knownAccounts: accounts,
    missingAccounts: findMissingAccounts(known, live),
  });
}

export async function syncAllExpenses(): Promise<void> {
  const items = await plaidItemsStore.listPlaidItems();
  // One at a time: each Item's plan reads the whole ledger.
  for (const item of items) {
    if (item.product === "transactions") await syncItemExpenses(item.itemId);
  }
}
