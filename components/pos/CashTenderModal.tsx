"use client";

import { useState } from "react";
import { formatUSD } from "@/lib/money";

// Cash payment flow — cashier types the amount received, we display change
// due, they confirm, and the parent creates the order.
const QUICK_TENDERS = [1, 5, 10, 20, 50, 100];

function nextRoundedUp(cents: number, step: number): number {
  return Math.ceil(cents / (step * 100)) * step * 100;
}

export default function CashTenderModal({
  totalCents,
  onConfirm,
  onCancel,
  pending,
}: {
  totalCents: number;
  onConfirm: (tenderedCents: number) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [tender, setTender] = useState<number>(totalCents);
  const [display, setDisplay] = useState<string>((totalCents / 100).toFixed(2));

  const change = Math.max(0, tender - totalCents);
  const insufficient = tender < totalCents;

  function setFromInput(v: string) {
    setDisplay(v);
    const num = parseFloat(v);
    setTender(Number.isFinite(num) && num >= 0 ? Math.round(num * 100) : 0);
  }

  const suggestions = [
    { label: "Exact", value: totalCents },
    { label: `$${Math.ceil(totalCents / 100)}`, value: Math.ceil(totalCents / 100) * 100 },
    { label: "$" + nextRoundedUp(totalCents, 5) / 100, value: nextRoundedUp(totalCents, 5) },
    { label: "$" + nextRoundedUp(totalCents, 10) / 100, value: nextRoundedUp(totalCents, 10) },
    { label: "$" + nextRoundedUp(totalCents, 20) / 100, value: nextRoundedUp(totalCents, 20) },
  ].filter((s, i, arr) => arr.findIndex((x) => x.value === s.value) === i);

  return (
    <div className="fixed inset-0 bg-meadow-deep/80 z-50 flex items-center justify-center px-4">
      <div className="bg-wheat max-w-md w-full p-6 md:p-8">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="section-label mb-1">Cash tender</p>
            <p className="font-serif text-2xl text-ink">Amount due</p>
          </div>
          <p className="font-serif text-4xl text-cider">{formatUSD(totalCents)}</p>
        </div>

        <label className="block text-xs tracking-widest uppercase text-stone font-light mb-2">Cash received</label>
        <div className="relative mb-3">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-ink-soft">$</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={display}
            onChange={(e) => setFromInput(e.target.value)}
            className="w-full pl-10 pr-4 py-4 text-3xl font-serif border border-meadow/25 bg-wheat-light text-ink outline-none focus:border-meadow"
            autoFocus
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => {
                setTender(s.value);
                setDisplay((s.value / 100).toFixed(2));
              }}
              className={`px-4 py-2 text-sm border transition-colors ${
                tender === s.value
                  ? "bg-meadow text-wheat border-meadow"
                  : "bg-wheat text-meadow border-meadow/25 hover:border-meadow"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className={`p-4 mb-6 ${insufficient ? "bg-cider/10 border border-cider/20" : "bg-orchard/5 border border-orchard/20"}`}>
          <div className="flex items-baseline justify-between">
            <span className="text-xs tracking-widest uppercase text-stone">
              {insufficient ? "Short by" : "Change due"}
            </span>
            <span
              className={`font-serif text-4xl ${
                insufficient ? "text-cider" : change > 0 ? "text-orchard" : "text-meadow"
              }`}
            >
              {formatUSD(insufficient ? totalCents - tender : change)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={pending}
            className="flex-1 py-3 text-sm tracking-widest uppercase font-light border border-meadow/30 text-meadow hover:bg-meadow/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(tender)}
            disabled={pending || insufficient}
            className="flex-1 py-3 text-sm tracking-widest uppercase font-light bg-cider text-wheat hover:bg-cider-deep transition-colors disabled:opacity-40"
          >
            {pending ? "Ringing…" : "Complete Sale"}
          </button>
        </div>

        <div className="flex justify-around mt-6 pt-6 border-t border-meadow/10">
          {QUICK_TENDERS.map((n) => (
            <button
              key={n}
              onClick={() => {
                setTender(n * 100);
                setDisplay(n.toFixed(2));
              }}
              className="text-xs tracking-widest uppercase text-stone hover:text-meadow"
            >
              ${n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
