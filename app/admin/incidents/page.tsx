import Link from "next/link";
import { listIncidents } from "@/lib/incidents";

export const dynamic = "force-dynamic";
export const metadata = { title: "Farm Incidents | Meadowlark Admin" };

const SEVERITY_STYLE: Record<string, string> = {
  low: "bg-orchard/15 text-orchard-deep",
  medium: "bg-sunflower/20 text-sunflower-deep",
  high: "bg-cider/15 text-cider",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function IncidentsPage() {
  const incidents = await listIncidents();
  const open = incidents.filter((i) => i.status === "open").length;

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Operations</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Farm incidents</h1>
          <p className="text-ink-soft font-light mt-2 max-w-xl">
            Log anything that happens on the grounds — a downed tree, broken irrigation, wildlife or pest damage,
            a safety issue. Attach a photo and drop a GPS pin from the field. {open} open.
          </p>
        </div>
        <Link href="/admin/incidents/new" className="btn-primary">
          + Log incident
        </Link>
      </div>

      {incidents.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No incidents logged yet. Use “Log incident” from your phone in the field to add the first.
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper-dark/40 text-left">
                {["When", "Incident", "Category", "Severity", "Photo", "Location", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {incidents.map((i) => (
                <tr key={i.id} className="hover:bg-paper-dark/20">
                  <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">{fmtDate(i.occurred_at)}</td>
                  <td className="px-4 py-3 font-serif text-ink">{i.title}</td>
                  <td className="px-4 py-3 text-ink-soft font-light">{i.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${SEVERITY_STYLE[i.severity] ?? ""}`}>
                      {i.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft font-light">{i.photo_url ? "Yes" : "—"}</td>
                  <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">
                    {i.latitude != null && i.longitude != null ? "GPS pin" : i.location_note ? "Noted" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                        i.status === "open" ? "bg-cider/15 text-cider" : "bg-meadow/15 text-meadow"
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/incidents/${i.id}`}
                      className="text-xs tracking-widest uppercase font-light text-meadow hover:text-meadow-deep transition-colors"
                    >
                      View
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
