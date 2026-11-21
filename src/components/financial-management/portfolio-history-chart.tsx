"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/financial-management/format";
import type { PortfolioHistoryRow } from "@/lib/financial-management/portfolio-history";
import {
  applyTimeFilter,
  DEFAULT_TIME_FILTER,
  formatAxisDate,
  spansYears,
  type TimeFilter,
} from "@/lib/financial-management/time-filter";
import TimeFilterControls from "./time-filter-controls";

const PORTFOLIO_COLOR = "#2a78d6";
const BENCHMARK_COLOR = "#eb6834";

function compactUsd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function HistoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PortfolioHistoryRow }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const gap = row.benchmarkValue === null ? null : row.portfolioValue - row.benchmarkValue;
  return (
    <div className="min-w-60 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <div className="mb-1.5 text-xs font-medium text-gray-500">{row.date}</div>
      <div className="flex items-center justify-between gap-4 py-0.5 text-xs">
        <span className="flex items-center gap-1.5 text-gray-600">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: PORTFOLIO_COLOR }} />
          My portfolio
        </span>
        <span className="tabular-nums text-gray-900">{formatCurrency(row.portfolioValue)}</span>
      </div>
      <div className="flex items-center justify-between gap-4 py-0.5 text-xs">
        <span className="flex items-center gap-1.5 text-gray-600">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: BENCHMARK_COLOR }} />
          S&amp;P 500
        </span>
        <span className="tabular-nums text-gray-900">
          {row.benchmarkValue === null ? "—" : formatCurrency(row.benchmarkValue)}
        </span>
      </div>
      {gap !== null && (
        <div className="mt-1.5 flex justify-between border-t border-gray-100 pt-1.5 text-xs font-semibold">
          <span className="text-gray-900">{gap >= 0 ? "Ahead of S&P 500" : "Behind S&P 500"}</span>
          <span className={`tabular-nums ${gap >= 0 ? "text-green-700" : "text-red-600"}`}>
            {gap >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(gap))}
          </span>
        </div>
      )}
    </div>
  );
}

export default function PortfolioHistoryChart({ rows }: { rows: PortfolioHistoryRow[] }) {
  const [filter, setFilter] = useState<TimeFilter>(DEFAULT_TIME_FILTER);
  const data = applyTimeFilter(rows, filter);
  const multiYear = spansYears(data);
  const hasBenchmark = data.some((r) => r.benchmarkValue !== null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600" aria-label="Legend">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: PORTFOLIO_COLOR }} />
            My portfolio
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: BENCHMARK_COLOR }} />
            S&amp;P 500, same contributions
          </span>
        </div>
        <TimeFilterControls value={filter} onChange={setFilter} />
      </div>

      {data.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
          No snapshots in this range.
        </div>
      ) : (
        <div className="h-72 [&_*:focus]:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#ececec" />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => formatAxisDate(d, filter.granularity, multiYear)}
                tickLine={false}
                axisLine={{ stroke: "#d4d4d4" }}
                tick={{ fontSize: 12, fill: "#737373" }}
                minTickGap={24}
              />
              <YAxis
                width={64}
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#737373" }}
                tickFormatter={compactUsd}
              />
              <Tooltip content={<HistoryTooltip />} cursor={{ stroke: "#d4d4d4" }} />
              <Line
                dataKey="portfolioValue"
                stroke={PORTFOLIO_COLOR}
                strokeWidth={2}
                dot={{ r: 4, fill: PORTFOLIO_COLOR, stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: PORTFOLIO_COLOR, stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive={false}
              />
              {hasBenchmark && (
                <Line
                  dataKey="benchmarkValue"
                  stroke={BENCHMARK_COLOR}
                  strokeWidth={2}
                  dot={{ r: 4, fill: BENCHMARK_COLOR, stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: BENCHMARK_COLOR, stroke: "#ffffff", strokeWidth: 2 }}
                  connectNulls
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-400">
        S&amp;P 500 line: each contribution invested in the S&amp;P 500 Total Return index (dividends reinvested) on its
        date, valued on each snapshot date.
      </p>
    </div>
  );
}
