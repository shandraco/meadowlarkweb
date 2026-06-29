"use client";

import { useState, useTransition } from "react";
import type { Product } from "@/lib/types";
import { updateProduct } from "@/app/admin/products/actions";

export default function ProductRow({ product }: { product: Product }) {
  const [price, setPrice] = useState((product.price_cents / 100).toFixed(2));
  const [stock, setStock] = useState(String(product.stock_quantity));
  const [active, setActive] = useState(product.active);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    Math.round(parseFloat(price) * 100) !== product.price_cents ||
    parseInt(stock, 10) !== product.stock_quantity ||
    active !== product.active;

  function save() {
    setError(null);
    start(async () => {
      const res = await updateProduct({
        id: product.id,
        priceCents: Math.round(parseFloat(price) * 100),
        stockQuantity: parseInt(stock, 10),
        active,
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else {
        setError(res.error ?? "Save failed");
      }
    });
  }

  const cell = "border border-orchard/15 bg-cream px-2 py-1.5 text-sm text-orchard w-full outline-none focus:border-orchard";

  return (
    <tr className="border-b border-orchard/10">
      <td className="px-4 py-3">
        <p className="font-serif text-lg text-orchard leading-tight">{product.name}</p>
        <p className="text-xs text-stone font-light">{product.tier}</p>
      </td>
      <td className="px-3 py-3 w-28">
        <div className="flex items-center gap-1">
          <span className="text-stone text-sm">$</span>
          <input className={cell} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </td>
      <td className="px-3 py-3 w-24">
        <input className={cell} inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} />
      </td>
      <td className="px-3 py-3 w-24 text-center">
        <button
          type="button"
          onClick={() => setActive((a) => !a)}
          className={`text-[10px] tracking-widest uppercase px-3 py-1.5 transition-colors ${
            active ? "bg-orchard text-cream" : "bg-stone/20 text-stone"
          }`}
        >
          {active ? "Live" : "Hidden"}
        </button>
      </td>
      <td className="px-3 py-3 w-28 text-right">
        {error ? (
          <span className="text-xs text-maroon">{error}</span>
        ) : (
          <button
            type="button"
            onClick={save}
            disabled={!dirty || pending}
            className={`text-xs tracking-widest uppercase px-4 py-2 transition-colors ${
              dirty && !pending
                ? "bg-maroon text-cream hover:bg-maroon-light"
                : "bg-transparent text-stone/40 cursor-default"
            }`}
          >
            {pending ? "…" : saved ? "Saved ✓" : "Save"}
          </button>
        )}
      </td>
    </tr>
  );
}
