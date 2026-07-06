"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Location, LocationKind } from "@/lib/types";
import { createLocation, updateLocation, deleteLocation } from "@/app/admin/locations/actions";

const KIND_OPTIONS: { value: LocationKind; label: string }[] = [
  { value: "farm", label: "At the Farm" },
  { value: "market", label: "Farmers Market" },
  { value: "popup", label: "Pop-up / Event" },
];

export default function LocationsPanel({ locations }: { locations: Location[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<LocationKind>("market");

  function add() {
    if (!newName.trim()) return;
    setError(null);
    start(async () => {
      const res = await createLocation({
        name: newName,
        kind: newKind,
        active: true,
        sortOrder: locations.length,
      });
      if (!res.ok) return setError(res.error ?? "Failed.");
      setNewName("");
      router.refresh();
    });
  }

  function toggle(loc: Location) {
    start(async () => {
      await updateLocation({
        id: loc.id,
        name: loc.name,
        kind: loc.kind,
        active: !loc.active,
        sortOrder: loc.sort_order,
      });
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this location? Past orders keep their tag.")) return;
    start(async () => {
      const res = await deleteLocation({ id });
      if (!res.ok) return setError(res.error ?? "Failed.");
      router.refresh();
    });
  }

  const input =
    "border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow";

  return (
    <div className="space-y-8">
      <div className="border border-meadow/10 divide-y divide-meadow/10">
        {locations.length === 0 && (
          <p className="text-ink-soft font-light text-sm p-6">No locations yet. Add the first below.</p>
        )}
        {locations.map((loc) => (
          <div key={loc.id} className="flex items-center justify-between px-4 py-3 gap-4">
            <div className="flex-1">
              <p className="font-serif text-lg text-ink">{loc.name}</p>
              <p className="text-xs text-ink-soft font-light tracking-widest uppercase">
                {KIND_OPTIONS.find((k) => k.value === loc.kind)?.label}
              </p>
            </div>
            <button
              onClick={() => toggle(loc)}
              disabled={pending}
              className={`text-[10px] tracking-widest uppercase px-3 py-1.5 ${
                loc.active ? "bg-meadow text-paper" : "bg-stone/20 text-stone"
              }`}
            >
              {loc.active ? "Active" : "Hidden"}
            </button>
            <button
              onClick={() => remove(loc.id)}
              disabled={pending}
              className="text-xs tracking-widest uppercase font-light text-stone hover:text-sunset transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div>
        <p className="section-label mb-4">Add location</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-stone font-light mb-1">Name</label>
            <input
              className={`${input} w-full`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Farmers Market — Andover"
            />
          </div>
          <div>
            <label className="block text-xs text-stone font-light mb-1">Kind</label>
            <select className={input} value={newKind} onChange={(e) => setNewKind(e.target.value as LocationKind)}>
              {KIND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={add} disabled={pending || !newName.trim()} className="btn-primary disabled:opacity-50">
            Add
          </button>
        </div>
        {error && <p className="text-sm text-sunset font-light mt-2">{error}</p>}
      </div>
    </div>
  );
}
