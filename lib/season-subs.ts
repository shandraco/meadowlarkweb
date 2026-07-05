import { createClient } from "./supabase/server";
import { getSupabaseAdmin } from "./supabase/admin";
import type { SeasonSubscriber } from "./types";

export const SEASON_TOPICS = [
  { id: "strawberries", label: "Strawberry U-Pick", when: "May" },
  { id: "peaches", label: "Peach Season", when: "July–Aug" },
  { id: "apples", label: "Apple Harvest", when: "Aug–Oct" },
  { id: "pumpkins", label: "Pumpkin Patch", when: "October" },
  { id: "cider-release", label: "Cider Club Releases", when: "4× per year" },
  { id: "live-music", label: "Live Music & Events", when: "Seasonal" },
  { id: "farmers-market", label: "Farmers Market Updates", when: "Every Saturday" },
] as const;

export type SeasonTopicId = (typeof SEASON_TOPICS)[number]["id"];

export async function subscribeToSeasons(input: {
  email: string;
  phone?: string;
  topics: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.email.trim()) return { ok: false, error: "Email required." };
  if (input.topics.length === 0) return { ok: false, error: "Pick at least one season." };

  const admin = getSupabaseAdmin();
  const email = input.email.trim().toLowerCase();

  const { data: existing } = await admin
    .from("season_subscribers")
    .select("id, topics")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    // Merge new topics into the existing set.
    const merged = Array.from(new Set([...(existing.topics as string[]), ...input.topics]));
    const { error } = await admin
      .from("season_subscribers")
      .update({ topics: merged, phone: input.phone?.trim() || null })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const { error } = await admin.from("season_subscribers").insert({
    email,
    phone: input.phone?.trim() || null,
    topics: input.topics,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function unsubscribeByToken(token: string): Promise<{ ok: boolean; error?: string }> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("season_subscribers").delete().eq("unsubscribe_token", token);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getSeasonSubscribers(): Promise<SeasonSubscriber[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("season_subscribers").select("*").order("created_at", { ascending: false });
  return (data ?? []) as SeasonSubscriber[];
}

// Handy count-per-topic for the admin blast page.
export async function getSubscriberCountsByTopic(): Promise<Record<string, number>> {
  const subs = await getSeasonSubscribers();
  const counts: Record<string, number> = {};
  for (const s of subs) {
    for (const t of s.topics) counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}
