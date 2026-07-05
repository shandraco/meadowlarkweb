"use server";

import { subscribeToSeasons } from "@/lib/season-subs";

export interface RemindMeInput {
  email: string;
  phone?: string;
  topics: string[];
}

export interface RemindMeResult {
  ok: boolean;
  error?: string;
}

export async function submitReminders(input: RemindMeInput): Promise<RemindMeResult> {
  const res = await subscribeToSeasons(input);
  if (res.ok) return { ok: true };
  return { ok: false, error: res.error };
}
