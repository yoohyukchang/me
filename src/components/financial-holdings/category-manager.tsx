"use client";

import { useState } from "react";
import type { Category } from "@/lib/financial-holdings/types";
import { CATEGORY_PALETTE, nextPaletteColor } from "@/lib/financial-holdings/format";
import { useToast } from "./toast";

export default function CategoryManager({
  categories,
  stockCountByCategory,
  onCreate,
  onRename,
  onRecolor,
  onDelete,
}: {
  categories: Category[];
  stockCountByCategory: Record<string, number>;
  onCreate: (name: string, color: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onRecolor: (id: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(nextPaletteColor(categories.length));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (newName.trim().length === 0) return;
    setError(null);
    try {
      await onCreate(newName.trim(), newColor);
      showToast(`Added category "${newName.trim()}"`);
      setNewName("");
      setNewColor(nextPaletteColor(categories.length + 1));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create category";
      setError(message);
      showToast(message, "error");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await onDelete(id);
      showToast("Category removed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete category";
      setError(message);
      showToast(message, "error");
    }
  }

  async function handleRecolor(id: string, color: string) {
    try {
      await onRecolor(id, color);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update category color",
        "error"
      );
    }
  }

  function startEditing(category: Category) {
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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>

      <div className="space-y-2 mb-5">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex gap-1 shrink-0">
                {CATEGORY_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleRecolor(category.id, color)}
                    className="h-4 w-4 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      outline:
                        category.color === color ? "2px solid #171717" : "none",
                      outlineOffset: 1,
                    }}
                    aria-label={`Set color ${color}`}
                  />
                ))}
              </div>
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
                  className="text-sm border-b border-gray-300 focus:outline-none focus:border-accent bg-transparent min-w-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => startEditing(category)}
                  className="text-sm text-gray-800 truncate text-left hover:text-black"
                >
                  {category.name}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-gray-400">
                {stockCountByCategory[category.id] ?? 0} stock
                {(stockCountByCategory[category.id] ?? 0) === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(category.id)}
                className="text-xs text-gray-400 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-gray-400">No categories yet — add one below.</p>
        )}
      </div>

      <form onSubmit={handleCreate} className="flex items-center gap-2.5">
        <div className="flex gap-1">
          {CATEGORY_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewColor(color)}
              className="h-5 w-5 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                outline: newColor === color ? "2px solid #171717" : "none",
                outlineOffset: 1,
              }}
              aria-label={`Choose color ${color}`}
            />
          ))}
        </div>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category (e.g. Wildcards)"
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
    </div>
  );
}
