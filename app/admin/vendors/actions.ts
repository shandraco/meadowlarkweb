"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface VendorInput {
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  splitPct: number;
  notes?: string;
}

export interface VendorResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function revalidateVendors() {
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/products");
}

export async function createVendor(input: VendorInput): Promise<VendorResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "Vendor name required." };
  if (input.splitPct < 0 || input.splitPct > 100) return { ok: false, error: "Split must be 0–100%." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .insert({
      name: input.name.trim(),
      contact_name: input.contactName?.trim() || null,
      contact_email: input.contactEmail?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
      split_pct: input.splitPct,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateVendors();
  return { ok: true, id: data!.id as string };
}

export async function updateVendor(id: string, input: VendorInput): Promise<VendorResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "Vendor name required." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("vendors")
    .update({
      name: input.name.trim(),
      contact_name: input.contactName?.trim() || null,
      contact_email: input.contactEmail?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
      split_pct: input.splitPct,
      notes: input.notes?.trim() || null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateVendors();
  return { ok: true, id };
}

export async function setVendorActive(id: string, active: boolean): Promise<VendorResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("vendors").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateVendors();
  return { ok: true, id };
}
