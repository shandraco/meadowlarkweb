import Link from "next/link";
import { notFound } from "next/navigation";
import { getFieldTripProgramById } from "@/lib/bookings";
import { formatUSD } from "@/lib/money";
import BookingForm from "@/components/booking/BookingForm";

export const dynamic = "force-dynamic";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function FieldTripBookingPage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  const program = await getFieldTripProgramById(programId);
  if (!program || !program.active) notFound();

  return (
    <section className="pt-36 pb-28 md:pb-40">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <Link
          href="/visit/field-trips"
          className="text-xs tracking-widest uppercase font-normal text-stone hover:text-meadow transition-colors"
        >
          ← Back to programs
        </Link>

        <p className="section-label mt-6 mb-2">Request a date</p>
        <h1 className="font-serif text-5xl md:text-6xl text-ink mb-4">{program.name}</h1>
        <p className="text-ink-soft font-normal mb-8">
          {formatUSD(program.price_per_student_cents)} per student · {program.min_students}–{program.max_students} students per
          class.
        </p>

        <div className="border border-meadow/10 bg-paper-dark/30 p-6 md:p-8">
          <BookingForm program={program} monthKey={currentMonthKey()} availability={[]} />
        </div>
      </div>
    </section>
  );
}
