"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { LocationInput, firstIssue, uuid } from "@/lib/validation";

export interface LocationResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const UpdateLocationInput = z.object({ id: uuid }).and(LocationInput);
const DeleteLocationInput = z.object({ id: uuid }).strict();

function revalidateAll() {
  revalidatePath("/admin/locations");
  revalidatePath("/pos");
  revalidatePath("/admin");
}

export async function createLocation(input: unknown): Promise<LocationResult> {
  await requireAdmin();
  const parsed = LocationInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const l = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .insert({ name: l.name, kind: l.kind, active: l.active, sort_order: l.sortOrder })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "create",
    entityType: "location",
    entityId: data.id,
    summary: `Created location "${l.name}" (${l.kind})`,
    after: { ...l, id: data.id },
  });

  revalidateAll();
  return { ok: true, id: data.id };
}

export async function updateLocation(input: unknown): Promise<LocationResult> {
  await requireAdmin();
  const parsed = UpdateLocationInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const l = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("locations").select("*").eq("id", l.id).maybeSingle();
  if (!before) return { ok: false, error: "Location not found." };

  const { error } = await supabase
    .from("locations")
    .update({ name: l.name, kind: l.kind, active: l.active, sort_order: l.sortOrder })
    .eq("id", l.id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "location",
    entityId: l.id,
    summary: `Updated location "${l.name}"`,
    before,
    after: l,
  });

  revalidateAll();
  return { ok: true, id: l.id };
}

export async function deleteLocation(input: unknown): Promise<LocationResult> {
  await requireAdmin();
  const parsed = DeleteLocationInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("locations").select("*").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Location not found." };

  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "delete",
    entityType: "location",
    entityId: id,
    summary: `Deleted location "${before.name}"`,
    before,
  });

  revalidateAll();
  return { ok: true };
}
