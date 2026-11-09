"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import ConnectionsStatus from "@/components/financial-management/connections-status";
import HoldingsTab from "@/components/financial-management/holdings-tab";
import HistoryTab from "@/components/financial-management/history-tab";
import NetWorthTab from "@/components/financial-management/net-worth-tab";
import { apiRequest } from "@/lib/financial-management/client";

type TabId = "holdings" | "history" | "net-worth";

const TABS: { id: TabId; label: string }[] = [
  { id: "holdings", label: "Portfolio Holdings" },
  { id: "history", label: "Portfolio History" },
  { id: "net-worth", label: "Net Worth" },
];

export default function FinancialManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("holdings");
  // Bumped whenever a connection is linked/reconnected, so every tab
  // (even ones already mounted) knows to refetch its data.
  const [dataVersion, setDataVersion] = useState(0);
  const bumpDataVersion = useCallback(() => setDataVersion((v) => v + 1), []);

  async function handleLogout() {
    await apiRequest("/api/financial-management/logout", { method: "POST" });
    router.push("/financial-management/login");
  }

  return (
    <main className="container mx-auto px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 mt-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Financial Management</h1>
            <p className="text-gray-500 mt-2">Managing my finance</p>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionsStatus dataVersion={dataVersion} onChanged={bumpDataVersion} />
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "holdings" && <HoldingsTab dataVersion={dataVersion} />}
        {activeTab === "history" && <HistoryTab dataVersion={dataVersion} />}
        <div hidden={activeTab !== "net-worth"}>
          <NetWorthTab dataVersion={dataVersion} />
        </div>
      </div>
    </main>
  );
}
