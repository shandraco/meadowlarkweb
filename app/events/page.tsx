import Image from "next/image";
import Link from "next/link";
import { getUpcomingEvents, EVENT_KIND_LABEL } from "@/lib/events";
import { formatUSD } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Events | Meadowlark Farm",
  description: "Live music, cider dinners, and harvest days at Meadowlark Farm — Rose Hill, Kansas.",
};

function formatWhen(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const sameDay = start.toDateString() === end.toDateString();
  const dateLabel = start.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeLabel = `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}–${end.toLocaleTimeString(
    [],
    { hour: "numeric", minute: "2-digit" },
  )}`;
  return sameDay ? `${dateLabel} · ${timeLabel}` : `${dateLabel} → ${end.toLocaleDateString()}`;
}

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      <section className="pt-36 pb-14 bg-meadow-deep">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-xs tracking-widest uppercase font-normal text-sunflower mb-4">What&apos;s on</p>
          <h1 className="font-serif text-6xl md:text-8xl text-wheat leading-tight">
            Live music, dinners,
            <br />
            <em className="text-sunflower">harvest days.</em>
          </h1>
          <p className="text-wheat/70 font-normal text-lg mt-5 max-w-xl">
            Bring a friend and a lawn chair. Everything here happens on the farm — the orchard is the venue.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {events.length === 0 ? (
            <p className="text-ink-soft font-normal text-center">
              Nothing scheduled at the moment. Sign up for season reminders on the homepage and we&apos;ll tell you when
              the next event drops.
            </p>
          ) : (
            <div className="space-y-8">
              {events.map((e) => {
                const when = formatWhen(e.starts_at, e.ends_at);
                return (
                  <article key={e.id} className="grid md:grid-cols-5 gap-6 border-b border-meadow/10 pb-8">
                    <div className="md:col-span-2 relative aspect-[4/3] bg-wheat-dark overflow-hidden">
                      {e.hero_image_url && (
                        <Image src={e.hero_image_url} alt={e.name} fill className="estate-photo object-cover" />
                      )}
                      <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase bg-cider text-wheat px-3 py-1">
                        {EVENT_KIND_LABEL[e.kind]}
                      </span>
                    </div>
                    <div className="md:col-span-3 flex flex-col">
                      <p className="text-xs tracking-widest uppercase text-cider font-normal mb-2">{when}</p>
                      <h2 className="font-serif text-3xl md:text-4xl text-meadow leading-tight mb-3">{e.name}</h2>
                      {e.description && (
                        <p className="text-ink-soft font-normal leading-relaxed mb-4 max-w-prose">{e.description}</p>
                      )}
                      <div className="mt-auto flex flex-wrap items-baseline gap-6 pt-4">
                        <span className="font-serif text-2xl text-cider">
                          {e.price_cents === 0 ? "Free" : formatUSD(e.price_cents)}
                        </span>
                        {e.capacity && (
                          <span className="text-xs text-ink-soft font-normal">Capacity {e.capacity}</span>
                        )}
                        {e.ticket_url && (
                          <a
                            href={e.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary ml-auto"
                          >
                            Get Tickets →
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/visit" className="btn-outline">
              Plan Your Visit
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
