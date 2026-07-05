import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/money";
import type { Subscription, SubscriptionShipment, Product } from "@/lib/types";
import ScheduleShipment from "@/components/admin/ScheduleShipment";
import SubscriptionStatusControls from "@/components/admin/SubscriptionStatusControls";

export const dynamic = "force-dynamic";

export default async function ManageMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [subResp, shipsResp, prodResp] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("id", id).maybeSingle(),
    supabase.from("subscription_shipments").select("*").eq("subscription_id", id).order("ship_date", { ascending: false }),
    supabase.from("products").select("id, name, price_cents").eq("category", "cider"),
  ]);
  const sub = subResp.data as Subscription | null;
  if (!sub) notFound();
  const shipments = (shipsResp.data ?? []) as SubscriptionShipment[];
  const products = (prodResp.data ?? []) as Pick<Product, "id" | "name" | "price_cents">[];
  const productMap = new Map(products.map((p) => [p.id, p]));

  return (
    <div>
      <Link href="/admin/subscriptions" className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow">
        ← Members
      </Link>

      <div className="mt-6 mb-10">
        <p className="section-label mb-2">Member #{sub.member_number}</p>
        <h1 className="font-serif text-4xl text-meadow">{sub.customer_name}</h1>
        <p className="text-ink-soft font-light">{sub.customer_email}</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <h2 className="font-serif text-2xl text-meadow mb-4">Shipment history</h2>
          {shipments.length === 0 ? (
            <p className="text-ink-soft font-light">Nothing scheduled yet.</p>
          ) : (
            <div className="border border-meadow/10 divide-y divide-meadow/10 mb-8">
              {shipments.map((s) => (
                <div key={s.id} className="px-4 py-3 flex items-start justify-between gap-4 text-sm">
                  <div>
                    <p className="font-serif text-lg text-ink">{new Date(s.ship_date).toLocaleDateString()}</p>
                    <p className="text-xs text-ink-soft font-light">
                      {s.product_ids.map((pid) => productMap.get(pid)?.name ?? "—").join(", ")}
                    </p>
                    {s.notes && <p className="text-xs text-stone mt-1">{s.notes}</p>}
                    {s.tracking_number && <p className="text-xs text-meadow mt-1">Tracking: {s.tracking_number}</p>}
                  </div>
                  <span className="text-[10px] tracking-widest uppercase px-2 py-1 bg-wheat/25 text-ink whitespace-nowrap">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <h2 className="font-serif text-2xl text-meadow mb-4">Schedule a shipment</h2>
          <ScheduleShipment subscriptionId={sub.id} products={products} />
        </div>

        <div className="lg:col-span-2">
          <div className="border border-meadow/10 bg-paper-dark/40 p-6 space-y-6">
            <div>
              <p className="section-label mb-2">Status</p>
              <SubscriptionStatusControls subscription={sub} />
            </div>
            <div>
              <p className="section-label mb-2">Fulfillment</p>
              <p className="text-ink capitalize">{sub.fulfillment_mode}</p>
              {sub.shipping_address && <p className="text-sm text-ink-soft font-light whitespace-pre-line mt-1">{sub.shipping_address}</p>}
            </div>
            {sub.customer_phone && (
              <div>
                <p className="section-label mb-2">Phone</p>
                <p className="text-ink">{sub.customer_phone}</p>
              </div>
            )}
            <div>
              <p className="section-label mb-2">Member link</p>
              <p className="text-xs text-ink-soft font-light break-all">
                /club/account/<span className="text-meadow">{sub.member_token}</span>
              </p>
              <p className="text-xs text-stone/70 font-light mt-1">Send this to the member so they can pause / update.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
