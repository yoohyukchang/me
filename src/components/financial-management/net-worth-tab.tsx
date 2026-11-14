"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/financial-management/client";
import type { Currency, NetWorthEntry } from "@/lib/financial-management/types";

function money(value: number, currency: Currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(value);
}

function convert(amount: number, entry: NetWorthEntry, currency: Currency) {
  if (currency === "USD" || !entry.fxRateUsdKrw) return amount;
  return amount * entry.fxRateUsdKrw;
}

function formatRate(rate: number) {
  return `₩${rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function NetWorthTab({ dataVersion }: { dataVersion: number }) {
  const [entries, setEntries] = useState<NetWorthEntry[]>([]);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await apiRequest("/api/financial-management/net-worth");
      setEntries(data.entries);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load net worth.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load, dataVersion]);

  const latest = entries[0] ?? null;
  const selected = useMemo(
    () => entries.find((e) => e.date === selectedDate) ?? latest,
    [entries, selectedDate, latest]
  );

  if (loading || loadError) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        {loading ? (
          <p role="status" className="py-12 text-sm text-gray-400">
            Loading net worth…
          </p>
        ) : (
          <>
            <p role="alert" className="py-4 text-sm text-red-600">
              {loadError}
            </p>
            <button type="button" onClick={load} className="rounded-lg bg-black px-4 py-2 text-sm text-white">
              Retry
            </button>
          </>
        )}
      </section>
    );
  }

  if (!selected) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="font-medium">No snapshot yet</p>
        <p className="mt-2 text-sm text-gray-500">
          This fills in automatically once Chase, BOA, and Fidelity are connected on the Portfolio
          Holdings tab.
        </p>
      </section>
    );
  }

  const breakdown = [
    ...Object.entries(selected.depositoryBalances).map(([name, amount]) => ({ name, amount })),
    { name: "Fidelity", amount: selected.fidelityValue },
  ];

  return (
    <section aria-label="Net Worth" className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-5 md:px-7">
        <div>
          <h2 className="text-lg font-semibold">Net Worth</h2>
          <p className="mt-1 text-sm text-gray-500">Chase + BOA + Fidelity, updated every Saturday.</p>
        </div>
        <div className="flex rounded-lg bg-gray-100 p-1" aria-label="Display currency" role="group">
          {(["USD", "KRW"] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={currency === c}
              onClick={() => setCurrency(c)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                currency === c ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {c === "USD" ? "$ USD" : "₩ KRW"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <aside
          className="shrink-0 border-b border-gray-200 bg-gray-50/70 p-4 md:w-56 md:border-r md:border-b-0"
          aria-label="History"
        >
          <div className="mb-3 flex items-center justify-between px-1 text-xs font-medium uppercase tracking-wider text-gray-400">
            <h3>Snapshots</h3>
            <span>{entries.length}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto md:max-h-[600px] md:flex-col md:overflow-y-auto">
            {entries.map((entry, index) => (
              <button
                key={entry.date}
                type="button"
                aria-pressed={selected.date === entry.date}
                onClick={() => setSelectedDate(entry.date)}
                className={`min-w-40 rounded-lg border p-3 text-left transition-colors md:w-full md:min-w-0 ${
                  selected.date === entry.date
                    ? "border-gray-200 bg-white shadow-sm"
                    : "border-transparent hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <time dateTime={entry.date} className="text-sm font-medium">
                    {entry.date}
                  </time>
                  <span className="text-[10px] text-gray-400">#{entries.length - index}</span>
                </span>
                <span className="mt-1 block text-xs tabular-nums text-gray-500">
                  {money(convert(entry.total, entry, currency), currency)}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 md:p-7">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              {selected.date === latest?.date ? "Current" : `Snapshot · ${selected.date}`}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums lg:text-4xl">
              {money(convert(selected.total, selected, currency), currency)}{" "}
              <span className="text-sm font-normal tracking-normal text-gray-400">{currency}</span>
            </p>
            {selected.fxRateUsdKrw > 0 && (
              <p className="mt-1.5 text-xs tabular-nums text-gray-400">
                Exchange rate that day: $1 = {formatRate(selected.fxRateUsdKrw)}
              </p>
            )}
          </div>

          <div className="p-5 md:p-7">
            <h3 className="mb-4 text-sm font-semibold">Breakdown</h3>
            <table className="w-full text-sm">
              <tbody>
                {breakdown.map((row) => (
                  <tr key={row.name} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 font-medium">{row.name}</td>
                    <td className="py-3 text-right tabular-nums">
                      {money(convert(row.amount, selected, currency), currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
