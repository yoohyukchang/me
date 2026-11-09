"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/financial-management/client";
import type { PublicPlaidItem } from "@/lib/financial-management/types";
import ConnectionsPanel from "./connections-panel";

export default function ConnectionsStatus({
  dataVersion,
  onChanged,
}: {
  dataVersion: number;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<PublicPlaidItem[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const data = await apiRequest("/api/financial-management/plaid/items");
    setItems(data.items);
  }, []);

  useEffect(() => {
    load();
  }, [load, dataVersion]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const needsAttention = items.some((item) => item.status !== "active");
  const dotColor = needsAttention ? "bg-amber-500" : items.length > 0 ? "bg-emerald-500" : "bg-gray-300";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        Accounts
        {needsAttention && <span className="text-amber-600">· needs attention</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-[22rem] rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <ConnectionsPanel
            items={items}
            onChanged={() => {
              load();
              onChanged();
            }}
          />
        </div>
      )}
    </div>
  );
}
