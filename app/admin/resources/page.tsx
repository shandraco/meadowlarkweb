import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/money";
import type { BookableResource } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookable Resources | Meadowlark Admin" };

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("bookable_resources").select("*").order("sort_order");
  const resources = (data ?? []) as BookableResource[];

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Bookings</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Resources</h1>
          <p className="text-ink-soft font-light mt-2 max-w-xl">
            Shelters, barn, and open fields you can book online. Amenities here drive the public filters.
          </p>
        </div>
        <Link href="/admin/resources/new" className="btn-primary">
          + Add resource
        </Link>
      </div>

      {resources.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No resources yet. Add the first when you decide which spaces to open up for online booking.
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper-dark/40 text-left">
                {["Resource", "Kind", "Capacity", "Rate", "Deposit", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {resources.map((r) => (
                <tr key={r.id} className="hover:bg-paper-dark/20">
                  <td className="px-4 py-3 font-serif text-ink">{r.name}</td>
                  <td className="px-4 py-3 text-ink-soft font-light capitalize">{r.kind}</td>
                  <td className="px-4 py-3 text-ink-soft font-light">{r.capacity ?? "—"}</td>
                  <td className="px-4 py-3 text-meadow whitespace-nowrap">
                    {r.price_cents === 0 ? "On inquiry" : `${formatUSD(r.price_cents)}/hr`}
                  </td>
                  <td className="px-4 py-3 text-ink-soft font-light">{r.deposit_pct}%</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                        r.active ? "bg-meadow/15 text-meadow" : "bg-stone/20 text-stone"
                      }`}
                    >
                      {r.active ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/resources/${r.id}`}
                      className="text-xs tracking-widest uppercase font-light text-meadow hover:text-meadow-deep transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
