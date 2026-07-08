import Link from "next/link";
import { notFound } from "next/navigation";
import { getIncidentById } from "@/lib/incidents";
import IncidentManage from "@/components/admin/IncidentManage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Incident | Meadowlark Admin" };

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = await getIncidentById(id);
  if (!incident) notFound();

  const hasGps = incident.latitude != null && incident.longitude != null;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/incidents" className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow">
        ← All incidents
      </Link>

      <div className="flex items-start justify-between gap-6 mt-4 mb-2">
        <h1 className="font-serif text-4xl text-meadow leading-tight">{incident.title}</h1>
        <span
          className={`text-[10px] tracking-widest uppercase px-2 py-1 shrink-0 mt-2 ${
            incident.status === "open" ? "bg-cider/15 text-cider" : "bg-meadow/15 text-meadow"
          }`}
        >
          {incident.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft font-light mb-8">
        <span>{incident.category}</span>
        <span className="capitalize">Severity: {incident.severity}</span>
        <span>Occurred {fmt(incident.occurred_at)}</span>
      </div>

      {incident.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={incident.photo_url}
          alt={incident.title}
          className="w-full max-h-[480px] object-cover border border-meadow/10 mb-8"
        />
      )}

      {incident.details && (
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-stone mb-2">Details</p>
          <p className="text-ink font-light leading-relaxed whitespace-pre-wrap">{incident.details}</p>
        </div>
      )}

      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase text-stone mb-2">Location</p>
        {hasGps ? (
          <p className="text-ink font-light">
            {incident.latitude!.toFixed(5)}, {incident.longitude!.toFixed(5)}{" "}
            <a
              href={`https://maps.google.com/?q=${incident.latitude},${incident.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-meadow underline ml-2"
            >
              Open in Maps →
            </a>
          </p>
        ) : (
          <p className="text-ink-soft font-light">No GPS pin.</p>
        )}
        {incident.location_note && <p className="text-ink-soft font-light mt-1">{incident.location_note}</p>}
      </div>

      <div className="border-t border-meadow/10 pt-6">
        <IncidentManage id={incident.id} status={incident.status} />
      </div>
    </div>
  );
}
