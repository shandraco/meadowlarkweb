"use server";

import { headers } from "next/headers";
import { createPaidOrder } from "@/lib/orders";

export interface PlaceOrderInput {
  lines: { productId: string; quantity: number }[];
  customer: { name: string; email: string; phone?: string };
  fulfillment: "pickup" | "ship";
  address?: string;
  ageConfirmed: boolean;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderNumber?: number;
  error?: string;
}

// One-shot: record the order, mark it paid (placeholder), decrement stock.
// A live payment provider will slot into this flow via the abstraction in
// lib/payments/ — until then, orders are recorded as "paid" for tracking
// purposes and the customer settles at pickup or via a mailed invoice.
export async function placeOnlineOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!input.customer.name?.trim() || !input.customer.email?.trim()) {
    return { ok: false, error: "Name and email are required." };
  }
  if (input.fulfillment === "ship" && !input.address?.trim()) {
    return { ok: false, error: "Shipping address is required." };
  }

  const notes =
    input.fulfillment === "ship"
      ? `Fulfillment: Ship to — ${(input.address ?? "").trim()}`
      : "Fulfillment: Farm pickup";

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? null;

  try {
    const order = await createPaidOrder({
      channel: "online",
      items: input.lines,
      customer: input.customer,
      notes,
      ageConfirmed: input.ageConfirmed,
      ageConfirmIp: ip,
    });
    return { ok: true, orderNumber: order.orderNumber };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not place order." };
  }
}
