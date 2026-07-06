"use server";

import { revalidatePath } from "next/cache";
import { claimGift } from "@/lib/gift-memberships";
import { ClaimGiftInput, firstIssue } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";

export interface ClaimResult {
  ok: boolean;
  memberToken?: string;
  error?: string;
}

export async function submitClaim(input: unknown): Promise<ClaimResult> {
  const parsed = ClaimGiftInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const c = parsed.data;
  if (!c.ageConfirmed) return { ok: false, error: "Please confirm you're 21 or older." };

  const res = await claimGift({
    token: c.token,
    fulfillmentMode: c.fulfillmentMode,
    shippingAddress: c.shippingAddress,
    phone: c.phone,
  });
  if (!res.ok) return { ok: false, error: res.error };

  await writeAudit({
    action: "update",
    entityType: "gift_membership",
    summary: `Gift claimed via /gift/claim`,
    after: { subscriptionId: res.subscriptionId },
  });
  revalidatePath("/admin/gifts");
  revalidatePath("/admin/subscriptions");
  return { ok: true, memberToken: res.memberToken };
}
