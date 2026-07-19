"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { Category, Stock } from "@/lib/financial-holdings/types";
import { formatCurrency, formatPercent } from "@/lib/financial-holdings/format";
import { apiRequest } from "@/lib/financial-holdings/client";
import { useToast } from "./toast";
import { RefreshIcon, SpinnerIcon } from "./icons";
import TickerCombobox from "./ticker-combobox";

function GripIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="3" r="1.3" />
      <circle cx="11" cy="3" r="1.3" />
      <circle cx="5" cy="8" r="1.3" />
      <circle cx="11" cy="8" r="1.3" />
      <circle cx="5" cy="13" r="1.3" />
      <circle cx="11" cy="13" r="1.3" />
    </svg>
  );
}

async function fetchQuote(ticker: string): Promise<number> {
  const data = await apiRequest(
    `/api/financial-holdings/tickers/quote?symbol=${encodeURIComponent(ticker)}`
  );
  return data.price as number;
}

function StockRow({
  stock,
  categories,
  groupPercent,
  onUpdate,
  onDelete,
}: {
  stock: Stock;
  categories: Category[];
  groupPercent: number;
  onUpdate: (id: string, update: Partial<Pick<Stock, "shares" | "price" | "categoryId">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [shares, setShares] = useState(String(stock.shares));
  const [price, setPrice] = useState(String(stock.price));
  const [error, setError] = useState<string | null>(null);
  const [refreshingPrice, setRefreshingPrice] = useState(false);
  const showToast = useToast();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stock.id, data: { type: "stock", categoryId: stock.categoryId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function commitShares() {
    const value = Number(shares);
    if (!Number.isFinite(value) || value < 0 || value === stock.shares) {
      setShares(String(stock.shares));
      return;
    }
    try {
      await onUpdate(stock.id, { shares: value });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update shares";
      setError(message);
      showToast(message, "error");
      setShares(String(stock.shares));
    }
  }

  async function commitPrice() {
    const value = Number(price);
    if (!Number.isFinite(value) || value < 0 || value === stock.price) {
      setPrice(String(stock.price));
      return;
    }
    try {
      await onUpdate(stock.id, { price: value });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update price";
      setError(message);
      showToast(message, "error");
      setPrice(String(stock.price));
    }
  }

  async function handleCategoryChange(newCategoryId: string) {
    try {
      await onUpdate(stock.id, { categoryId: newCategoryId });
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to move stock to that category",
        "error"
      );
    }
  }

  async function handleRefreshPrice() {
    setRefreshingPrice(true);
    setError(null);
    try {
      const newPrice = await fetchQuote(stock.ticker);
      await onUpdate(stock.id, { price: newPrice });
      setPrice(String(newPrice));
      showToast(`${stock.ticker} price updated to ${formatCurrency(newPrice)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to refresh ${stock.ticker} price`;
      setError(message);
      showToast(message, "error");
    } finally {
      setRefreshingPrice(false);
    }
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-100 last:border-0">
      <td className="py-3 pl-3 pr-1 w-7">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder stock"
        >
          <GripIcon />
        </button>
      </td>
      <td className="py-3 pr-4">
        <div className="text-sm font-semibold text-gray-900">{stock.ticker}</div>
        <div className="text-xs text-gray-500">{stock.name}</div>
        {error && <div className="text-xs text-red-600 mt-0.5">{error}</div>}
      </td>
      <td className="py-3 pr-4">
        <input
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          onBlur={commitShares}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          type="number"
          step="any"
          className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1">
          <div className="relative w-28">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              $
            </span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              type="number"
              step="any"
              className="w-full rounded-md border border-gray-300 pl-5 pr-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={handleRefreshPrice}
            disabled={refreshingPrice}
            title={`Fetch latest price for ${stock.ticker}`}
            className="shrink-0 text-gray-400 hover:text-accent transition-colors disabled:opacity-50"
          >
            {refreshingPrice ? <SpinnerIcon /> : <RefreshIcon />}
          </button>
        </div>
      </td>
      <td className="py-3 pr-4 text-sm font-medium text-gray-900 text-right">
        {formatCurrency(stock.shares * stock.price)}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500 text-right tabular-nums">
        {formatPercent(groupPercent)}
      </td>
      <td className="py-3 pr-4">
        <select
          value={stock.categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3 pr-3 text-right">
        <button
          type="button"
          onClick={() => onDelete(stock.id)}
          className="text-xs text-gray-400 hover:text-red-600 transition-colors"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

function CategoryGroup({
  category,
  stocks,
  allCategories,
  onUpdate,
  onDelete,
}: {
  category: Category;
  stocks: Stock[];
  allCategories: Category[];
  onUpdate: (id: string, update: Partial<Pick<Stock, "shares" | "price" | "categoryId">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id, data: { type: "category" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const groupTotal = stocks.reduce((sum, s) => sum + s.shares * s.price, 0);

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2.5 bg-gray-50 px-3.5 py-2.5 border-b border-gray-200">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder group"
        >
          <GripIcon />
        </button>
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: category.color }}
        />
        <span className="text-sm font-semibold text-gray-900">{category.name}</span>
        <span className="text-xs text-gray-400">
          {stocks.length} stock{stocks.length === 1 ? "" : "s"}
        </span>
      </div>

      {stocks.length === 0 ? (
        <p className="text-sm text-gray-400 px-3.5 py-3">No stocks in this group yet.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500">
              <th className="pb-2 w-7" />
              <th className="text-left font-medium pb-2 pr-4 pt-2.5">Stock</th>
              <th className="text-left font-medium pb-2 pr-4 pt-2.5">Shares</th>
              <th className="text-left font-medium pb-2 pr-4 pt-2.5">Price</th>
              <th className="text-right font-medium pb-2 pr-4 pt-2.5">Value</th>
              <th className="text-right font-medium pb-2 pr-4 pt-2.5">% of group</th>
              <th className="text-left font-medium pb-2 pr-4 pt-2.5">Category</th>
              <th className="pb-2 pr-3" />
            </tr>
          </thead>
          <tbody>
            <SortableContext
              items={stocks.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {stocks.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  categories={allCategories}
                  groupPercent={
                    groupTotal > 0 ? ((stock.shares * stock.price) / groupTotal) * 100 : 0
                  }
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function StockManager({
  stocks,
  categories,
  onCreate,
  onUpdate,
  onDelete,
  onReorderCategories,
  onReorderStocks,
}: {
  stocks: Stock[];
  categories: Category[];
  onCreate: (input: {
    ticker: string;
    name: string;
    shares: number;
    price: number;
    categoryId: string;
  }) => Promise<void>;
  onUpdate: (
    id: string,
    update: Partial<Pick<Stock, "shares" | "price" | "categoryId">>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorderCategories: (orderedIds: string[]) => Promise<void>;
  onReorderStocks: (orderedIds: string[]) => Promise<void>;
}) {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [bulkRefreshing, setBulkRefreshing] = useState(false);
  const showToast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const stocksByCategory = useMemo(() => {
    const map: Record<string, Stock[]> = {};
    for (const category of categories) map[category.id] = [];
    for (const stock of stocks) {
      (map[stock.categoryId] ??= []).push(stock);
    }
    for (const id of Object.keys(map)) {
      map[id].sort((a, b) => a.order - b.order);
    }
    return map;
  }, [stocks, categories]);

  const existingTickers = useMemo(
    () => new Set(stocks.map((s) => s.ticker.toUpperCase())),
    [stocks]
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;

    if (activeType === "category") {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(categories, oldIndex, newIndex);
      try {
        await onReorderCategories(reordered.map((c) => c.id));
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to reorder categories", "error");
      }
      return;
    }

    if (activeType === "stock") {
      const draggedCategoryId = active.data.current?.categoryId as string | undefined;
      const overCategoryId = over.data.current?.categoryId as string | undefined;
      if (!draggedCategoryId || draggedCategoryId !== overCategoryId) return;

      const groupStocks = stocksByCategory[draggedCategoryId] ?? [];
      const oldIndex = groupStocks.findIndex((s) => s.id === active.id);
      const newIndex = groupStocks.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(groupStocks, oldIndex, newIndex);
      try {
        await onReorderStocks(reordered.map((s) => s.id));
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to reorder stocks", "error");
      }
    }
  }

  async function handleFetchPrice() {
    const trimmedTicker = ticker.trim();
    if (trimmedTicker.length === 0) {
      showToast("Enter a ticker first", "error");
      return;
    }
    setFetchingPrice(true);
    try {
      const newPrice = await fetchQuote(trimmedTicker);
      setPrice(String(newPrice));
      showToast(`Fetched ${trimmedTicker.toUpperCase()} price: ${formatCurrency(newPrice)}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to fetch price", "error");
    } finally {
      setFetchingPrice(false);
    }
  }

  async function handleRefreshAllPrices() {
    if (stocks.length === 0) return;
    setBulkRefreshing(true);
    let successCount = 0;
    const failedTickers: string[] = [];
    for (const stock of stocks) {
      try {
        const newPrice = await fetchQuote(stock.ticker);
        await onUpdate(stock.id, { price: newPrice });
        successCount++;
      } catch {
        failedTickers.push(stock.ticker);
      }
    }
    setBulkRefreshing(false);
    if (failedTickers.length === 0) {
      showToast(`Updated prices for all ${successCount} stocks`);
    } else {
      showToast(
        `Updated ${successCount} of ${stocks.length} stocks — failed: ${failedTickers.join(", ")}`,
        "error"
      );
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const sharesNum = Number(shares);
    const priceNum = Number(price);
    if (ticker.trim().length === 0 || name.trim().length === 0) {
      setError("Ticker and name are required");
      return;
    }
    if (!Number.isFinite(sharesNum) || sharesNum < 0) {
      setError("Shares must be a non-negative number");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Price must be a non-negative number");
      return;
    }
    if (!categoryId) {
      setError("Pick a category first");
      return;
    }

    try {
      await onCreate({
        ticker: ticker.trim(),
        name: name.trim(),
        shares: sharesNum,
        price: priceNum,
        categoryId,
      });
      showToast(`Added ${ticker.trim().toUpperCase()}`);
      setTicker("");
      setName("");
      setShares("");
      setPrice("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add stock";
      setError(message);
      showToast(message, "error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Stocks</h2>
        {stocks.length > 0 && (
          <button
            type="button"
            onClick={handleRefreshAllPrices}
            disabled={bulkRefreshing}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-accent transition-colors disabled:opacity-50"
          >
            {bulkRefreshing ? <SpinnerIcon /> : <RefreshIcon />}
            {bulkRefreshing ? "Refreshing prices…" : "Refresh all prices"}
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-400 mb-6">Add a category first before adding stocks.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 mb-6">
              {categories.map((category) => (
                <CategoryGroup
                  key={category.id}
                  category={category}
                  stocks={stocksByCategory[category.id] ?? []}
                  allCategories={categories}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {categories.length === 0 ? null : (
        <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
          <TickerCombobox
            value={ticker}
            onChange={setTicker}
            existingTickers={existingTickers}
            onSelectTicker={(symbol, description) => {
              setTicker(symbol);
              setName((prev) => (prev.trim().length === 0 ? description : prev));
            }}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent col-span-2 md:col-span-1"
          />
          <input
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="Shares"
            type="number"
            step="any"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <div className="flex items-center gap-1">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              type="number"
              step="any"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleFetchPrice}
              disabled={fetchingPrice}
              title="Fetch latest price"
              className="shrink-0 text-gray-400 hover:text-accent transition-colors disabled:opacity-50"
            >
              {fetchingPrice ? <SpinnerIcon /> : <RefreshIcon />}
            </button>
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-black text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Add stock
          </button>
        </form>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
