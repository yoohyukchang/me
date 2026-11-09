"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/financial-management/client";
import type { Currency, ManualHolding } from "@/lib/financial-management/types";
import { useToast } from "./toast";

interface Draft {
  ticker: string;
  name: string;
  accountName: string;
  shares: string;
  price: string;
  currency: Currency;
}

const emptyDraft: Draft = { ticker: "", name: "", accountName: "", shares: "", price: "", currency: "USD" };
const fieldClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

export default function ManualHoldingForm({
  editing,
  onDone,
  onCancel,
}: {
  editing: ManualHolding | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const showToast = useToast();
  const [draft, setDraft] = useState<Draft>(
    editing
      ? {
          ticker: editing.ticker,
          name: editing.name,
          accountName: editing.accountName,
          shares: String(editing.shares),
          price: String(editing.price),
          currency: editing.currency,
        }
      : emptyDraft
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const shares = Number(draft.shares);
    const price = Number(draft.price);
    if (draft.ticker.trim().length === 0 || draft.name.trim().length === 0) {
      setError("Ticker and name are required");
      return;
    }
    if (!Number.isFinite(shares) || shares < 0) {
      setError("Shares must be a non-negative number");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a non-negative number");
      return;
    }

    const body = JSON.stringify({
      ticker: draft.ticker.trim(),
      name: draft.name.trim(),
      accountName: draft.accountName.trim() || "Manual",
      shares,
      price,
      currency: draft.currency,
    });

    try {
      if (editing) {
        await apiRequest(`/api/financial-management/holdings/manual/${editing.id}`, { method: "PATCH", body });
        showToast(`Updated ${draft.ticker.trim().toUpperCase()}`);
      } else {
        await apiRequest("/api/financial-management/holdings/manual", { method: "POST", body });
        showToast(`Added ${draft.ticker.trim().toUpperCase()}`);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save holding");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-900">{editing ? "Edit holding" : "Add holding"}</h4>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <label className="text-xs font-medium text-gray-600">
          Ticker
          <input
            autoFocus
            value={draft.ticker}
            onChange={(e) => setDraft((d) => ({ ...d, ticker: e.target.value }))}
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="text-xs font-medium text-gray-600 col-span-2">
          Name
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="text-xs font-medium text-gray-600 col-span-2">
          Account
          <input
            value={draft.accountName}
            onChange={(e) => setDraft((d) => ({ ...d, accountName: e.target.value }))}
            placeholder="e.g. Kiwoom Securities"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="text-xs font-medium text-gray-600">
          Currency
          <select
            value={draft.currency}
            onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value as Currency }))}
            className={`${fieldClass} mt-1`}
          >
            <option value="USD">USD</option>
            <option value="KRW">KRW</option>
          </select>
        </label>
        <label className="text-xs font-medium text-gray-600">
          Shares
          <input
            type="number"
            step="any"
            value={draft.shares}
            onChange={(e) => setDraft((d) => ({ ...d, shares: e.target.value }))}
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="text-xs font-medium text-gray-600">
          Price ({draft.currency})
          <input
            type="number"
            step="any"
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
            className={`${fieldClass} mt-1`}
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button type="submit" className="rounded-lg bg-black text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity">
          {editing ? "Save changes" : "Add holding"}
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-2 text-sm text-gray-500">
          Cancel
        </button>
      </div>
    </form>
  );
}
