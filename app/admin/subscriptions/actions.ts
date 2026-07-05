"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ShipmentStatus, SubscriptionStatus } from "@/lib/types";

export interface PlanInput {
  name: string;
  tier: string;
  cadence: string;
  bottlesPerShipment: number;
  priceCents: number;
  description: string;
  benefits: string;
  sortOrder: number;
}

export interface AdminResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function revalidateAll() {
  revalidatePath("/admin/subscriptions");
  revalidatePath("/cider-club");
}

export async function createPlan(input: PlanInput): Promise<AdminResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "Plan name required." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .insert({
      name: input.name.trim(),
      tier: input.tier.trim() || "basic",
      cadence: input.cadence,
      bottles_per_shipment: input.bottlesPerShipment,
      price_cents: input.priceCents,
      description: input.description.trim() || null,
      benefits: input.benefits.trim() || null,
      sort_order: input.sortOrder,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id: data!.id as string };
}

export async function updatePlan(id: string, input: PlanInput): Promise<AdminResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscription_plans")
    .update({
      name: input.name.trim(),
      tier: input.tier.trim() || "basic",
      cadence: input.cadence,
      bottles_per_shipment: input.bottlesPerShipment,
      price_cents: input.priceCents,
      description: input.description.trim() || null,
      benefits: input.benefits.trim() || null,
      sort_order: input.sortOrder,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id };
}

export async function setPlanActive(id: string, active: boolean): Promise<AdminResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("subscription_plans").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id };
}

export async function setSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<AdminResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status,
      cancelled_at: status === "cancelled" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id };
}

export async function scheduleShipment(input: {
  subscriptionId: string;
  shipDate: string;
  productIds: string[];
  notes?: string;
}): Promise<AdminResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_shipments")
    .insert({
      subscription_id: input.subscriptionId,
      ship_date: input.shipDate,
      product_ids: input.productIds,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id: data!.id as string };
}

export async function setShipmentStatus(id: string, status: ShipmentStatus, tracking?: string): Promise<AdminResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscription_shipments")
    .update({
      status,
      tracking_number: tracking?.trim() || null,
      shipped_at: status === "shipped" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}
