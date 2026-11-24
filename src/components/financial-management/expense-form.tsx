"use client";

import { useEffect, useState } from "react";
import type { ExpenseCategory, ExpenseTransaction } from "@/lib/financial-management/expenses";

export interface ExpenseDraft {
  merchantName: string;
  originalAmount: number;
  date: string;
  categoryId: string;
  notes: string;
  isSubscription: boolean;
}

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const fieldClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

export default function ExpenseForm({
  transaction,
  categories,
  onSave,
  onClose,
}: {
  transaction: ExpenseTransaction | null;
  categories: ExpenseCategory[];
  onSave: (draft: ExpenseDraft) => Promise<void>;
  onClose: () => void;
}) {
  const [merchantName, setMerchantName] = useState(transaction?.merchantName ?? "");
  const [amount, setAmount] = useState(transaction ? String(transaction.originalAmount) : "");
  const [date, setDate] = useState(transaction?.date ?? todayLocal());
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "");
  const [notes, setNotes] = useState(transaction?.notes ?? "");
  const [isSubscription, setIsSubscription] = useState(transaction?.isSubscription ?? false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ merchantName, originalAmount: Number(amount), date, categoryId, notes, isSubscription });
    } finally {
      setSaving(false);
    }
  }

  const title = transaction ? "Edit transaction" : "Add expense";
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 sm:items-center sm:p-6" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lg sm:rounded-2xl"
      >
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        <div className="grid grid-cols-2 gap-3 text-xs font-medium text-gray-600">
          <label className="col-span-2">
            Merchant
            <input required autoFocus={!transaction} value={merchantName} onChange={(e) => setMerchantName(e.target.value)} className={fieldClass} />
          </label>
          <label>
            Amount (USD)
            <input required type="number" step="0.01" min={transaction ? "0" : "0.01"} value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldClass} />
          </label>
          <label>
            Date
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
          </label>
          <label className="col-span-2">
            Category
            <select required={!transaction} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={fieldClass}>
              <option value="" disabled>Choose a category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2">
            Notes
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={fieldClass} />
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm font-normal text-gray-700">
            <input type="checkbox" checked={isSubscription} onChange={(e) => setIsSubscription(e.target.checked)} />
            Subscription
          </label>
        </div>
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : transaction ? "Save changes" : "Add expense"}
          </button>
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-gray-500">Cancel</button>
        </div>
      </form>
    </div>
  );
}
