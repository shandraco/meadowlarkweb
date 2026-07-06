import Link from "next/link";
import { getAllEvents, EVENT_KIND_LABEL } from "@/lib/events";
import { formatUSD } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Events | Meadowlark Admin" };

export default async function EventsAdminPage() {
  const events = await getAllEvents();
  const now = Date.now();

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Marketing</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Events</h1>
          <p className="text-ink-soft font-light mt-2 max-w-xl">
            Live music, cider dinners, harvest days. Featured events show on the homepage.
          </p>
        </div>
        <Link href="/admin/events/new" className="btn-primary">
          + Add event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No events yet. Add one when you know the date and someone&apos;s playing.
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-wheat-dark/40 text-left">
                {["Event", "Kind", "When", "Price", "Cap.", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {events.map((e) => {
                const startsAt = new Date(e.starts_at);
                const past = startsAt.getTime() < now;
                return (
                  <tr key={e.id} className="hover:bg-wheat-dark/20">
                    <td className="px-4 py-3">
                      <p className="font-serif text-lg text-ink">{e.name}</p>
                      {e.featured && <span className="text-[10px] tracking-widest uppercase text-sunflower-deep">Featured</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-soft font-light">{EVENT_KIND_LABEL[e.kind]}</td>
                    <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">
                      {startsAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-meadow whitespace-nowrap">
                      {e.price_cents === 0 ? "Free" : formatUSD(e.price_cents)}
                    </td>
                    <td className="px-4 py-3 text-ink-soft font-light">{e.capacity ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                          e.cancelled
                            ? "bg-cider/20 text-cider"
                            : past
                              ? "bg-stone/20 text-stone"
                              : "bg-orchard/15 text-orchard"
                        }`}
                      >
                        {e.cancelled ? "Cancelled" : past ? "Past" : "Upcoming"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/events/${e.id}`}
                        className="text-xs tracking-widest uppercase font-light text-meadow hover:text-meadow-deep"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
