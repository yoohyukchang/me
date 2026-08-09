"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/financial-holdings/client";
import { formatCurrency, formatMonthId } from "@/lib/financial-holdings/format";
import type { BudgetAllocation, BudgetCategory, BudgetMonth } from "@/lib/financial-holdings/types";
import BudgetCategoryManager from "./budget-category-manager";
import { useToast } from "./toast";

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 };
}

function computeRolloverByCategory(
  months: BudgetMonth[],
  beforeMonthId: string
): Map<string, number> {
  const prior = months.filter((m) => m.id < beforeMonthId);
  const totals = new Map<string, number>();
  for (const m of prior) {
    for (const a of m.allocations) {
      const budgeted = m.income * (a.percentage / 100);
      totals.set(a.categoryId, (totals.get(a.categoryId) ?? 0) + (budgeted - a.spent));
    }
  }
  return totals;
}

function DollarField({
  value,
  onChange,
  onBlur,
  wrapperClassName,
  inputClassName,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  wrapperClassName: string;
  inputClassName: string;
}) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
        $
      </span>
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        type="number"
        step="any"
        className={inputClassName}
      />
    </div>
  );
}

function PercentField({
  value,
  onChange,
  onBlur,
  wrapperClassName,
  inputClassName,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  wrapperClassName: string;
  inputClassName: string;
}) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        type="number"
        step="any"
        className={inputClassName}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
        %
      </span>
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group ml-1 align-middle normal-case font-normal">
      <span
        tabIndex={0}
        className="flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 text-[9px] leading-none cursor-help hover:border-gray-400 hover:text-gray-600 focus:outline-none focus:border-accent focus:text-accent"
      >
        i
      </span>
      <span className="pointer-events-none absolute right-0 top-full mt-2 w-56 rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] leading-snug text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
        {text}
      </span>
    </span>
  );
}

const dollarInputClass =
  "w-full rounded-md border border-gray-300 pl-5 pr-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";
const percentInputClass =
  "w-full rounded-md border border-gray-300 pl-2 pr-6 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

