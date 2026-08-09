"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HoldingsTab from "@/components/financial-holdings/holdings-tab";
import HistoryTab from "@/components/financial-holdings/history-tab";
import IncomeExpenseTab from "@/components/financial-holdings/income-expense-tab";
import { apiRequest } from "@/lib/financial-holdings/client";

type TabId = "holdings" | "history" | "income-expense";

const TABS: { id: TabId; label: string }[] = [
  { id: "holdings", label: "Financial Holdings" },
  { id: "history", label: "Financial History" },
  { id: "income-expense", label: "Income / Expense" },
];

export default function FinancialManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("holdings");

  async function handleLogout() {
    await apiRequest("/api/financial-holdings/logout", { method: "POST" });
    router.push("/financial-management/login");
  }

  return (
    <main className="container mx-auto px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 mt-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Financial Management
            </h1>
            <p className="text-gray-500 mt-2">Managing my finance</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Log out
          </button>
        </div>

        <div className="flex gap-1 border-b border-gray-200 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "holdings" ? (
          <HoldingsTab />
        ) : activeTab === "history" ? (
          <HistoryTab />
        ) : (
          <IncomeExpenseTab />
        )}
      </div>
    </main>
  );
}
