"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BookableResource, ResourceKind } from "@/lib/types";
import { createResource, updateResource, setResourceActive } from "@/app/admin/resources/actions";

const KIND_OPTIONS: { value: ResourceKind; label: string }[] = [
  { value: "shelter", label: "Shelter" },
  { value: "barn", label: "Barn" },
  { value: "field", label: "Field" },
  { value: "other", label: "Other" },
];

export default function ResourceEditor({ resource }: { resource?: BookableResource }) {
  const router = useRouter();
  const editing = !!resource;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState({
    name: resource?.name ?? "",
    kind: (resource?.kind ?? "shelter") as ResourceKind,
    capacity: String(resource?.capacity ?? ""),
    description: resource?.description ?? "",
    price: resource ? (resource.price_cents / 100).toFixed(2) : "",
    depositPct: String(resource?.deposit_pct ?? 25),
    heroImageUrl: resource?.hero_image_url ?? "",
    floorPlanUrl: resource?.floor_plan_url ?? "",
    sortOrder: String(resource?.sort_order ?? 50),
    covered: (resource?.amenities.covered ?? "none") as "full" | "semi" | "none",
    ac: resource?.amenities.ac ?? false,
    nearParking: resource?.amenities.near_parking ?? false,
    restrooms: resource?.amenities.restrooms ?? false,
    tables: String(resource?.amenities.tables ?? ""),
    seats: String(resource?.amenities.seats ?? ""),
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      name: f.name,
      kind: f.kind,
      capacity: f.capacity.trim() ? parseInt(f.capacity, 10) : null,
      description: f.description,
      priceCents: Math.round(parseFloat(f.price || "0") * 100),
      depositPct: parseInt(f.depositPct, 10) || 0,
      heroImageUrl: f.heroImageUrl,
      floorPlanUrl: f.floorPlanUrl,
      sortOrder: parseInt(f.sortOrder, 10) || 0,
      amenities: {
        covered: f.covered,
        ac: f.ac,
        near_parking: f.nearParking,
        restrooms: f.restrooms,
        tables: f.tables.trim() ? parseInt(f.tables, 10) : undefined,
        seats: f.seats.trim() ? parseInt(f.seats, 10) : undefined,
      },
    };
    start(async () => {
      const res = editing ? await updateResource({ id: resource!.id, ...input }) : await createResource(input);
      if (!res.ok) return setError(res.error ?? "Save failed.");
      if (editing) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        router.refresh();
      } else router.push("/admin/resources");
    });
  }

  const label = "block text-xs tracking-widest uppercase font-light text-stone mb-2";
  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow transition-colors";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <label className={label}>Name</label>
        <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} required />
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className={label}>Kind</label>
          <select className={input} value={f.kind} onChange={(e) => set("kind", e.target.value as ResourceKind)}>
            {KIND_OPTIONS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Capacity</label>
          <input className={input} inputMode="numeric" value={f.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="60" />
        </div>
        <div>
          <label className={label}>Sort order</label>
          <input className={input} inputMode="numeric" value={f.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Price per hour (USD)</label>
          <input className={input} inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="75.00" />
        </div>
        <div>
          <label className={label}>Deposit %</label>
          <input className={input} inputMode="numeric" value={f.depositPct} onChange={(e) => set("depositPct", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea className={input} rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Hero image URL</label>
          <input className={input} value={f.heroImageUrl} onChange={(e) => set("heroImageUrl", e.target.value)} />
        </div>
        <div>
          <label className={label}>Floor plan URL (PDF/image)</label>
          <input className={input} value={f.floorPlanUrl} onChange={(e) => set("floorPlanUrl", e.target.value)} />
        </div>
      </div>

      <div className="border border-meadow/15 bg-paper-dark/40 p-5 space-y-4">
        <p className="section-label">Amenities (drives the public filters)</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Cover</label>
            <select className={input} value={f.covered} onChange={(e) => set("covered", e.target.value as "full" | "semi" | "none")}>
              <option value="full">Fully covered</option>
              <option value="semi">Semi-covered</option>
              <option value="none">Open air</option>
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2 text-sm text-ink font-light">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={f.ac} onChange={(e) => set("ac", e.target.checked)} className="w-4 h-4 accent-meadow" /> Air conditioning
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={f.nearParking} onChange={(e) => set("nearParking", e.target.checked)} className="w-4 h-4 accent-meadow" /> Near parking
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={f.restrooms} onChange={(e) => set("restrooms", e.target.checked)} className="w-4 h-4 accent-meadow" /> Restrooms nearby
            </label>
          </div>
          <div>
            <label className={label}>Tables</label>
            <input className={input} inputMode="numeric" value={f.tables} onChange={(e) => set("tables", e.target.value)} />
          </div>
          <div>
            <label className={label}>Seats</label>
            <input className={input} inputMode="numeric" value={f.seats} onChange={(e) => set("seats", e.target.value)} />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-sunset font-light">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Saving…" : saved ? "Saved ✓" : editing ? "Save changes" : "Create resource"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() =>
              start(async () => {
                await setResourceActive({ id: resource!.id, active: !resource!.active });
                router.refresh();
              })
            }
            className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors"
          >
            {resource!.active ? "Take offline" : "Publish"}
          </button>
        )}
        <Link href="/admin/resources" className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
