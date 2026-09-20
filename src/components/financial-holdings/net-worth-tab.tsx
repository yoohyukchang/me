"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/financial-holdings/client";
import type { Currency, NetWorthSource as Source, NetWorthSnapshot as Snapshot } from "@/lib/financial-holdings/net-worth";

type Draft = Omit<Source, "id" | "amount" | "rate"> & { amount: string; rate: string };

const emptyDraft: Draft = { name: "", kind: "asset", currency: "USD", amount: "", rate: "" };
const fieldClass = "w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm";

function converted(source: Source, currency: Currency) {
  if (source.currency === currency) return source.amount;
  return currency === "USD" ? source.amount / source.rate : source.amount * source.rate;
}

function money(value: number, currency: Currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: currency === "KRW" ? 0 : 2 }).format(value);
}

export default function NetWorthTab() {
  const [sources, setSources] = useState<Source[]>([]);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [recordMessage, setRecordMessage] = useState("");
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState("");
  const mutationPending = useRef(false);
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await apiRequest("/api/financial-holdings/net-worth");
      setSources(data.sources);
      setSnapshots(data.snapshots);
      setRevision(data.revision);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load net worth.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSnapshot = snapshots.find(snapshot => snapshot.id === selectedId);
  const visibleSources = selectedSnapshot?.sources ?? sources;
  const assets = visibleSources.filter(s => s.kind === "asset").reduce((sum, s) => sum + converted(s, currency), 0);
  const debts = visibleSources.filter(s => s.kind === "debt").reduce((sum, s) => sum + converted(s, currency), 0);

  async function recordSnapshot() {
    if (showForm || sources.length === 0 || mutationPending.current) return;
    mutationPending.current = true;
    setSaving(true);
    setStorageError("");
    setRecordMessage("");
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    try {
      const data = await apiRequest("/api/financial-holdings/net-worth", { method: "POST", body: JSON.stringify({ date, revision }) });
      setSnapshots(previous => [data.snapshot, ...previous]);
      setRevision(data.revision);
      setSelectedId(data.snapshot.id);
      setRecordMessage(`Recorded for ${date}.`);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "Unable to record net worth.");
    } finally { mutationPending.current = false; setSaving(false); }
  }

  async function persistSources(next: Source[]) {
    if (mutationPending.current) return;
    mutationPending.current = true;
    setSaving(true);
    setStorageError("");
    setRecordMessage("");
    try {
      const data = await apiRequest("/api/financial-holdings/net-worth", { method: "PUT", body: JSON.stringify({ sources: next, revision }) });
      setSources(data.sources);
      setRevision(data.revision);
      closeForm();
      setRecordMessage("Sources saved.");
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "Unable to save sources.");
    } finally { mutationPending.current = false; setSaving(false); }
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setError("");
  }

  async function saveSource(event: React.FormEvent) {
    event.preventDefault();
    const amount = Number(draft.amount);
    const rate = Number(draft.rate);
    if (!draft.name.trim() || !draft.amount.trim() || !Number.isFinite(amount) || amount < 0 || !Number.isFinite(rate) || rate <= 0 || !Number.isFinite(amount * rate) || !Number.isFinite(amount / rate)) {
      setError("Enter a source name, a non-negative balance, and a valid exchange rate greater than zero.");
      return;
    }
    const source: Source = { ...draft, name: draft.name.trim(), amount, rate, id: editingId ?? crypto.randomUUID() };
    const next = editingId ? sources.map(s => s.id === editingId ? source : s) : [...sources, source];
    if (["USD", "KRW"].some(c => !Number.isFinite(next.reduce((sum, s) => sum + converted(s, c as Currency), 0)))) {
      setError("These values are too large. Enter a smaller balance or exchange rate.");
      return;
    }
    await persistSources(next);
  }

  if (loading || loadError) return (
    <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
      {loading ? <p role="status" className="py-12 text-sm text-gray-400">Loading net worth…</p> : <><p role="alert" className="py-4 text-sm text-red-600">{loadError}</p><button type="button" onClick={load} className="rounded-lg bg-black px-4 py-2 text-sm text-white">Retry</button></>}
    </section>
  );

  return (
    <section aria-label="Net Worth" className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <fieldset disabled={saving} className="min-w-0" aria-busy={saving}>
      <legend className="sr-only">Net Worth</legend>
      {storageError && <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">{storageError}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-5 md:px-7">
        <div>
          <h2 className="text-lg font-semibold">Net Worth</h2>
          <p className="mt-1 text-sm text-gray-500">Update your sources. Record your progress.</p>
        </div>
        <div className="flex rounded-lg bg-gray-100 p-1" aria-label="Display currency" role="group">
          {(["USD", "KRW"] as const).map(c => <button key={c} type="button" aria-pressed={currency === c} onClick={() => setCurrency(c)} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${currency === c ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>{c === "USD" ? "$ USD" : "₩ KRW"}</button>)}
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <aside className="shrink-0 border-b border-gray-200 bg-gray-50/70 p-4 md:w-56 md:border-r md:border-b-0" aria-label="Current balances and history">
          <button type="button" aria-pressed={!selectedSnapshot} onClick={() => setSelectedId(null)} className={`w-full rounded-lg border p-3 text-left transition-colors ${!selectedSnapshot ? "border-gray-200 bg-white shadow-sm" : "border-transparent hover:bg-gray-100"}`}>
            <span className="flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-500" />Current balances</span>
            <span className="mt-1 block pl-4 text-xs text-gray-500">Your editable workspace</span>
          </button>
          <div className="mb-3 mt-6 flex items-center justify-between px-3 text-xs font-medium uppercase tracking-wider text-gray-400"><h3>Recorded history</h3><span>{snapshots.length}</span></div>
          {snapshots.length === 0 ? <p className="px-3 pb-3 text-xs leading-relaxed text-gray-500">Your recorded dates will appear here. Start with your current balances.</p> : <div className="flex gap-2 overflow-x-auto md:max-h-[600px] md:flex-col md:overflow-y-auto">
            {snapshots.map((snapshot, index) => {
              const total = snapshot.sources.reduce((sum, source) => sum + converted(source, currency) * (source.kind === "debt" ? -1 : 1), 0);
              return <button key={snapshot.id} type="button" aria-pressed={selectedId === snapshot.id} onClick={() => setSelectedId(snapshot.id)} className={`min-w-40 rounded-lg border p-3 text-left transition-colors md:w-full md:min-w-0 ${selectedId === snapshot.id ? "border-gray-200 bg-white shadow-sm" : "border-transparent hover:bg-gray-100"}`}>
                <span className="flex items-center justify-between gap-2"><time dateTime={snapshot.date} className="text-sm font-medium">{snapshot.date}</time><span className="text-[10px] text-gray-400">#{snapshots.length - index}</span></span>
                <span className="mt-1 block break-words text-xs tabular-nums text-gray-500">{money(total, currency)}</span>
              </button>;
            })}
          </div>}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{selectedSnapshot ? `Recorded · ${selectedSnapshot.date}` : "Current net worth"}</p>
                <p className="mt-3 break-words text-3xl font-semibold tracking-tight tabular-nums lg:text-4xl" aria-live="polite">{money(assets - debts, currency)} <span className="text-sm font-normal tracking-normal text-gray-400">{currency}</span></p>
              </div>
              {selectedSnapshot ? <button type="button" onClick={() => setSelectedId(null)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-50">Back to current</button> : <button type="button" onClick={recordSnapshot} disabled={showForm || sources.length === 0} aria-describedby="snapshot-help" className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Saving…" : "Record today"} <span aria-hidden="true" className="ml-1">↗</span></button>}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
              <p>Assets <span className="ml-1 font-medium tabular-nums text-emerald-700">{money(assets, currency)}</span></p>
              <p>Debts <span className="ml-1 font-medium tabular-nums text-gray-700">{money(debts, currency)}</span></p>
            </div>
            <p id="snapshot-help" className="mt-4 text-xs leading-relaxed text-gray-500">{selectedSnapshot ? "Recorded balances and exchange rates are preserved. Return to current balances to make changes." : showForm ? "Save or cancel your source changes before recording." : sources.length === 0 ? "Add your first source, then record your net worth for today." : "Record today saves a dated copy of every balance and exchange rate."}</p>
            <p role="status" className="mt-2 text-xs text-emerald-700">{recordMessage}</p>
          </div>

          <div className="p-5 md:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div><h3 className="text-sm font-semibold">{selectedSnapshot ? "Recorded sources" : "Sources"} <span className="ml-1 font-normal text-gray-400">{visibleSources.length}</span></h3><p className="mt-1 text-xs text-gray-500">Original balances, with an exchange rate for each source.</p></div>
              {!selectedSnapshot && <button type="button" disabled={showForm} onClick={() => { closeForm(); setShowForm(true); }} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium hover:bg-gray-50 disabled:opacity-40">+ Add source</button>}
            </div>
        {!selectedSnapshot && showForm && <form onSubmit={saveSource} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
          <h4 className="mb-4 text-sm font-semibold">{editingId ? "Edit source" : "New source"}</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5 text-xs font-medium text-gray-600">Source name<input autoFocus required maxLength={100} placeholder="e.g. Korean savings" className={fieldClass} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
            <label className="space-y-1.5 text-xs font-medium text-gray-600">Type<select className={fieldClass} value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value as Source["kind"] })}><option value="asset">Asset</option><option value="debt">Debt</option></select></label>
            <label className="space-y-1.5 text-xs font-medium text-gray-600">Original currency<select className={fieldClass} value={draft.currency} onChange={e => setDraft({ ...draft, currency: e.target.value as Currency })}><option value="USD">USD · US dollar</option><option value="KRW">KRW · Korean won</option></select></label>
            <label className="space-y-1.5 text-xs font-medium text-gray-600">Balance ({draft.currency})<input required type="number" min="0" step="any" placeholder="0" className={fieldClass} value={draft.amount} onChange={e => setDraft({ ...draft, amount: e.target.value })} /></label>
            <label className="space-y-1.5 text-xs font-medium text-gray-600">Exchange rate (₩ per $1)<input required type="number" min="0" step="any" placeholder="e.g. 1350" className={fieldClass} value={draft.rate} onChange={e => setDraft({ ...draft, rate: e.target.value })} /></label>
            <p className="self-center text-xs leading-relaxed text-gray-500">Each source has its own rate. Enter debts as positive balances; they are subtracted from your total.</p>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5 flex gap-3"><button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">{editingId ? "Save changes" : "Add source"}</button><button type="button" onClick={closeForm} className="px-3 py-2 text-sm text-gray-500">Cancel</button></div>
        </form>}

        {visibleSources.length === 0 ? <div className="rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center"><p className="font-medium">Your net worth starts here</p><p className="mt-2 text-sm text-gray-500">Add a bank account, investments, cash, or a debt.</p></div> : <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-sm">
            <thead><tr className="border-b border-gray-200 text-xs text-gray-500"><th className="pb-3 text-left font-medium">Source</th><th className="pb-3 text-right font-medium">Original balance</th><th className="pb-3 text-right font-medium">Rate · $1 = ₩</th><th className="pb-3 text-right font-medium">Value in {currency}</th>{!selectedSnapshot && <th className="pb-3 text-right font-medium"><span className="sr-only">Actions</span></th>}</tr></thead>
            <tbody>{visibleSources.map(source => <tr key={source.id} className="border-b border-gray-100 last:border-0">
              <td className="max-w-48 py-4 pr-4"><p className="break-words font-medium">{source.name}</p><span className={`mt-1 inline-block text-xs ${source.kind === "asset" ? "text-emerald-700" : "text-gray-500"}`}>{source.kind === "asset" ? "Asset" : "Debt"} · {source.currency}</span></td>
              <td className="py-4 pl-3 text-right tabular-nums">{money(source.amount, source.currency)}</td>
              <td className="py-4 pl-3 text-right tabular-nums text-gray-500">{source.rate.toLocaleString("en-US", { maximumFractionDigits: 8 })}</td>
              <td className="py-4 pl-3 text-right font-medium tabular-nums">{money(converted(source, currency) * (source.kind === "debt" ? -1 : 1), currency)}</td>
              {!selectedSnapshot && <td className="whitespace-nowrap py-4 pl-5 text-right text-xs"><button type="button" aria-label={`Edit ${source.name}`} onClick={() => { setEditingId(source.id); setDraft({ ...source, amount: String(source.amount), rate: String(source.rate) }); setError(""); setShowForm(true); }} className="mr-3 text-gray-500 hover:text-black">Edit</button><button type="button" aria-label={`Remove ${source.name}`} onClick={() => void persistSources(sources.filter(s => s.id !== source.id))} className="text-gray-400 hover:text-red-600">Remove</button></td>}
            </tr>)}</tbody>
          </table>
        </div>}

            <p className="mt-4 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-400">Exchange rate: won per $1. Debts are subtracted from your total. Holdings are included only when you add them as a source.</p>
          </div>
        </div>
      </div>
      </fieldset>
    </section>
  );
}
