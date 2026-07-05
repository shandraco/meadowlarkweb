"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ResourceAmenities, ResourceKind } from "@/lib/types";

export interface ResourceInput {
  name: string;
  kind: ResourceKind;
  capacity: number | null;
  description: string;
  priceCents: number;
  depositPct: number;
  heroImageUrl: string;
  floorPlanUrl: string;
  amenities: ResourceAmenities;
  sortOrder: number;
}

export interface ResourceResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function revalidateAll() {
  revalidatePath("/admin/resources");
  revalidatePath("/visit/book");
}

export async function createResource(input: ResourceInput): Promise<ResourceResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "Name required." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookable_resources")
    .insert({
      name: input.name.trim(),
      kind: input.kind,
      capacity: input.capacity,
      description: input.description.trim() || null,
      price_cents: input.priceCents,
      deposit_pct: input.depositPct,
      hero_image_url: input.heroImageUrl.trim() || null,
      floor_plan_url: input.floorPlanUrl.trim() || null,
      amenities: input.amenities,
      sort_order: input.sortOrder,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id: data!.id as string };
}

export async function updateResource(id: string, input: ResourceInput): Promise<ResourceResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookable_resources")
    .update({
      name: input.name.trim(),
      kind: input.kind,
      capacity: input.capacity,
      description: input.description.trim() || null,
      price_cents: input.priceCents,
      deposit_pct: input.depositPct,
      hero_image_url: input.heroImageUrl.trim() || null,
      floor_plan_url: input.floorPlanUrl.trim() || null,
      amenities: input.amenities,
      sort_order: input.sortOrder,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id };
}

export async function setResourceActive(id: string, active: boolean): Promise<ResourceResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("bookable_resources").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id };
}

export async function addBlockedDate(input: {
  resourceId: string;
  startsAt: string;
  endsAt: string;
  reason?: string;
}): Promise<ResourceResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("blocked_dates").insert({
    resource_id: input.resourceId,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    reason: input.reason ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function removeBlockedDate(id: string): Promise<ResourceResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}
