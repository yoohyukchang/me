"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/financial-management/client";
import type { ExpenseCategory, ExpenseTransaction } from "@/lib/financial-management/expenses";
import { formatRelativeTime } from "@/lib/financial-management/format";
import type { PublicPlaidItem } from "@/lib/financial-management/types";
import ExpenseAnalysis from "./expense-analysis";
import ExpenseCategories from "./expense-categories";
import ExpenseForm, { type ExpenseDraft } from "./expense-form";
import ExpenseReview from "./expense-review";
import ExpenseTransactions from "./expense-transactions";
import { AlertIcon, SpinnerIcon } from "./icons";
import { useToast } from "./toast";

export type ReviewAction = "APPROVE" | "DEFER" | "EXCLUDE" | "RESTORE";

type Section = "review" | "analysis" | "transactions" | "categories";
const API = "/api/financial-management/expenses";

function connectionProblems(items: PublicPlaidItem[]): string[] {
  const problems: string[] = [];
  for (const item of items) {
    if (item.status === "login_required") problems.push(`${item.institutionName} needs to be reconnected.`);
    else if (item.expenseSyncError) problems.push(`${item.institutionName} failed to sync: ${item.expenseSyncError}`);
    for (const account of item.missingAccounts ?? []) {
      problems.push(
        `${item.institutionName} stopped sharing ${account.name} ••${account.mask}, so its transactions aren't coming in. Use Accounts → Manage accounts and select it again.`
      );
    }
  }
  return problems;
}

export default function ExpensesTab({ dataVersion }: { dataVersion: number }) {
  const showToast = useToast();
  const [section, setSection] = useState<Section>("review");
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [banks, setBanks] = useState<PublicPlaidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [editing, setEditing] = useState<ExpenseTransaction | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiRequest(API);
      setTransactions(data.transactions);
      setCategories(data.categories);
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load expenses.");
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const data = await apiRequest(`${API}/sync`, { method: "POST" });
      setBanks(data.items);
      setSyncError("");
      await load();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, [load]);

  useEffect(() => {
    void load();
    void sync();
  }, [load, sync, dataVersion]);

  const queue = useMemo(() => {
    const byDate = (a: ExpenseTransaction, b: ExpenseTransaction) => b.date.localeCompare(a.date);
    return [
      ...transactions.filter((t) => t.status === "PENDING_REVIEW").sort(byDate),
      ...transactions.filter((t) => t.status === "DEFERRED").sort(byDate),
    ];
  }, [transactions]);

  function replaceRow(row: ExpenseTransaction) {
    setTransactions((prev) => prev.map((t) => (t.transactionId === row.transactionId ? row : t)));
  }

  async function update(id: string, patch: Partial<ExpenseDraft>): Promise<boolean> {
    try {
      const data = await apiRequest(`${API}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
      replaceRow(data.transaction);
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Couldn't save that change", "error");
      void load();
      return false;
    }
  }

  async function review(id: string, action: ReviewAction) {
    try {
      const data = await apiRequest(`${API}/${encodeURIComponent(id)}/review`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      replaceRow(data.transaction);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Couldn't update that transaction", "error");
      void load();
    }
  }

  async function saveForm(draft: ExpenseDraft) {
    if (editing) {
      if (await update(editing.transactionId, draft)) {
        showToast("Transaction updated");
        setEditing(null);
      }
      return;
    }
    try {
      await apiRequest(API, { method: "POST", body: JSON.stringify(draft) });
      showToast("Expense added to review");
      setAdding(false);
      await load();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Couldn't add that expense", "error");
    }
  }

  if (loading || loadError) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        {loading ? (
          <p role="status" className="py-12 text-sm text-gray-400">Loading expenses…</p>
        ) : (
          <>
            <p role="alert" className="py-4 text-sm text-red-600">{loadError}</p>
            <button type="button" onClick={load} className="rounded-lg bg-black px-4 py-2 text-sm text-white">Retry</button>
          </>
        )}
      </section>
    );
  }

  const problems = [...(syncError ? [`Sync failed: ${syncError}`] : []), ...connectionProblems(banks)];
  const lastSync = banks.map((b) => b.lastExpenseSyncAt ?? "").sort()[0] || null;
  const sections: Array<{ id: Section; label: string }> = [
    { id: "review", label: queue.length > 0 ? `Review (${queue.length})` : "Review" },
    { id: "analysis", label: "Analysis" },
    { id: "transactions", label: "Transactions" },
    { id: "categories", label: "Categories" },
  ];

  return (
    <div className="space-y-6">
      {problems.length > 0 && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {problems.map((p) => (
            <p key={p} className="flex items-start gap-2 py-0.5">
              <AlertIcon className="mt-0.5 shrink-0" />
              <span>{p}</span>
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex max-w-full overflow-x-auto rounded-lg bg-gray-100 p-1" role="group" aria-label="Expenses section">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={section === s.id}
              onClick={() => setSection(s.id)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                section === s.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={sync}
            disabled={syncing}
            className="flex items-center gap-1.5 text-gray-400 transition-colors hover:text-gray-700"
          >
            {syncing && <SpinnerIcon />}
            {syncing ? "Syncing…" : lastSync ? `Synced ${formatRelativeTime(lastSync)}` : "Sync"}
          </button>
          <button type="button" onClick={() => setAdding(true)} className="font-medium text-accent hover:opacity-80">
            + Add expense
          </button>
        </div>
      </div>

      {section === "review" && (
        <ExpenseReview queue={queue} categories={categories} onUpdate={update} onReview={review} onEdit={setEditing} />
      )}
      {section === "analysis" && <ExpenseAnalysis transactions={transactions} categories={categories} />}
      {section === "transactions" && (
        <ExpenseTransactions transactions={transactions} categories={categories} onEdit={setEditing} onReview={review} />
      )}
      {section === "categories" && (
        <ExpenseCategories categories={categories} transactions={transactions} onChanged={load} />
      )}

      {(editing || adding) && (
        <ExpenseForm
          key={editing?.transactionId ?? "new"}
          transaction={editing}
          categories={categories}
          onSave={saveForm}
          onClose={() => {
            setEditing(null);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}
