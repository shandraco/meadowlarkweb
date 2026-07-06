// Client-safe event types + labels. Kept separate from lib/events.ts so
// client components (like EventEditor) can import types + labels without
// pulling the Supabase server client into the bundle.

import type { Database } from "./database.types";

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventKind = Database["public"]["Enums"]["event_kind"];

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  live_music: "Live music",
  cider_dinner: "Cider dinner",
  harvest_day: "Harvest day",
  other: "Event",
};
