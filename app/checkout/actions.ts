"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createPaidOrder, quoteCartTotals, type CartQuote } from "@/lib/orders";
import { writeAudit } from "@/lib/audit";
import { consumeRateLimit, callerIp } from "@/lib/rate-limit";
import { CartItemInput, PlaceOrderInput, firstIssue } from "@/lib/validation";
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

// Live quote — called from the checkout page as the customer types their
// address. Never touches the orders table. Cheap and safe to spam.
const QuoteInput = z
  .object({
    lines: z.array(CartItemInput).min(1).max(50),
    fulfillment: z.enum(["pickup", "ship"]),
    shipState: z
      .string()
      .transform((s) => s.trim().toUpperCase())
      .pipe(z.string().max(2))
      .optional(),
    shipAddress: z.string().max(500).optional(),
  })
  .strict();

export async function quoteCheckout(input: unknown): Promise<
  { ok: true; quote: CartQuote } | { ok: false; error: string }
> {
  const parsed = QuoteInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    const quote = await quoteCartTotals({
      items: parsed.data.lines,
      fulfillment: parsed.data.fulfillment,
      shipState: parsed.data.shipState ?? null,
      shipAddress: parsed.data.shipAddress ?? null,
    });
    return { ok: true, quote };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not quote your cart." };
  }
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

  // Re-quote server-side — we never trust totals sent by the client.
  const quote = await quoteCartTotals({
    items: p.lines,
    fulfillment: p.fulfillment,
    shipState: p.fulfillment === "ship" ? p.shipState ?? null : null,
    shipAddress: p.fulfillment === "ship" ? p.address : null,
  });

  if (p.fulfillment === "ship" && quote.shipQuote && !quote.shipQuote.supported) {
    return { ok: false, error: quote.shipQuote.warning ?? "Cider can't ship to that state yet." };
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
      taxCents: quote.taxCents,
      shippingCents: quote.shippingCents,
    });

    const lookupUrl = `${siteUrl()}/orders/lookup?order=${order.orderNumber}&token=${order.lookupToken}`;

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
      after: {
        orderNumber: order.orderNumber,
        channel: "online",
        customer: p.customer,
        itemCount: p.lines.length,
        subtotalCents: quote.subtotalCents,
        taxCents: quote.taxCents,
        shippingCents: quote.shippingCents,
      },
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
