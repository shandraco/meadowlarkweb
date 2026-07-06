"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatUSD } from "@/lib/money";
import { createRefund } from "@/app/admin/orders/[id]/actions";

const REASONS = [
  { value: "customer_request", label: "Customer request" },
  { value: "damaged", label: "Damaged" },
  { value: "wrong_item", label: "Wrong item" },
  { value: "other", label: "Other" },
] as const;

export default function RefundPanel({
  orderId,
  orderTotal,
  alreadyRefunded,
}: {
  orderId: string;
  orderTotal: number;
  alreadyRefunded: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const refundable = orderTotal - alreadyRefunded;
  const [amount, setAmount] = useState<string>((refundable / 100).toFixed(2));
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("customer_request");
  const [notes, setNotes] = useState("");
  const [restock, setRestock] = useState(true);

  function submit() {
    setError(null);
    const cents = Math.round(parseFloat(amount || "0") * 100);
    if (cents <= 0) return setError("Enter a positive amount.");
    start(async () => {
      const res = await createRefund({ orderId, amountCents: cents, reason, notes, restock });
      if (!res.ok) return setError(res.error ?? "Refund failed.");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    });
  }

  const input =
    "w-full border border-meadow/20 bg-wheat text-ink px-3 py-2.5 text-sm font-light outline-none focus:border-meadow";

  if (refundable <= 0) {
    return (
      <div className="border border-meadow/10 bg-wheat-dark/40 p-6">
        <p className="text-ink-soft font-light text-sm">
          This order has been fully refunded ({formatUSD(alreadyRefunded)} of {formatUSD(orderTotal)}).
        </p>
      </div>
    );
  }

  return (
    <div className="border border-meadow/15 bg-wheat p-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="section-label">Issue refund</p>
        <p className="text-sm text-ink-soft font-light">
          Max: <span className="text-cider">{formatUSD(refundable)}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone font-light mb-1">Amount (USD)</label>
          <input className={input} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-stone font-light mb-1">Reason</label>
          <select className={input} value={reason} onChange={(e) => setReason(e.target.value as typeof reason)}>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-stone font-light mb-1">Notes</label>
        <textarea className={input} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink font-light">
        <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} className="w-4 h-4 accent-meadow" />
        Restock inventory (applies on full refund)
      </label>

      {error && <p className="text-sm text-cider font-light">{error}</p>}

      <button onClick={submit} disabled={pending} className="btn-primary w-full disabled:opacity-50">
        {pending ? "Processing…" : saved ? "Refund logged ✓" : "Issue Refund"}
      </button>
    </div>
  );
}
