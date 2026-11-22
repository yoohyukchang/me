"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { formatPercent } from "@/lib/financial-management/format";
import {
  applyTimeFilter,
  DEFAULT_TIME_FILTER,
  formatAxisDate,
  spansYears,
  type TimeFilter,
} from "@/lib/financial-management/time-filter";
import TimeFilterControls from "./time-filter-controls";
import type { BucketDefinition } from "@/lib/financial-management/net-worth-buckets";

export interface HistoryPoint {
  date: string;
  amounts: Record<string, number>;
  total: number;
}

function HistoryTooltip({
  active,
  payload,
  definitions,
  points,
  formatMoney,
}: {
  active?: boolean;
  payload?: Array<{ payload: { date: string } }>;
  definitions: BucketDefinition[];
  points: HistoryPoint[];
  formatMoney: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const point = points.find((p) => p.date === payload[0].payload.date);
  if (!point) return null;
  return (
    <div className="min-w-56 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <div className="mb-1.5 text-xs font-medium text-gray-500">{point.date}</div>
      {[...definitions].reverse().map((d) => {
        const amount = point.amounts[d.institution] ?? 0;
        return (
          <div key={d.institution} className="flex items-center justify-between gap-4 py-0.5 text-xs">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              {d.institution}
            </span>
            <span className="tabular-nums text-gray-900">
              {formatMoney(amount)}{" "}
              <span className="text-gray-400">{formatPercent(point.total > 0 ? (amount / point.total) * 100 : 0)}</span>
            </span>
          </div>
        );
      })}
      <div className="mt-1.5 flex justify-between border-t border-gray-100 pt-1.5 text-xs font-semibold text-gray-900">
        <span>Total</span>
        <span className="tabular-nums">{formatMoney(point.total)}</span>
      </div>
    </div>
  );
}

export default function NetWorthHistoryChart({
  definitions,
  points,
  selectedDate,
  onSelect,
  formatMoney,
  formatCompact,
}: {
  definitions: BucketDefinition[];
  points: HistoryPoint[];
  selectedDate: string;
  onSelect: (date: string) => void;
  formatMoney: (value: number) => string;
  formatCompact: (value: number) => string;
}) {
  const [filter, setFilter] = useState<TimeFilter>(DEFAULT_TIME_FILTER);
  const filtered = applyTimeFilter(points, filter);
  const multiYear = spansYears(filtered);
  const data = filtered.map((p) => ({
    date: p.date,
    label: formatAxisDate(p.date, filter.granularity, multiYear),
    total: p.total,
  }));

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <TimeFilterControls value={filter} onChange={setFilter} />
      </div>

      {data.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
          No snapshots in this range.
        </div>
      ) : (
        <div className="h-72 [&_*:focus]:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              onClick={(state) => {
                const index = Number(state?.activeIndex);
                if (Number.isInteger(index) && data[index]) onSelect(data[index].date);
              }}
              style={{ cursor: "pointer" }}
            >
              <CartesianGrid vertical={false} stroke="#ececec" />
              <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#d4d4d4" }} tick={{ fontSize: 12, fill: "#737373" }} />
              <YAxis
                width={64}
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#737373" }}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <Tooltip
                cursor={{ stroke: "#d4d4d4" }}
                content={<HistoryTooltip definitions={definitions} points={points} formatMoney={formatMoney} />}
              />
              <Line
                dataKey="total"
                type="linear"
                stroke="#171717"
                strokeWidth={2}
                dot={{ r: 4, fill: "#171717", stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#171717", stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-400">
        Selected: {selectedDate} · click a point to view that snapshot above.
      </p>
    </div>
  );
}
