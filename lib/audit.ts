// Immutable audit log — every mutating server action calls `writeAudit()`
// after the DB write succeeds. Writes go through the service-role admin
// client. Read policy is admin-only. There is NO update or delete policy on
// admin_audit_log, which means even a compromised admin session can't
// rewrite history — only append.

import { headers } from "next/headers";
import { getSupabaseAdmin } from "./supabase/admin";
import { getSessionProfile } from "./auth";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "stock_adjust"
  | "sign_in"
  | "sign_out"
  | "other";

export interface AuditInput {
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  summary?: string;
  before?: unknown;
  after?: unknown;
}

async function requestContext(): Promise<{ ip: string | null; userAgent: string | null; requestId: string | null }> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return {
    ip: fwd?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
    userAgent: h.get("user-agent") ?? null,
    requestId: h.get("x-request-id") ?? h.get("x-vercel-id") ?? null,
  };
}

// Best-effort audit write. Never throws — an audit failure must not roll
// back the user-facing action (that would create a worse UX than a missing
// log line). Failures are logged to the server console for ops to review.
export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    const [session, ctx] = await Promise.all([getSessionProfile(), requestContext()]);
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("admin_audit_log").insert({
      actor_id: session?.userId ?? null,
      actor_email: session?.email ?? null,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      summary: input.summary ?? null,
      before_state: (input.before as never) ?? null,
      after_state: (input.after as never) ?? null,
      ip_address: ctx.ip,
      user_agent: ctx.userAgent,
      request_id: ctx.requestId,
    });
    if (error) {
      console.error("[audit] write failed:", error.message, input);
    }
  } catch (e) {
    console.error("[audit] unexpected failure:", e, input);
  }
}

// Convenience for entities we frequently read-then-diff-then-audit.
export async function writeAuditWithBefore<T>(
  input: Omit<AuditInput, "before"> & { load: () => Promise<T | null> },
  runMutation: () => Promise<{ after: T | null }>,
): Promise<{ ok: boolean; error?: string }> {
  const before = await input.load();
  try {
    const { after } = await runMutation();
    await writeAudit({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      before,
      after,
    });
    return { ok: true };
  } catch (e) {
    // Failed mutation is still audit-worthy so admins can spot attempts.
    await writeAudit({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: `FAILED: ${input.summary ?? ""} — ${e instanceof Error ? e.message : String(e)}`,
      before,
      after: null,
    });
    return { ok: false, error: e instanceof Error ? e.message : "Failed." };
  }
}
