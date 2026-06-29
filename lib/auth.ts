import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile } from "./types";

export interface SessionInfo {
  userId: string;
  email: string | undefined;
  profile: Profile | null;
}

// Current signed-in staff member + their profile (role), or null.
export async function getSessionProfile(): Promise<SessionInfo | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email, profile: profile ?? null };
}

// Use at the top of a protected Server Component. Redirects if not allowed.
export async function requireStaff(): Promise<SessionInfo> {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<SessionInfo> {
  const session = await requireStaff();
  if (session.profile?.role !== "admin") redirect("/pos");
  return session;
}
