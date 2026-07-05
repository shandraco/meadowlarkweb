import Link from "next/link";
import { getFieldTripPrograms } from "@/lib/bookings";
import { formatUSD } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Field Trips | Meadowlark Farm" };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function FieldTripsPage() {
  const programs = await getFieldTripPrograms();

  return (
    <>
      <section className="pt-36 pb-14 bg-meadow-deep">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-xs tracking-widest uppercase font-light text-wheat mb-5">For Teachers</p>
          <h1 className="font-serif text-6xl md:text-8xl text-paper leading-tight">
            Field trips <em className="text-wheat-light">worth talking about.</em>
          </h1>
          <p className="text-paper/70 font-light text-lg mt-5 max-w-lg">
            Kids meet the apples on the tree, then watch juice made from them. Bring rubber boots.
          </p>
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
