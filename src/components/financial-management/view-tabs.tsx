"use client";

import { useState } from "react";
import type { View } from "@/lib/financial-management/types";
import { useToast } from "./toast";

export default function ViewTabs({
  views,
  activeViewId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: {
  views: View[];
  activeViewId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const showToast = useToast();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length === 0) return;
    await onCreate(name.trim());
    setName("");
    setAdding(false);
  }

  function startEditing(view: View) {
    setEditingId(view.id);
    setEditingName(view.name);
  }

  async function saveEditing(id: string) {
    const trimmed = editingName.trim();
    setEditingId(null);
    if (trimmed.length === 0) return;
    try {
      await onRename(id, trimmed);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to rename view", "error");
    }
  }

  async function handleDelete(id: string) {
    try {
      await onDelete(id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove view", "error");
    }
  }

  const activeView = views.find((v) => v.id === activeViewId);

  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 flex-wrap">
        {views.map((view) =>
          editingId === view.id ? (
            <input
              key={view.id}
              autoFocus
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => saveEditing(view.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEditing(view.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              className="rounded-full border border-gray-300 px-3.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          ) : (
            <button
              key={view.id}
              type="button"
              onClick={() => onSelect(view.id)}
              onDoubleClick={() => startEditing(view)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeViewId === view.id
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {view.name}
            </button>
          )
        )}

        {adding ? (
          <form onSubmit={handleCreate} className="flex items-center gap-1.5">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => !name.trim() && setAdding(false)}
              placeholder="View name"
              className="rounded-full border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button type="submit" className="text-xs font-medium text-accent">
              Add
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
          >
            + New view
          </button>
        )}
      </div>

      {activeView && editingId !== activeView.id && (
        <div className="flex items-center gap-3 mt-1.5 pl-0.5">
          <button
            type="button"
            onClick={() => startEditing(activeView)}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            Edit
          </button>
          {views.length > 1 && (
            <button
              type="button"
              onClick={() => handleDelete(activeView.id)}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}
