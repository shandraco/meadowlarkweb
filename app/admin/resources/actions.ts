"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { BlockedDateInput, ResourceInput, SetActiveInput, firstIssue, uuid } from "@/lib/validation";

export interface ResourceResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const UpdateResourceInput = z.object({ id: uuid }).and(ResourceInput);
const RemoveBlockedInput = z.object({ id: uuid }).strict();

function revalidateAll() {
  revalidatePath("/admin/resources");
  revalidatePath("/visit/book");
}

export async function createResource(input: unknown): Promise<ResourceResult> {
  await requireAdmin();
  const parsed = ResourceInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const r = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookable_resources")
    .insert({
      name: r.name,
      kind: r.kind,
      capacity: r.capacity,
      description: r.description || null,
      price_cents: r.priceCents,
      deposit_pct: r.depositPct,
      hero_image_url: r.heroImageUrl || null,
      floor_plan_url: r.floorPlanUrl || null,
      amenities: r.amenities,
      sort_order: r.sortOrder,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "create",
    entityType: "bookable_resource",
    entityId: data.id,
    summary: `Created resource "${r.name}"`,
    after: { ...r, id: data.id },
  });
  revalidateAll();
  return { ok: true, id: data.id };
}

export async function updateResource(input: unknown): Promise<ResourceResult> {
  await requireAdmin();
  const parsed = UpdateResourceInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const r = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("bookable_resources").select("*").eq("id", r.id).maybeSingle();
  if (!before) return { ok: false, error: "Resource not found." };

  const { error } = await supabase
    .from("bookable_resources")
    .update({
      name: r.name,
      kind: r.kind,
      capacity: r.capacity,
      description: r.description || null,
      price_cents: r.priceCents,
      deposit_pct: r.depositPct,
      hero_image_url: r.heroImageUrl || null,
      floor_plan_url: r.floorPlanUrl || null,
      amenities: r.amenities,
      sort_order: r.sortOrder,
    })
    .eq("id", r.id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "bookable_resource",
    entityId: r.id,
    summary: `Updated resource "${r.name}"`,
    before,
    after: r,
  });
  revalidateAll();
  return { ok: true, id: r.id };
}

export async function setResourceActive(input: unknown): Promise<ResourceResult> {
  await requireAdmin();
  const parsed = SetActiveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, active } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("bookable_resources").select("id, name, active").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Resource not found." };

  const { error } = await supabase.from("bookable_resources").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "bookable_resource",
    entityId: id,
    summary: `${active ? "Published" : "Hid"} resource "${before.name}"`,
    before: { active: before.active },
    after: { active },
  });
  revalidateAll();
  return { ok: true, id };
}

export async function addBlockedDate(input: unknown): Promise<ResourceResult> {
  await requireAdmin();
  const parsed = BlockedDateInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const b = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocked_dates")
    .insert({
      resource_id: b.resourceId,
      starts_at: b.startsAt,
      ends_at: b.endsAt,
      reason: b.reason ?? null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "create",
    entityType: "blocked_date",
    entityId: data.id,
    summary: `Blocked ${new Date(b.startsAt).toLocaleString()} → ${new Date(b.endsAt).toLocaleString()}`,
    after: b,
  });
  revalidateAll();
  return { ok: true, id: data.id };
}

export async function removeBlockedDate(input: unknown): Promise<ResourceResult> {
  await requireAdmin();
  const parsed = RemoveBlockedInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("blocked_dates").select("*").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Block not found." };

  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "delete",
    entityType: "blocked_date",
    entityId: id,
    summary: `Removed block on resource ${before.resource_id}`,
    before,
  });
  revalidateAll();
  return { ok: true };
}
