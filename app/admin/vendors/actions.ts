"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { SetActiveInput, VendorInput, firstIssue, uuid } from "@/lib/validation";

export interface VendorResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const UpdateVendorInput = z
  .object({ id: uuid })
  .and(VendorInput);

function refresh() {
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/products");
}

export async function createVendor(input: unknown): Promise<VendorResult> {
  await requireAdmin();
  const parsed = VendorInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const v = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .insert({
      name: v.name,
      contact_name: v.contactName ?? null,
      contact_email: v.contactEmail || null,
      contact_phone: v.contactPhone ?? null,
      split_pct: v.splitPct,
      notes: v.notes ?? null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "create",
    entityType: "vendor",
    entityId: data.id,
    summary: `Created vendor "${v.name}" (${v.splitPct}% split)`,
    after: { ...v, id: data.id },
  });

  refresh();
  return { ok: true, id: data.id };
}

export async function updateVendor(input: unknown): Promise<VendorResult> {
  await requireAdmin();
  const parsed = UpdateVendorInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const v = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("vendors").select("*").eq("id", v.id).maybeSingle();
  if (!before) return { ok: false, error: "Vendor not found." };

  const { error } = await supabase
    .from("vendors")
    .update({
      name: v.name,
      contact_name: v.contactName ?? null,
      contact_email: v.contactEmail || null,
      contact_phone: v.contactPhone ?? null,
      split_pct: v.splitPct,
      notes: v.notes ?? null,
    })
    .eq("id", v.id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "vendor",
    entityId: v.id,
    summary: `Updated vendor "${v.name}"`,
    before,
    after: v,
  });

  refresh();
  return { ok: true, id: v.id };
}

export async function setVendorActive(input: unknown): Promise<VendorResult> {
  await requireAdmin();
  const parsed = SetActiveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, active } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("vendors").select("id, name, active").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Vendor not found." };

  const { error } = await supabase.from("vendors").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "vendor",
    entityId: id,
    summary: `${active ? "Reactivated" : "Deactivated"} vendor "${before.name}"`,
    before: { active: before.active },
    after: { active },
  });

  refresh();
  return { ok: true, id };
}
