/** Types and pure rules for the Expenses tab — no SDK or store imports, so all of it is unit-testable. */

export type ExpenseStatus = "PENDING_REVIEW" | "DEFERRED" | "APPROVED" | "EXCLUDED";

export interface ExpenseRevision {
  revisedAt: string;
  changes: {
    originalAmount?: { from: number; to: number };
    merchantName?: { from: string; to: string };
  };
  /** The bank withdrew this posted transaction after it was approved. */
  removedByBank?: boolean;
}

export interface ExpenseTransaction {
  transactionId: string;
  status: ExpenseStatus;
  merchantName: string;
  originalAmount: number;
  /** YYYY-MM-DD, the day spending is counted on. Compare as a string: `new Date()` shifts it by timezone. */
  date: string;
  categoryId?: string | null;
  accountId: string;
  accountMask?: string | null;
  institutionName: string;
  notes?: string | null;
  isSubscription?: boolean;
  isPending: boolean;
  pendingTransactionId?: string;
  reviewedAt?: string;
  importedAt: string;
  updatedAt: string;
  revision?: ExpenseRevision;
  /**
   * What the bank last reported, kept apart from the owner-editable fields
   * above. An edit survives syncs, except that an edited amount is replaced
   * when the bank's own amount changes. Absent on migrated and manual rows.
   */
  bankAmount?: number;
  bankMerchant?: string;
  bankDate?: string;
}

