"use client";

import { useState, useTransition } from "react";
import { formatUSD } from "@/lib/money";
import { buyPass } from "@/app/season-pass/actions";

export default function BuyPassForm({ priceCents }: { priceCents: number }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ passNumber: number; redeemUrl: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await buyPass({
        customer: { name, email, phone },
        notes,
        ageConfirmed: confirmed,
      });
      if (res.ok && res.passNumber != null && res.redeemUrl) {
        setConfirmation({ passNumber: res.passNumber, redeemUrl: res.redeemUrl });
      } else {
        setError(res.error ?? "Could not issue your pass.");
      }
    });
  }

  const inputCls =
    "w-full border border-meadow/20 bg-wheat text-ink placeholder:text-ink-soft/40 px-4 py-3 text-sm font-normal outline-none focus:border-meadow transition-colors";

  if (confirmation) {
    return (
      <div className="border border-meadow/15 bg-wheat p-6 md:p-8 text-center">
        <p className="section-label mb-2">Pass issued</p>
        <p className="font-serif text-5xl text-meadow mb-3">#{confirmation.passNumber}</p>
        <p className="text-ink-soft font-normal mb-6">
          Save your pass link (also sent to your email):
        </p>
        <p className="font-mono text-sm text-cider break-all bg-wheat-dark p-3 border border-meadow/15">
          {confirmation.redeemUrl}
        </p>
        <p className="text-xs text-stone font-normal mt-4">
          We&apos;ll email an invoice for {formatUSD(5000)} within a business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-meadow/15 bg-wheat p-6 md:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <input className={inputCls} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={`${inputCls} sm:col-span-2`} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <textarea
        className={inputCls}
        rows={2}
        placeholder="Notes for us (optional) — birthdays, kids' ages, anything to know"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <label className="flex items-start gap-3 p-4 border border-meadow/20 bg-sunflower/10 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 w-4 h-4 accent-meadow"
        />
        <span className="text-sm text-ink font-normal leading-snug">
          I understand my pass is good for one year of unlimited farm entry, non-transferable, and covers the pass holder.
        </span>
      </label>
      {error && <p className="text-sm text-cider font-normal">{error}</p>}
      <button type="submit" disabled={pending || !confirmed} className="btn-primary w-full disabled:opacity-50">
        {pending ? "Issuing pass…" : `Get My Pass · ${formatUSD(priceCents)}`}
      </button>
      <p className="text-xs text-ink-soft font-normal text-center">
        Invoiced by email. Card processing coming online soon.
      </p>
    </form>
  );
}
