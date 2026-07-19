"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import HoldingsPieChart, {
  type CategorySlice,
} from "@/components/financial-holdings/holdings-pie-chart";
import CategoryManager from "@/components/financial-holdings/category-manager";
import StockManager from "@/components/financial-holdings/stock-manager";
import { useToast } from "@/components/financial-holdings/toast";
import { apiRequest } from "@/lib/financial-holdings/client";
import type { Category, Stock } from "@/lib/financial-holdings/types";

export default function FinancialHoldingsPage() {
  const router = useRouter();
  const showToast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [categoriesData, stocksData] = await Promise.all([
      apiRequest("/api/financial-holdings/categories"),
      apiRequest("/api/financial-holdings/stocks"),
    ]);
    setCategories(categoriesData.categories);
    setStocks(stocksData.stocks);
  }, []);

  const loadInitialData = useCallback(() => {
    setLoading(true);
    refresh()
      .then(() => setLoadError(null))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load your data";
        setLoadError(message);
        showToast(message, "error");
      })
      .finally(() => setLoading(false));
  }, [refresh, showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  const stockCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const stock of stocks) {
      counts[stock.categoryId] = (counts[stock.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [stocks]);

  const { slices, totalValue } = useMemo(() => {
    const totalsByCategory = new Map<string, number>();
    let total = 0;
    for (const stock of stocks) {
      const value = stock.shares * stock.price;
      totalsByCategory.set(
        stock.categoryId,
        (totalsByCategory.get(stock.categoryId) ?? 0) + value
      );
      total += value;
    }

    const computedSlices: CategorySlice[] = sortedCategories
      .map((category) => {
        const categoryTotal = totalsByCategory.get(category.id) ?? 0;
        return {
          id: category.id,
          name: category.name,
          color: category.color,
          total: categoryTotal,
          percent: total > 0 ? (categoryTotal / total) * 100 : 0,
        };
      })
      .filter((slice) => slice.total > 0);

    return { slices: computedSlices, totalValue: total };
  }, [sortedCategories, stocks]);

  async function handleLogout() {
    await apiRequest("/api/financial-holdings/logout", { method: "POST" });
    router.push("/financial-holdings/login");
  }

  async function handleCreateCategory(name: string, color: string) {
    await apiRequest("/api/financial-holdings/categories", {
      method: "POST",
      body: JSON.stringify({ name, color }),
    });
    await refresh();
  }

  async function handleRenameCategory(id: string, name: string) {
    await apiRequest(`/api/financial-holdings/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    await refresh();
  }

  async function handleRecolorCategory(id: string, color: string) {
    await apiRequest(`/api/financial-holdings/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ color }),
    });
    await refresh();
  }

  async function handleDeleteCategory(id: string) {
    await apiRequest(`/api/financial-holdings/categories/${id}`, {
      method: "DELETE",
    });
    await refresh();
  }

  async function handleReorderCategories(orderedIds: string[]) {
    await apiRequest("/api/financial-holdings/categories/reorder", {
      method: "POST",
      body: JSON.stringify({ orderedIds }),
    });
    await refresh();
  }

  async function handleReorderStocks(orderedIds: string[]) {
    await apiRequest("/api/financial-holdings/stocks/reorder", {
      method: "POST",
      body: JSON.stringify({ orderedIds }),
    });
    await refresh();
  }

  async function handleCreateStock(input: {
    ticker: string;
    name: string;
    shares: number;
    price: number;
    categoryId: string;
  }) {
    await apiRequest("/api/financial-holdings/stocks", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await refresh();
  }

  async function handleUpdateStock(
    id: string,
    update: Partial<Pick<Stock, "shares" | "price" | "categoryId">>
  ) {
    await apiRequest(`/api/financial-holdings/stocks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(update),
    });
    await refresh();
  }

  async function handleDeleteStock(id: string) {
    await apiRequest(`/api/financial-holdings/stocks/${id}`, {
      method: "DELETE",
    });
    await refresh();
  }

  if (loading) {
    return (
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto text-center text-gray-400 text-sm">
          Loading…
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-red-600 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={loadInitialData}
            className="rounded-lg bg-black text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 mt-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Financial Holdings
            </h1>
            <p className="text-gray-500 mt-2">
              Track allocation across your own custom categories.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Log out
          </button>
        </div>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <HoldingsPieChart slices={slices} totalValue={totalValue} />
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <CategoryManager
            categories={sortedCategories}
            stockCountByCategory={stockCountByCategory}
            onCreate={handleCreateCategory}
            onRename={handleRenameCategory}
            onRecolor={handleRecolorCategory}
            onDelete={handleDeleteCategory}
          />
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
          <StockManager
            stocks={stocks}
            categories={sortedCategories}
            onCreate={handleCreateStock}
            onUpdate={handleUpdateStock}
            onDelete={handleDeleteStock}
            onReorderCategories={handleReorderCategories}
            onReorderStocks={handleReorderStocks}
          />
        </section>
      </div>
    </main>
  );
}
