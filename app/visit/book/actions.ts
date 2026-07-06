"use server";

import { revalidatePath } from "next/cache";
import { createPendingBooking } from "@/lib/bookings";
import { getBookableResourceById, getFieldTripProgramById } from "@/lib/bookings";
import { writeAudit } from "@/lib/audit";
import { consumeRateLimit } from "@/lib/rate-limit";
import { RequestBookingInput, firstIssue } from "@/lib/validation";

export interface RequestBookingResult {
  ok: boolean;
  bookingNumber?: number;
  totalCents?: number;
  depositCents?: number;
  error?: string;
}

function toDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

function durationHours(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

export async function requestBooking(input: unknown): Promise<RequestBookingResult> {
  const parsed = RequestBookingInput.safeParse(input);
  if (!parsed.success) {
    await writeAudit({
      action: "other",
      entityType: "booking",
      summary: `Rejected booking request (validation): ${firstIssue(parsed.error)}`,
    });
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const b = parsed.data;

  // 8 attempts / 30 min per email — teachers sometimes try multiple slots.
  const ok = await consumeRateLimit("booking", b.customer.email, 8, 1800);
  if (!ok) return { ok: false, error: "Too many attempts. Please try again shortly." };

  const startsAt = toDateTime(b.date, b.startTime);
  const endsAt = toDateTime(b.date, b.endTime);
  if (endsAt <= startsAt) return { ok: false, error: "End time must be after start time." };

  let totalCents = 0;
  let depositCents = 0;

  if (b.resourceId) {
    const res = await getBookableResourceById(b.resourceId);
    if (!res || !res.active) return { ok: false, error: "That space isn't available." };
    if (res.capacity && b.guestCount > res.capacity) {
      return { ok: false, error: `That space holds up to ${res.capacity} guests.` };
    }
    const hours = Math.ceil(durationHours(startsAt, endsAt));
    totalCents = res.price_cents * Math.max(1, hours);
    depositCents = Math.round((totalCents * res.deposit_pct) / 100);
  } else if (b.programId) {
    const prog = await getFieldTripProgramById(b.programId);
    if (!prog || !prog.active) return { ok: false, error: "That program isn't available." };
    if (b.guestCount < prog.min_students || b.guestCount > prog.max_students) {
      return { ok: false, error: `Programs run for ${prog.min_students}–${prog.max_students} students.` };
    }
    totalCents = prog.price_per_student_cents * b.guestCount;
    depositCents = Math.round(totalCents * 0.25);
  }

  try {
    const booking = await createPendingBooking({
      resourceId: b.resourceId ?? null,
      programId: b.programId ?? null,
      startsAt,
      endsAt,
      guestCount: b.guestCount,
      customer: b.customer,
      notes: b.notes,
      totalCents,
      depositCents,
    });
    await writeAudit({
      action: "create",
      entityType: "booking",
      entityId: booking.id,
      summary: `Booking request #${booking.bookingNumber} — ${b.customer.name} — ${b.date} ${b.startTime}`,
      after: {
        bookingNumber: booking.bookingNumber,
        resourceId: b.resourceId,
        programId: b.programId,
        guestCount: b.guestCount,
        totalCents,
        depositCents,
      },
    });
    revalidatePath("/visit/book");
    revalidatePath("/admin/bookings");
    return { ok: true, bookingNumber: booking.bookingNumber, totalCents, depositCents };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Booking failed.";
    await writeAudit({
      action: "other",
      entityType: "booking",
      summary: `Failed booking for ${b.customer.email}: ${msg}`,
    });
    return { ok: false, error: msg };
  }
}
