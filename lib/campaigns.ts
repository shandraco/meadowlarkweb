import { createClient } from "./supabase/server";
import type { DiscountCampaign } from "./types";

export async function getLiveCampaigns(): Promise<DiscountCampaign[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("discount_campaigns")
    .select("*")
    .eq("status", "live")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("starts_at", { ascending: false });
  return (data ?? []) as DiscountCampaign[];
}

export async function getAllCampaigns(): Promise<DiscountCampaign[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("discount_campaigns").select("*").order("created_at", { ascending: false });
  return (data ?? []) as DiscountCampaign[];
}

export async function getCampaignById(id: string): Promise<DiscountCampaign | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("discount_campaigns").select("*").eq("id", id).maybeSingle();
  return (data as DiscountCampaign | null) ?? null;
}
