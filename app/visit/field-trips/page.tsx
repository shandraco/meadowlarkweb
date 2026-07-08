import Link from "next/link";
import { getFieldTripPrograms } from "@/lib/bookings";
import { formatUSD } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Field Trips | Meadowlark Farm" };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Real field-trip photos. Rendered as CSS background-image so a not-yet-added
// file degrades to the solid brand color underneath instead of a broken <img>.
// Each is exposed to assistive tech via role="img" + aria-label. Drop the
// matching files into /public/images/field-trips/ to make them appear.
const GALLERY = [
  { src: "/images/field-trips/strawberry-toddlers.jpg", label: "Toddlers walking the strawberry rows on a farm visit" },
  { src: "/images/field-trips/strawberry-planting.jpg", label: "Students tending strawberry plants in the field" },
  { src: "/images/field-trips/turtle.jpg", label: "A student holding an ornate box turtle found on the farm" },
  { src: "/images/field-trips/snakeskin.jpg", label: "A student holding a shed snake skin discovered in the orchard" },
];

export default async function FieldTripsPage() {
  const programs = await getFieldTripPrograms();

  return (
    <>
      <section className="relative pt-36 pb-14 bg-meadow-deep overflow-hidden">
        {/* Background photo (kids walking the apple orchard rows). Decorative —
            the heading carries the meaning — so no alt/aria is needed here. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/field-trips/orchard-rows.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep via-meadow-deep/85 to-meadow-deep/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-xs tracking-widest uppercase font-light text-sunflower mb-5">For Teachers</p>
          <h1 className="font-serif text-6xl md:text-8xl text-paper leading-tight">
            Field trips <em className="text-wheat-light">worth talking about.</em>
          </h1>
          <p className="text-paper/85 font-light text-lg mt-5 max-w-lg">
            Kids meet the apples on the tree, then watch juice made from them. Bring rubber boots.
          </p>
        </div>
      </section>

      {/* What a visit looks like — real photos from past field trips */}
      <section className="py-16 md:py-20 bg-wheat-light">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="section-label mb-3">Out in the field</p>
          <h2 className="font-serif text-3xl md:text-4xl text-meadow mb-8">
            Picking, planting, and the odd turtle.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {GALLERY.map((g) => (
              <div key={g.src} className="relative aspect-[3/4] overflow-hidden bg-orchard-deep">
                {/* Decorative here: the visible caption below conveys the same
                    info, so aria-hidden avoids a duplicate screen-reader read. */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                  style={{ backgroundImage: `url('${g.src}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep/85 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-3 right-3 text-wheat text-xs font-light leading-snug">
                  {g.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {programs.length === 0 ? (
            <p className="text-ink-soft font-light">
              Programs are being scheduled. Email{" "}
              <a href="mailto:gina@themeadowlarkfarm.com" className="text-meadow underline">
                gina@themeadowlarkfarm.com
              </a>{" "}
              to plan a visit for your class.
            </p>
          ) : (
            <div className="space-y-14">
              {programs.map((p) => (
                <div key={p.id} className="grid md:grid-cols-3 gap-8 border-b border-meadow/10 pb-14 last:border-b-0">
                  <div>
                    <h2 className="font-serif text-3xl text-ink mb-2">{p.name}</h2>
                    {p.description && <p className="text-ink-soft font-light">{p.description}</p>}
                    <div className="mt-5 text-sm text-ink-soft font-light space-y-1">
                      <p>
                        <span className="text-meadow">Fee:</span> {formatUSD(p.price_per_student_cents)} per student
                      </p>
                      <p>
                        <span className="text-meadow">Class size:</span> {p.min_students}–{p.max_students} students
                      </p>
                      {p.season_start_month && p.season_end_month && (
                        <p>
                          <span className="text-meadow">In season:</span> {MONTHS[p.season_start_month - 1]}–
                          {MONTHS[p.season_end_month - 1]}
                        </p>
                      )}
                    </div>
                    <Link href={`/visit/field-trips/${p.id}`} className="btn-primary mt-6 inline-block">
                      Request a Date
                    </Link>
                  </div>

                  <div className="md:col-span-2">
                    <p className="section-label mb-4">Sample schedule</p>
                    {p.schedule && p.schedule.length > 0 ? (
                      <ol className="border-l-2 border-wheat pl-5 space-y-3">
                        {p.schedule.map((s, i) => (
                          <li key={i} className="text-ink-soft font-light">
                            <span className="text-meadow font-serif text-lg mr-3">{s.time}</span>
                            {s.activity}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-ink-soft/70 font-light">Schedule sent by email once we confirm your date.</p>
                    )}
                    {p.teacher_notes && (
                      <div className="mt-6 border border-meadow/10 bg-paper-dark/40 p-5">
                        <p className="text-xs tracking-widest uppercase text-stone mb-2">For teachers</p>
                        <p className="text-sm text-ink-soft font-light leading-relaxed">{p.teacher_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
