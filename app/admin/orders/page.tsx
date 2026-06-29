import { getOrders } from "@/lib/admin-data";
import { formatUSD } from "@/lib/money";
import { ChannelBadge, StatusBadge } from "@/components/admin/OrderBadges";
import OrdersRealtime from "@/components/admin/OrdersRealtime";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const orders = await getOrders(100);

  return (
    <div>
      <OrdersRealtime />
      <p className="section-label mb-2">All Channels</p>
      <h1 className="font-serif text-4xl md:text-5xl text-orchard leading-none mb-10">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-stone font-light border-t border-orchard/10 pt-6">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-orchard/10 bg-cream-dark/20 p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-xl text-orchard">#{o.order_number}</span>
                  <ChannelBadge channel={o.channel} />
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-serif text-xl text-orchard">{formatUSD(o.total_cents)}</span>
                  <span className="text-xs text-stone/70 font-light">
                    {new Date(o.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
                <div>
                  {o.order_items.map((it, i) => (
                    <div key={i} className="flex justify-between text-sm text-stone font-light">
                      <span>
                        {it.name_snapshot} <span className="text-stone/50">× {it.quantity}</span>
                      </span>
                      <span className="text-orchard">{formatUSD(it.line_total_cents)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-stone font-light md:text-right">
                  {o.customer_name && <p className="text-orchard">{o.customer_name}</p>}
                  {o.customer_email && <p>{o.customer_email}</p>}
                  {o.customer_phone && <p>{o.customer_phone}</p>}
                  {o.notes && <p className="text-stone/70 mt-1">{o.notes}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
