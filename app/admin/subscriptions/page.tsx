import Link from "next/link";
import { getAllPlans, getSubscriptions } from "@/lib/subscriptions";
import { formatUSD } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cider Club | Meadowlark Admin" };

export default async function SubscriptionsAdminPage() {
  const [plans, subs] = await Promise.all([getAllPlans(), getSubscriptions()]);

  const active = subs.filter((s) => s.status === "active").length;
  const paused = subs.filter((s) => s.status === "paused").length;
  const cancelled = subs.filter((s) => s.status === "cancelled").length;

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Recurring revenue</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Cider Club</h1>
          <p className="text-ink-soft font-light mt-2 max-w-xl">
            Plans, members, and the shipment queue. Members are billed manually by invoice until card processing is live.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/subscriptions/plans" className="btn-outline">
            Plans
          </Link>
          <Link href="/admin/subscriptions/shipments" className="btn-primary">
            Shipment queue
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="border border-meadow/10 bg-paper-dark/50 p-5">
          <p className="text-xs tracking-widest uppercase font-light text-stone mb-1">Members</p>
          <p className="font-serif text-3xl text-meadow">{subs.length}</p>
        </div>
        <div className="border border-meadow/10 bg-paper-dark/50 p-5">
          <p className="text-xs tracking-widest uppercase font-light text-stone mb-1">Active</p>
          <p className="font-serif text-3xl text-meadow">{active}</p>
        </div>
        <div className="border border-meadow/10 bg-paper-dark/50 p-5">
          <p className="text-xs tracking-widest uppercase font-light text-stone mb-1">Paused</p>
          <p className="font-serif text-3xl text-ink">{paused}</p>
        </div>
        <div className="border border-meadow/10 bg-paper-dark/50 p-5">
          <p className="text-xs tracking-widest uppercase font-light text-stone mb-1">Cancelled</p>
          <p className="font-serif text-3xl text-stone">{cancelled}</p>
        </div>
      </div>

      <h2 className="font-serif text-2xl text-meadow mb-4">Plans</h2>
      {plans.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6 mb-10">
          No plans yet. <Link href="/admin/subscriptions/plans" className="text-meadow underline">Create your first plan</Link>.
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto mb-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper-dark/40 text-left">
                {["Plan", "Tier", "Cadence", "Bottles", "Price", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-paper-dark/20">
                  <td className="px-4 py-3 font-serif text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink-soft font-light capitalize">{p.tier}</td>
                  <td className="px-4 py-3 text-ink-soft font-light">{p.cadence}</td>
                  <td className="px-4 py-3 text-ink-soft font-light">{p.bottles_per_shipment}</td>
                  <td className="px-4 py-3 text-meadow whitespace-nowrap">{formatUSD(p.price_cents)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${p.active ? "bg-meadow/15 text-meadow" : "bg-stone/20 text-stone"}`}>
                      {p.active ? "Live" : "Hidden"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="font-serif text-2xl text-meadow mb-4">Members</h2>
      {subs.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No members yet. The public sign-up is at <a href="/cider-club" className="text-meadow underline">/cider-club</a>.
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper-dark/40 text-left">
                {["#", "Member", "Email", "Status", "Since", "Fulfillment", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {subs.map((s) => (
                <tr key={s.id} className="hover:bg-paper-dark/20">
                  <td className="px-4 py-3 font-serif text-meadow whitespace-nowrap">#{s.member_number}</td>
                  <td className="px-4 py-3 text-ink">{s.customer_name}</td>
                  <td className="px-4 py-3 text-ink-soft font-light">{s.customer_email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                      s.status === "active"
                        ? "bg-meadow/15 text-meadow"
                        : s.status === "paused"
                          ? "bg-wheat/25 text-ink"
                          : "bg-stone/20 text-stone"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">
                    {new Date(s.started_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-ink-soft font-light capitalize">{s.fulfillment_mode}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/subscriptions/${s.id}`} className="text-xs tracking-widest uppercase font-light text-meadow hover:text-meadow-deep">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
