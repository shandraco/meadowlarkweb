"use client";

import { useState, useTransition } from "react";
import { formatUSD } from "@/lib/money";
import { lookupOrder, type LookupOrderResult } from "@/app/orders/lookup/actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function OrderLookup({ initialToken }: { initialToken?: string }) {
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<LookupOrderResult | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!initialToken) return;
    start(async () => {
      const res = await lookupOrder({ token: initialToken, email });
      setResult(res);
    });
  }

  if (!initialToken) {
    return (
      <div className="border border-meadow/10 bg-wheat-dark p-6 md:p-8 text-center">
        <p className="section-label mb-3">No lookup link</p>
        <p className="text-ink-soft font-normal leading-relaxed">
          Every order confirmation email includes a link that opens this page directly. Check your inbox for a message
          from <span className="text-meadow">gina@themeadowlarkfarm.com</span>.
        </p>
      </div>
    );
  }

  if (result?.ok && result.order) {
    const o = result.order;
    return (
      <div className="border border-meadow/15 bg-wheat p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <p className="section-label mb-1">Order</p>
            <h2 className="font-serif text-4xl text-meadow">#{o.orderNumber}</h2>
          </div>
          <span
            className={`text-[10px] tracking-widest uppercase px-3 py-1 ${
              o.status === "paid" || o.status === "fulfilled"
                ? "bg-orchard text-wheat"
                : o.status === "cancelled" || o.status === "refunded"
                  ? "bg-stone/20 text-stone"
                  : "bg-sunflower text-ink"
            }`}
          >
            {STATUS_LABEL[o.status] ?? o.status}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-xs tracking-widest uppercase text-stone font-normal mb-1">Customer</p>
            <p className="text-ink">{o.customerName ?? "—"}</p>
            <p className="text-ink-soft font-normal">{o.customerEmail}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-stone font-normal mb-1">Placed</p>
            <p className="text-ink">{new Date(o.createdAt).toLocaleString()}</p>
            {o.paidAt && <p className="text-ink-soft font-normal text-xs">Paid {new Date(o.paidAt).toLocaleString()}</p>}
          </div>
        </div>

        <div className="border-t border-meadow/10 py-4 mb-4">
          {o.items.map((it, i) => (
            <div key={i} className="flex justify-between py-2 text-sm">
              <span className="text-ink-soft font-normal">
                {it.name} <span className="text-stone">× {it.quantity}</span>
              </span>
              <span className="text-meadow whitespace-nowrap">{formatUSD(it.lineCents)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-baseline pt-4 border-t border-meadow/15">
          <span className="font-serif text-xl text-ink">Total</span>
          <span className="font-serif text-2xl text-cider">{formatUSD(o.totalCents)}</span>
        </div>

        {o.notes && (
          <div className="mt-6 bg-wheat-dark p-4">
            <p className="text-xs tracking-widest uppercase text-stone font-normal mb-2">Notes</p>
            <p className="text-sm text-ink-soft font-normal whitespace-pre-wrap">{o.notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-meadow/10 bg-wheat p-6 md:p-8 space-y-5">
      <div>
        <p className="section-label mb-3">Verify it&apos;s you</p>
        <p className="text-sm text-ink-soft font-normal mb-4">
          Enter the email you used when placing the order. If it matches, we&apos;ll show you the receipt.
        </p>
      </div>
      <div>
        <label className="block text-xs text-stone font-normal mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-meadow/20 bg-wheat text-ink placeholder:text-ink-soft/40 px-4 py-3 text-sm font-normal outline-none focus:border-meadow transition-colors"
          placeholder="you@example.com"
        />
      </div>
      {result && !result.ok && <p className="text-sm text-cider font-normal">{result.error}</p>}
      <button type="submit" disabled={pending || !email} className="btn-primary w-full disabled:opacity-50">
        {pending ? "Looking up…" : "Show My Order"}
      </button>
    </form>
  );
}
