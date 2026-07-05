"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface ProviderInput {
  name: string;
  code: string;
  statesCovered: string[];
  apiBaseUrl: string;
  notes: string;
  active: boolean;
}

export interface ProviderResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function refresh() {
  revalidatePath("/admin/shipping");
}

export async function upsertProvider(id: string | null, input: ProviderInput): Promise<ProviderResult> {
  await requireAdmin();
  if (!input.name.trim() || !input.code.trim()) return { ok: false, error: "Name and code required." };
  const supabase = await createClient();
  const payload = {
    name: input.name.trim(),
    code: input.code.trim().toLowerCase(),
    states_covered: input.statesCovered,
    api_base_url: input.apiBaseUrl.trim() || null,
    notes: input.notes.trim() || null,
    active: input.active,
  };
  if (id) {
    const { error } = await supabase.from("shipping_providers").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true, id };
  }
  const { data, error } = await supabase.from("shipping_providers").insert(payload).select("id").single();
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true, id: data!.id as string };
}
