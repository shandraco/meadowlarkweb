"use server";

import { revalidatePath } from "next/cache";
import { getPlanById, joinCiderClub } from "@/lib/subscriptions";
import { writeAudit } from "@/lib/audit";
import { consumeRateLimit } from "@/lib/rate-limit";
import { JoinClubInput, firstIssue } from "@/lib/validation";
import { sendClubWelcome } from "@/lib/email/send";

export interface JoinResult {
  ok: boolean;
  memberNumber?: number;
  token?: string;
  error?: string;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
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

  const ok = await consumeRateLimit("club_signup", c.customer.email, 3, 1800);
  if (!ok) return { ok: false, error: "Too many attempts. Please try again shortly." };

  try {
    const r = await joinCiderClub(c);
    const plan = await getPlanById(c.planId);

    void sendClubWelcome(c.customer.email, {
      memberNumber: r.memberNumber,
      customerName: c.customer.name,
      planName: plan?.name ?? "your plan",
      cadence: plan?.cadence ?? "each season",
      bottlesPerShipment: plan?.bottles_per_shipment ?? 0,
      fulfillmentMode: c.fulfillmentMode,
      memberPortalUrl: `${siteUrl()}/club/account/${r.token}`,
    });

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
