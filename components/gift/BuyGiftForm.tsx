"use client";

import { useState, useTransition } from "react";
import type { SubscriptionPlan } from "@/lib/types";
import { formatUSD } from "@/lib/money";
import { purchaseGift } from "@/app/gift/actions";

export default function BuyGiftForm({ plans }: { plans: SubscriptionPlan[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ giftNumber: number } | null>(null);

  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await purchaseGift({
        planId,
        buyer: { name: buyerName, email: buyerEmail },
        recipient: { name: recipientName, email: recipientEmail },
        message: message || undefined,
        ageConfirmed: confirmed,
      });
      if (res.ok && res.giftNumber != null) setConfirmation({ giftNumber: res.giftNumber });
      else setError(res.error ?? "Failed.");
    });
  }

  const plan = plans.find((p) => p.id === planId);
  const input =
    "w-full border border-meadow/20 bg-wheat text-ink placeholder:text-ink-soft/40 px-4 py-3 text-sm font-light outline-none focus:border-meadow";

  if (confirmation) {
    return (
      <div className="border border-meadow/15 bg-wheat p-6 md:p-8 text-center">
        <p className="section-label mb-2">Gift sent</p>
        <p className="font-serif text-5xl text-meadow mb-3">#{confirmation.giftNumber}</p>
        <p className="text-ink-soft font-light">
          We just emailed you a receipt and sent {recipientName} their claim link. You&apos;ll be invoiced when they redeem it.
        </p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="border border-meadow/15 bg-wheat p-8 text-center">
        <p className="text-ink-soft font-light">
          Cider Club plans aren&apos;t published yet. Email{" "}
          <a href="mailto:gina@themeadowlarkfarm.com" className="text-cider">
            gina@themeadowlarkfarm.com
          </a>{" "}
          to gift one directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-meadow/15 bg-wheat p-6 md:p-8 space-y-5">
      <div>
        <p className="section-label mb-3">Pick the plan</p>
        <div className="grid gap-3">
          {plans.map((p) => (
            <label
              key={p.id}
              className={`block p-4 border cursor-pointer transition-colors ${
                planId === p.id ? "border-meadow bg-meadow/5" : "border-meadow/20 hover:border-meadow/40"
              }`}
            >
              <input type="radio" name="plan" value={p.id} checked={planId === p.id} onChange={() => setPlanId(p.id)} className="sr-only" />
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-serif text-xl text-ink">{p.name}</p>
                <p className="font-serif text-lg text-cider">
                  {formatUSD(p.price_cents)} <span className="text-xs text-ink-soft">/{p.cadence}</span>
                </p>
              </div>
              {p.description && <p className="text-sm text-ink-soft font-light mt-1">{p.description}</p>}
            </label>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <p className="section-label mb-2">Your details</p>
          <input className={input} placeholder="Your name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
          <input className={`${input} mt-2`} type="email" placeholder="Your email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} required />
        </div>
        <div>
          <p className="section-label mb-2">Recipient</p>
          <input className={input} placeholder="Their name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required />
          <input className={`${input} mt-2`} type="email" placeholder="Their email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} required />
        </div>
      </div>

      <textarea
        className={input}
        rows={3}
        placeholder="A note to include (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <label className="flex items-start gap-3 p-4 border border-meadow/20 bg-sunflower/10 cursor-pointer">
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 w-4 h-4 accent-meadow" />
        <span className="text-sm text-ink font-light">
          I confirm both the buyer and recipient are 21 or older. The recipient will verify their age when they claim.
        </span>
      </label>

      {error && <p className="text-sm text-cider font-light">{error}</p>}

      <button type="submit" disabled={pending || !confirmed} className="btn-primary w-full disabled:opacity-50">
        {pending ? "Sending gift…" : `Gift ${plan ? plan.name : ""} · ${plan ? formatUSD(plan.price_cents) : ""}`}
      </button>
      <p className="text-xs text-ink-soft font-light text-center">
        Invoiced when the recipient claims. Refunded automatically if they don&apos;t claim within a year.
      </p>
    </form>
  );
}
