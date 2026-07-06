"use server";

import { headers } from "next/headers";
import { createPaidOrder } from "@/lib/orders";
import { writeAudit } from "@/lib/audit";
import { consumeRateLimit, callerIp } from "@/lib/rate-limit";
import { PlaceOrderInput, firstIssue } from "@/lib/validation";

export interface PlaceOrderResult {
  ok: boolean;
  orderNumber?: number;
  error?: string;
}

// One-shot: validate the wire payload, throttle abusive callers, then record
// the order + mark it paid (placeholder). Every attempt is audited so we can
// spot forgery attempts even when validation blocks them.
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

  // 5 attempts / 15 min per email — real customers rarely retry many times.
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
    await writeAudit({
      action: "create",
      entityType: "order",
      entityId: order.id,
      summary: `Online order #${order.orderNumber} — ${p.customer.name} — $${(order.totalCents / 100).toFixed(2)}`,
      after: { orderNumber: order.orderNumber, channel: "online", customer: p.customer, itemCount: p.lines.length },
    });
    return { ok: true, orderNumber: order.orderNumber };
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
