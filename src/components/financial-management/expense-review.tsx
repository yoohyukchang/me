"use client";

import { useState } from "react";
import type { ExpenseCategory, ExpenseTransaction } from "@/lib/financial-management/expenses";
import { formatCurrency } from "@/lib/financial-management/format";
import type { ExpenseDraft } from "./expense-form";
import type { ReviewAction } from "./expenses-tab";

function RevisionNote({ transaction }: { transaction: ExpenseTransaction }) {
  if (!transaction.revision) return null;
  const { changes, removedByBank } = transaction.revision;
  return (
    <p className="mt-1 text-xs text-amber-700">
      {removedByBank
        ? "The bank removed this transaction after you confirmed it."
        : "The bank changed this after you confirmed it."}
      {changes.originalAmount &&
        ` Amount ${formatCurrency(changes.originalAmount.from)} → ${formatCurrency(changes.originalAmount.to)}.`}
      {changes.merchantName && ` Merchant ${changes.merchantName.from} → ${changes.merchantName.to}.`}
    </p>
  );
}

export default function ExpenseReview({
  queue,
  categories,
  onUpdate,
  onReview,
  onEdit,
}: {
  queue: ExpenseTransaction[];
  categories: ExpenseCategory[];
  onUpdate: (id: string, patch: Partial<ExpenseDraft>) => Promise<boolean>;
  onReview: (id: string, action: ReviewAction) => Promise<void>;
  onEdit: (transaction: ExpenseTransaction) => void;
}) {
  const [busy, setBusy] = useState<Set<string>>(new Set());

  async function act(id: string, work: () => Promise<unknown>) {
    setBusy((prev) => new Set(prev).add(id));
    try {
      await work();
    } finally {
      setBusy((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  if (queue.length === 0) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <p className="font-medium">All caught up</p>
        <p className="mt-2 text-sm text-gray-500">New card and checking transactions show up here to confirm.</p>
      </section>
    );
  }

  return (
    <section aria-label="Review" className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <ul>
        {queue.map((t) => {
          const working = busy.has(t.transactionId);
          return (
            <li key={t.transactionId} className="border-b border-gray-100 px-5 py-4 last:border-0 md:px-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <button type="button" onClick={() => onEdit(t)} className="min-w-0 flex-1 text-left">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-gray-900">{t.merchantName}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">{formatCurrency(t.originalAmount)}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-400">
                    {t.date} · {t.institutionName}
                    {t.accountMask && ` ••${t.accountMask}`}
                    {t.isPending && " · Pending"}
                    {t.status === "DEFERRED" && " · Deferred"}
                    {t.isSubscription && " · Subscription"}
                    {t.notes && ` · ${t.notes}`}
                  </span>
                  <RevisionNote transaction={t} />
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`Category for ${t.merchantName}`}
                    value={t.categoryId ?? ""}
                    disabled={working}
                    onChange={(e) => act(t.transactionId, () => onUpdate(t.transactionId, { categoryId: e.target.value }))}
                    className="w-40 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="" disabled>Category…</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={working || !t.categoryId}
                    onClick={() => act(t.transactionId, () => onReview(t.transactionId, "APPROVE"))}
                    className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-30"
                  >
                    Confirm
                  </button>
                  {t.status !== "DEFERRED" && (
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => act(t.transactionId, () => onReview(t.transactionId, "DEFER"))}
                      className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50"
                    >
                      Defer
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => act(t.transactionId, () => onReview(t.transactionId, "EXCLUDE"))}
                    className="px-2 py-1.5 text-sm text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    Exclude
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
