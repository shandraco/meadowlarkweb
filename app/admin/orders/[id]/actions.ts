"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { writeAudit } from "@/lib/audit";
import { CreateRefundInput, firstIssue } from "@/lib/validation";

export interface RefundResult {
  ok: boolean;
  refundId?: string;
  error?: string;
}

// Records a refund + optionally restocks inventory. Order status transitions
// to 'refunded' when the total refunded reaches the order total.
export async function createRefund(input: unknown): Promise<RefundResult> {
  const session = await requireAdmin();
  const parsed = CreateRefundInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const r = parsed.data;

  const admin = getSupabaseAdmin();

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, order_number, status, total_cents, customer_name, customer_email")
    .eq("id", r.orderId)
    .maybeSingle();
  if (orderErr) return { ok: false, error: orderErr.message };
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "refunded") return { ok: false, error: "Order already refunded." };

  // Sum existing refunds to prevent over-refunding.
  const { data: priors } = await admin.from("refunds").select("amount_cents").eq("order_id", r.orderId);
  const alreadyRefunded = (priors ?? []).reduce((s, x) => s + x.amount_cents, 0);
  if (alreadyRefunded + r.amountCents > order.total_cents) {
    return {
      ok: false,
      error: `Only $${((order.total_cents - alreadyRefunded) / 100).toFixed(2)} remaining refundable.`,
    };
  }

  const { data: refund, error: refundErr } = await admin
    .from("refunds")
    .insert({
      order_id: r.orderId,
      amount_cents: r.amountCents,
      reason: r.reason,
      notes: r.notes ?? null,
      restock: r.restock,
      processed_by: session.userId,
    })
    .select("id")
    .single();
  if (refundErr) return { ok: false, error: refundErr.message };

  // Restock line items proportionally to the refund. Simplification: on a
  // full refund we restock every line at its full quantity; on a partial
  // refund we just log the intent and leave stock as-is — real fine-grained
  // restocking needs per-item selection UI that we haven't built yet.
  const totalRefunded = alreadyRefunded + r.amountCents;
  const fullRefund = totalRefunded >= order.total_cents;
  if (r.restock && fullRefund) {
    const { data: items } = await admin
      .from("order_items")
      .select("product_id, quantity, name_snapshot")
      .eq("order_id", r.orderId);
    for (const it of items ?? []) {
      if (!it.product_id) continue;
      await admin.rpc("adjust_stock", {
        p_product: it.product_id,
        p_delta: it.quantity,
        p_reason: "return",
        p_note: `Refund for order #${order.order_number}`,
        p_user: session.userId,
      });
    }
  }

  if (fullRefund) {
    await admin.from("orders").update({ status: "refunded" }).eq("id", r.orderId);
  }

  await writeAudit({
    action: "update",
    entityType: "order",
    entityId: r.orderId,
    summary: `Refund $${(r.amountCents / 100).toFixed(2)} on order #${order.order_number} (${r.reason})${fullRefund ? " — status → refunded" : ""}`,
    before: { total_refunded_cents: alreadyRefunded, status: order.status },
    after: {
      total_refunded_cents: totalRefunded,
      status: fullRefund ? "refunded" : order.status,
      refund_id: refund.id,
      restocked: r.restock && fullRefund,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${r.orderId}`);
  return { ok: true, refundId: refund.id };
}
