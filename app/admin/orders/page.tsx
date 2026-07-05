import { getOrders } from "@/lib/admin-data";
import { formatUSD } from "@/lib/money";
import { ChannelBadge, StatusBadge } from "@/components/admin/OrderBadges";
import OrdersRealtime from "@/components/admin/OrdersRealtime";
import { getActiveLocations } from "@/lib/pos-session";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const [orders, locations] = await Promise.all([getOrders(100), getActiveLocations()]);
  const locName = new Map(locations.map((l) => [l.id, l.name]));

  return (
    <div>
      <OrdersRealtime />
      <p className="section-label mb-2">All Channels</p>
      <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none mb-10">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-meadow/10 bg-paper-dark/20 p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-xl text-meadow">#{o.order_number}</span>
                  <ChannelBadge channel={o.channel} />
                  <StatusBadge status={o.status} />
                  {o.location_id && (
                    <span className="text-[10px] tracking-widest uppercase text-ink-soft">
                      · {locName.get(o.location_id) ?? "Location"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-serif text-xl text-meadow">{formatUSD(o.total_cents)}</span>
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
                    <div key={i} className="flex justify-between text-sm text-ink-soft font-light">
                      <span>
                        {it.name_snapshot} <span className="text-stone/50">× {it.quantity}</span>
                      </span>
                      <span className="text-meadow">{formatUSD(it.line_total_cents)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-ink-soft font-light md:text-right">
                  {o.customer_name && <p className="text-ink">{o.customer_name}</p>}
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
