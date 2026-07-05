"use server";

import { revalidatePath } from "next/cache";
import { getSubscriptionByToken } from "@/lib/subscriptions";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface MemberActionResult {
  ok: boolean;
  error?: string;
}

async function loadOrError(token: string) {
  const sub = await getSubscriptionByToken(token);
  if (!sub) throw new Error("Membership not found.");
  return sub;
}

export async function memberPause(token: string, until?: string): Promise<MemberActionResult> {
  const sub = await loadOrError(token);
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("subscriptions")
    .update({ status: "paused", paused_until: until ?? null })
    .eq("id", sub.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/club/account/${token}`);
  return { ok: true };
}

export async function memberResume(token: string): Promise<MemberActionResult> {
  const sub = await loadOrError(token);
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("subscriptions")
    .update({ status: "active", paused_until: null })
    .eq("id", sub.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/club/account/${token}`);
  return { ok: true };
}

export async function memberCancel(token: string): Promise<MemberActionResult> {
  const sub = await loadOrError(token);
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("subscriptions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", sub.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/club/account/${token}`);
  return { ok: true };
}

export async function memberUpdateAddress(token: string, address: string, phone: string): Promise<MemberActionResult> {
  const sub = await loadOrError(token);
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("subscriptions")
    .update({
      shipping_address: address.trim() || null,
      customer_phone: phone.trim() || null,
    })
    .eq("id", sub.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/club/account/${token}`);
  return { ok: true };
}
