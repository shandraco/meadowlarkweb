import Link from "next/link";
import { getSalesSummary, getOrders } from "@/lib/admin-data";
import { formatUSD } from "@/lib/money";
import { ChannelBadge, StatusBadge } from "@/components/admin/OrderBadges";
import OrdersRealtime from "@/components/admin/OrdersRealtime";

export const dynamic = "force-dynamic";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function AdminOverview() {
  const [summary, orders] = await Promise.all([getSalesSummary(), getOrders(8)]);

  const cards = [
    { label: "Paid revenue", value: formatUSD(summary.revenueCents) },
    { label: "Paid orders", value: String(summary.paidOrders) },
    { label: "Online", value: `${formatUSD(summary.onlineCents)} · ${summary.onlineOrders}` },
    { label: "In-person (POS)", value: `${formatUSD(summary.posCents)} · ${summary.posOrders}` },
  ];

  return (
    <div>
      <OrdersRealtime />

      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="section-label mb-2">Dashboard</p>
          <h1 className="font-serif text-4xl md:text-5xl text-orchard leading-none">Overview</h1>
        </div>
        <span className="text-xs text-stone font-light hidden md:block">Live · updates automatically</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {cards.map((c) => (
          <div key={c.label} className="bg-cream-dark/50 border border-orchard/10 p-6">
            <p className="text-xs tracking-widest uppercase font-light text-stone mb-2">{c.label}</p>
            <p className="font-serif text-2xl md:text-3xl text-orchard leading-none">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-2xl text-orchard">Recent orders</h2>
        <Link href="/admin/orders" className="text-xs tracking-widest uppercase font-light text-stone hover:text-orchard transition-colors">
          View all →
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-stone font-light border-t border-orchard/10 pt-6">
          No orders yet. Place one from the store or the POS.
        </p>
      ) : (
        <div className="border border-orchard/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-dark/40 text-left">
                {["Order", "Channel", "Customer", "Items", "Total", "Status", "When"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-orchard/10">
              {orders.map((o) => {
                const itemCount = o.order_items.reduce((n, i) => n + i.quantity, 0);
                return (
                  <tr key={o.id} className="hover:bg-cream-dark/20">
                    <td className="px-4 py-3 font-serif text-orchard whitespace-nowrap">#{o.order_number}</td>
                    <td className="px-4 py-3"><ChannelBadge channel={o.channel} /></td>
                    <td className="px-4 py-3 text-stone font-light whitespace-nowrap">
                      {o.customer_name || <span className="text-stone/50">—</span>}
                    </td>
                    <td className="px-4 py-3 text-stone font-light">{itemCount}</td>
                    <td className="px-4 py-3 text-orchard whitespace-nowrap">{formatUSD(o.total_cents)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-stone/70 font-light whitespace-nowrap">{timeAgo(o.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
