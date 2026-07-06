import { headers } from "next/headers";
import { getSupabaseAdmin } from "./supabase/admin";

// Public helpers around the `consume_rate_limit` SQL function. Every guarded
// action calls one of these before doing work. Returns `true` when the
// caller is within budget and the attempt was recorded, `false` when they
// have been throttled.

export async function consumeRateLimit(
  bucket: string,
  identifier: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc("consume_rate_limit", {
    p_bucket: bucket,
    p_identifier: identifier,
    p_max: max,
    p_window_sec: windowSeconds,
  });
  if (error) {
    // Don't fail-open on rate-limit errors — treat as throttled so an
    // attacker can't DoS the SQL function to bypass. Log for ops.
    console.error("[rate-limit] error:", error.message, { bucket, identifier });
    return false;
  }
  return data === true;
}

export async function callerIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}
