"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product, StockMovement, StockReason, Vendor } from "@/lib/types";
import { adjustStock, setProductActive } from "@/app/admin/products/actions";

const REASONS: { value: StockReason; label: string; sign: 1 | -1 }[] = [
  { value: "restock", label: "Restock (add)", sign: 1 },
  { value: "return", label: "Customer return (add)", sign: 1 },
  { value: "spoilage", label: "Spoilage (remove)", sign: -1 },
  { value: "correction", label: "Correction", sign: 1 },
];

const REASON_LABEL: Record<StockReason, string> = {
  initial: "Opening stock",
  restock: "Restock",
  sale: "Sale",
  spoilage: "Spoilage",
  correction: "Correction",
  return: "Return",
};

export default function StockPanel({
  product,
  movements,
  vendors,
}: {
  product: Product;
  movements: StockMovement[];
  vendors: Vendor[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState<StockReason>("restock");
  const [note, setNote] = useState("");
  const [vendorId, setVendorId] = useState(product.vendor_id ?? "");
  const [error, setError] = useState<string | null>(null);

  const vendorMap = new Map(vendors.map((v) => [v.id, v]));

  function apply() {
    setError(null);
    const n = parseInt(qty, 10);
    if (!Number.isInteger(n) || n === 0) {
      setError("Enter a non-zero whole number.");
      return;
    }
    if (reason !== "correction" && n <= 0) {
      setError("Enter a positive number for this reason.");
      return;
    }
    const sign = REASONS.find((r) => r.value === reason)?.sign ?? 1;
    const delta = reason === "correction" ? n : n * sign;
    start(async () => {
      const res = await adjustStock({
        productId: product.id,
        delta,
        reason,
        note,
        vendorId: reason === "restock" ? vendorId || null : null,
      });
      if (!res.ok) setError(res.error ?? "Failed.");
      else {
        setQty("");
        setNote("");
        router.refresh();
      }
    });
  }

  const input =
    "border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow";

  return (
    <div className="space-y-8">
      {/* Current stock + visibility */}
      <div className="flex items-end justify-between bg-paper-dark/50 border border-meadow/10 p-6">
        <div>
          <p className="text-xs tracking-widest uppercase font-light text-stone mb-1">On hand</p>
          <p className="font-serif text-5xl text-meadow leading-none">{product.stock_quantity}</p>
        </div>
        <button
          type="button"
          onClick={() =>
            start(async () => {
              await setProductActive({ id: product.id, active: !product.active });
              router.refresh();
            })
          }
          className={`text-[10px] tracking-widest uppercase px-3 py-1.5 ${
            product.active ? "bg-meadow text-paper" : "bg-stone/20 text-stone"
          }`}
        >
          {product.active ? "Live in store" : "Hidden"}
        </button>
      </div>

      {/* Adjust */}
      <div>
        <p className="section-label mb-4">Adjust stock</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-stone font-light mb-1">Reason</label>
            <select className={input} value={reason} onChange={(e) => setReason(e.target.value as StockReason)}>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="block text-xs text-stone font-light mb-1">{reason === "correction" ? "± Qty" : "Qty"}</label>
            <input
              className={`${input} w-full`}
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder={reason === "correction" ? "-3" : "12"}
            />
          </div>
          {reason === "restock" && (
            <div className="w-56">
              <label className="block text-xs text-stone font-light mb-1">Vendor (optional)</label>
              <select className={`${input} w-full`} value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                <option value="">— Farm-grown —</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-stone font-light mb-1">Note (optional)</label>
            <input
              className={`${input} w-full`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Delivery, breakage…"
            />
          </div>
          <button type="button" onClick={apply} disabled={pending} className="btn-primary disabled:opacity-50">
            {pending ? "…" : "Apply"}
          </button>
        </div>
        {error && <p className="text-sm text-sunset font-light mt-2">{error}</p>}
        {reason === "correction" && (
          <p className="text-xs text-ink-soft/60 font-light mt-2">Use a negative number to subtract.</p>
        )}
        <Link
          href={`/admin/products/labels?productId=${product.id}${
            parseInt(qty, 10) > 0 ? `&qty=${parseInt(qty, 10)}` : ""
          }`}
          className="inline-block mt-4 text-xs tracking-widest uppercase font-light text-meadow hover:text-meadow-deep"
        >
          Print QR labels for this batch →
        </Link>
      </div>

      {/* History */}
      <div>
        <p className="section-label mb-4">Movement history</p>
        {movements.length === 0 ? (
          <p className="text-ink-soft/60 font-light text-sm">No movements yet.</p>
        ) : (
          <div className="border border-meadow/10 divide-y divide-meadow/10">
            {movements.map((m) => {
              const vendor = m.vendor_id ? vendorMap.get(m.vendor_id) : null;
              return (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <span className="text-meadow">{REASON_LABEL[m.reason]}</span>
                    {vendor && <span className="text-ink-soft font-light"> · {vendor.name}</span>}
                    {m.note && <span className="text-ink-soft font-light"> · {m.note}</span>}
                    <span className="text-stone/50 font-light block text-xs">
                      {new Date(m.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className={`font-serif text-lg tabular-nums ${m.delta >= 0 ? "text-meadow" : "text-sunset"}`}>
                    {m.delta >= 0 ? "+" : ""}
                    {m.delta}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
