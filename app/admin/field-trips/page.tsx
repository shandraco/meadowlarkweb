import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/money";
import type { FieldTripProgram } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Field Trip Programs | Meadowlark Admin" };

export default async function FieldTripsAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("field_trip_programs").select("*").order("name");
  const programs = (data ?? []) as FieldTripProgram[];

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Education</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Field Trip Programs</h1>
          <p className="text-ink-soft font-light mt-2 max-w-xl">
            Each program is a teacher-facing offering with a schedule, seasonal window, and per-student fee.
          </p>
        </div>
        <Link href="/admin/field-trips/new" className="btn-primary">
          + Add program
        </Link>
      </div>

      {programs.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No programs yet. Add one so teachers can book a class online.
        </p>
      ) : (
        <div className="grid gap-4">
          {programs.map((p) => (
            <Link key={p.id} href={`/admin/field-trips/${p.id}`} className="block border border-meadow/10 bg-paper p-5 hover:border-meadow transition-colors">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-2xl text-ink">{p.name}</h2>
                <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${p.active ? "bg-meadow/15 text-meadow" : "bg-stone/20 text-stone"}`}>
                  {p.active ? "Live" : "Hidden"}
                </span>
              </div>
              <p className="text-sm text-ink-soft font-light mt-2">
                {formatUSD(p.price_per_student_cents)} per student · {p.min_students}–{p.max_students} students
              </p>
              {p.description && <p className="text-sm text-ink-soft font-light mt-2">{p.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
