"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { CampaignInput, firstIssue, uuid } from "@/lib/validation";

export interface CampaignResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const UpsertCampaignInput = z.object({ id: uuid.nullable() }).and(CampaignInput);
const MarkPostedInput = z
  .object({ id: uuid, ref: z.string().max(500).optional() })
  .strict();

function refresh() {
  revalidatePath("/admin/campaigns");
  revalidatePath("/store");
  revalidatePath("/");
}

export async function upsertCampaign(input: unknown): Promise<CampaignResult> {
  await requireAdmin();
  const parsed = UpsertCampaignInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const c = parsed.data;

  const supabase = await createClient();
  const payload = {
    name: c.name,
    status: c.status,
    product_ids: c.productIds,
    starts_at: c.startsAt,
    ends_at: c.endsAt,
    hero_image_url: c.heroImageUrl || null,
    headline: c.headline || null,
    body: c.body || null,
  };

  if (c.id) {
    const { data: before } = await supabase.from("discount_campaigns").select("*").eq("id", c.id).maybeSingle();
    if (!before) return { ok: false, error: "Campaign not found." };
    const { error } = await supabase.from("discount_campaigns").update(payload).eq("id", c.id);
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      action: "update",
      entityType: "discount_campaign",
      entityId: c.id,
      summary: `Updated campaign "${c.name}" (${c.status}, ${c.productIds.length} products)`,
      before,
      after: c,
    });
    refresh();
    return { ok: true, id: c.id };
  }

  const { data, error } = await supabase.from("discount_campaigns").insert(payload).select("id").single();
  if (error) return { ok: false, error: error.message };
  await writeAudit({
    action: "create",
    entityType: "discount_campaign",
    entityId: data.id,
    summary: `Created campaign "${c.name}"`,
    after: { ...c, id: data.id },
  });
  refresh();
  return { ok: true, id: data.id };
}

// Live-system hook point: when this fires, a Meta Graph API call would go
// out. For now it just stamps the DB so ops know the announcement went out.
export async function markSocialPosted(input: unknown): Promise<CampaignResult> {
  await requireAdmin();
  const parsed = MarkPostedInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, ref } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("discount_campaigns").select("name, social_posted_at").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Campaign not found." };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("discount_campaigns")
    .update({ social_posted_at: now, social_post_ref: ref || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "discount_campaign",
    entityId: id,
    summary: `Marked campaign "${before.name}" as socially posted${ref ? ` (ref ${ref})` : ""}`,
    before: { social_posted_at: before.social_posted_at },
    after: { social_posted_at: now, social_post_ref: ref || null },
  });
  refresh();
  return { ok: true, id };
}
