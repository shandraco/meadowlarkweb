"use server";

import { createPaidOrder } from "@/lib/orders";
import { getSessionProfile } from "@/lib/auth";

export interface PosSaleResult {
  ok: boolean;
  orderNumber?: number;
  totalCents?: number;
  error?: string;
}

// Rings up an in-person sale. Same order pipeline as online checkout, tagged
// channel:'pos' and attributed to the signed-in cashier.
export async function createPosOrder(input: {
  items: { productId: string; quantity: number }[];
  customerName?: string;
}): Promise<PosSaleResult> {
  const session = await getSessionProfile();
  if (!session) return { ok: false, error: "Not signed in." };
  if (!input.items.length) return { ok: false, error: "Ticket is empty." };

  try {
    const order = await createPaidOrder({
      channel: "pos",
      items: input.items,
      customer: input.customerName?.trim() ? { name: input.customerName.trim() } : undefined,
      createdBy: session.userId,
      notes: "In-person sale",
    });
    return { ok: true, orderNumber: order.orderNumber, totalCents: order.totalCents };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sale failed." };
  }
}
