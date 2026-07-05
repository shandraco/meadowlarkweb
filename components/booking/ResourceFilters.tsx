"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BookableResource } from "@/lib/types";
import { formatUSD } from "@/lib/money";

interface Filters {
  covered: "any" | "full" | "semi" | "none";
  nearParking: boolean;
  ac: boolean;
  minCapacity: number;
}

const DEFAULT_FILTERS: Filters = {
  covered: "any",
  nearParking: false,
  ac: false,
  minCapacity: 0,
};

export default function ResourceFilters({ resources }: { resources: BookableResource[] }) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const a = r.amenities ?? {};
      if (filters.covered !== "any" && a.covered !== filters.covered) return false;
      if (filters.nearParking && !a.near_parking) return false;
      if (filters.ac && !a.ac) return false;
      if (filters.minCapacity && (r.capacity ?? 0) < filters.minCapacity) return false;
      return true;
    });
  }, [resources, filters]);

  const chip = (active: boolean) =>
    `px-4 py-2 text-xs tracking-widest uppercase font-light border transition-colors ${
      active ? "bg-meadow text-paper border-meadow" : "bg-transparent text-meadow border-meadow/30 hover:border-meadow"
    }`;

  return (
    <div className="space-y-8">
      <div className="border border-meadow/10 bg-paper-dark/40 p-5 md:p-6">
        <p className="section-label mb-4">Filter spaces</p>
        <div className="flex flex-wrap items-center gap-2 gap-y-3">
          <span className="text-xs text-ink-soft font-light">Covered:</span>
          {(
            [
              { v: "any" as const, label: "Any" },
              { v: "full" as const, label: "Fully covered" },
              { v: "semi" as const, label: "Semi-covered" },
              { v: "none" as const, label: "Open air" },
            ]
          ).map((o) => (
            <button key={o.v} onClick={() => setFilters((f) => ({ ...f, covered: o.v }))} className={chip(filters.covered === o.v)}>
              {o.label}
            </button>
          ))}
          <span className="w-full sm:w-auto sm:ml-4 h-px sm:h-4 sm:w-px sm:bg-meadow/20" />
          <button onClick={() => setFilters((f) => ({ ...f, ac: !f.ac }))} className={chip(filters.ac)}>
            Air conditioning
          </button>
          <button onClick={() => setFilters((f) => ({ ...f, nearParking: !f.nearParking }))} className={chip(filters.nearParking)}>
            Near parking
          </button>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-ink-soft font-light">Min guests:</span>
            <input
              type="number"
              min={0}
              value={filters.minCapacity || ""}
              onChange={(e) => setFilters((f) => ({ ...f, minCapacity: parseInt(e.target.value, 10) || 0 }))}
              className="w-16 border border-meadow/20 bg-paper text-ink px-2 py-1 text-sm font-light outline-none focus:border-meadow"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-soft font-light">No spaces match those filters.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((r) => (
            <Link
              key={r.id}
              href={`/visit/book/${r.id}`}
              className="group flex flex-col border border-meadow/10 bg-paper hover:border-meadow transition-colors overflow-hidden"
            >
              <div className="relative aspect-[16/10] bg-paper-dark">
                {r.hero_image_url && (
                  <Image
                    src={r.hero_image_url}
                    alt={r.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="estate-photo object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-2xl text-ink">{r.name}</h3>
                  <p className="font-serif text-lg text-meadow whitespace-nowrap">
                    {r.price_cents === 0 ? "Inquire" : `${formatUSD(r.price_cents)}/hr`}
                  </p>
                </div>
                {r.capacity && <p className="text-xs text-ink-soft font-light mt-1">Up to {r.capacity} guests</p>}
                {r.description && <p className="text-sm text-ink-soft font-light leading-relaxed mt-4 flex-1">{r.description}</p>}
                <div className="mt-5 flex flex-wrap gap-2 text-[10px] tracking-widest uppercase text-meadow">
                  {r.amenities.covered && <span className="border border-meadow/30 px-2 py-1">{r.amenities.covered} cover</span>}
                  {r.amenities.ac && <span className="border border-meadow/30 px-2 py-1">AC</span>}
                  {r.amenities.near_parking && <span className="border border-meadow/30 px-2 py-1">Parking</span>}
                  {r.amenities.restrooms && <span className="border border-meadow/30 px-2 py-1">Restrooms</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
