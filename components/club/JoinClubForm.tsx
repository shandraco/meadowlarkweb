"use client";

import { useState, useTransition } from "react";
import type { SubscriptionPlan } from "@/lib/types";
import { formatUSD } from "@/lib/money";
import { joinClub } from "@/app/cider-club/actions";

export default function JoinClubForm({ plans }: { plans: SubscriptionPlan[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ memberNumber: number; token: string } | null>(null);

  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<"ship" | "pickup">("ship");
  const [address, setAddress] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ageConfirmed) return setError("Please confirm you are 21 or older.");
    setError(null);
    start(async () => {
      const res = await joinClub({
        planId,
        customer: { name, email, phone },
        shippingAddress: address,
        fulfillmentMode: fulfillment,
        ageConfirmed,
      });
      if (res.ok && res.memberNumber != null && res.token) {
        setConfirmation({ memberNumber: res.memberNumber, token: res.token });
      } else {
        setError(res.error ?? "Could not sign up.");
      }
    });
  }

  const selectedPlan = plans.find((p) => p.id === planId);

  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow transition-colors";

  if (confirmation) {
    return (
      <div className="border border-meadow/15 bg-paper-dark/40 p-8 text-center">
        <p className="section-label mb-2">Welcome to the club</p>
        <h2 className="font-serif text-3xl text-meadow mb-3">Member #{confirmation.memberNumber}</h2>
        <p className="text-ink-soft font-light mb-6">
          We&apos;ll email you a receipt and your member portal link. Save this URL to manage your subscription:
        </p>
        <p className="font-mono text-sm text-meadow break-all border border-meadow/20 bg-paper px-4 py-3">
          /club/account/{confirmation.token}
        </p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="border border-meadow/15 bg-paper-dark/40 p-8 text-center">
        <p className="text-ink-soft font-light">
          The club opens soon. Email{" "}
          <a href="mailto:gina@themeadowlarkfarm.com" className="text-meadow underline">
            gina@themeadowlarkfarm.com
          </a>{" "}
          to be first on the list.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-meadow/15 bg-paper p-6 md:p-8 space-y-6">
      <div>
        <p className="section-label mb-3">Pick your plan</p>
        <div className="grid gap-3">
          {plans.map((p) => (
            <label
              key={p.id}
              className={`block p-4 border cursor-pointer transition-colors ${
                planId === p.id ? "border-meadow bg-meadow/5" : "border-meadow/20 hover:border-meadow/40"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={p.id}
                checked={planId === p.id}
                onChange={() => setPlanId(p.id)}
                className="sr-only"
              />
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-serif text-xl text-ink">{p.name}</p>
                <p className="font-serif text-lg text-meadow">
                  {formatUSD(p.price_cents)}
                  <span className="text-xs text-ink-soft ml-1">/{p.cadence}</span>
                </p>
              </div>
              {p.description && <p className="text-sm text-ink-soft font-light mt-1">{p.description}</p>}
              {p.benefits && <p className="text-xs text-meadow font-light mt-2">{p.benefits}</p>}
            </label>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-stone font-light mb-1">Name</label>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs text-stone font-light mb-1">Email</label>
          <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-stone font-light mb-1">Phone (optional)</label>
          <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div>
        <p className="section-label mb-2">Fulfillment</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              { id: "ship" as const, label: "Ship to me", sub: "KS, MO, CO, NE, OK · 21+ signature" },
              { id: "pickup" as const, label: "Farm pickup", sub: "Held for you at the tasting room" },
            ]
          ).map((o) => (
            <button
              type="button"
              key={o.id}
              onClick={() => setFulfillment(o.id)}
              className={`text-left p-4 border transition-colors ${
                fulfillment === o.id ? "border-meadow bg-meadow text-paper" : "border-meadow/20 hover:border-meadow/50"
              }`}
            >
              <p className="font-serif text-lg leading-tight">{o.label}</p>
              <p className={`text-xs font-light mt-1 ${fulfillment === o.id ? "text-paper/70" : "text-ink-soft"}`}>{o.sub}</p>
            </button>
          ))}
        </div>
        {fulfillment === "ship" && (
          <textarea
            className={`${input} mt-3`}
            rows={3}
            placeholder="Shipping address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        )}
      </div>

      <label className="flex items-start gap-3 p-4 border border-meadow/20 bg-wheat/10 cursor-pointer">
        <input
          type="checkbox"
          checked={ageConfirmed}
          onChange={(e) => setAgeConfirmed(e.target.checked)}
          className="mt-1 w-4 h-4 accent-meadow"
        />
        <span className="text-sm text-ink font-light leading-snug">
          I confirm I am 21 years of age or older.
        </span>
      </label>

      {error && <p className="text-sm text-sunset font-light">{error}</p>}

      <div>
        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
          {pending ? "Signing you up…" : selectedPlan ? `Join ${selectedPlan.name} — ${formatUSD(selectedPlan.price_cents)}` : "Join"}
        </button>
        <p className="text-xs text-ink-soft font-light mt-3 text-center">
          We&apos;ll email an invoice for your first shipment. Cancel anytime.
        </p>
      </div>
    </form>
  );
}
