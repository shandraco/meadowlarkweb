"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product, PosCategory } from "@/lib/types";
import { effectivePriceCents, isOnSale } from "@/lib/types";
import { formatUSD } from "@/lib/money";
import { createPosOrder } from "@/app/pos/actions";
import PosCatalog from "./PosCatalog";

interface TicketLine {
  product: Product;
  qty: number;
}

export default function PosRegister({
  products,
  categories,
  canEdit,
  locationName,
}: {
  products: Product[];
  categories: PosCategory[];
  canEdit: boolean;
  locationName: string;
}) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Map<string, TicketLine>>(new Map());
  const [pending, start] = useTransition();
  const [done, setDone] = useState<{ orderNumber: number; totalCents: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lines = [...ticket.values()];
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + effectivePriceCents(l.product) * l.qty, 0),
    [lines],
  );

  function addToTicket(p: Product) {
    setError(null);
    setTicket((prev) => {
      const next = new Map(prev);
      const cur = next.get(p.id);
      const qty = (cur?.qty ?? 0) + 1;
      if (qty > p.stock_quantity) return prev;
      next.set(p.id, { product: p, qty });
      return next;
    });
  }

  function setQty(id: string, qty: number) {
    setTicket((prev) => {
      const next = new Map(prev);
      const line = next.get(id);
      if (!line) return prev;
      if (qty <= 0) next.delete(id);
      else next.set(id, { ...line, qty: Math.min(qty, line.product.stock_quantity) });
      return next;
    });
  }

  function charge() {
    if (!lines.length) return;
    setError(null);
    start(async () => {
      const res = await createPosOrder({
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.qty })),
      });
      if (res.ok && res.orderNumber != null) {
        setDone({ orderNumber: res.orderNumber, totalCents: res.totalCents ?? subtotal });
        setTicket(new Map());
        router.refresh();
      } else {
        setError(res.error ?? "Sale failed.");
      }
    });
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-paper">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-meadow text-paper flex items-center justify-center mx-auto mb-6 text-2xl">
            ✓
          </div>
          <p className="section-label mb-2">Sale complete</p>
          <h2 className="font-serif text-5xl text-meadow mb-2">{formatUSD(done.totalCents)}</h2>
          <p className="text-ink-soft font-light mb-1">Order #{done.orderNumber}</p>
          <p className="text-stone font-light text-sm mb-8">{locationName}</p>
          <button onClick={() => setDone(null)} className="btn-primary">
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-paper">
      <PosCatalog products={products} categories={categories} canEdit={canEdit} onAdd={addToTicket} />

      <aside className="lg:w-96 bg-paper-dark/60 border-t lg:border-t-0 lg:border-l border-meadow/15 flex flex-col">
        <div className="px-6 py-4 border-b border-meadow/10">
          <p className="section-label">Current Ticket</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-[120px]">
          {lines.length === 0 ? (
            <p className="text-ink-soft/60 font-light text-sm text-center py-10">Tap products to add them.</p>
          ) : (
            <div className="divide-y divide-meadow/10">
              {lines.map((l) => {
                const unit = effectivePriceCents(l.product);
                const sale = isOnSale(l.product);
                return (
                  <div key={l.product.id} className="py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base text-ink truncate">{l.product.name}</p>
                      <p className="text-xs text-ink-soft font-light">
                        {formatUSD(unit)} ea
                        {sale && <span className="ml-2 text-sunset">sale</span>}
                      </p>
                    </div>
                    <div className="flex items-center border border-meadow/20">
                      <button
                        onClick={() => setQty(l.product.id, l.qty - 1)}
                        className="w-8 h-8 text-meadow hover:bg-meadow hover:text-paper"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">{l.qty}</span>
                      <button
                        onClick={() => setQty(l.product.id, l.qty + 1)}
                        className="w-8 h-8 text-meadow hover:bg-meadow hover:text-paper"
                      >
                        +
                      </button>
                    </div>
                    <span className="w-16 text-right font-serif text-meadow">{formatUSD(unit * l.qty)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-5 border-t border-meadow/15">
          <div className="flex justify-between items-baseline mb-4">
            <span className="font-serif text-xl text-ink">Total</span>
            <span className="font-serif text-3xl text-meadow">{formatUSD(subtotal)}</span>
          </div>
          {error && <p className="text-sm text-sunset font-light mb-3">{error}</p>}
          <button
            onClick={charge}
            disabled={!lines.length || pending}
            className="w-full bg-meadow text-paper py-4 text-sm tracking-widest uppercase font-light hover:bg-meadow-deep transition-colors disabled:opacity-40"
          >
            {pending ? "Charging…" : `Charge ${formatUSD(subtotal)}`}
          </button>
          <p className="text-[11px] text-ink-soft/60 font-light text-center mt-3">
            Ringing up at {locationName}
          </p>
        </div>
      </aside>
    </div>
  );
}
