"use client";

import { useMemo, useState } from "react";
import { monthOf, shiftMonth, summarizeMonth, type ExpenseCategory, type ExpenseTransaction } from "@/lib/financial-management/expenses";
import { formatCurrency, formatPercent } from "@/lib/financial-management/format";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string, style: "long" | "short"): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(
    "en-US",
    style === "long" ? { month: "long", year: "numeric" } : { month: "short" }
  );
}

const cardClass = "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm";

export default function ExpenseAnalysis({
  transactions,
  categories,
}: {
  transactions: ExpenseTransaction[];
  categories: ExpenseCategory[];
}) {
  const latest = currentMonth();
  const [month, setMonth] = useState(latest);
  const summary = useMemo(() => summarizeMonth(transactions, month), [transactions, month]);
  const trend = useMemo(
    () =>
      [-5, -4, -3, -2, -1, 0].map((by) => {
        const m = shiftMonth(month, by);
        return { month: m, total: summarizeMonth(transactions, m).total };
      }),
    [transactions, month]
  );
  const maxTrend = Math.max(1, ...trend.map((t) => t.total));
  const subscriptions = transactions.filter((t) => t.status === "APPROVED" && t.isSubscription && monthOf(t.date) === month);
  const categoryById = new Map(categories.map((c) => [c.categoryId, c]));

  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => shiftMonth(m, -1))} className="px-3 py-1 text-gray-500 hover:text-black">
            ‹
          </button>
          <h2 className="text-lg font-semibold">{monthLabel(month, "long")}</h2>
          <button type="button" aria-label="Next month" disabled={month >= latest} onClick={() => setMonth((m) => shiftMonth(m, 1))} className="px-3 py-1 text-gray-500 hover:text-black disabled:opacity-20">
            ›
          </button>
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[
            ["Total spent", formatCurrency(summary.total)],
            ["Transactions", String(summary.count)],
            ["Per day", formatCurrency(summary.perDay)],
          ].map(([label, value]) => (
            <div key={label}>
              <dd className="text-lg font-semibold tabular-nums md:text-2xl">{value}</dd>
              <dt className="mt-1 text-xs text-gray-500">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className={cardClass}>
          <h3 className="mb-4 text-sm font-semibold">By category</h3>
          {summary.byCategory.length === 0 && <p className="text-sm text-gray-400">No confirmed spending this month.</p>}
          <ul className="space-y-3">
            {summary.byCategory.map(({ categoryId, amount }) => {
              const category = categoryId ? categoryById.get(categoryId) : undefined;
              const percent = summary.total > 0 ? (amount / summary.total) * 100 : 0;
              return (
                <li key={categoryId ?? "none"}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate text-gray-700">{category?.name ?? "Uncategorized"}</span>
                    <span className="shrink-0 tabular-nums">
                      {formatCurrency(amount)} <span className="text-gray-400">{formatPercent(percent, 0)}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: category?.color ?? "#9ca3af" }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={cardClass}>
          <h3 className="mb-4 text-sm font-semibold">6-month trend</h3>
          <div className="flex h-52 items-end gap-3">
            {trend.map((t) => (
              <button key={t.month} type="button" onClick={() => setMonth(t.month)} disabled={t.month > latest} aria-label={`${monthLabel(t.month, "long")}: ${formatCurrency(t.total)}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] tabular-nums text-gray-500">{t.total > 0 ? `$${Math.round(t.total).toLocaleString()}` : "–"}</span>
                <span className={`w-full rounded-t-md ${t.month === month ? "bg-black" : "bg-gray-200"}`} style={{ height: `${Math.max(1, (t.total / maxTrend) * 75)}%` }} />
                <span className="text-xs text-gray-500">{monthLabel(t.month, "short")}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {subscriptions.length > 0 && (
        <section className={cardClass}>
          <h3 className="mb-3 flex justify-between text-sm font-semibold">
            <span>Subscriptions</span>
            <span className="tabular-nums">{formatCurrency(subscriptions.reduce((sum, t) => sum + t.originalAmount, 0))}</span>
          </h3>
          <ul>
            {subscriptions.map((t) => (
              <li key={t.transactionId} className="flex justify-between gap-3 border-b border-gray-100 py-2 text-sm last:border-0">
                <span className="truncate text-gray-700">
                  {t.merchantName} <span className="text-xs text-gray-400">{t.date}</span>
                </span>
                <span className="tabular-nums">{formatCurrency(t.originalAmount)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
