"use server";

import { revalidatePath } from "next/cache";
import { createGift } from "@/lib/gift-memberships";
import { getPlanById } from "@/lib/subscriptions";
import { writeAudit } from "@/lib/audit";
import { consumeRateLimit } from "@/lib/rate-limit";
import { PurchaseGiftInput, firstIssue } from "@/lib/validation";
import { sendGiftBuyerConfirmation, sendGiftRecipient } from "@/lib/email/send";

export interface GiftResult {
  ok: boolean;
  giftNumber?: number;
  error?: string;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

export async function purchaseGift(input: unknown): Promise<GiftResult> {
  const parsed = PurchaseGiftInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const g = parsed.data;

  if (!g.ageConfirmed) return { ok: false, error: "Please confirm you're 21 or older." };
  if (g.buyer.email === g.recipient.email) {
    return { ok: false, error: "Recipient must be a different person than the buyer." };
  }

  const ok = await consumeRateLimit("gift_membership", g.buyer.email, 3, 1800);
  if (!ok) return { ok: false, error: "Too many attempts. Please try again shortly." };

  const plan = await getPlanById(g.planId);
  if (!plan || !plan.active) return { ok: false, error: "Plan not available." };

  try {
    const gift = await createGift({
      planId: g.planId,
      buyer: g.buyer,
      recipient: g.recipient,
      message: g.message,
      priceCents: plan.price_cents,
    });

    const claimUrl = `${siteUrl()}/gift/claim/${gift.claimToken}`;

    void sendGiftBuyerConfirmation(g.buyer.email, {
      giftNumber: gift.giftNumber,
      buyerName: g.buyer.name,
      recipientName: g.recipient.name,
      planName: plan.name,
      priceCents: plan.price_cents,
      claimUrl,
    });

    void sendGiftRecipient(g.recipient.email, {
      giftNumber: gift.giftNumber,
      recipientName: g.recipient.name,
      buyerName: g.buyer.name,
      planName: plan.name,
      message: g.message ?? null,
      claimUrl,
    });

    await writeAudit({
      action: "create",
      entityType: "gift_membership",
      entityId: gift.id,
      summary: `Gift #${gift.giftNumber} — ${g.buyer.name} → ${g.recipient.name} (${plan.name})`,
      after: { giftNumber: gift.giftNumber, planId: g.planId },
    });
    revalidatePath("/admin/gifts");
    return { ok: true, giftNumber: gift.giftNumber };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not send gift." };
  }
}
