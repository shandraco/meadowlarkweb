"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatUSD } from "@/lib/money";
import type { Subscription, SubscriptionPlan, SubscriptionShipment } from "@/lib/types";
import { memberPause, memberResume, memberCancel, memberUpdateAddress } from "@/app/club/account/[token]/actions";

export default function MemberPortal({
  subscription,
  plan,
  shipments,
  token,
}: {
  subscription: Subscription;
  plan: SubscriptionPlan | null;
  shipments: SubscriptionShipment[];
  token: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState(subscription.shipping_address ?? "");
  const [phone, setPhone] = useState(subscription.customer_phone ?? "");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    setError(null);
    start(async () => {
      const res = await action();
      if (!res.ok) return setError(res.error ?? "Failed.");
      setSavedMsg(ok);
      setTimeout(() => setSavedMsg(null), 2200);
      router.refresh();
    });
  }

  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow";

  return (
    <div className="space-y-10">
      <div className="border border-meadow/10 bg-paper-dark/40 p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
          <div>
            <p className="section-label mb-1">Membership</p>
            <h2 className="font-serif text-3xl text-meadow">Member #{subscription.member_number}</h2>
          </div>
          <span
            className={`text-[10px] tracking-widest uppercase px-3 py-1 ${
              subscription.status === "active"
                ? "bg-meadow/15 text-meadow"
                : subscription.status === "paused"
                  ? "bg-wheat/25 text-ink"
                  : "bg-stone/20 text-stone"
            }`}
          >
            {subscription.status}
          </span>
        </div>
        {plan && (
          <p className="text-ink-soft font-light">
            {plan.name} · {formatUSD(plan.price_cents)}/{plan.cadence} · {plan.bottles_per_shipment} bottles per release
          </p>
        )}
        {savedMsg && <p className="text-sm text-meadow font-light mt-3">{savedMsg}</p>}
        {error && <p className="text-sm text-sunset font-light mt-3">{error}</p>}

        <div className="flex flex-wrap gap-3 mt-6">
          {subscription.status === "active" && (
            <button
              onClick={() => run(() => memberPause(token), "Paused. Resume anytime.")}
              disabled={pending}
              className="btn-outline"
            >
              Pause
            </button>
          )}
          {subscription.status === "paused" && (
            <button
              onClick={() => run(() => memberResume(token), "You&apos;re back on schedule.")}
              disabled={pending}
              className="btn-primary"
            >
              Resume
            </button>
          )}
          {subscription.status !== "cancelled" && (
            <button
              onClick={() => {
                if (!confirm("Cancel your membership? You can rejoin any time.")) return;
                run(() => memberCancel(token), "Your membership is cancelled.");
              }}
              disabled={pending}
              className="text-xs tracking-widest uppercase font-light text-stone hover:text-sunset"
            >
              Cancel membership
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-serif text-2xl text-meadow mb-4">Shipping</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-stone font-light mb-1">Address</label>
            <textarea className={input} rows={4} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-stone font-light mb-1">Phone</label>
            <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <button
          onClick={() => run(() => memberUpdateAddress(token, address, phone), "Shipping updated.")}
          disabled={pending}
          className="btn-primary mt-4 disabled:opacity-50"
        >
          Save shipping
        </button>
      </div>

      <div>
        <h3 className="font-serif text-2xl text-meadow mb-4">Shipments</h3>
        {shipments.length === 0 ? (
          <p className="text-ink-soft font-light">Your first shipment will show here once it&apos;s scheduled.</p>
        ) : (
          <div className="border border-meadow/10 divide-y divide-meadow/10">
            {shipments.map((s) => (
              <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-serif text-lg text-ink">{new Date(s.ship_date).toLocaleDateString()}</p>
                  {s.tracking_number && <p className="text-xs text-meadow">Tracking: {s.tracking_number}</p>}
                </div>
                <span className="text-[10px] tracking-widest uppercase px-2 py-1 bg-wheat/25 text-ink">{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
