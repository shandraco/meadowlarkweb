import { createClient } from "./supabase/server";
import { getSupabaseAdmin } from "./supabase/admin";
import type { Database } from "./database.types";

export type SeasonPass = Database["public"]["Tables"]["season_passes"]["Row"];
export type SeasonPassStatus = Database["public"]["Enums"]["season_pass_status"];

// Kept as constants for now. Later this can be sourced from CMS or a
// `pass_tiers` table if the farm decides to offer levels (individual, family, etc.).
export const SEASON_PASS = {
  priceCents: 5000,
  years: 1,
  name: "Annual Season Pass",
  description: "Unlimited farm entry for one year from purchase.",
};

export async function getAllPasses(limit = 500): Promise<SeasonPass[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("season_passes").select("*").order("purchased_at", { ascending: false }).limit(limit);
  return (data ?? []) as SeasonPass[];
}

export async function getPassById(id: string): Promise<SeasonPass | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("season_passes").select("*").eq("id", id).maybeSingle();
  return (data as SeasonPass | null) ?? null;
}

export interface PurchasePassInput {
  customer: { name: string; email: string; phone?: string };
  notes?: string;
}

export async function purchaseSeasonPass(input: PurchasePassInput): Promise<{
  id: string;
  passNumber: number;
  expiresAt: string;
  redeemToken: string;
}> {
  const admin = getSupabaseAdmin();
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + SEASON_PASS.years);

  const { data, error } = await admin
    .from("season_passes")
    .insert({
      customer_name: input.customer.name.trim(),
      customer_email: input.customer.email.trim().toLowerCase(),
      customer_phone: input.customer.phone?.trim() || null,
      price_cents: SEASON_PASS.priceCents,
      expires_at: expires.toISOString(),
      notes: input.notes?.trim() || null,
    })
    .select("id, pass_number, expires_at, redeem_token")
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    passNumber: data.pass_number,
    expiresAt: data.expires_at,
    redeemToken: data.redeem_token,
  };
}
