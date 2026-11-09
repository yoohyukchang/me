"use client";

import { useState } from "react";
import type { View } from "@/lib/financial-management/types";

export default function ViewTabs({
  views,
  activeViewId,
  onSelect,
  onCreate,
}: {
  views: View[];
  activeViewId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length === 0) return;
    await onCreate(name.trim());
    setName("");
    setAdding(false);
  }

  return (
    <div className="flex items-center gap-1 flex-wrap mb-5">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          onClick={() => onSelect(view.id)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeViewId === view.id
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {view.name}
        </button>
      ))}

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
  );
}
