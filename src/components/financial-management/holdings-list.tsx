"use client";

import { useMemo } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UNCATEGORIZED_ID, type Category, type Currency, type UnifiedHolding } from "@/lib/financial-management/types";
import { formatPercent } from "@/lib/financial-management/format";

function money(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(amount);
}

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="3" r="1.3" />
      <circle cx="11" cy="3" r="1.3" />
      <circle cx="5" cy="8" r="1.3" />
      <circle cx="11" cy="8" r="1.3" />
      <circle cx="5" cy="13" r="1.3" />
      <circle cx="11" cy="13" r="1.3" />
    </svg>
  );
}

function HoldingRowView({
  holding,
  categories,
  categoryId,
  groupPercent,
  totalPercent,
  onCategoryChange,
  onEditManual,
  onDeleteManual,
}: {
  holding: UnifiedHolding;
  categories: Category[];
  categoryId: string;
  groupPercent: number;
  totalPercent: number;
  onCategoryChange: (holdingKey: string, categoryId: string) => void;
  onEditManual: (holding: UnifiedHolding) => void;
  onDeleteManual: (holdingKey: string) => void;
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pl-3 pr-4">
        <div className="text-sm font-semibold text-gray-900">{holding.ticker ?? holding.name}</div>
        <div className="text-xs text-gray-500">
          {holding.name} · {holding.accountName}
        </div>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-700 text-right tabular-nums">
        {holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-700 text-right tabular-nums">
        {money(holding.price, holding.currency)}
      </td>
      <td className="py-3 pr-4 text-sm font-medium text-gray-900 text-right tabular-nums">
        {money(holding.value, holding.currency)}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500 text-right tabular-nums">
        {formatPercent(groupPercent)}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500 text-right tabular-nums">
        {formatPercent(totalPercent)}
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-3">
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(holding.holdingKey, e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value={UNCATEGORIZED_ID}>Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {holding.source === "manual" && (
            <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
              <button
                type="button"
                onClick={() => onEditManual(holding)}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDeleteManual(holding.holdingKey)}
                className="text-xs text-gray-400 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function GroupTable({
  holdings,
  categories,
  categoryId,
  portfolioTotalUsd,
  onCategoryChange,
  onEditManual,
  onDeleteManual,
}: {
  holdings: UnifiedHolding[];
  categories: Category[];
  categoryId: string;
  portfolioTotalUsd: number;
  onCategoryChange: (holdingKey: string, categoryId: string) => void;
  onEditManual: (holding: UnifiedHolding) => void;
  onDeleteManual: (holdingKey: string) => void;
}) {
  const sorted = [...holdings].sort((a, b) => b.valueUsd - a.valueUsd);
  const groupTotal = sorted.reduce((sum, h) => sum + h.valueUsd, 0);

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200 text-xs text-gray-500">
          <th className="text-left font-medium pb-2 pl-3 pr-4 pt-2.5">Holding</th>
          <th className="text-right font-medium pb-2 pr-4 pt-2.5">Shares</th>
          <th className="text-right font-medium pb-2 pr-4 pt-2.5">Price</th>
          <th className="text-right font-medium pb-2 pr-4 pt-2.5">Value</th>
          <th className="text-right font-medium pb-2 pr-4 pt-2.5">% of group</th>
          <th className="text-right font-medium pb-2 pr-4 pt-2.5">% of total</th>
          <th className="text-left font-medium pb-2 pr-3 pt-2.5">Category</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((holding) => (
          <HoldingRowView
            key={holding.holdingKey}
            holding={holding}
            categories={categories}
            categoryId={categoryId}
            groupPercent={groupTotal > 0 ? (holding.valueUsd / groupTotal) * 100 : 0}
            totalPercent={portfolioTotalUsd > 0 ? (holding.valueUsd / portfolioTotalUsd) * 100 : 0}
            onCategoryChange={onCategoryChange}
            onEditManual={onEditManual}
            onDeleteManual={onDeleteManual}
          />
        ))}
      </tbody>
    </table>
  );
}

function CategoryGroup({
  category,
  holdings,
  categories,
  portfolioTotalUsd,
  onCategoryChange,
  onEditManual,
  onDeleteManual,
}: {
  category: Category;
  holdings: UnifiedHolding[];
  categories: Category[];
  portfolioTotalUsd: number;
  onCategoryChange: (holdingKey: string, categoryId: string) => void;
  onEditManual: (holding: UnifiedHolding) => void;
  onDeleteManual: (holdingKey: string) => void;
}) {
  const sortable = useSortable({ id: category.id, data: { type: "category" } });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.5 : 1,
  };

  return (
    <div ref={sortable.setNodeRef} style={style} className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2.5 bg-gray-50 px-3.5 py-2.5 border-b border-gray-200">
        <button
          type="button"
          {...sortable.attributes}
          {...sortable.listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder category"
        >
          <GripIcon />
        </button>
        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
        <span className="text-sm font-semibold text-gray-900">{category.name}</span>
        <span className="text-xs text-gray-400">
          {holdings.length} holding{holdings.length === 1 ? "" : "s"}
        </span>
      </div>
      {holdings.length === 0 ? (
        <p className="text-sm text-gray-400 px-3.5 py-3">
          Nothing here yet — use a holding&apos;s Category dropdown to add one.
        </p>
      ) : (
        <GroupTable
          holdings={holdings}
          categories={categories}
          categoryId={category.id}
          portfolioTotalUsd={portfolioTotalUsd}
          onCategoryChange={onCategoryChange}
          onEditManual={onEditManual}
          onDeleteManual={onDeleteManual}
        />
      )}
    </div>
  );
}

export default function HoldingsList({
  holdings,
  categories,
  assignments,
  portfolioTotalUsd,
  onCategoryChange,
  onReorderCategories,
  onEditManual,
  onDeleteManual,
}: {
  holdings: UnifiedHolding[];
  categories: Category[];
  assignments: Record<string, string>;
  portfolioTotalUsd: number;
  onCategoryChange: (holdingKey: string, categoryId: string) => void;
  onReorderCategories: (orderedIds: string[]) => void;
  onEditManual: (holding: UnifiedHolding) => void;
  onDeleteManual: (holdingKey: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { uncategorized, byCategory } = useMemo(() => {
    const groups: Record<string, UnifiedHolding[]> = {};
    for (const category of categories) groups[category.id] = [];
    const leftover: UnifiedHolding[] = [];
    for (const holding of holdings) {
      const categoryId = assignments[holding.holdingKey];
      if (categoryId && groups[categoryId]) groups[categoryId].push(holding);
      else leftover.push(holding);
    }
    return { uncategorized: leftover, byCategory: groups };
  }, [holdings, categories, assignments]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeType = active.data.current?.type;

    if (activeType === "category") {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      onReorderCategories(arrayMove(categories, oldIndex, newIndex).map((c) => c.id));
    }
  }

  return (
    <div>
      {uncategorized.length > 0 && (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/40 overflow-hidden mb-4">
          <div className="flex items-center gap-2.5 bg-amber-50 px-3.5 py-2.5 border-b border-amber-200">
            <span className="h-2.5 w-2.5 rounded-full shrink-0 bg-gray-400" />
            <span className="text-sm font-semibold text-gray-900">Uncategorized</span>
            <span className="text-xs text-gray-500">
              {uncategorized.length} holding{uncategorized.length === 1 ? "" : "s"} — new or not yet sorted
            </span>
          </div>
          <GroupTable
            holdings={uncategorized}
            categories={categories}
            categoryId={UNCATEGORIZED_ID}
            portfolioTotalUsd={portfolioTotalUsd}
            onCategoryChange={onCategoryChange}
            onEditManual={onEditManual}
            onDeleteManual={onDeleteManual}
          />
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-sm text-gray-400">Add a category to start sorting holdings.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {categories.map((category) => (
                <CategoryGroup
                  key={category.id}
                  category={category}
                  holdings={byCategory[category.id] ?? []}
                  categories={categories}
                  portfolioTotalUsd={portfolioTotalUsd}
                  onCategoryChange={onCategoryChange}
                  onEditManual={onEditManual}
                  onDeleteManual={onDeleteManual}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
