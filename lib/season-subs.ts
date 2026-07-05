import { createClient } from "./supabase/server";
import { getSupabaseAdmin } from "./supabase/admin";
import type { SeasonSubscriber } from "./types";

// Re-exported for backward compatibility with earlier imports.
export { SEASON_TOPICS, type SeasonTopicId } from "./season-topics";

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

export async function getSubscriberCountsByTopic(): Promise<Record<string, number>> {
  const subs = await getSeasonSubscribers();
  const counts: Record<string, number> = {};
  for (const s of subs) {
    for (const t of s.topics) counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}
