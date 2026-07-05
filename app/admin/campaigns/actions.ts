"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CampaignStatus } from "@/lib/types";

export interface CampaignInput {
  name: string;
  status: CampaignStatus;
  productIds: string[];
  startsAt: string | null;
  endsAt: string | null;
  heroImageUrl: string;
  headline: string;
  body: string;
}

export interface CampaignResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function refresh() {
  revalidatePath("/admin/campaigns");
  revalidatePath("/store");
  revalidatePath("/");
}

export async function upsertCampaign(id: string | null, input: CampaignInput): Promise<CampaignResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "Campaign name required." };
  const supabase = await createClient();
  const payload = {
    name: input.name.trim(),
    status: input.status,
    product_ids: input.productIds,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    hero_image_url: input.heroImageUrl.trim() || null,
    headline: input.headline.trim() || null,
    body: input.body.trim() || null,
  };
  if (id) {
    const { error } = await supabase.from("discount_campaigns").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true, id };
  }
  const { data, error } = await supabase.from("discount_campaigns").insert(payload).select("id").single();
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true, id: data!.id as string };
}

// Mark a campaign as socially announced. In a live system this would fire the
// Meta Graph API call — for now it stamps the DB so ops know it's been done.
export async function markSocialPosted(id: string, ref: string): Promise<CampaignResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("discount_campaigns")
    .update({ social_posted_at: new Date().toISOString(), social_post_ref: ref || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true, id };
}
