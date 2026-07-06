"use server";

import { revalidatePath } from "next/cache";
import { getSubscriptionByToken } from "@/lib/subscriptions";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { writeAudit } from "@/lib/audit";
import { MemberToken, MemberUpdateAddressInput, firstIssue } from "@/lib/validation";

export interface MemberActionResult {
  ok: boolean;
  error?: string;
}

async function loadOrError(rawToken: unknown) {
  const parsed = MemberToken.safeParse(rawToken);
  if (!parsed.success) return { ok: false as const, error: "Invalid membership link." };
  const sub = await getSubscriptionByToken(parsed.data);
  if (!sub) return { ok: false as const, error: "Membership not found." };
  return { ok: true as const, sub, token: parsed.data };
}

export async function memberPause(token: unknown, until?: unknown): Promise<MemberActionResult> {
  const loaded = await loadOrError(token);
  if (!loaded.ok) return { ok: false, error: loaded.error };
  const untilIso = typeof until === "string" && until.length > 0 ? until : null;

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("subscriptions")
    .update({ status: "paused", paused_until: untilIso })
    .eq("id", loaded.sub.id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "subscription",
    entityId: loaded.sub.id,
    summary: `Member #${loaded.sub.member_number} paused their subscription`,
    before: { status: loaded.sub.status },
    after: { status: "paused", paused_until: untilIso },
  });

  revalidatePath(`/club/account/${loaded.token}`);
  return { ok: true };
}

export async function memberResume(token: unknown): Promise<MemberActionResult> {
  const loaded = await loadOrError(token);
  if (!loaded.ok) return { ok: false, error: loaded.error };

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("subscriptions")
    .update({ status: "active", paused_until: null })
    .eq("id", loaded.sub.id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "subscription",
    entityId: loaded.sub.id,
    summary: `Member #${loaded.sub.member_number} resumed their subscription`,
    before: { status: loaded.sub.status },
    after: { status: "active" },
  });

  revalidatePath(`/club/account/${loaded.token}`);
  return { ok: true };
}

export async function memberCancel(token: unknown): Promise<MemberActionResult> {
  const loaded = await loadOrError(token);
  if (!loaded.ok) return { ok: false, error: loaded.error };

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("subscriptions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", loaded.sub.id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "subscription",
    entityId: loaded.sub.id,
    summary: `Member #${loaded.sub.member_number} cancelled their subscription`,
    before: { status: loaded.sub.status },
    after: { status: "cancelled" },
  });

  revalidatePath(`/club/account/${loaded.token}`);
  return { ok: true };
}

export async function memberUpdateAddress(token: unknown, address: unknown, phone: unknown): Promise<MemberActionResult> {
  const parsed = MemberUpdateAddressInput.safeParse({ token, address, phone });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const loaded = await loadOrError(parsed.data.token);
  if (!loaded.ok) return { ok: false, error: loaded.error };

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("subscriptions")
    .update({
      shipping_address: parsed.data.address || null,
      customer_phone: parsed.data.phone || null,
    })
    .eq("id", loaded.sub.id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "subscription",
    entityId: loaded.sub.id,
    summary: `Member #${loaded.sub.member_number} updated shipping details`,
    before: {
      shipping_address: loaded.sub.shipping_address,
      customer_phone: loaded.sub.customer_phone,
    },
    after: {
      shipping_address: parsed.data.address || null,
      customer_phone: parsed.data.phone || null,
    },
  });

  revalidatePath(`/club/account/${loaded.token}`);
  return { ok: true };
}