export default function IncomeExpenseTab() {
  const showToast = useToast();
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [months, setMonths] = useState<BudgetMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [incomeInput, setIncomeInput] = useState("0");
  const [allocationInputs, setAllocationInputs] = useState<
    Record<string, { percentage?: string; spent?: string }>
  >({});

  const refresh = useCallback(async () => {
    const [categoriesData, monthsData] = await Promise.all([
      apiRequest("/api/financial-holdings/income-expense/categories"),
      apiRequest("/api/financial-holdings/income-expense/months"),
    ]);
    setBudgetCategories(categoriesData.categories);
    setMonths(monthsData.months);
  }, []);

  const loadInitialData = useCallback(() => {
    setLoading(true);
    refresh()
      .then(() => setLoadError(null))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load your data";
        setLoadError(message);
        showToast(message, "error");
      })
      .finally(() => setLoading(false));
  }, [refresh, showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const selectedMonthId = formatMonthId(selectedYear, selectedMonth);

  const activeCategories = useMemo(
    () =>
      [...budgetCategories]
        .filter((c) => !c.archived)
        .sort((a, b) => a.order - b.order),
    [budgetCategories]
  );

  const currentMonth = useMemo(
    () => months.find((m) => m.id === selectedMonthId),
    [months, selectedMonthId]
  );

  const priorMonthForCopy = useMemo(() => {
    const prior = months.filter((m) => m.id < selectedMonthId);
    if (prior.length === 0) return undefined;
    return prior.reduce((latest, m) => (m.id > latest.id ? m : latest));
  }, [months, selectedMonthId]);

  const displayAllocations = useMemo(() => {
    const map = new Map<string, { percentage: number; spent: number }>();
    for (const category of activeCategories) {
      const inCurrent = currentMonth?.allocations.find((a) => a.categoryId === category.id);
      if (inCurrent) {
        map.set(category.id, { percentage: inCurrent.percentage, spent: inCurrent.spent });
        continue;
      }
      const inPrior = priorMonthForCopy?.allocations.find((a) => a.categoryId === category.id);
      if (inPrior && !currentMonth) {
        map.set(category.id, { percentage: inPrior.percentage, spent: 0 });
        continue;
      }
      map.set(category.id, { percentage: 0, spent: 0 });
    }
    return map;
  }, [activeCategories, currentMonth, priorMonthForCopy]);

  const rolloverByCategory = useMemo(
    () => computeRolloverByCategory(months, selectedMonthId),
    [months, selectedMonthId]
  );

  // Reset local input buffers when navigating to a different month, and once
  // more when the initial fetch finishes — `loading` flips true→false exactly
  // once, so this still doesn't fire on every `months` update (e.g. a save
  // round-trip on the current month), which would otherwise wipe out an
  // in-flight edit on a sibling field.
  useEffect(() => {
    if (loading) return;
    setAllocationInputs({});
    setIncomeInput(String(currentMonth?.income ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonthId, loading]);

  function getPercentageValue(categoryId: string): number {
    const local = allocationInputs[categoryId]?.percentage;
    if (local !== undefined) {
      const n = Number(local);
      return Number.isFinite(n) ? n : 0;
    }
    return displayAllocations.get(categoryId)?.percentage ?? 0;
  }

  function getSpentValue(categoryId: string): number {
    const local = allocationInputs[categoryId]?.spent;
    if (local !== undefined) {
      const n = Number(local);
      return Number.isFinite(n) ? n : 0;
    }
    return displayAllocations.get(categoryId)?.spent ?? 0;
  }

  function getPercentageInputValue(categoryId: string): string {
    return (
      allocationInputs[categoryId]?.percentage ??
      String(displayAllocations.get(categoryId)?.percentage ?? 0)
    );
  }

  function getSpentInputValue(categoryId: string): string {
    return (
      allocationInputs[categoryId]?.spent ??
      String(displayAllocations.get(categoryId)?.spent ?? 0)
    );
  }

  const income = Number(incomeInput);
  const incomeIsValid = Number.isFinite(income) && income >= 0;
  const percentageSum = activeCategories.reduce((sum, c) => sum + getPercentageValue(c.id), 0);
  const percentageSumOk = Math.abs(percentageSum - 100) <= 0.05 || activeCategories.length === 0;

  function revertField(categoryId: string, field: "percentage" | "spent") {
    setAllocationInputs((prev) => {
      const entry = { ...(prev[categoryId] ?? {}) };
      delete entry[field];
      return { ...prev, [categoryId]: entry };
    });
  }

  function buildBaseAllocationsForSave(): BudgetAllocation[] {
    if (currentMonth) {
      return currentMonth.allocations;
    }
    if (priorMonthForCopy) {
      const activeIds = new Set(activeCategories.map((c) => c.id));
      return priorMonthForCopy.allocations
        .filter((a) => activeIds.has(a.categoryId))
        .map((a) => ({ categoryId: a.categoryId, percentage: a.percentage, spent: 0 }));
    }
    return activeCategories.map((c) => ({ categoryId: c.id, percentage: 0, spent: 0 }));
  }

  async function saveMonth(patch: {
    income?: number;
    allocationOverride?: { categoryId: string; percentage?: number; spent?: number };
  }) {
    const base = buildBaseAllocationsForSave();
    let allocations = base;
    if (patch.allocationOverride) {
      const { categoryId, ...fields } = patch.allocationOverride;
      const idx = base.findIndex((a) => a.categoryId === categoryId);
      allocations =
        idx === -1
          ? [...base, { categoryId, percentage: 0, spent: 0, ...fields }]
          : base.map((a, i) => (i === idx ? { ...a, ...fields } : a));
    }
    const data = await apiRequest(`/api/financial-holdings/income-expense/months/${selectedMonthId}`, {
      method: "PUT",
      body: JSON.stringify({
        year: selectedYear,
        month: selectedMonth,
        income: patch.income ?? currentMonth?.income ?? 0,
        allocations,
      }),
    });
    setMonths((prev) => {
      const idx = prev.findIndex((m) => m.id === selectedMonthId);
      if (idx === -1) return [...prev, data.month];
      const next = [...prev];
      next[idx] = data.month;
      return next;
    });
  }

  async function commitIncome() {
    const value = Number(incomeInput);
    if (!Number.isFinite(value) || value < 0) {
      setIncomeInput(String(currentMonth?.income ?? 0));
      return;
    }
    try {
      await saveMonth({ income: value });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save income", "error");
      setIncomeInput(String(currentMonth?.income ?? 0));
    }
  }

  async function commitAllocationField(categoryId: string, field: "percentage" | "spent") {
    const raw = allocationInputs[categoryId]?.[field];
    if (raw === undefined) return;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      revertField(categoryId, field);
      return;
    }
    try {
      await saveMonth({ allocationOverride: { categoryId, [field]: value } });
      revertField(categoryId, field);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "error");
      revertField(categoryId, field);
    }
  }

  function handlePrevMonth() {
    const { year, month } = shiftMonth(selectedYear, selectedMonth, -1);
    setSelectedYear(year);
    setSelectedMonth(month);
  }

  function handleNextMonth() {
    const { year, month } = shiftMonth(selectedYear, selectedMonth, 1);
    setSelectedYear(year);
    setSelectedMonth(month);
  }

  function handleMonthInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value; // "YYYY-MM"
    if (!/^\d{4}-\d{2}$/.test(raw)) return;
    const [year, month] = raw.split("-").map(Number);
    setSelectedYear(year);
    setSelectedMonth(month);
  }

  async function handleCreateBudgetCategory(name: string) {
    await apiRequest("/api/financial-holdings/income-expense/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    await refresh();
  }

  async function handleRenameBudgetCategory(id: string, name: string) {
    await apiRequest(`/api/financial-holdings/income-expense/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    await refresh();
  }

  async function handleArchiveBudgetCategory(id: string) {
    await apiRequest(`/api/financial-holdings/income-expense/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    });
    await refresh();
  }

  async function handleUnarchiveBudgetCategory(id: string) {
    await apiRequest(`/api/financial-holdings/income-expense/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: false }),
    });
    await refresh();
  }

  if (loading) {
    return <div className="text-center text-gray-400 text-sm py-16">Loading…</div>;
  }

  if (loadError) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-600 mb-4">{loadError}</p>
        <button
          type="button"
          onClick={loadInitialData}
          className="rounded-lg bg-black text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="text-gray-400 hover:text-gray-700 transition-colors px-2 py-1"
          >
            ←
          </button>
          <input
            type="month"
            value={selectedMonthId}
            onChange={handleMonthInputChange}
            className="appearance-none bg-transparent text-lg font-semibold text-gray-900 text-center cursor-pointer border-none focus:outline-none"
          />
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="text-gray-400 hover:text-gray-700 transition-colors px-2 py-1"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Income</h2>
            <DollarField
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
              onBlur={commitIncome}
              wrapperClassName=""
              inputClassName="w-full rounded-lg border border-gray-300 pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense</h2>
            {!percentageSumOk && (
              <div className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm mb-3">
                Percentages add up to {percentageSum.toFixed(1)}% (should be 100%).
              </div>
            )}
            {activeCategories.length === 0 ? (
              <p className="text-sm text-gray-400">No categories yet — add one below.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs text-gray-500">
                      <th className="text-left font-medium pb-2 pr-3">Category</th>
                      <th className="text-right font-medium pb-2 pr-3">%</th>
                      <th className="text-right font-medium pb-2 pr-4">Budgeted</th>
                      <th className="text-right font-medium pb-2 pr-4">Spent</th>
                      <th className="text-right font-medium pb-2 pl-4 border-l border-gray-200">
                        Rollover
                        <InfoTooltip text="Unspent (or overspent) budget carried forward from every month, including this one." />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCategories.map((category) => {
                      const percentage = getPercentageValue(category.id);
                      const spent = getSpentValue(category.id);
                      const budgeted = (incomeIsValid ? income : 0) * (percentage / 100);
                      const rolloverIn = rolloverByCategory.get(category.id) ?? 0;
                      const rollover = rolloverIn + budgeted - spent;
                      return (
                        <tr key={category.id} className="border-b border-gray-100 last:border-0">
                          <td className="py-3 pr-3 text-sm text-gray-900">{category.name}</td>
                          <td className="py-3 pr-3">
                            <PercentField
                              value={getPercentageInputValue(category.id)}
                              onChange={(e) =>
                                setAllocationInputs((prev) => ({
                                  ...prev,
                                  [category.id]: {
                                    ...prev[category.id],
                                    percentage: e.target.value,
                                  },
                                }))
                              }
                              onBlur={() => commitAllocationField(category.id, "percentage")}
                              wrapperClassName="w-24 ml-auto"
                              inputClassName={percentInputClass}
                            />
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-900 text-right tabular-nums">
                            {formatCurrency(budgeted)}
                          </td>
                          <td className="py-3 pr-4">
                            <DollarField
                              value={getSpentInputValue(category.id)}
                              onChange={(e) =>
                                setAllocationInputs((prev) => ({
                                  ...prev,
                                  [category.id]: { ...prev[category.id], spent: e.target.value },
                                }))
                              }
                              onBlur={() => commitAllocationField(category.id, "spent")}
                              wrapperClassName="w-28 ml-auto"
                              inputClassName={dollarInputClass}
                            />
                          </td>
                          <td
                            className={`py-3 text-sm text-right tabular-nums font-medium pl-4 border-l border-gray-200 ${
                              rollover >= 0 ? "text-green-700" : "text-red-600"
                            }`}
                          >
                            {formatCurrency(rollover)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
        <BudgetCategoryManager
          categories={budgetCategories}
          onCreate={handleCreateBudgetCategory}
          onRename={handleRenameBudgetCategory}
          onArchive={handleArchiveBudgetCategory}
          onUnarchive={handleUnarchiveBudgetCategory}
        />
      </section>
    </div>
  );
}
