import { getAllBookings } from "@/lib/bookings";
import { createClient } from "@/lib/supabase/server";
import type { BookableResource, FieldTripProgram } from "@/lib/types";
import BookingRow from "@/components/admin/BookingRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings | Meadowlark Admin" };

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const [bookings, resourcesResp, programsResp] = await Promise.all([
    getAllBookings(200),
    supabase.from("bookable_resources").select("id, name"),
    supabase.from("field_trip_programs").select("id, name"),
  ]);
  const resourceMap = new Map<string, string>(((resourcesResp.data ?? []) as Pick<BookableResource, "id" | "name">[]).map((r) => [r.id, r.name]));
  const programMap = new Map<string, string>(((programsResp.data ?? []) as Pick<FieldTripProgram, "id" | "name">[]).map((p) => [p.id, p.name]));

  return (
    <div>
      <p className="section-label mb-2">Bookings</p>
      <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none mb-8">Reservations</h1>

      {bookings.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No bookings yet. The public booking flow lives at{" "}
          <a href="/visit/book" className="text-meadow underline">
            /visit/book
          </a>
          .
        </p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const label = b.resource_id
              ? resourceMap.get(b.resource_id) ?? "Resource"
              : b.program_id
                ? programMap.get(b.program_id) ?? "Field trip"
                : "—";
            return <BookingRow key={b.id} booking={b} resourceName={label} />;
          })}
        </div>
      )}
    </div>
  );
}
