"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EVENT_KIND_LABEL, type Event, type EventKind } from "@/lib/events";
import { createEvent, updateEvent, deleteEvent } from "@/app/admin/events/actions";

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16);
}

function fromDateInput(v: string): string {
  return v ? new Date(v).toISOString() : "";
}

export default function EventEditor({ event }: { event?: Event }) {
  const router = useRouter();
  const editing = !!event;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState({
    name: event?.name ?? "",
    kind: (event?.kind ?? "live_music") as EventKind,
    startsAt: toDateInput(event?.starts_at ?? null),
    endsAt: toDateInput(event?.ends_at ?? null),
    description: event?.description ?? "",
    heroImageUrl: event?.hero_image_url ?? "",
    ticketUrl: event?.ticket_url ?? "",
    price: event ? (event.price_cents / 100).toFixed(2) : "0",
    capacity: event?.capacity != null ? String(event.capacity) : "",
    cancelled: event?.cancelled ?? false,
    featured: event?.featured ?? false,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      name: f.name,
      kind: f.kind,
      startsAt: fromDateInput(f.startsAt),
      endsAt: fromDateInput(f.endsAt),
      description: f.description || undefined,
      heroImageUrl: f.heroImageUrl || undefined,
      ticketUrl: f.ticketUrl || undefined,
      priceCents: Math.round(parseFloat(f.price || "0") * 100),
      capacity: f.capacity.trim() ? parseInt(f.capacity, 10) : null,
      cancelled: f.cancelled,
      featured: f.featured,
    };
    start(async () => {
      const res = editing ? await updateEvent({ id: event!.id, ...input }) : await createEvent(input);
      if (!res.ok) return setError(res.error ?? "Save failed.");
      if (editing) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        router.refresh();
      } else router.push("/admin/events");
    });
  }

  function remove() {
    if (!confirm("Delete this event? Past guest bookings won't be affected.")) return;
    start(async () => {
      const res = await deleteEvent({ id: event!.id });
      if (!res.ok) return setError(res.error ?? "Delete failed.");
      router.push("/admin/events");
    });
  }

  const label = "block text-xs tracking-widest uppercase font-light text-stone mb-2";
  const input =
    "w-full border border-meadow/20 bg-wheat text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow transition-colors";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <label className={label}>Event name</label>
        <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} required />
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className={label}>Kind</label>
          <select className={input} value={f.kind} onChange={(e) => set("kind", e.target.value as EventKind)}>
            {(Object.keys(EVENT_KIND_LABEL) as EventKind[]).map((k) => (
              <option key={k} value={k}>
                {EVENT_KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Starts</label>
          <input className={input} type="datetime-local" value={f.startsAt} onChange={(e) => set("startsAt", e.target.value)} required />
        </div>
        <div>
          <label className={label}>Ends</label>
          <input className={input} type="datetime-local" value={f.endsAt} onChange={(e) => set("endsAt", e.target.value)} required />
        </div>
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea className={input} rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Hero image URL</label>
          <input className={input} value={f.heroImageUrl} onChange={(e) => set("heroImageUrl", e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <label className={label}>Ticket URL (optional)</label>
          <input className={input} value={f.ticketUrl} onChange={(e) => set("ticketUrl", e.target.value)} placeholder="https://eventbrite.com/…" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Price (USD)</label>
          <input className={input} inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="15.00" />
        </div>
        <div>
          <label className={label}>Capacity (optional)</label>
          <input className={input} inputMode="numeric" value={f.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="80" />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 pt-2">
        <label className="flex items-center gap-2 text-sm text-ink font-light">
          <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-meadow" />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-ink font-light">
          <input type="checkbox" checked={f.cancelled} onChange={(e) => set("cancelled", e.target.checked)} className="w-4 h-4 accent-cider" />
          Cancelled
        </label>
      </div>

      {error && <p className="text-sm text-cider font-light">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Saving…" : saved ? "Saved ✓" : editing ? "Save changes" : "Create event"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-xs tracking-widest uppercase font-light text-stone hover:text-cider transition-colors"
          >
            Delete
          </button>
        )}
        <Link
          href="/admin/events"
          className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
