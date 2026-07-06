"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { consumeRateLimit, callerIp } from "@/lib/rate-limit";
import { LoginInput, firstIssue } from "@/lib/validation";
import { getSessionProfile } from "@/lib/auth";

export interface LoginResult {
  error?: string;
}

// Only redirect to same-origin absolute paths — never let an attacker pass
// `?next=https://evil.example.com` through.
function safeNext(raw: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  return raw;
}

export async function login(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const parsed = LoginInput.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { email, password, next } = parsed.data;

  // Two layered buckets: per-email (targeted credential stuffing) and per-IP
  // (spraying attack from one client). Both must pass.
  const ip = await callerIp();
  const emailOk = await consumeRateLimit("login_email", email, 5, 900);
  const ipOk = await consumeRateLimit("login_ip", ip, 20, 900);
  if (!emailOk || !ipOk) {
    await writeAudit({
      action: "other",
      entityType: "auth",
      summary: `Login throttled — email=${email}, ip=${ip}`,
    });
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    await writeAudit({
      action: "other",
      entityType: "auth",
      summary: `Failed sign-in — email=${email}: ${error.message}`,
    });
    return { error: error.message };
  }

  await writeAudit({
    action: "sign_in",
    entityType: "auth",
    entityId: data.user?.id ?? null,
    summary: `Sign-in — ${email}`,
  });

  redirect(safeNext(next ?? "/admin"));
}

export async function logout() {
  const session = await getSessionProfile();
  const supabase = await createClient();
  await supabase.auth.signOut();
  if (session) {
    await writeAudit({
      action: "sign_out",
      entityType: "auth",
      entityId: session.userId,
      summary: `Sign-out — ${session.email}`,
    });
  }
  redirect("/login");
}
