"use server";

import { createPaidOrder } from "@/lib/orders";

export interface PlaceOrderInput {
  lines: { productId: string; quantity: number }[];
  customer: { name: string; email: string; phone?: string };
  fulfillment: "pickup" | "ship";
  address?: string;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderNumber?: number;
  error?: string;
}

export async function placeOnlineOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!input.customer.name?.trim() || !input.customer.email?.trim()) {
    return { ok: false, error: "Name and email are required." };
  }

  const notes =
    input.fulfillment === "ship"
      ? `Fulfillment: Ship to — ${(input.address ?? "").trim()}`
      : "Fulfillment: Farm pickup";

  try {
    const order = await createPaidOrder({
      channel: "online",
      items: input.lines,
      customer: input.customer,
      notes,
    });
    return { ok: true, orderNumber: order.orderNumber };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not place order." };
  }
}
