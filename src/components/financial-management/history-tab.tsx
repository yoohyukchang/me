"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/financial-management/client";
import { formatCurrency, formatPercent } from "@/lib/financial-management/format";
import type { ContributionEntry } from "@/lib/financial-management/types";
import type { PortfolioHistoryRow } from "@/lib/financial-management/portfolio-history";
import ContributionsManager from "./contributions-manager";
import { useToast } from "./toast";

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group ml-1 align-middle normal-case font-normal">
      <span
        tabIndex={0}
        className="flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 text-[9px] leading-none cursor-help hover:border-gray-400 hover:text-gray-600 focus:outline-none focus:border-accent focus:text-accent"
      >
        i
      </span>
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] leading-snug text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
        {text}
      </span>
    </span>
  );
}

export default function HistoryTab({ dataVersion }: { dataVersion: number }) {
  const showToast = useToast();
  const [rows, setRows] = useState<PortfolioHistoryRow[]>([]);
  const [contributions, setContributions] = useState<ContributionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [historyData, contributionsData] = await Promise.all([
      apiRequest("/api/financial-management/portfolio-history"),
      apiRequest("/api/financial-management/contributions"),
    ]);
    setRows(historyData.rows);
    setContributions(contributionsData.contributions);
  }, []);

  useEffect(() => {
    setLoading(true);
    load()
      .then(() => setLoadError(null))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load history";
        setLoadError(message);
        showToast(message, "error");
      })
      .finally(() => setLoading(false));
  }, [load, showToast, dataVersion]);

  if (loading) {
    return (
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="text-center text-gray-400 text-sm py-16">Loading…</div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
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
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">History</h2>
          <span className="text-xs text-gray-400">Portfolio Value updated every Saturday</span>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">
            No snapshots yet — Portfolio Value fills in automatically once Fidelity (and any manual
            holdings) are in place on the Portfolio Holdings tab.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th className="text-left font-medium pb-2 pr-4">Date</th>
                  <th className="text-right font-medium pb-2 pr-4">
                    Net Contribution
                    <InfoTooltip text="Running total of every contribution entered below, as of this date." />
                  </th>
                  <th className="text-right font-medium pb-2 pr-4">
                    Portfolio Value
                    <InfoTooltip text="Every Fidelity account (brokerage, 401(k), vested RSU) plus any manual holdings." />
                  </th>
                  <th className="text-right font-medium pb-2 pr-4">Total Profit</th>
                  <th className="text-right font-medium pb-2 pr-4">Return on Net Contribution</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.date} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 text-sm text-gray-900">{row.date}</td>
                    <td className="py-3 pr-4 text-sm text-gray-900 text-right tabular-nums">
                      {formatCurrency(row.netContribution)}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-900 text-right tabular-nums">
                      {formatCurrency(row.portfolioValue)}
                    </td>
                    <td
                      className={`py-3 pr-4 text-sm text-right tabular-nums font-medium ${
                        row.totalProfit >= 0 ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(row.totalProfit)}
                    </td>
                    <td
                      className={`py-3 pr-4 text-sm text-right tabular-nums ${
                        row.returnOnNetContribution >= 0 ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {formatPercent(row.returnOnNetContribution, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ContributionsManager contributions={contributions} onChanged={load} />
    </div>
  );
}
