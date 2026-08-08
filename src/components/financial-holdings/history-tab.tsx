"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/financial-holdings/client";
import { formatCurrency, formatPercent } from "@/lib/financial-holdings/format";
import type { HistoryEntry } from "@/lib/financial-holdings/types";
import { useToast } from "./toast";

interface DerivedRow extends HistoryEntry {
  totalProfit: number;
  returnOnNetContribution: number;
}

function withDerivedFields(entries: HistoryEntry[]): DerivedRow[] {
  return [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((entry) => {
      const totalProfit = entry.portfolioValue - entry.netContribution;
      const returnOnNetContribution =
        entry.netContribution !== 0 ? (totalProfit / entry.netContribution) * 100 : 0;
      return { ...entry, totalProfit, returnOnNetContribution };
    });
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function DollarField({
  value,
  onChange,
  onKeyDown,
  placeholder,
  wrapperClassName,
  inputClassName,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
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
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        type="number"
        step="any"
        className={inputClassName}
      />
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
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] leading-snug text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
        {text}
      </span>
    </span>
  );
}

const dollarInputClass =
  "w-full rounded-md border border-gray-300 pl-5 pr-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

function EntryRow({
  row,
  onUpdate,
  onDelete,
}: {
  row: DerivedRow;
  onUpdate: (
    id: string,
    update: Partial<Pick<HistoryEntry, "date" | "netContribution" | "portfolioValue">>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(row.date);
  const [netContribution, setNetContribution] = useState(String(row.netContribution));
  const [portfolioValue, setPortfolioValue] = useState(String(row.portfolioValue));
  const showToast = useToast();

  function startEdit() {
    setDate(row.date);
    setNetContribution(String(row.netContribution));
    setPortfolioValue(String(row.portfolioValue));
    setIsEditing(true);
  }

  async function handleSave() {
    const netContributionNum = Number(netContribution);
    const portfolioValueNum = Number(portfolioValue);

    if (date.trim().length === 0) {
      showToast("Date is required", "error");
      return;
    }
    if (!Number.isFinite(netContributionNum)) {
      showToast("Net contribution must be a number", "error");
      return;
    }
    if (!Number.isFinite(portfolioValueNum) || portfolioValueNum < 0) {
      showToast("Portfolio value must be a non-negative number", "error");
      return;
    }

    setSaving(true);
    try {
      await onUpdate(row.id, {
        date: date.trim(),
        netContribution: netContributionNum,
        portfolioValue: portfolioValueNum,
      });
      setIsEditing(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update entry", "error");
    } finally {
      setSaving(false);
    }
  }

  if (isEditing) {
    return (
      <tr className="border-b border-gray-100 last:border-0 bg-gray-50">
        <td className="py-3 pr-4">
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </td>
        <td className="py-3 pr-4">
          <DollarField
            value={netContribution}
            onChange={(e) => setNetContribution(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            wrapperClassName="w-28"
            inputClassName={dollarInputClass}
          />
        </td>
        <td className="py-3 pr-4">
          <DollarField
            value={portfolioValue}
            onChange={(e) => setPortfolioValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            wrapperClassName="w-28"
            inputClassName={dollarInputClass}
          />
        </td>
        <td className="py-3 pr-4 text-sm text-right tabular-nums text-gray-300">—</td>
        <td className="py-3 pr-4 text-sm text-right tabular-nums text-gray-300">—</td>
        <td className="py-3 pr-3 text-right whitespace-nowrap">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-medium text-accent hover:opacity-80 transition-opacity disabled:opacity-50 mr-3"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-4 text-sm text-gray-900">{row.date}</td>
      <td className="py-3 pr-4 text-sm text-gray-900 text-right tabular-nums">
        {formatCurrency(row.netContribution)}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-900 text-right tabular-nums">
        {formatCurrency(row.portfolioValue)}
      </td>
      <td
        className={`py-3 pr-4 text-sm text-right tabular-nums font-medium ${
          row.totalProfit >= 0 ? "text-green-700" : "text-red-600"
        }`}
      >
        {formatCurrency(row.totalProfit)}
      </td>
      <td
        className={`py-3 pr-4 text-sm text-right tabular-nums ${
          row.returnOnNetContribution >= 0 ? "text-green-700" : "text-red-600"
        }`}
      >
        {formatPercent(row.returnOnNetContribution, 2)}
      </td>
      <td className="py-3 pr-3 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={startEdit}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors mr-3"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(row.id)}
          className="text-xs text-gray-400 hover:text-red-600 transition-colors"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

export default function HistoryTab() {
  const showToast = useToast();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [date, setDate] = useState(todayISO());
  const [netContribution, setNetContribution] = useState("");
  const [portfolioValue, setPortfolioValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await apiRequest("/api/financial-holdings/history");
    setEntries(data.entries);
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

  const rows = useMemo(() => withDerivedFields(entries), [entries]);

  async function handleUpdate(
    id: string,
    update: Partial<Pick<HistoryEntry, "date" | "netContribution" | "portfolioValue">>
  ) {
    await apiRequest(`/api/financial-holdings/history/${id}`, {
      method: "PATCH",
      body: JSON.stringify(update),
    });
    await refresh();
  }

  async function handleDelete(id: string) {
    await apiRequest(`/api/financial-holdings/history/${id}`, {
      method: "DELETE",
    });
    await refresh();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const netContributionNum = Number(netContribution);
    const portfolioValueNum = Number(portfolioValue);

    if (date.trim().length === 0) {
      setError("Date is required");
      return;
    }
    if (!Number.isFinite(netContributionNum)) {
      setError("Net contribution must be a number");
      return;
    }
    if (!Number.isFinite(portfolioValueNum) || portfolioValueNum < 0) {
      setError("Portfolio value must be a non-negative number");
      return;
    }

    try {
      await apiRequest("/api/financial-holdings/history", {
        method: "POST",
        body: JSON.stringify({
          date,
          netContribution: netContributionNum,
          portfolioValue: portfolioValueNum,
        }),
      });
      await refresh();
      showToast("Added entry");
      setDate(todayISO());
      setNetContribution("");
      setPortfolioValue("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add entry";
      setError(message);
      showToast(message, "error");
    }
  }

  if (loading) {
    return (
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="text-center text-gray-400 text-sm py-16">Loading…</div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
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
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">History</h2>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 mb-6">No entries yet.</p>
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                <th className="text-left font-medium pb-2 pr-4">Date</th>
                <th className="text-right font-medium pb-2 pr-4">
                  Net Contribution
                  <InfoTooltip text="(Cumulative Fidelity Cash) + (Cumulative 키움증권 Cash) − (Realized G/L on Yahoo Finance)" />
                </th>
                <th className="text-right font-medium pb-2 pr-4">
                  Portfolio Value
                  <InfoTooltip text="Check on Yahoo Finance" />
                </th>
                <th className="text-right font-medium pb-2 pr-4">Total Profit</th>
                <th className="text-right font-medium pb-2 pr-4">Return on Net Contribution</th>
                <th className="pb-2 pr-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <EntryRow key={row.id} row={row} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          type="date"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <DollarField
          value={netContribution}
          onChange={(e) => setNetContribution(e.target.value)}
          placeholder="Net contribution"
          wrapperClassName=""
          inputClassName="w-full rounded-lg border border-gray-300 pl-5 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <DollarField
          value={portfolioValue}
          onChange={(e) => setPortfolioValue(e.target.value)}
          placeholder="Portfolio value"
          wrapperClassName=""
          inputClassName="w-full rounded-lg border border-gray-300 pl-5 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <button
          type="submit"
          className="rounded-lg bg-black text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Add entry
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </section>
  );
}
