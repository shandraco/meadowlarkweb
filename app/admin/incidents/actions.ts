"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { IncidentInput, IncidentStatusEnum, firstIssue, uuid } from "@/lib/validation";

export interface IncidentResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const SetStatusInput = z.object({ id: uuid, status: IncidentStatusEnum }).strict();
const DeleteInput = z.object({ id: uuid }).strict();

function revalidateAll(id?: string) {
  revalidatePath("/admin/incidents");
  if (id) revalidatePath(`/admin/incidents/${id}`);
}

export async function createIncident(input: unknown): Promise<IncidentResult> {
  const session = await requireStaff();
  const parsed = IncidentInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const i = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("farm_incidents")
    .insert({
      title: i.title,
      details: i.details || null,
      category: i.category,
      severity: i.severity,
      photo_url: i.photoUrl || null,
      latitude: i.latitude ?? null,
      longitude: i.longitude ?? null,
      location_note: i.locationNote || null,
      occurred_at: i.occurredAt ?? new Date().toISOString(),
      created_by: session.userId,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "create",
    entityType: "farm_incident",
    entityId: data.id,
    summary: `Logged incident "${i.title}" (${i.severity})`,
    after: { ...i, id: data.id },
  });
  revalidateAll(data.id);
  return { ok: true, id: data.id };
}

export async function setIncidentStatus(input: unknown): Promise<IncidentResult> {
  await requireStaff();
  const parsed = SetStatusInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, status } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("farm_incidents").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "farm_incident",
    entityId: id,
    summary: `Marked incident ${status}`,
  });
  revalidateAll(id);
  return { ok: true, id };
}

export async function deleteIncident(input: unknown): Promise<IncidentResult> {
  await requireStaff();
  const parsed = DeleteInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("farm_incidents").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "delete",
    entityType: "farm_incident",
    entityId: id,
    summary: `Deleted incident ${id}`,
  });
  revalidateAll();
  return { ok: true };
}
