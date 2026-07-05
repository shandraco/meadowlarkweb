"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatUSD } from "@/lib/money";
import type { Product } from "@/lib/types";
import { scheduleShipment } from "@/app/admin/subscriptions/actions";

export default function ScheduleShipment({
  subscriptionId,
  products,
}: {
  subscriptionId: string;
  products: Pick<Product, "id" | "name" | "price_cents">[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [shipDate, setShipDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function submit() {
    if (!shipDate) {
      setError("Pick a ship date.");
      return;
    }
    if (selected.length === 0) {
      setError("Pick at least one bottle.");
      return;
    }
    setError(null);
    start(async () => {
      const res = await scheduleShipment({ subscriptionId, shipDate, productIds: selected, notes });
      if (!res.ok) return setError(res.error ?? "Failed.");
      setShipDate("");
      setNotes("");
      setSelected([]);
      router.refresh();
    });
  }

  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow";

  return (
    <div className="border border-meadow/10 bg-paper-dark/30 p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-stone font-light mb-1">Ship date</label>
          <input type="date" className={input} value={shipDate} onChange={(e) => setShipDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-stone font-light mb-1">Notes</label>
          <input className={input} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Include postcard, apple-scent insert" />
        </div>
      </div>
      <div>
        <p className="text-xs tracking-widest uppercase font-light text-stone mb-2">Bottles</p>
        <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-auto">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm text-ink font-light border border-meadow/10 px-3 py-2 cursor-pointer hover:border-meadow">
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => toggle(p.id)}
                className="w-4 h-4 accent-meadow"
              />
              <span className="flex-1">{p.name}</span>
              <span className="text-xs text-ink-soft">{formatUSD(p.price_cents)}</span>
            </label>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-sunset font-light">{error}</p>}
      <button onClick={submit} disabled={pending} className="btn-primary disabled:opacity-50">
        Schedule
      </button>
    </div>
  );
}
