"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";

export interface BookingUpdateResult {
  ok: boolean;
  error?: string;
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<BookingUpdateResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status, paid_at: status === "confirmed" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/bookings");
  return { ok: true };
}
