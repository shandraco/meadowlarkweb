import { getSupabaseAdmin } from "./supabase/admin";
import type { OrderChannel, Product } from "./types";
import { effectivePriceCents } from "./types";

export interface NewOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  channel: OrderChannel;
  items: NewOrderItem[];
  customer?: { name?: string | null; email?: string | null; phone?: string | null };
  notes?: string | null;
  createdBy?: string | null;
  locationId?: string | null;
  ageConfirmed?: boolean;
  ageConfirmIp?: string | null;
}

export interface CreatedOrder {
  id: string;
  orderNumber: number;
  totalCents: number;
}

async function validateAndPrice(items: NewOrderItem[]) {
  const admin = getSupabaseAdmin();
  const qtyById = new Map<string, number>();
  for (const it of items) {
    if (it.quantity > 0) qtyById.set(it.productId, (qtyById.get(it.productId) ?? 0) + it.quantity);
  }
  const ids = [...qtyById.keys()];
  if (ids.length === 0) throw new Error("Your cart is empty.");

  const { data: products, error } = await admin
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("active", true)
    .returns<Product[]>();
  if (error) throw new Error(error.message);
  if (!products || products.length !== ids.length) throw new Error("One or more items are no longer available.");

  const requiresAgeCheck = products.some((p) => p.requires_age_check);

  const lines = products.map((p) => {
    const qty = qtyById.get(p.id)!;
    if (qty > p.stock_quantity) throw new Error(`Only ${p.stock_quantity} of ${p.name} remaining.`);
    const unit = effectivePriceCents(p);
    return {
      product_id: p.id,
      name_snapshot: p.name,
      unit_price_cents: unit,
      quantity: qty,
      line_total_cents: unit * qty,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.line_total_cents, 0);
  return { admin, lines, subtotal, requiresAgeCheck };
}

// Creates an order from trusted server-side data and finalizes it. Same
// pipeline for both channels — the payment step is a placeholder reference
// until a live payment provider is wired up. Stock decrements atomically via
// mark_order_paid so the audit trail is identical regardless of how the
// money actually moves.
export async function createPaidOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const { admin, lines, subtotal, requiresAgeCheck } = await validateAndPrice(input.items);

  if (requiresAgeCheck && input.channel === "online" && !input.ageConfirmed) {
    throw new Error("You must confirm you are 21 or older to purchase cider.");
  }

  const ref =
    input.channel === "pos"
      ? `pos_${crypto.randomUUID()}`
      : `pending_${crypto.randomUUID()}`;

  const { data: order, error: oErr } = await admin
    .from("orders")
    .insert({
      channel: input.channel,
      status: "pending",
      subtotal_cents: subtotal,
      tax_cents: 0,
      total_cents: subtotal,
      customer_name: input.customer?.name ?? null,
      customer_email: input.customer?.email ?? null,
      customer_phone: input.customer?.phone ?? null,
      notes: input.notes ?? null,
      created_by: input.createdBy ?? null,
      location_id: input.locationId ?? null,
      payment_provider: input.channel === "pos" ? "pos_terminal" : "manual_invoice",
      payment_ref: ref,
      stripe_payment_intent_id: ref,
      age_confirmed_at: input.ageConfirmed ? new Date().toISOString() : null,
      age_confirm_ip: input.ageConfirmIp ?? null,
    })
    .select("id, order_number")
    .single();
  if (oErr) throw new Error(oErr.message);

  const orderId = order!.id as string;
  const { error: iErr } = await admin
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: orderId })));
  if (iErr) throw new Error(iErr.message);

  // Atomic: status → paid + decrement stock (idempotent). For POS the sale is
  // final. For online we mark paid immediately for now — the day payments go
  // live, this branch calls createIntent + returns a client_secret instead,
  // and this row stays 'pending' until the webhook fires.
  const { error: mErr } = await admin.rpc("mark_order_paid", { p_payment_intent: ref });
  if (mErr) throw new Error(mErr.message);

  return { id: orderId, orderNumber: order!.order_number as number, totalCents: subtotal };
}

// Kept for callers that were already using the more specific POS-only name.
export const createPaidPosOrder = createPaidOrder;
