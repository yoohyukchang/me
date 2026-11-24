"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/financial-management/client";
import type { ExpenseCategory, ExpenseTransaction } from "@/lib/financial-management/expenses";
import { nextPaletteColor } from "@/lib/financial-management/format";
import { useToast } from "./toast";

const API = "/api/financial-management/expenses/categories";

export default function ExpenseCategories({
  categories,
  transactions,
  onChanged,
}: {
  categories: ExpenseCategory[];
  transactions: ExpenseTransaction[];
  onChanged: () => Promise<void>;
}) {
  const showToast = useToast();
  const [name, setName] = useState("");
  const [color, setColor] = useState(nextPaletteColor(categories.length));

  async function run(work: () => Promise<unknown>, message: string) {
    try {
      await work();
      showToast(message);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Something went wrong", "error");
    }
    await onChanged();
  }

  function save(id: string, patch: { name?: string; color?: string }) {
    return run(() => apiRequest(`${API}/${id}`, { method: "PATCH", body: JSON.stringify(patch) }), "Category updated");
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    await run(
      () => apiRequest(API, { method: "POST", body: JSON.stringify({ name, color }) }),
      `Added category "${name.trim()}"`
    );
    setName("");
  }

  const colorClass = "h-7 w-7 shrink-0 cursor-pointer rounded border border-gray-200 bg-white p-0.5";
  return (
    <section aria-label="Categories" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <ul className="mb-5 space-y-2">
        {categories.map((c) => {
          const count = transactions.filter((t) => t.categoryId === c.categoryId).length;
          return (
            <li key={c.categoryId} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
              <input
                type="color"
                aria-label={`Color for ${c.name}`}
                defaultValue={c.color}
                onBlur={(e) => e.target.value.toLowerCase() !== c.color.toLowerCase() && save(c.categoryId, { color: e.target.value })}
                className={colorClass}
              />
              <input
                aria-label={`Name of ${c.name}`}
                defaultValue={c.name}
                onBlur={(e) => {
                  const next = e.target.value.trim();
                  if (next && next !== c.name) void save(c.categoryId, { name: next });
                }}
                className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
              />
              <span className="shrink-0 text-xs text-gray-400">{count}</span>
              {count === 0 && (
                <button
                  type="button"
                  onClick={() => run(() => apiRequest(`${API}/${c.categoryId}`, { method: "DELETE" }), "Category removed")}
                  className="shrink-0 text-xs text-gray-400 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <form onSubmit={handleAdd} className="flex items-center gap-2.5">
        <input type="color" aria-label="New category color" value={color} onChange={(e) => setColor(e.target.value)} className={colorClass} />
        <input required placeholder="New category" value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90">Add</button>
      </form>
    </section>
  );
}
