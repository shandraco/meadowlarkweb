import { getSupabaseAdmin } from "./supabase/admin";
import type { OrderChannel, Product } from "./types";
import { effectivePriceCents } from "./types";
import { quoteTax, homeStateTax } from "./tax";
import { quoteShipping } from "./shipping-rates";

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
  taxCents?: number;
  shippingCents?: number;
}

export interface CreatedOrder {
  id: string;
  orderNumber: number;
  totalCents: number;
  lookupToken: string;
  items: { name_snapshot: string; quantity: number; line_total_cents: number }[];
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

  const tax = Math.max(0, Math.round(input.taxCents ?? 0));
  const shipping = Math.max(0, Math.round(input.shippingCents ?? 0));
  const total = subtotal + tax + shipping;

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
      tax_cents: tax,
      total_cents: total,
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
    .select("id, order_number, customer_lookup_token")
    .single();
  if (oErr) throw new Error(oErr.message);

  const orderId = order.id;
  const { error: iErr } = await admin
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: orderId })));
  if (iErr) throw new Error(iErr.message);

  // Atomic: status → paid + decrement stock (idempotent).
  const { error: mErr } = await admin.rpc("mark_order_paid", { p_payment_intent: ref });
  if (mErr) throw new Error(mErr.message);

  return {
    id: orderId,
    orderNumber: order.order_number,
    totalCents: total,
    lookupToken: order.customer_lookup_token,
    items: lines.map((l) => ({
      name_snapshot: l.name_snapshot,
      quantity: l.quantity,
      line_total_cents: l.line_total_cents,
    })),
  };
}

// Kept for callers that were already using the more specific POS-only name.
export const createPaidPosOrder = createPaidOrder;

// ── Live quote for the checkout page ──────────────────────────────────────
// No order is created. Given the cart and (optionally) a ship-to state,
// returns subtotal + tax + shipping + total so the customer can see the
// full price before submitting.
export interface CartQuote {
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  bottleCount: number;
  taxLabel: string | null;
  taxWarning?: string;
  shipQuote?: {
    supported: boolean;
    stateCode: string | null;
    daysMin: number;
    daysMax: number;
    notes: string | null;
    warning?: string;
  };
}

export async function quoteCartTotals(input: {
  items: NewOrderItem[];
  fulfillment: "pickup" | "ship";
  shipState?: string | null;
  shipAddress?: string | null;
}): Promise<CartQuote> {
  const { lines, subtotal } = await validateAndPrice(input.items);
  const bottleCount = lines.reduce((n, l) => n + l.quantity, 0);

  if (input.fulfillment === "pickup") {
    const t = await homeStateTax(subtotal);
    return {
      subtotalCents: subtotal,
      taxCents: t.taxCents,
      shippingCents: 0,
      totalCents: subtotal + t.taxCents,
      bottleCount,
      taxLabel: t.label,
      taxWarning: t.warning,
    };
  }

  const stateHint = input.shipState ?? input.shipAddress ?? null;
  const shipping = await quoteShipping(subtotal, bottleCount, stateHint);
  const tax = await quoteTax(subtotal, shipping.stateCode);
  return {
    subtotalCents: subtotal,
    taxCents: tax.taxCents,
    shippingCents: shipping.costCents,
    totalCents: subtotal + tax.taxCents + shipping.costCents,
    bottleCount,
    taxLabel: tax.label,
    taxWarning: tax.warning,
    shipQuote: {
      supported: shipping.supported,
      stateCode: shipping.stateCode,
      daysMin: shipping.daysMin,
      daysMax: shipping.daysMax,
      notes: shipping.notes,
      warning: shipping.warning,
    },
  };
}
