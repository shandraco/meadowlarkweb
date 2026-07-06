import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderWithItems, getRefundsForOrder } from "@/lib/refunds";
import { formatUSD } from "@/lib/money";
import { ChannelBadge, StatusBadge } from "@/components/admin/OrderBadges";
import RefundPanel from "@/components/admin/RefundPanel";

export const dynamic = "force-dynamic";

interface OrderRow {
  id: string;
  order_number: number;
  channel: "online" | "pos";
  status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  notes: string | null;
  location_id: string | null;
  created_at: string;
  paid_at: string | null;
  order_items: {
    id: string;
    name_snapshot: string;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
  }[];
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, refunds] = await Promise.all([getOrderWithItems(id), getRefundsForOrder(id)]);
  if (!order) notFound();
  const o = order as unknown as OrderRow;

  const alreadyRefunded = refunds.reduce((s, r) => s + r.amount_cents, 0);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow"
      >
        ← Orders
      </Link>
      <div className="flex flex-wrap items-baseline gap-4 mt-4 mb-10">
        <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Order #{o.order_number}</h1>
        <ChannelBadge channel={o.channel} />
        <StatusBadge status={o.status} />
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <div className="border border-meadow/10 bg-wheat">
            <div className="p-6 border-b border-meadow/10">
              <p className="section-label mb-2">Customer</p>
              <p className="font-serif text-xl text-ink">{o.customer_name ?? "—"}</p>
              <p className="text-sm text-ink-soft font-light">{o.customer_email}</p>
              {o.customer_phone && <p className="text-sm text-ink-soft font-light">{o.customer_phone}</p>}
              {o.notes && (
                <p className="text-xs text-ink-soft font-light mt-3 border-t border-meadow/10 pt-3 whitespace-pre-wrap">
                  {o.notes}
                </p>
              )}
            </div>

            <div className="p-6">
              <p className="section-label mb-4">Items</p>
              <div className="divide-y divide-meadow/10">
                {o.order_items.map((it) => (
                  <div key={it.id} className="py-3 flex justify-between text-sm">
                    <span className="text-ink">
                      {it.name_snapshot} <span className="text-stone">× {it.quantity}</span>
                    </span>
                    <span className="text-meadow">{formatUSD(it.line_total_cents)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-meadow/15 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-soft font-light">Subtotal</span>
                  <span className="text-ink">{formatUSD(o.subtotal_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft font-light">Tax</span>
                  <span className="text-ink">{formatUSD(o.tax_cents)}</span>
                </div>
                <div className="flex justify-between font-serif text-lg pt-2">
                  <span className="text-ink">Total</span>
                  <span className="text-cider">{formatUSD(o.total_cents)}</span>
                </div>
                {alreadyRefunded > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-cider font-light">Refunded</span>
                    <span className="text-cider">−{formatUSD(alreadyRefunded)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="border border-meadow/10 bg-wheat-dark/40 p-5 text-sm">
            <p className="text-xs tracking-widest uppercase text-stone font-light mb-1">Placed</p>
            <p className="text-ink">{new Date(o.created_at).toLocaleString()}</p>
            {o.paid_at && (
              <>
                <p className="text-xs tracking-widest uppercase text-stone font-light mb-1 mt-3">Paid</p>
                <p className="text-ink">{new Date(o.paid_at).toLocaleString()}</p>
              </>
            )}
          </div>

          <RefundPanel orderId={o.id} orderTotal={o.total_cents} alreadyRefunded={alreadyRefunded} />

          {refunds.length > 0 && (
            <div className="border border-meadow/10 bg-wheat p-5">
              <p className="section-label mb-3">Refund history</p>
              <div className="space-y-2">
                {refunds.map((r) => (
                  <div key={r.id} className="text-sm border-b border-meadow/10 pb-2 last:border-b-0">
                    <div className="flex justify-between">
                      <span className="text-ink">{r.reason.replace("_", " ")}</span>
                      <span className="text-cider">−{formatUSD(r.amount_cents)}</span>
                    </div>
                    <p className="text-xs text-stone font-light">{new Date(r.created_at).toLocaleString()}</p>
                    {r.notes && <p className="text-xs text-ink-soft font-light mt-1">{r.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
