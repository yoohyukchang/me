"use client";

import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/financial-holdings/client";
import { CheckIcon, SpinnerIcon } from "./icons";

interface TickerResult {
  symbol: string;
  name: string;
  type: string;
}

export default function TickerCombobox({
  value,
  onChange,
  onSelectTicker,
  existingTickers,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelectTicker: (symbol: string, name: string) => void;
  existingTickers: Set<string>;
  placeholder?: string;
}) {
  const [results, setResults] = useState<TickerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const query = value.trim();
    if (query.length === 0) {
      setResults([]);
      setSearchError(null);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setSearchError(null);
      try {
        const data = await apiRequest(
          `/api/financial-holdings/tickers/search?q=${encodeURIComponent(query)}`
        );
        if (controller.signal.aborted) return;
        setResults(data.results ?? []);
      } catch (err) {
        if (controller.signal.aborted) return;
        setResults([]);
        setSearchError(
          err instanceof Error ? err.message : "Couldn't search tickers"
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [value]);

  function handleSelect(result: TickerResult) {
    onSelectTicker(result.symbol, result.name);
    setOpen(false);
    setResults([]);
  }

  function handleBlur() {
    // Delay so a click on a dropdown row registers before we close it.
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  function handleFocus() {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpen(true);
  }

  const showDropdown = open && value.trim().length > 0;

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        placeholder={placeholder ?? "Ticker"}
        autoComplete="off"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      />
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-72 max-w-[90vw] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400">
              <SpinnerIcon />
              Searching…
            </div>
          )}
          {!loading && searchError && (
            <div className="px-3 py-2.5 text-xs text-gray-400">
              Couldn&apos;t search tickers — you can still type one manually.
            </div>
          )}
          {!loading && !searchError && results.length === 0 && (
            <div className="px-3 py-2.5 text-xs text-gray-400">
              No matches — you can still type a ticker manually.
            </div>
          )}
          {!loading &&
            !searchError &&
            results.map((result) => {
              const alreadyAdded = existingTickers.has(result.symbol.toUpperCase());
              return (
                <button
                  key={result.symbol}
                  type="button"
                  disabled={alreadyAdded}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(result)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm border-t border-gray-100 first:border-t-0 ${
                    alreadyAdded
                      ? "opacity-50 cursor-not-allowed bg-gray-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="font-semibold text-gray-900">{result.symbol}</span>
                    <span className="block text-xs text-gray-500 truncate">
                      {result.name}
                    </span>
                  </span>
                  {alreadyAdded && (
                    <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      <CheckIcon />
                      Added
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
