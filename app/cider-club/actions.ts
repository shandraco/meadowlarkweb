"use server";

import { revalidatePath } from "next/cache";
import { joinCiderClub } from "@/lib/subscriptions";
import { writeAudit } from "@/lib/audit";
import { consumeRateLimit } from "@/lib/rate-limit";
import { JoinClubInput, firstIssue } from "@/lib/validation";

export interface JoinResult {
  ok: boolean;
  memberNumber?: number;
  token?: string;
  error?: string;
}

export async function joinClub(input: unknown): Promise<JoinResult> {
  const parsed = JoinClubInput.safeParse(input);
  if (!parsed.success) {
    await writeAudit({
      action: "other",
      entityType: "subscription",
      summary: `Rejected club sign-up (validation): ${firstIssue(parsed.error)}`,
    });
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const c = parsed.data;

  if (c.fulfillmentMode === "ship" && !c.shippingAddress?.trim()) {
    return { ok: false, error: "Shipping address required for shipped members." };
  }

  // 3 attempts / 30 min per email. Legit sign-ups happen once.
  const ok = await consumeRateLimit("club_signup", c.customer.email, 3, 1800);
  if (!ok) return { ok: false, error: "Too many attempts. Please try again shortly." };

  try {
    const r = await joinCiderClub(c);
    await writeAudit({
      action: "create",
      entityType: "subscription",
      entityId: r.id,
      summary: `New Cider Club member #${r.memberNumber} (${c.customer.name})`,
      after: { memberNumber: r.memberNumber, planId: c.planId, fulfillmentMode: c.fulfillmentMode },
    });
    revalidatePath("/admin/subscriptions");
    return { ok: true, memberNumber: r.memberNumber, token: r.token };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not sign up.";
    await writeAudit({
      action: "other",
      entityType: "subscription",
      summary: `Failed club sign-up for ${c.customer.email}: ${msg}`,
    });
    return { ok: false, error: msg };
  }
}
