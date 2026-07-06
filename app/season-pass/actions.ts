"use server";

import { revalidatePath } from "next/cache";
import { SEASON_PASS, purchaseSeasonPass } from "@/lib/season-pass";
import { PurchaseSeasonPassInput, firstIssue } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { consumeRateLimit } from "@/lib/rate-limit";
import { sendSeasonPassConfirmation } from "@/lib/email/send";

export interface PurchasePassResult {
  ok: boolean;
  passNumber?: number;
  redeemUrl?: string;
  error?: string;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

export async function buyPass(input: unknown): Promise<PurchasePassResult> {
  const parsed = PurchaseSeasonPassInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  if (!p.ageConfirmed) return { ok: false, error: "Please confirm you're the pass holder." };

  const ok = await consumeRateLimit("season_pass", p.customer.email, 3, 1800);
  if (!ok) return { ok: false, error: "Too many attempts. Please try again shortly." };

  try {
    const pass = await purchaseSeasonPass({ customer: p.customer, notes: p.notes });
    const redeemUrl = `${siteUrl()}/season-pass/${pass.redeemToken}`;

    void sendSeasonPassConfirmation(p.customer.email, {
      passNumber: pass.passNumber,
      customerName: p.customer.name,
      expiresAt: pass.expiresAt,
      priceCents: SEASON_PASS.priceCents,
      redeemUrl,
    });

    await writeAudit({
      action: "create",
      entityType: "season_pass",
      entityId: pass.id,
      summary: `Season Pass #${pass.passNumber} — ${p.customer.name} (${p.customer.email})`,
      after: { passNumber: pass.passNumber, expiresAt: pass.expiresAt },
    });
    revalidatePath("/admin/season-passes");

    return { ok: true, passNumber: pass.passNumber, redeemUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not issue your pass.";
    await writeAudit({
      action: "other",
      entityType: "season_pass",
      summary: `Failed pass for ${p.customer.email}: ${msg}`,
    });
    return { ok: false, error: msg };
  }
}
