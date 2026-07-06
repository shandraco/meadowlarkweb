"use server";

import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import type { Location } from "./types";

// Session cookie holds both the location the cashier is ringing sales at
// and the last-activity timestamp. A physical POS terminal walked away from
// mid-shift becomes the biggest security risk in a bricks-and-mortar system,
// so we force re-auth after IDLE_TIMEOUT_MS of inactivity even inside the
// otherwise long-lived Supabase session.
const COOKIE_NAME = "meadowlark_pos_session";
const COOKIE_MAX_AGE = 60 * 60 * 12; // 12h absolute — a full shift
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 min idle → treat session as gone

interface PosSession {
  locationId: string;
  lastActiveAt: number;
}

function readCookie(raw: string | undefined): PosSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PosSession>;
    if (typeof parsed.locationId === "string" && typeof parsed.lastActiveAt === "number") {
      return { locationId: parsed.locationId, lastActiveAt: parsed.lastActiveAt };
    }
  } catch {
    /* fall through to null */
  }
  return null;
}

function writeCookie(session: PosSession, jar: Awaited<ReturnType<typeof cookies>>) {
  jar.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

// Reads the current session and enforces the idle timeout. If the timeout
// has elapsed, the cookie is cleared and null is returned — the caller
// treats this the same as "no session".
export async function getPosLocationId(): Promise<string | null> {
  const jar = await cookies();
  const session = readCookie(jar.get(COOKIE_NAME)?.value);
  if (!session) return null;
  if (Date.now() - session.lastActiveAt > IDLE_TIMEOUT_MS) {
    jar.delete(COOKIE_NAME);
    return null;
  }
  return session.locationId;
}

// Called both when a cashier first picks a location and whenever they
// perform a mutating POS action, refreshing the last-activity clock.
export async function setPosLocation(locationId: string) {
  const jar = await cookies();
  writeCookie({ locationId, lastActiveAt: Date.now() }, jar);
}

// Idempotent activity ping — updates the timestamp on the existing session
// if there is one, does nothing if the cookie expired or was cleared. Safe
// to call from every server action without a location picker roundtrip.
export async function touchPosSession() {
  const jar = await cookies();
  const session = readCookie(jar.get(COOKIE_NAME)?.value);
  if (!session) return;
  if (Date.now() - session.lastActiveAt > IDLE_TIMEOUT_MS) {
    jar.delete(COOKIE_NAME);
    return;
  }
  writeCookie({ locationId: session.locationId, lastActiveAt: Date.now() }, jar);
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
