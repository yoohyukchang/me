"use client";

import { useMemo, useState } from "react";
import { monthOf, type ExpenseCategory, type ExpenseTransaction } from "@/lib/financial-management/expenses";
import { formatCurrency } from "@/lib/financial-management/format";
import type { ReviewAction } from "./expenses-tab";

type Sort = "newest" | "oldest" | "highest" | "lowest";
const PAGE_SIZE = 50;
const selectClass = "rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

export default function ExpenseTransactions({
  transactions,
  categories,
  onEdit,
  onReview,
}: {
  transactions: ExpenseTransaction[];
  categories: ExpenseCategory[];
  onEdit: (transaction: ExpenseTransaction) => void;
  onReview: (id: string, action: ReviewAction) => Promise<void>;
}) {
  const [view, setView] = useState<"APPROVED" | "EXCLUDED">("APPROVED");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const months = useMemo(() => [...new Set(transactions.map((t) => monthOf(t.date)))].sort().reverse(), [transactions]);
  const categoryById = new Map(categories.map((c) => [c.categoryId, c]));
  const query = search.trim().toLowerCase();
  const filtered = transactions
    .filter(
      (t) =>
        t.status === view &&
        (!query || t.merchantName.toLowerCase().includes(query) || (t.notes ?? "").toLowerCase().includes(query)) &&
        (!month || monthOf(t.date) === month) &&
        (!categoryId || t.categoryId === categoryId)
    )
    .sort((a, b) => {
      if (sort === "highest") return b.originalAmount - a.originalAmount;
      if (sort === "lowest") return a.originalAmount - b.originalAmount;
      return sort === "newest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
    });

  return (
    <section aria-label="Transactions" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap gap-2">
        <input aria-label="Search" placeholder="Search merchant or note" value={search} onChange={(e) => setSearch(e.target.value)} className={`${selectClass} min-w-40 flex-1 px-3`} />
        <select aria-label="Status" value={view} onChange={(e) => setView(e.target.value as typeof view)} className={selectClass}>
          <option value="APPROVED">Confirmed</option>
          <option value="EXCLUDED">Excluded</option>
        </select>
        <select aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)} className={selectClass}>
          <option value="">All time</option>
          {months.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select aria-label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${selectClass} max-w-40`}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectClass}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest</option>
          <option value="lowest">Lowest</option>
        </select>
      </div>
      <p className="my-4 text-xs text-gray-500">
        {filtered.length} transaction{filtered.length === 1 ? "" : "s"} ·{" "}
        <span className="tabular-nums">{formatCurrency(filtered.reduce((sum, t) => sum + t.originalAmount, 0))}</span>
      </p>
      <ul>
        {filtered.slice(0, visible).map((t) => {
          const category = t.categoryId ? categoryById.get(t.categoryId) : undefined;
          return (
            <li key={t.transactionId} className="flex items-center gap-4 border-b border-gray-100 py-2.5 last:border-0">
              <button type="button" onClick={() => onEdit(t)} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
                <span className="min-w-0">
                  <span className="block truncate text-sm text-gray-900">{t.merchantName}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                    {category && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />}
                    <span className="truncate">
                      {t.autoExcluded ? "Own transfer / card payment" : category?.name ?? "Uncategorized"} · {t.date}
                      {t.notes && ` · ${t.notes}`}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-sm tabular-nums">{formatCurrency(t.originalAmount)}</span>
              </button>
              <button
                type="button"
                onClick={() => onReview(t.transactionId, view === "APPROVED" ? "EXCLUDE" : "RESTORE")}
                className={`shrink-0 text-xs text-gray-400 ${view === "APPROVED" ? "hover:text-red-600" : "hover:text-gray-900"}`}
              >
                {view === "APPROVED" ? "Exclude" : "Restore"}
              </button>
            </li>
          );
        })}
      </ul>
      {visible < filtered.length && (
        <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50">
          Load more
        </button>
      )}
    </section>
  );
}
