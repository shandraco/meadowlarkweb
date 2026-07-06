"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { EventInput, firstIssue, uuid } from "@/lib/validation";

export interface EventResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const UpdateEventInput = z.object({ id: uuid }).and(EventInput);
const IdInput = z.object({ id: uuid }).strict();

function refresh() {
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function createEvent(input: unknown): Promise<EventResult> {
  await requireAdmin();
  const parsed = EventInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const e = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      name: e.name,
      kind: e.kind,
      starts_at: e.startsAt,
      ends_at: e.endsAt,
      description: e.description ?? null,
      hero_image_url: e.heroImageUrl ?? null,
      ticket_url: e.ticketUrl ?? null,
      price_cents: e.priceCents,
      capacity: e.capacity,
      cancelled: e.cancelled,
      featured: e.featured,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "create",
    entityType: "event",
    entityId: data.id,
    summary: `Created event "${e.name}" (${e.kind}, ${new Date(e.startsAt).toLocaleDateString()})`,
    after: { ...e, id: data.id },
  });
  refresh();
  return { ok: true, id: data.id };
}

export async function updateEvent(input: unknown): Promise<EventResult> {
  await requireAdmin();
  const parsed = UpdateEventInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const e = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("events").select("*").eq("id", e.id).maybeSingle();
  if (!before) return { ok: false, error: "Event not found." };

  const { error } = await supabase
    .from("events")
    .update({
      name: e.name,
      kind: e.kind,
      starts_at: e.startsAt,
      ends_at: e.endsAt,
      description: e.description ?? null,
      hero_image_url: e.heroImageUrl ?? null,
      ticket_url: e.ticketUrl ?? null,
      price_cents: e.priceCents,
      capacity: e.capacity,
      cancelled: e.cancelled,
      featured: e.featured,
    })
    .eq("id", e.id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "event",
    entityId: e.id,
    summary: `Updated event "${e.name}"`,
    before,
    after: e,
  });
  refresh();
  return { ok: true, id: e.id };
}

export async function deleteEvent(input: unknown): Promise<EventResult> {
  await requireAdmin();
  const parsed = IdInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Event not found." };

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "delete",
    entityType: "event",
    entityId: id,
    summary: `Deleted event "${before.name}"`,
    before,
  });
  refresh();
  return { ok: true };
}
