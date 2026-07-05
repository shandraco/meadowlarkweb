"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ShippingProvider } from "@/lib/types";
import { upsertProvider } from "@/app/admin/shipping/actions";

export default function ShippingProviderRow({ provider }: { provider: ShippingProvider }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [f, setF] = useState({
    name: provider.name,
    code: provider.code,
    states: provider.states_covered.join(", "),
    apiBaseUrl: provider.api_base_url ?? "",
    notes: provider.notes ?? "",
    active: provider.active,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function save() {
    setError(null);
    const statesCovered = f.states
      .split(/[\s,]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    start(async () => {
      const res = await upsertProvider(provider.id, {
        name: f.name,
        code: f.code,
        statesCovered,
        apiBaseUrl: f.apiBaseUrl,
        notes: f.notes,
        active: f.active,
      });
      if (!res.ok) return setError(res.error ?? "Failed.");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    });
  }

  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow";

  return (
    <div className="border border-meadow/10 bg-paper p-5 md:p-6 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="font-serif text-2xl text-ink">{provider.name}</h3>
        <label className="flex items-center gap-2 text-sm text-ink font-light">
          <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-meadow" />
          {f.active ? "Active" : "Inactive"}
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-stone font-light mb-1">Name</label>
          <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-stone font-light mb-1">Code</label>
          <input className={input} value={f.code} onChange={(e) => set("code", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-stone font-light mb-1">API base URL</label>
          <input className={input} value={f.apiBaseUrl} onChange={(e) => set("apiBaseUrl", e.target.value)} placeholder="https://…" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-stone font-light mb-1">States covered (comma-separated)</label>
        <input className={input} value={f.states} onChange={(e) => set("states", e.target.value)} placeholder="KS, MO, CO" />
      </div>

      <div>
        <label className="block text-xs text-stone font-light mb-1">Notes</label>
        <textarea className={input} rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>

      {error && <p className="text-sm text-sunset font-light">{error}</p>}

      <button onClick={save} disabled={pending} className="btn-primary disabled:opacity-50">
        {pending ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}
