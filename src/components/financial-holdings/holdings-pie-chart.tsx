"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/financial-holdings/format";

export interface CategorySlice {
  id: string;
  name: string;
  color: string;
  total: number;
  percent: number;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategorySlice }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const slice = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-3 rounded-full"
          style={{ backgroundColor: slice.color }}
        />
        <span className="text-xs text-gray-500">{slice.name}</span>
      </div>
      <div className="mt-0.5 text-sm font-semibold text-gray-900">
        {formatCurrency(slice.total)}{" "}
        <span className="font-normal text-gray-500">
          ({formatPercent(slice.percent)})
        </span>
      </div>
    </div>
  );
}

export default function HoldingsPieChart({
  slices,
  totalValue,
}: {
  slices: CategorySlice[];
  totalValue: number;
}) {
  if (totalValue <= 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 text-center px-6">
        <p className="text-sm text-gray-500">
          Add stocks to a category to see your allocation here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="relative h-72 w-72 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="total"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={slices.length > 1 ? 2 : 0}
              stroke="#ffffff"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            {formatCurrency(totalValue)}
          </span>
          <span className="text-xs text-gray-500 mt-1">Total value</span>
        </div>
      </div>

      <div className="w-full space-y-2.5">
        {slices
          .slice()
          .sort((a, b) => b.total - a.total)
          .map((slice) => (
            <div key={slice.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm text-gray-700 truncate">{slice.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-gray-500">
                  {formatCurrency(slice.total)}
                </span>
                <span className="text-sm font-semibold text-gray-900 w-14 text-right">
                  {formatPercent(slice.percent)}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
