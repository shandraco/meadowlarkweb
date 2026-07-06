"use server";

import { subscribeToSeasons } from "@/lib/season-subs";
import { consumeRateLimit } from "@/lib/rate-limit";
import { SubscribeSeasonsInput, firstIssue } from "@/lib/validation";

export interface RemindMeResult {
  ok: boolean;
  error?: string;
}

export async function submitReminders(input: unknown): Promise<RemindMeResult> {
  const parsed = SubscribeSeasonsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const s = parsed.data;

  // 5 attempts / 15 min per email — this is idempotent so re-submits are fine.
  const ok = await consumeRateLimit("season_signup", s.email, 5, 900);
  if (!ok) return { ok: false, error: "Too many attempts. Please try again shortly." };

  const res = await subscribeToSeasons(s);
  if (res.ok) return { ok: true };
  return { ok: false, error: res.error };
}
