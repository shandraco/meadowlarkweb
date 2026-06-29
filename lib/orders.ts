import { getSupabaseAdmin } from "./supabase/admin";
import type { OrderChannel, Product } from "./types";

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
}

export interface CreatedOrder {
  id: string;
  orderNumber: number;
  totalCents: number;
}

// Creates an order from trusted server-side data and finalizes it.
// SERVER ONLY (uses the service-role admin client; bypasses RLS).
//
// For the demo there is no Stripe charge yet — we generate a synthetic
// reference and run the SAME `mark_order_paid` routine (status → paid +
// atomic stock decrement) that the Stripe webhook will call later. When
// Stripe is added, only the reference source changes.
export async function createPaidOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const admin = getSupabaseAdmin();

  // Collapse duplicate product ids and drop non-positive quantities.
  const qtyById = new Map<string, number>();
  for (const it of input.items) {
    if (it.quantity > 0) qtyById.set(it.productId, (qtyById.get(it.productId) ?? 0) + it.quantity);
  }
  const ids = [...qtyById.keys()];
  if (ids.length === 0) throw new Error("Your cart is empty.");

  // Re-fetch products server-side — prices and availability come from the DB,
  // never from the client.
  const { data: products, error: pErr } = await admin
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("active", true)
    .returns<Product[]>();
  if (pErr) throw new Error(pErr.message);
  if (!products || products.length !== ids.length) {
    throw new Error("One or more items are no longer available.");
  }

  const items = products.map((p) => {
    const qty = qtyById.get(p.id)!;
    if (qty > p.stock_quantity) {
      throw new Error(`Only ${p.stock_quantity} of ${p.name} remaining.`);
    }
    return {
      product_id: p.id,
      name_snapshot: p.name,
      unit_price_cents: p.price_cents,
      quantity: qty,
      line_total_cents: p.price_cents * qty,
    };
  });

  const subtotal = items.reduce((s, i) => s + i.line_total_cents, 0);
  const tax = 0; // demo: tax handled at a later phase
  const total = subtotal + tax;
  const ref = `demo_${crypto.randomUUID()}`;

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
      stripe_payment_intent_id: ref,
    })
    .select("id, order_number")
    .single();
  if (oErr) throw new Error(oErr.message);

  const orderId = order!.id as string;
  const { error: iErr } = await admin
    .from("order_items")
    .insert(items.map((i) => ({ ...i, order_id: orderId })));
  if (iErr) throw new Error(iErr.message);

  // Atomic: status → paid + decrement stock (idempotent).
  const { error: mErr } = await admin.rpc("mark_order_paid", { p_payment_intent: ref });
  if (mErr) throw new Error(mErr.message);

  return { id: orderId, orderNumber: order!.order_number as number, totalCents: total };
}
