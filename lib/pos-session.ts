"use server";

import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import type { Location } from "./types";

const COOKIE_NAME = "meadowlark_pos_location";
const COOKIE_MAX_AGE = 60 * 60 * 12; // 12h — a full shift

// Reads the location the cashier picked at the start of their session.
// Returns null when unset (first visit, or after clear).
export async function getPosLocationId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

export async function setPosLocation(locationId: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, locationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearPosLocation() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getActiveLocations(): Promise<Location[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as Location[];
}

export async function getLocationById(id: string): Promise<Location | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("locations").select("*").eq("id", id).maybeSingle();
  return (data as Location | null) ?? null;
}
