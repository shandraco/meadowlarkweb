"use server";

import { headers } from "next/headers";
import { createPaidOrder } from "@/lib/orders";
import { writeAudit } from "@/lib/audit";
import { consumeRateLimit, callerIp } from "@/lib/rate-limit";
import { PlaceOrderInput, firstIssue } from "@/lib/validation";
import { sendOrderConfirmation } from "@/lib/email/send";

export interface PlaceOrderResult {
  ok: boolean;
  orderNumber?: number;
  lookupUrl?: string;
  error?: string;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

export async function placeOnlineOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = PlaceOrderInput.safeParse(input);
  if (!parsed.success) {
    await writeAudit({
      action: "other",
      entityType: "order",
      summary: `Rejected online order (validation): ${firstIssue(parsed.error)}`,
    });
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const p = parsed.data;

  if (p.fulfillment === "ship" && !p.address?.trim()) {
    return { ok: false, error: "Shipping address is required." };
  }

  const ok = await consumeRateLimit("checkout", p.customer.email, 5, 900);
  if (!ok) {
    await writeAudit({
      action: "other",
      entityType: "order",
      summary: `Throttled online order for ${p.customer.email}`,
    });
    return { ok: false, error: "Too many attempts. Please try again shortly." };
  }

  const notes =
    p.fulfillment === "ship"
      ? `Fulfillment: Ship to — ${(p.address ?? "").trim()}`
      : "Fulfillment: Farm pickup";

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? (await callerIp());

  try {
    const order = await createPaidOrder({
      channel: "online",
      items: p.lines,
      customer: p.customer,
      notes,
      ageConfirmed: p.ageConfirmed,
      ageConfirmIp: ip,
    });

    const lookupUrl = `${siteUrl()}/orders/lookup?order=${order.orderNumber}&token=${order.lookupToken}`;

    // Fire-and-forget — email failure must not roll back the order. The
    // send helper already logs to email_log for ops visibility.
    void sendOrderConfirmation(p.customer.email, {
      orderNumber: order.orderNumber,
      customerName: p.customer.name,
      totalCents: order.totalCents,
      items: order.items.map((i) => ({
        name: i.name_snapshot,
        quantity: i.quantity,
        lineCents: i.line_total_cents,
      })),
      fulfillment: p.fulfillment,
      address: p.fulfillment === "ship" ? p.address : null,
      lookupUrl,
    });

    await writeAudit({
      action: "create",
      entityType: "order",
      entityId: order.id,
      summary: `Online order #${order.orderNumber} — ${p.customer.name} — $${(order.totalCents / 100).toFixed(2)}`,
      after: { orderNumber: order.orderNumber, channel: "online", customer: p.customer, itemCount: p.lines.length },
    });
    return { ok: true, orderNumber: order.orderNumber, lookupUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not place order.";
    await writeAudit({
      action: "other",
      entityType: "order",
      summary: `Failed online order for ${p.customer.email}: ${msg}`,
    });
    return { ok: false, error: msg };
  }
}
