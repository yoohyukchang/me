"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import HoldingsPieChart, { type CategorySlice } from "@/components/financial-management/holdings-pie-chart";
import CategoryManager from "@/components/financial-management/category-manager";
import HoldingsList from "@/components/financial-management/holdings-list";
import ManualHoldingForm from "@/components/financial-management/manual-holding-form";
import ViewTabs from "@/components/financial-management/view-tabs";
import { useToast } from "@/components/financial-management/toast";
import { apiRequest } from "@/lib/financial-management/client";
import { formatRelativeTime } from "@/lib/financial-management/format";
import {
  UNCATEGORIZED_ID,
  type Assignment,
  type Category,
  type ManualHolding,
  type UnifiedHolding,
  type View,
} from "@/lib/financial-management/types";

const DEFAULT_VIEW_NAME = "By Category";

export default function HoldingsTab({ dataVersion }: { dataVersion: number }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [holdingRows, setHoldingRows] = useState<UnifiedHolding[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [manualHoldings, setManualHoldings] = useState<ManualHolding[]>([]);
  const [manualForm, setManualForm] = useState<"closed" | "new" | ManualHolding>("closed");
  const [views, setViews] = useState<View[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const loadOverview = useCallback(async () => {
    const [holdingsData, manualData, viewsData] = await Promise.all([
      apiRequest("/api/financial-management/holdings"),
      apiRequest("/api/financial-management/holdings/manual"),
      apiRequest("/api/financial-management/views"),
    ]);
    setHoldingRows(holdingsData.holdings);
    setLastSyncedAt(holdingsData.lastSyncedAt);
    setManualHoldings(manualData.holdings);

    let viewList: View[] = viewsData.views;
    if (viewList.length === 0) {
      const created = await apiRequest("/api/financial-management/views", {
        method: "POST",
        body: JSON.stringify({ name: DEFAULT_VIEW_NAME }),
      });
      viewList = [created.view];
    }
    setViews(viewList);
    setActiveViewId((current) => current ?? viewList[0].id);
    return viewList;
  }, []);

  const loadViewData = useCallback(async (viewId: string) => {
    const [categoriesData, assignmentsData] = await Promise.all([
      apiRequest(`/api/financial-management/views/${viewId}/categories`),
      apiRequest(`/api/financial-management/views/${viewId}/assignments`),
    ]);
    setCategories(categoriesData.categories);
    setAssignments(assignmentsData.assignments);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadOverview()
      .then(() => setLoadError(null))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load your data";
        setLoadError(message);
        showToast(message, "error");
      })
      .finally(() => setLoading(false));
  }, [loadOverview, showToast, dataVersion]);

  useEffect(() => {
    if (!activeViewId) return;
    loadViewData(activeViewId).catch((err) => {
      showToast(err instanceof Error ? err.message : "Failed to load view", "error");
    });
  }, [activeViewId, loadViewData, showToast]);

  const assignmentByKey = useMemo(
    () => Object.fromEntries(assignments.map((a) => [a.holdingKey, a.categoryId])),
    [assignments]
  );

  const holdingCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of holdingRows) {
      const categoryId = assignmentByKey[row.holdingKey] ?? UNCATEGORIZED_ID;
      counts[categoryId] = (counts[categoryId] ?? 0) + 1;
    }
    return counts;
  }, [holdingRows, assignmentByKey]);

  const { slices, totalValue, uncategorizedTotal } = useMemo(() => {
    const totalsByCategory = new Map<string, number>();
    for (const row of holdingRows) {
      const categoryId = assignmentByKey[row.holdingKey] ?? UNCATEGORIZED_ID;
      totalsByCategory.set(categoryId, (totalsByCategory.get(categoryId) ?? 0) + row.valueUsd);
    }
    // Uncategorized holdings never appear as a slice, and don't count toward
    // the pie's "Total value" either — it's the total of what's actually
    // shown, not the whole portfolio. The component still surfaces the
    // uncategorized sum separately, outside the chart, so it reconciles.
    const categorizedTotal = [...totalsByCategory.entries()]
      .filter(([categoryId]) => categoryId !== UNCATEGORIZED_ID)
      .reduce((sum, [, value]) => sum + value, 0);
    const named: CategorySlice[] = categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      total: totalsByCategory.get(category.id) ?? 0,
      percent: categorizedTotal > 0 ? ((totalsByCategory.get(category.id) ?? 0) / categorizedTotal) * 100 : 0,
    }));
    return {
      slices: named.filter((s) => s.total > 0),
      totalValue: categorizedTotal,
      uncategorizedTotal: totalsByCategory.get(UNCATEGORIZED_ID) ?? 0,
    };
  }, [holdingRows, assignmentByKey, categories]);

  async function handleCreateView(name: string) {
    const data = await apiRequest("/api/financial-management/views", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setViews((prev) => [...prev, data.view]);
    setActiveViewId(data.view.id);
  }

  async function handleRenameView(id: string, name: string) {
    await apiRequest(`/api/financial-management/views/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    setViews((prev) => prev.map((v) => (v.id === id ? { ...v, name } : v)));
  }

  async function handleDeleteView(id: string) {
    await apiRequest(`/api/financial-management/views/${id}`, { method: "DELETE" });
    const remaining = views.filter((v) => v.id !== id);
    setViews(remaining);
    if (activeViewId === id) setActiveViewId(remaining[0]?.id ?? null);
  }

  async function handleCategoryChange(holdingKey: string, categoryId: string) {
    if (!activeViewId) return;
    try {
      await apiRequest(`/api/financial-management/views/${activeViewId}/assignments`, {
        method: "PATCH",
        body: JSON.stringify({ holdingKey, categoryId }),
      });
      await loadViewData(activeViewId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to move holding", "error");
    }
  }

  async function handleCreateCategory(name: string, color: string) {
    if (!activeViewId) return;
    await apiRequest(`/api/financial-management/views/${activeViewId}/categories`, {
      method: "POST",
      body: JSON.stringify({ name, color }),
    });
    await loadViewData(activeViewId);
  }

  async function handleRenameCategory(id: string, name: string) {
    if (!activeViewId) return;
    await apiRequest(`/api/financial-management/views/${activeViewId}/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    await loadViewData(activeViewId);
  }

  async function handleRecolorCategory(id: string, color: string) {
    if (!activeViewId) return;
    await apiRequest(`/api/financial-management/views/${activeViewId}/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ color }),
    });
    await loadViewData(activeViewId);
  }

  async function handleDeleteCategory(id: string) {
    if (!activeViewId) return;
    await apiRequest(`/api/financial-management/views/${activeViewId}/categories/${id}`, {
      method: "DELETE",
    });
    await loadViewData(activeViewId);
  }

  async function handleReorderCategories(orderedIds: string[]) {
    if (!activeViewId) return;
    setCategories((prev) =>
      orderedIds.map((id) => prev.find((c) => c.id === id)!).filter(Boolean)
    );
    try {
      await apiRequest(`/api/financial-management/views/${activeViewId}/categories/reorder`, {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reorder categories", "error");
      await loadViewData(activeViewId);
    }
  }

  function handleEditManual(holding: UnifiedHolding) {
    const found = manualHoldings.find((m) => m.id === holding.holdingKey);
    if (found) setManualForm(found);
  }

  async function handleDeleteManual(holdingKey: string) {
    try {
      await apiRequest(`/api/financial-management/holdings/manual/${holdingKey}`, { method: "DELETE" });
      showToast("Holding removed");
      await loadOverview();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove holding", "error");
    }
  }

  if (loading) {
    return <div className="text-center text-gray-400 text-sm py-16">Loading…</div>;
  }

  if (loadError) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-600 mb-4">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-black text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <div className="flex items-center justify-end mb-6">
          <span className="text-xs text-gray-400">
            Last synced {formatRelativeTime(lastSyncedAt)}
          </span>
        </div>
        <HoldingsPieChart slices={slices} totalValue={totalValue} uncategorizedTotal={uncategorizedTotal} />
      </section>

      <ViewTabs
        views={views}
        activeViewId={activeViewId}
        onSelect={setActiveViewId}
        onCreate={handleCreateView}
        onRename={handleRenameView}
        onDelete={handleDeleteView}
      />

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <CategoryManager
          categories={categories}
          holdingCountByCategory={holdingCountByCategory}
          onCreate={handleCreateCategory}
          onRename={handleRenameCategory}
          onRecolor={handleRecolorCategory}
          onDelete={handleDeleteCategory}
        />
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Holdings</h2>
          {manualForm === "closed" && (
            <button
              type="button"
              onClick={() => setManualForm("new")}
              className="text-xs font-medium text-accent hover:opacity-80 transition-opacity"
            >
              + Add holding
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Fidelity holdings sync automatically. Add a holding by hand for any account outside the
          connected providers — a Korean brokerage, for example.
        </p>

        {manualForm !== "closed" && (
          <div className="mb-6">
            <ManualHoldingForm
              editing={manualForm === "new" ? null : manualForm}
              onDone={() => {
                setManualForm("closed");
                loadOverview();
              }}
              onCancel={() => setManualForm("closed")}
            />
          </div>
        )}

        <HoldingsList
          holdings={holdingRows}
          categories={categories}
          assignments={assignmentByKey}
          portfolioTotalUsd={totalValue}
          onCategoryChange={handleCategoryChange}
          onReorderCategories={handleReorderCategories}
          onEditManual={handleEditManual}
          onDeleteManual={handleDeleteManual}
        />
      </section>
    </div>
  );
}
