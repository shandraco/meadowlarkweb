import { createClient } from "./supabase/server";
import { getSupabaseAdmin } from "./supabase/admin";
import type { BookableResource, Booking, BlockedDate, FieldTripProgram } from "./types";

// ---- Public catalog (respects RLS via anon key) ---------------------------

export async function getBookableResources(): Promise<BookableResource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookable_resources")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as BookableResource[];
}

export async function getBookableResourceById(id: string): Promise<BookableResource | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("bookable_resources").select("*").eq("id", id).maybeSingle();
  return (data as BookableResource | null) ?? null;
}

export async function getFieldTripPrograms(): Promise<FieldTripProgram[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("field_trip_programs")
    .select("*")
    .eq("active", true)
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as FieldTripProgram[];
}

export async function getFieldTripProgramById(id: string): Promise<FieldTripProgram | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("field_trip_programs").select("*").eq("id", id).maybeSingle();
  return (data as FieldTripProgram | null) ?? null;
}

// ---- Availability lookup (server-side; safe to expose to the public) -----

export interface DayAvailability {
  date: string; // YYYY-MM-DD in the farm's timezone
  status: "open" | "partial" | "booked";
  bookingCount: number;
  blockedReasons: string[];
}

export async function getResourceMonthAvailability(
  resourceId: string,
  monthStart: Date, // 1st of month (UTC midnight for simplicity)
): Promise<DayAvailability[]> {
  const supabase = await createClient();
  const start = new Date(monthStart);
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);

  const [bookingsResp, blocksResp] = await Promise.all([
    supabase
      .from("bookings")
      .select("starts_at, ends_at, status")
      .eq("resource_id", resourceId)
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString()),
    supabase
      .from("blocked_dates")
      .select("starts_at, ends_at, reason")
      .eq("resource_id", resourceId)
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString()),
  ]);

  const bookings = bookingsResp.data ?? [];
  const blocks = blocksResp.data ?? [];

  const days: DayAvailability[] = [];
  const cursor = new Date(start);
  while (cursor < end) {
    const iso = cursor.toISOString().slice(0, 10);
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const dayBookings = bookings.filter(
      (b) => new Date(b.starts_at) < dayEnd && new Date(b.ends_at) > dayStart,
    );
    const dayBlocks = blocks.filter(
      (b) => new Date(b.starts_at) < dayEnd && new Date(b.ends_at) > dayStart,
    );

    const isBlocked = dayBlocks.length > 0;
    days.push({
      date: iso,
      status: isBlocked ? "booked" : dayBookings.length > 0 ? "partial" : "open",
      bookingCount: dayBookings.length,
      blockedReasons: dayBlocks.map((b) => b.reason ?? "Unavailable"),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export async function getBookingsForResource(resourceId: string, from: Date, to: Date): Promise<Booking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("resource_id", resourceId)
    .gte("starts_at", from.toISOString())
    .lt("starts_at", to.toISOString())
    .order("starts_at");
  return (data ?? []) as Booking[];
}

export async function getBlockedDatesForResource(resourceId: string): Promise<BlockedDate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocked_dates")
    .select("*")
    .eq("resource_id", resourceId)
    .order("starts_at");
  return (data ?? []) as BlockedDate[];
}

// ---- Admin queries (staff-only via RLS) ----------------------------------

export async function getAllBookings(limit = 100): Promise<Booking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("starts_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Booking[];
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  return (data as Booking | null) ?? null;
}

// ---- Create a booking (server-only, uses admin client) -------------------

export interface CreateBookingInput {
  resourceId?: string | null;
  programId?: string | null;
  startsAt: Date;
  endsAt: Date;
  guestCount: number;
  customer: { name: string; email: string; phone?: string; organization?: string };
  notes?: string;
  totalCents: number;
  depositCents: number;
}

export async function createPendingBooking(input: CreateBookingInput): Promise<{ id: string; bookingNumber: number }> {
  const admin = getSupabaseAdmin();

  if (input.resourceId) {
    const { data: conflict } = await admin.rpc("resource_has_conflict", {
      p_resource: input.resourceId,
      p_start: input.startsAt.toISOString(),
      p_end: input.endsAt.toISOString(),
    });
    if (conflict) throw new Error("Sorry — that resource is already booked for those hours.");
  }

  const ref = `booking_${crypto.randomUUID()}`;
  const { data, error } = await admin
    .from("bookings")
    .insert({
      resource_id: input.resourceId ?? null,
      program_id: input.programId ?? null,
      status: "pending",
      starts_at: input.startsAt.toISOString(),
      ends_at: input.endsAt.toISOString(),
      guest_count: input.guestCount,
      customer_name: input.customer.name.trim(),
      customer_email: input.customer.email.trim(),
      customer_phone: input.customer.phone?.trim() || null,
      organization: input.customer.organization?.trim() || null,
      notes: input.notes?.trim() || null,
      total_cents: input.totalCents,
      deposit_cents: input.depositCents,
      payment_provider: "manual_invoice",
      payment_ref: ref,
    })
    .select("id, booking_number")
    .single();
  if (error) throw new Error(error.message);
  return { id: data!.id as string, bookingNumber: data!.booking_number as number };
}
