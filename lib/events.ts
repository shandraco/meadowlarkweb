import { createClient } from "./supabase/server";
import type { Database } from "./database.types";

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventKind = Database["public"]["Enums"]["event_kind"];

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  live_music: "Live music",
  cider_dinner: "Cider dinner",
  harvest_day: "Harvest day",
  other: "Event",
};

// Public read — anyone can list upcoming, non-cancelled events.
export async function getUpcomingEvents(limit = 20): Promise<Event[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("cancelled", false)
    .gte("starts_at", now)
    .order("starts_at")
    .limit(limit);
  return (data ?? []) as Event[];
}

export async function getFeaturedEvents(limit = 3): Promise<Event[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("cancelled", false)
    .eq("featured", true)
    .gte("starts_at", now)
    .order("starts_at")
    .limit(limit);
  return (data ?? []) as Event[];
}

export async function getAllEvents(limit = 200): Promise<Event[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").order("starts_at", { ascending: false }).limit(limit);
  return (data ?? []) as Event[];
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  return (data as Event | null) ?? null;
}
