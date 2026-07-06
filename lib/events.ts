import { createClient } from "./supabase/server";
import type { Event } from "./events-shared";

// Re-export for backward compat — existing importers of lib/events for types
// keep working, but new client-side callers should import from lib/events-shared.
export { EVENT_KIND_LABEL, type Event, type EventKind } from "./events-shared";

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
