"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatPercent } from "@/lib/financial-management/format";
import type { BucketAmount } from "@/lib/financial-management/net-worth-buckets";

function SliceTooltip({
  active,
  payload,
  formatMoney,
}: {
  active?: boolean;
  payload?: Array<{ payload: BucketAmount }>;
  formatMoney: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const bucket = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-3 rounded-full" style={{ backgroundColor: bucket.color }} />
        <span className="text-xs text-gray-500">
          {bucket.institution}
          {bucket.purpose && ` · ${bucket.purpose}`}
        </span>
      </div>
      <div className="mt-0.5 text-sm font-semibold text-gray-900">
        {formatMoney(bucket.amount)} <span className="font-normal text-gray-500">({formatPercent(bucket.percent)})</span>
      </div>
    </div>
  );
}

export default function NetWorthAllocation({
  buckets,
  formatMoney,
}: {
  buckets: BucketAmount[];
  formatMoney: (value: number) => string;
}) {
  const visible = buckets.filter((b) => b.amount > 0);

  return (
    <div className="flex flex-col items-center gap-8 md:flex-row">
      <div className="relative h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visible}
              dataKey="amount"
              nameKey="institution"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={visible.length > 1 ? 2 : 0}
              stroke="#ffffff"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {visible.map((b) => (
                <Cell key={b.institution} fill={b.color} />
              ))}
            </Pie>
            <Tooltip content={<SliceTooltip formatMoney={formatMoney} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-gray-500">By account</span>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="pb-2 text-left font-medium">Account</th>
            <th className="pb-2 text-right font-medium">Balance</th>
            <th className="pb-2 text-right font-medium">Share</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
              <tr key={b.institution} className="border-t border-gray-100">
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.color }} />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">{b.institution}</div>
                      {b.purpose && <div className="text-xs text-gray-400">{b.purpose}</div>}
                    </div>
                  </div>
                </td>
                <td className="py-2.5 text-right tabular-nums text-gray-700">{formatMoney(b.amount)}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums text-gray-900">{formatPercent(b.percent)}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
