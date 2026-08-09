"use client";

import { useState } from "react";
import type { BudgetCategory } from "@/lib/financial-holdings/types";
import { useToast } from "./toast";

export default function BudgetCategoryManager({
  categories,
  onCreate,
  onRename,
  onArchive,
  onUnarchive,
}: {
  categories: BudgetCategory[];
  onCreate: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onUnarchive: (id: string) => Promise<void>;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const showToast = useToast();

  const active = categories.filter((category) => !category.archived);
  const archived = categories.filter((category) => category.archived);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (newName.trim().length === 0) return;
    setError(null);
    try {
      await onCreate(newName.trim());
      showToast(`Added category "${newName.trim()}"`);
      setNewName("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create category";
      setError(message);
      showToast(message, "error");
    }
  }

  async function handleArchive(id: string) {
    setError(null);
    try {
      await onArchive(id);
      showToast("Category archived");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to archive category";
      setError(message);
      showToast(message, "error");
    }
  }

  async function handleUnarchive(id: string) {
    setError(null);
    try {
      await onUnarchive(id);
      showToast("Category unarchived");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unarchive category";
      setError(message);
      showToast(message, "error");
    }
  }

  function startEditing(category: BudgetCategory) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  async function saveEditing(id: string) {
    if (editingName.trim().length === 0) {
      setEditingId(null);
      return;
    }
    try {
      await onRename(id, editingName.trim());
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to rename category", "error");
    }
    setEditingId(null);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Categories</h2>

      <div className="space-y-2 mb-5">
        {active.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3.5 py-2.5"
          >
            {editingId === category.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => saveEditing(category.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEditing(category.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="text-sm border-b border-gray-300 focus:outline-none focus:border-accent bg-transparent min-w-0 flex-1"
              />
            ) : (
              <button
                type="button"
                onClick={() => startEditing(category)}
                className="text-sm text-gray-800 truncate text-left hover:text-black flex-1 min-w-0"
              >
                {category.name}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleArchive(category.id)}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors shrink-0"
            >
              Archive
            </button>
          </div>
        ))}
        {active.length === 0 && (
          <p className="text-sm text-gray-400">No categories yet — add one below.</p>
        )}
      </div>

      <form onSubmit={handleCreate} className="flex items-center gap-2.5">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category (e.g. 렌트)"
          className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <button
          type="submit"
          className="rounded-lg bg-black text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity shrink-0"
        >
          Add
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {archived.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showArchived ? "Hide" : "Show"} archived ({archived.length})
          </button>
          {showArchived && (
            <div className="space-y-2 mt-3">
              {archived.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3.5 py-2.5 opacity-60"
                >
                  <span className="text-sm text-gray-600 truncate">{category.name}</span>
                  <button
                    type="button"
                    onClick={() => handleUnarchive(category.id)}
                    className="text-xs text-gray-400 hover:text-black transition-colors shrink-0"
                  >
                    Unarchive
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
