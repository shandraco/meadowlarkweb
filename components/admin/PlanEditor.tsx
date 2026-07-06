"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionPlan } from "@/lib/types";
import { createPlan, updatePlan, setPlanActive } from "@/app/admin/subscriptions/actions";

export default function PlanEditor({ plan, onSaved }: { plan?: SubscriptionPlan; onSaved?: () => void }) {
  const router = useRouter();
  const editing = !!plan;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState({
    name: plan?.name ?? "",
    tier: plan?.tier ?? "basic",
    cadence: plan?.cadence ?? "quarterly",
    bottles: String(plan?.bottles_per_shipment ?? 2),
    price: plan ? (plan.price_cents / 100).toFixed(2) : "",
    description: plan?.description ?? "",
    benefits: plan?.benefits ?? "",
    sortOrder: String(plan?.sort_order ?? 0),
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      name: f.name,
      tier: f.tier,
      cadence: f.cadence,
      bottlesPerShipment: parseInt(f.bottles, 10) || 2,
      priceCents: Math.round(parseFloat(f.price || "0") * 100),
      description: f.description,
      benefits: f.benefits,
      sortOrder: parseInt(f.sortOrder, 10) || 0,
    };
    start(async () => {
      const res = editing ? await updatePlan({ id: plan!.id, ...input }) : await createPlan(input);
      if (!res.ok) return setError(res.error ?? "Save failed.");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
      onSaved?.();
    });
  }

  const label = "block text-xs tracking-widest uppercase font-light text-stone mb-2";
  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow transition-colors";

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Name</label>
          <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div>
          <label className={label}>Tier</label>
          <select className={input} value={f.tier} onChange={(e) => set("tier", e.target.value)}>
            <option value="basic">Basic</option>
            <option value="reserve">Reserve</option>
            <option value="fine">Fine</option>
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={label}>Cadence</label>
          <select className={input} value={f.cadence} onChange={(e) => set("cadence", e.target.value)}>
            <option value="quarterly">Quarterly (every 3 months)</option>
            <option value="seasonal">Seasonal (4×/year)</option>
            <option value="monthly">Monthly</option>
            <option value="biannual">Biannual (2×/year)</option>
          </select>
        </div>
        <div>
          <label className={label}>Bottles/shipment</label>
          <input className={input} inputMode="numeric" value={f.bottles} onChange={(e) => set("bottles", e.target.value)} />
        </div>
        <div>
          <label className={label}>Price / cycle</label>
          <input className={input} inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} />
        </div>
      </div>
      <div>
        <label className={label}>Description</label>
        <textarea className={input} rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div>
        <label className={label}>Perks / benefits</label>
        <textarea className={input} rows={2} value={f.benefits} onChange={(e) => set("benefits", e.target.value)} placeholder="10% shop discount · First tasting free · Postcard + apple-scent insert" />
      </div>
      <div>
        <label className={label}>Sort order</label>
        <input className={`${input} max-w-[140px]`} inputMode="numeric" value={f.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
      </div>

      {error && <p className="text-sm text-sunset font-light">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Saving…" : saved ? "Saved ✓" : editing ? "Save changes" : "Create plan"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() =>
              start(async () => {
                await setPlanActive({ id: plan!.id, active: !plan!.active });
                router.refresh();
              })
            }
            className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow"
          >
            {plan!.active ? "Hide" : "Publish"}
          </button>
        )}
      </div>
    </form>
  );
}
