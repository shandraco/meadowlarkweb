"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { ProviderInput, firstIssue, uuid } from "@/lib/validation";

export interface ProviderResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const UpsertProviderInput = z.object({ id: uuid.nullable() }).and(ProviderInput);

function refresh() {
  revalidatePath("/admin/shipping");
}

export async function upsertProvider(input: unknown): Promise<ProviderResult> {
  await requireAdmin();
  const parsed = UpsertProviderInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  const supabase = await createClient();
  const payload = {
    name: p.name,
    code: p.code,
    states_covered: p.statesCovered,
    api_base_url: p.apiBaseUrl || null,
    notes: p.notes || null,
    active: p.active,
  };

  if (p.id) {
    const { data: before } = await supabase.from("shipping_providers").select("*").eq("id", p.id).maybeSingle();
    if (!before) return { ok: false, error: "Provider not found." };
    const { error } = await supabase.from("shipping_providers").update(payload).eq("id", p.id);
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      action: "update",
      entityType: "shipping_provider",
      entityId: p.id,
      summary: `Updated provider "${p.name}" (${p.statesCovered.length} states)`,
      before,
      after: p,
    });
    refresh();
    return { ok: true, id: p.id };
  }

  const { data, error } = await supabase.from("shipping_providers").insert(payload).select("id").single();
  if (error) return { ok: false, error: error.message };
  await writeAudit({
    action: "create",
    entityType: "shipping_provider",
    entityId: data.id,
    summary: `Added provider "${p.name}"`,
    after: { ...p, id: data.id },
  });
  refresh();
  return { ok: true, id: data.id };
}
