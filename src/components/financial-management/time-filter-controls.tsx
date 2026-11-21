"use client";

import type { Granularity, RangePreset, TimeFilter } from "@/lib/financial-management/time-filter";

const GRANULARITIES: Array<[Granularity, string]> = [
  ["week", "Week"],
  ["month", "Month"],
];

const PRESETS: Array<[RangePreset, string]> = [
  ["3m", "3M"],
  ["6m", "6M"],
  ["ytd", "YTD"],
  ["1y", "1Y"],
  ["all", "All"],
  ["custom", "Custom"],
];

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<[T, string]>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-1" role="group" aria-label={label}>
      {options.map(([option, text]) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            value === option ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

const dateFieldClass =
  "rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

export default function TimeFilterControls({
  value,
  onChange,
}: {
  value: TimeFilter;
  onChange: (value: TimeFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented
        label="Granularity"
        options={GRANULARITIES}
        value={value.granularity}
        onChange={(granularity) => onChange({ ...value, granularity })}
      />
      <Segmented
        label="Range"
        options={PRESETS}
        value={value.preset}
        onChange={(preset) => onChange({ ...value, preset })}
      />
      {value.preset === "custom" && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <input
            type="date"
            aria-label="From"
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className={dateFieldClass}
          />
          <span>–</span>
          <input
            type="date"
            aria-label="To"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className={dateFieldClass}
          />
        </div>
      )}
    </div>
  );
}
