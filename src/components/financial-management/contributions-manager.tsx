"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/financial-management/client";
import type { ContributionEntry, Currency } from "@/lib/financial-management/types";
import { useToast } from "./toast";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function money(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(amount);
}

interface Draft {
  date: string;
  amount: string;
  currency: Currency;
  rate: string;
  note: string;
}

const emptyDraft: Draft = { date: todayISO(), amount: "", currency: "USD", rate: "1", note: "" };
const fieldClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

export default function ContributionsManager({
  contributions,
  onChanged,
}: {
  contributions: ContributionEntry[];
  onChanged: () => void;
}) {
  const showToast = useToast();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [error, setError] = useState("");

  async function handleCurrencyChange(currency: Currency) {
    setDraft((d) => ({ ...d, currency }));
    if (currency !== "KRW" || editingId) return;
    setFetchingRate(true);
    try {
      const data = await apiRequest("/api/financial-management/fx-rate");
      setDraft((d) => ({ ...d, rate: String(data.rate) }));
    } catch {
      // Leave whatever rate was there — the field stays editable regardless.
    } finally {
      setFetchingRate(false);
    }
  }

  function startEdit(entry: ContributionEntry) {
    setEditingId(entry.id);
    setDraft({
      date: entry.date,
      amount: String(entry.amount),
      currency: entry.currency,
      rate: String(entry.rate),
      note: entry.note,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(draft.amount);
    const rate = draft.currency === "USD" ? 1 : Number(draft.rate);
    if (!Number.isFinite(amount)) {
      setError("Enter a valid amount");
      return;
    }
    if (draft.currency === "KRW" && (!Number.isFinite(rate) || rate <= 0)) {
      setError("Enter a valid exchange rate (won per $1)");
      return;
    }
    const body = JSON.stringify({ date: draft.date, amount, currency: draft.currency, rate, note: draft.note.trim() });
    try {
      if (editingId) {
        await apiRequest(`/api/financial-management/contributions/${editingId}`, { method: "PATCH", body });
        showToast("Contribution updated");
      } else {
        await apiRequest("/api/financial-management/contributions", { method: "POST", body });
        showToast("Contribution added");
      }
      closeForm();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contribution");
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/financial-management/contributions/${id}`, { method: "DELETE" });
      showToast("Contribution removed");
      onChanged();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove contribution", "error");
    }
  }

  const sorted = [...contributions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Contributions</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-xs font-medium text-accent hover:opacity-80 transition-opacity"
          >
            + Add contribution
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Money moved into the portfolio from outside it — a bank transfer, a Korean brokerage deposit,
        anything that isn&apos;t market growth. This is what Net Contribution and Return are measured against.
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <label className="text-xs font-medium text-gray-600">
              Date
              <input
                type="date"
                required
                value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                className={`${fieldClass} mt-1`}
              />
            </label>
            <label className="text-xs font-medium text-gray-600">
              Currency
              <select
                value={draft.currency}
                onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                className={`${fieldClass} mt-1`}
              >
                <option value="USD">USD</option>
                <option value="KRW">KRW</option>
              </select>
            </label>
            <label className="text-xs font-medium text-gray-600">
              Amount ({draft.currency})
              <input
                type="number"
                step="any"
                required
                value={draft.amount}
                onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
                className={`${fieldClass} mt-1`}
              />
            </label>
            {draft.currency === "KRW" && (
              <label className="text-xs font-medium text-gray-600">
                Rate (₩ per $1)
                <input
                  type="number"
                  step="any"
                  required
                  disabled={fetchingRate}
                  value={draft.rate}
                  onChange={(e) => setDraft((d) => ({ ...d, rate: e.target.value }))}
                  className={`${fieldClass} mt-1`}
                />
              </label>
            )}
            <label className="text-xs font-medium text-gray-600 col-span-2 md:col-span-1">
              Note (optional)
              <input
                value={draft.note}
                onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                placeholder="e.g. Kiwoom transfer"
                className={`${fieldClass} mt-1`}
              />
            </label>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-lg bg-black text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity">
              {editingId ? "Save changes" : "Add contribution"}
            </button>
            <button type="button" onClick={closeForm} className="px-3 py-2 text-sm text-gray-500">
              Cancel
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400">No contributions entered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                <th className="text-left font-medium pb-2 pr-4">Date</th>
                <th className="text-right font-medium pb-2 pr-4">Amount</th>
                <th className="text-left font-medium pb-2 pr-4">Note</th>
                <th className="pb-2 pr-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2.5 pr-4 text-sm text-gray-900">{entry.date}</td>
                  <td className="py-2.5 pr-4 text-sm text-gray-900 text-right tabular-nums">
                    {money(entry.amount, entry.currency)}
                  </td>
                  <td className="py-2.5 pr-4 text-sm text-gray-500">{entry.note}</td>
                  <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => startEdit(entry)}
                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors mr-3"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
