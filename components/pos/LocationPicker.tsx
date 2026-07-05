"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Location } from "@/lib/types";
import { chooseLocation } from "@/app/pos/actions";

const KIND_LABEL: Record<Location["kind"], string> = {
  farm: "At the Farm",
  market: "Farmers Market",
  popup: "Pop-up / Event",
};

export default function LocationPicker({ locations }: { locations: Location[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function pick(id: string) {
    start(async () => {
      const res = await chooseLocation(id);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <p className="text-xs tracking-widest uppercase font-light text-wheat mb-3 text-center">Register</p>
        <h1 className="font-serif text-4xl md:text-5xl text-paper mb-3 text-center">Where are you selling today?</h1>
        <p className="text-paper/60 font-light text-center mb-10">
          Sales are attributed to the location you pick. Switch anytime from the header.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => pick(loc.id)}
              disabled={pending}
              className="text-left p-6 bg-paper/5 border border-paper/20 hover:bg-paper/10 hover:border-wheat/60 transition-colors disabled:opacity-40"
            >
              <p className="text-xs tracking-widest uppercase font-light text-wheat mb-2">{KIND_LABEL[loc.kind]}</p>
              <p className="font-serif text-2xl text-paper leading-tight">{loc.name}</p>
            </button>
          ))}
          {locations.length === 0 && (
            <p className="col-span-full text-paper/60 text-sm font-light">
              No active locations. Add one from the admin panel first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