export interface ExpenseCategory {
  categoryId: string;
  name: string;
  color: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** One bank transaction, provider-agnostic. Positive amount = money out. */
export interface BankTransaction {
  transactionId: string;
  pendingTransactionId: string | null;
  accountId: string;
  amount: number;
  merchant: string;
  date: string;
  pending: boolean;
}

export interface BankAccount {
  accountId: string;
  name: string;
  mask: string | null;
  type: string;
  subtype: string | null;
}

export interface BankChanges {
  added: BankTransaction[];
  modified: BankTransaction[];
  removed: string[];
}

/**
 * One ledger write. `previousUpdatedAt` is the version the plan was made from;
 * "rekey" moves a row to a new transaction id (pending → posted, re-link).
 */
export type ExpenseOp =
  | { kind: "insert"; row: ExpenseTransaction }
  | { kind: "update"; row: ExpenseTransaction; previousUpdatedAt: string }
  | { kind: "rekey"; oldId: string; row: ExpenseTransaction; previousUpdatedAt: string }
  | { kind: "delete"; id: string; previousUpdatedAt: string };

/** Earlier history is closed: the sync never adds, changes, or removes it. */
export const EXPENSES_SYNC_FROM = "2026-11-01";

export function isFrozen(row: ExpenseTransaction): boolean {
  return (row.bankDate ?? row.date) < EXPENSES_SYNC_FROM;
}

/**
 * Turns one Item's bank changes into ledger writes. Pure. Must tolerate a
 * replay: a run that fails before saving its cursor sees the same changes again.
 */
export function planExpenseSync(
  existing: ExpenseTransaction[],
  changes: BankChanges,
  accounts: BankAccount[],
  institutionName: string,
  now: string
): ExpenseOp[] {
  const rows = new Map(existing.map((r) => [r.transactionId, r]));
  const accountById = new Map(accounts.map((a) => [a.accountId, a]));
  const ops: ExpenseOp[] = [];

  function fresh(txn: BankTransaction): ExpenseTransaction {
    const account = accountById.get(txn.accountId);
    return {
      transactionId: txn.transactionId,
      status: "PENDING_REVIEW",
      merchantName: txn.merchant,
      originalAmount: txn.amount,
      date: txn.date,
      accountId: txn.accountId,
      accountMask: account?.mask ?? null,
      institutionName,
      isPending: txn.pending,
      importedAt: now,
      updatedAt: now,
      bankAmount: txn.amount,
      bankMerchant: txn.merchant,
      bankDate: txn.date,
    };
  }

  /** Applies a bank update to a row, sending it back to review if an approved value changed. */
  function absorb(row: ExpenseTransaction, incoming: BankTransaction): ExpenseTransaction {
    // A late date correction must not move an open transaction into closed history.
    const txn =
      incoming.date < EXPENSES_SYNC_FROM ? { ...incoming, date: row.bankDate ?? row.date } : incoming;
    const next: ExpenseTransaction = {
      ...row,
      transactionId: txn.transactionId,
      accountId: txn.accountId,
      accountMask: accountById.get(txn.accountId)?.mask ?? row.accountMask ?? null,
      isPending: txn.pending,
      updatedAt: now,
      bankAmount: txn.amount,
      bankMerchant: txn.merchant,
      bankDate: txn.date,
    };
    const amountChanged = txn.amount !== row.bankAmount;
    const merchantChanged = txn.merchant !== row.bankMerchant;
    const merchantEdited = row.merchantName !== row.bankMerchant;
    const dateEdited = row.date !== row.bankDate;
    if (!dateEdited) next.date = txn.date;
    if (amountChanged) next.originalAmount = txn.amount;
    if (merchantChanged && !merchantEdited) next.merchantName = txn.merchant;

    const reviewed = row.status === "APPROVED" || row.revision !== undefined;
    if (reviewed && row.status !== "EXCLUDED") {
      const prior = row.revision?.changes;
      const amountBase = prior?.originalAmount?.from ?? row.originalAmount;
      const merchantBase = prior?.merchantName?.from ?? row.merchantName;
      const revised: ExpenseRevision["changes"] = {};
      if (next.originalAmount !== amountBase) revised.originalAmount = { from: amountBase, to: next.originalAmount };
      if (next.merchantName !== merchantBase) revised.merchantName = { from: merchantBase, to: next.merchantName };
      if (Object.keys(revised).length > 0) {
        next.status = row.status === "DEFERRED" ? "DEFERRED" : "PENDING_REVIEW";
        next.revision = { revisedAt: now, changes: revised };
      } else {
        next.status = "APPROVED";
        delete next.revision;
      }
    }
    return next;
  }

  function replace(row: ExpenseTransaction, next: ExpenseTransaction) {
    const previousUpdatedAt = row.updatedAt;
    if (row.transactionId === next.transactionId) {
      ops.push({ kind: "update", row: next, previousUpdatedAt });
    } else {
      ops.push({ kind: "rekey", oldId: row.transactionId, row: next, previousUpdatedAt });
      rows.delete(row.transactionId);
    }
    rows.set(next.transactionId, next);
  }

  // Re-linking a bank re-issues every transaction under new ids. The same
  // account (mask) with the same bank date and amount under a different
  // account id is that transaction, so its review is carried over.
  function findRelinked(txn: BankTransaction): ExpenseTransaction | undefined {
    const mask = accountById.get(txn.accountId)?.mask;
    if (!mask) return undefined;
    for (const row of rows.values()) {
      if (
        row.accountMask === mask &&
        row.institutionName === institutionName &&
        row.accountId !== txn.accountId &&
        row.bankDate === txn.date &&
        row.bankAmount === txn.amount &&
        !isFrozen(row)
      ) {
        return row;
      }
    }
    return undefined;
  }

  function add(txn: BankTransaction) {
    const known = rows.get(txn.transactionId);
    if (known) {
      modify(known, txn);
      return;
    }
    const pendingRow = txn.pendingTransactionId ? rows.get(txn.pendingTransactionId) : undefined;
    if (pendingRow) {
      if (!isFrozen(pendingRow)) replace(pendingRow, absorb(pendingRow, txn));
      return;
    }
    if (txn.date < EXPENSES_SYNC_FROM || txn.amount <= 0) return;
    const relinked = findRelinked(txn);
    if (relinked) {
      replace(relinked, absorb(relinked, txn));
      return;
    }
    const row = fresh(txn);
    ops.push({ kind: "insert", row });
    rows.set(row.transactionId, row);
  }

  function modify(row: ExpenseTransaction, txn: BankTransaction) {
    if (isFrozen(row)) return;
    const unchanged =
      row.bankAmount === txn.amount &&
      row.bankMerchant === txn.merchant &&
      row.bankDate === txn.date &&
      row.isPending === txn.pending;
    if (!unchanged) replace(row, absorb(row, txn));
  }

  for (const txn of changes.added) add(txn);
  for (const txn of changes.modified) add(txn);
  for (const id of changes.removed) {
    const row = rows.get(id);
    if (!row || isFrozen(row) || row.status === "EXCLUDED") continue;
    // Already flagged by a run that failed before saving its cursor.
    if (row.revision?.removedByBank) continue;
    if (row.status === "APPROVED" && !row.isPending) {
      replace(row, {
        ...row,
        status: "PENDING_REVIEW",
        revision: { revisedAt: now, changes: {}, removedByBank: true },
        updatedAt: now,
      });
    } else {
      ops.push({ kind: "delete", id, previousUpdatedAt: row.updatedAt });
      rows.delete(id);
    }
  }
  return ops;
}

/** Accounts seen on an earlier sync that the bank no longer shares. Matched by type + mask: ids can change on re-link. */
export function findMissingAccounts(known: BankAccount[], live: BankAccount[]): BankAccount[] {
  const key = (a: BankAccount) => `${a.type}|${a.mask}`;
  const liveKeys = new Set(live.map(key));
  return known.filter((a) => !liveKeys.has(key(a)));
}

/** Every account ever shared; live details win. */
export function mergeKnownAccounts(known: BankAccount[], live: BankAccount[]): BankAccount[] {
  return [...live, ...findMissingAccounts(known, live)];
}

export function monthOf(date: string): string {
  return date.slice(0, 7);
}

export function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const index = y * 12 + (m - 1) + by;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export interface MonthSummary {
  total: number;
  count: number;
  perDay: number;
  byCategory: Array<{ categoryId: string | null; amount: number }>;
}

export function summarizeMonth(transactions: ExpenseTransaction[], month: string): MonthSummary {
  const approved = transactions.filter((t) => t.status === "APPROVED" && monthOf(t.date) === month);
  const total = approved.reduce((sum, t) => sum + t.originalAmount, 0);
  const amounts = new Map<string | null, number>();
  for (const t of approved) {
    const key = t.categoryId ?? null;
    amounts.set(key, (amounts.get(key) ?? 0) + t.originalAmount);
  }
  return {
    total,
    count: approved.length,
    perDay: total / daysInMonth(month),
    byCategory: [...amounts].map(([categoryId, amount]) => ({ categoryId, amount })).sort((a, b) => b.amount - a.amount),
  };
}
