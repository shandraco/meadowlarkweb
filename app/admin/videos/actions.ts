"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { FarmVideosInput, firstIssue } from "@/lib/validation";

export interface VideoSlot {
  title: string;
  url: string;
  posterUrl?: string;
}

export interface VideosPayload {
  eyebrow: string;
  headline: string;
  emphasis: string;
  videos: VideoSlot[];
}

export interface VideosResult {
  ok: boolean;
  error?: string;
}

export async function saveFarmVideos(input: unknown): Promise<VideosResult> {
  const session = await requireAdmin();
  const parsed = FarmVideosInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const payload = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("site_content").select("value").eq("key", "farm_videos").maybeSingle();

  const clean = {
    eyebrow: payload.eyebrow.trim(),
    headline: payload.headline.trim(),
    emphasis: payload.emphasis.trim(),
    videos: payload.videos
      .map((v) => ({ title: v.title.trim(), url: v.url.trim(), posterUrl: v.posterUrl?.trim() ?? "" }))
      .filter((v) => v.url && v.title),
  };

  const { error } = await supabase
    .from("site_content")
    .upsert({ key: "farm_videos", value: clean, updated_at: new Date().toISOString(), updated_by: session.userId });
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "site_content",
    entityId: "farm_videos",
    summary: `Updated farm videos (${clean.videos.length} clips)`,
    before: before?.value ?? null,
    after: clean,
  });

  revalidatePath("/");
  revalidatePath("/admin/videos");
  return { ok: true };
}
