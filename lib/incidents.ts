import { createClient } from "./supabase/server";
import type { FarmIncident } from "./types";

// Newest incidents first. Staff-only via RLS.
export async function listIncidents(): Promise<FarmIncident[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("farm_incidents")
    .select("*")
    .order("occurred_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as FarmIncident[];
}

export async function getIncidentById(id: string): Promise<FarmIncident | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("farm_incidents").select("*").eq("id", id).maybeSingle();
  return (data as FarmIncident | null) ?? null;
}
