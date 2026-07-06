"use client";

import { useState, useTransition } from "react";
import { submitClaim } from "@/app/gift/claim/[token]/actions";

export default function ClaimForm({ token }: { token: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [memberToken, setMemberToken] = useState<string | null>(null);

  const [fulfillment, setFulfillment] = useState<"ship" | "pickup">("ship");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await submitClaim({
        token,
        fulfillmentMode: fulfillment,
        shippingAddress: address || undefined,
        phone: phone || undefined,
        ageConfirmed: confirmed,
      });
      if (res.ok && res.memberToken) setMemberToken(res.memberToken);
      else setError(res.error ?? "Could not claim.");
    });
  }

  const input =
    "w-full border border-meadow/20 bg-wheat text-ink placeholder:text-ink-soft/40 px-4 py-3 text-sm font-light outline-none focus:border-meadow";

  if (memberToken) {
    return (
      <div className="border border-meadow/15 bg-wheat p-6 md:p-8 text-center">
        <p className="section-label mb-2">Welcome aboard</p>
        <p className="font-serif text-3xl text-meadow mb-4">You&apos;re in the club.</p>
        <p className="text-ink-soft font-light mb-6">Save your member portal link — you can pause, skip, or update shipping any time.</p>
        <p className="font-mono text-sm text-cider break-all bg-wheat-dark p-3 border border-meadow/15">
          /club/account/{memberToken}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-meadow/15 bg-wheat p-6 md:p-8 space-y-5">
      <div>
        <p className="section-label mb-2">Fulfillment</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              { id: "ship" as const, label: "Ship to me", sub: "KS, MO, CO, NE, OK · 21+ signature" },
              { id: "pickup" as const, label: "Farm pickup", sub: "Held for you at the tap room" },
            ]
          ).map((o) => (
            <button
              type="button"
              key={o.id}
              onClick={() => setFulfillment(o.id)}
              className={`text-left p-4 border transition-colors ${
                fulfillment === o.id ? "border-meadow bg-meadow text-wheat" : "border-meadow/20 hover:border-meadow/50"
              }`}
            >
              <p className="font-serif text-lg">{o.label}</p>
              <p className={`text-xs font-light mt-1 ${fulfillment === o.id ? "text-wheat/70" : "text-ink-soft"}`}>{o.sub}</p>
            </button>
          ))}
        </div>
      </div>
      {fulfillment === "ship" && (
        <textarea className={input} rows={3} placeholder="Shipping address" value={address} onChange={(e) => setAddress(e.target.value)} required />
      )}
      <input className={input} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />

      <label className="flex items-start gap-3 p-4 border border-meadow/20 bg-sunflower/10 cursor-pointer">
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 w-4 h-4 accent-meadow" />
        <span className="text-sm text-ink font-light">I confirm I&apos;m 21 or older.</span>
      </label>

      {error && <p className="text-sm text-cider font-light">{error}</p>}
      <button type="submit" disabled={pending || !confirmed} className="btn-primary w-full disabled:opacity-50">
        {pending ? "Claiming…" : "Claim My Membership"}
      </button>
    </form>
  );
}
