"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { SetBookingStatusInput, firstIssue } from "@/lib/validation";

export interface BookingUpdateResult {
  ok: boolean;
  error?: string;
}

export async function setBookingStatus(input: unknown): Promise<BookingUpdateResult> {
  await requireAdmin();
  const parsed = SetBookingStatusInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, status } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("bookings")
    .select("id, booking_number, status, customer_name")
    .eq("id", id)
    .maybeSingle();
  if (!before) return { ok: false, error: "Booking not found." };

  const { error } = await supabase
    .from("bookings")
    .update({ status, paid_at: status === "confirmed" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "booking",
    entityId: id,
    summary: `Booking #${before.booking_number} (${before.customer_name}): ${before.status} → ${status}`,
    before: { status: before.status },
    after: { status },
  });

  revalidatePath("/admin/bookings");
  return { ok: true };
}
