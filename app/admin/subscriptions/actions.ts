"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import {
  PlanInput,
  ScheduleShipmentInput,
  SetActiveInput,
  SetShipmentStatusInput,
  SetSubscriptionStatusInput,
  firstIssue,
  uuid,
} from "@/lib/validation";

export interface AdminResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const UpdatePlanInput = z.object({ id: uuid }).and(PlanInput);

function revalidateAll() {
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/subscriptions/plans");
  revalidatePath("/admin/subscriptions/shipments");
  revalidatePath("/cider-club");
}

export async function createPlan(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = PlanInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .insert({
      name: p.name,
      tier: p.tier,
      cadence: p.cadence,
      bottles_per_shipment: p.bottlesPerShipment,
      price_cents: p.priceCents,
      description: p.description || null,
      benefits: p.benefits || null,
      sort_order: p.sortOrder,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "create",
    entityType: "subscription_plan",
    entityId: data.id,
    summary: `Created plan "${p.name}" (${p.tier}, ${p.cadence}, $${(p.priceCents / 100).toFixed(2)})`,
    after: { ...p, id: data.id },
  });
  revalidateAll();
  return { ok: true, id: data.id };
}

export async function updatePlan(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = UpdatePlanInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("subscription_plans").select("*").eq("id", p.id).maybeSingle();
  if (!before) return { ok: false, error: "Plan not found." };

  const { error } = await supabase
    .from("subscription_plans")
    .update({
      name: p.name,
      tier: p.tier,
      cadence: p.cadence,
      bottles_per_shipment: p.bottlesPerShipment,
      price_cents: p.priceCents,
      description: p.description || null,
      benefits: p.benefits || null,
      sort_order: p.sortOrder,
    })
    .eq("id", p.id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "subscription_plan",
    entityId: p.id,
    summary: `Updated plan "${p.name}"`,
    before,
    after: p,
  });
  revalidateAll();
  return { ok: true, id: p.id };
}

export async function setPlanActive(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = SetActiveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, active } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("subscription_plans").select("id, name, active").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Plan not found." };

  const { error } = await supabase.from("subscription_plans").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "subscription_plan",
    entityId: id,
    summary: `${active ? "Published" : "Hid"} plan "${before.name}"`,
    before: { active: before.active },
    after: { active },
  });
  revalidateAll();
  return { ok: true, id };
}

export async function setSubscriptionStatus(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = SetSubscriptionStatusInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, status } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("subscriptions")
    .select("id, member_number, customer_name, status")
    .eq("id", id)
    .maybeSingle();
  if (!before) return { ok: false, error: "Member not found." };

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status,
      cancelled_at: status === "cancelled" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "subscription",
    entityId: id,
    summary: `Member #${before.member_number} (${before.customer_name}): ${before.status} → ${status}`,
    before: { status: before.status },
    after: { status },
  });
  revalidateAll();
  return { ok: true, id };
}

export async function scheduleShipment(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = ScheduleShipmentInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const s = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_shipments")
    .insert({
      subscription_id: s.subscriptionId,
      ship_date: s.shipDate,
      product_ids: s.productIds,
      notes: s.notes ?? null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "create",
    entityType: "subscription_shipment",
    entityId: data.id,
    summary: `Scheduled shipment (${s.productIds.length} bottles) for ${s.shipDate}`,
    after: { ...s, id: data.id },
  });
  revalidateAll();
  return { ok: true, id: data.id };
}

export async function setShipmentStatus(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = SetShipmentStatusInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, status, tracking } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("subscription_shipments").select("*").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Shipment not found." };

  const { error } = await supabase
    .from("subscription_shipments")
    .update({
      status,
      tracking_number: tracking || null,
      shipped_at: status === "shipped" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "subscription_shipment",
    entityId: id,
    summary: `Shipment ${before.status} → ${status}${tracking ? ` (tracking: ${tracking})` : ""}`,
    before: { status: before.status, tracking_number: before.tracking_number },
    after: { status, tracking_number: tracking || null },
  });
  revalidateAll();
  return { ok: true };
}
