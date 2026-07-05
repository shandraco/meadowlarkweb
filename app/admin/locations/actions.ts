"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { LocationKind } from "@/lib/types";

export interface LocationInput {
  name: string;
  kind: LocationKind;
  active: boolean;
  sortOrder: number;
}

export interface LocationResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function revalidateAll() {
  revalidatePath("/admin/locations");
  revalidatePath("/pos");
  revalidatePath("/admin");
}

export async function createLocation(input: LocationInput): Promise<LocationResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "Location name required." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .insert({
      name: input.name.trim(),
      kind: input.kind,
      active: input.active,
      sort_order: input.sortOrder,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id: data!.id as string };
}

export async function updateLocation(id: string, input: LocationInput): Promise<LocationResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update({
      name: input.name.trim(),
      kind: input.kind,
      active: input.active,
      sort_order: input.sortOrder,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id };
}

export async function deleteLocation(id: string): Promise<LocationResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}
