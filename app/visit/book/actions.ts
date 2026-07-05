"use server";

import { revalidatePath } from "next/cache";
import { createPendingBooking } from "@/lib/bookings";
import { getBookableResourceById, getFieldTripProgramById } from "@/lib/bookings";

export interface RequestBookingInput {
  resourceId?: string;
  programId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  guestCount: number;
  customer: { name: string; email: string; phone?: string; organization?: string };
  notes?: string;
}

export interface RequestBookingResult {
  ok: boolean;
  bookingNumber?: number;
  totalCents?: number;
  depositCents?: number;
  error?: string;
}

function toDateTime(date: string, time: string): Date {
  // Interpret as local time in the browser's TZ. Fine for a farm in one TZ.
  return new Date(`${date}T${time}:00`);
}

function durationHours(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

export async function requestBooking(input: RequestBookingInput): Promise<RequestBookingResult> {
  if (!input.customer.name?.trim() || !input.customer.email?.trim()) {
    return { ok: false, error: "Name and email are required." };
  }
  if (!input.resourceId && !input.programId) return { ok: false, error: "No resource or program specified." };
  if (!input.date || !input.startTime || !input.endTime) return { ok: false, error: "Pick a date and time window." };

  const startsAt = toDateTime(input.date, input.startTime);
  const endsAt = toDateTime(input.date, input.endTime);
  if (endsAt <= startsAt) return { ok: false, error: "End time must be after start time." };

  let totalCents = 0;
  let depositCents = 0;

  if (input.resourceId) {
    const res = await getBookableResourceById(input.resourceId);
    if (!res || !res.active) return { ok: false, error: "That space isn't available." };
    if (res.capacity && input.guestCount > res.capacity) {
      return { ok: false, error: `That space holds up to ${res.capacity} guests.` };
    }
    const hours = Math.ceil(durationHours(startsAt, endsAt));
    totalCents = res.price_cents * Math.max(1, hours);
    depositCents = Math.round((totalCents * res.deposit_pct) / 100);
  } else if (input.programId) {
    const prog = await getFieldTripProgramById(input.programId);
    if (!prog || !prog.active) return { ok: false, error: "That program isn't available." };
    if (input.guestCount < prog.min_students || input.guestCount > prog.max_students) {
      return { ok: false, error: `Programs run for ${prog.min_students}–${prog.max_students} students.` };
    }
    totalCents = prog.price_per_student_cents * input.guestCount;
    depositCents = Math.round(totalCents * 0.25);
  }

  try {
    const b = await createPendingBooking({
      resourceId: input.resourceId ?? null,
      programId: input.programId ?? null,
      startsAt,
      endsAt,
      guestCount: input.guestCount,
      customer: input.customer,
      notes: input.notes,
      totalCents,
      depositCents,
    });
    revalidatePath("/visit/book");
    revalidatePath("/admin/bookings");
    return { ok: true, bookingNumber: b.bookingNumber, totalCents, depositCents };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Booking failed." };
  }
}
