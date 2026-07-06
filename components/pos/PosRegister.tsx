"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product, PosCategory } from "@/lib/types";
import { effectivePriceCents, isOnSale } from "@/lib/types";
import { formatUSD } from "@/lib/money";
import { createPosOrder } from "@/app/pos/actions";
import PosCatalog from "./PosCatalog";
import CashTenderModal from "./CashTenderModal";
import BarcodeListener from "./BarcodeListener";
import Receipt, { type ReceiptItem } from "./Receipt";

interface TicketLine {
  product: Product;
  qty: number;
}

// Kansas home-state tax rate — matches the DB seed. Kept as a client-side
// constant so the POS shows a live tax total without a network round-trip
// per keystroke. If a manager changes the rate, they redeploy this constant
// or move the value into a fetched config endpoint.
const HOME_TAX_BP = 650;

function computeTax(subtotalCents: number): number {
  return Math.round((subtotalCents * HOME_TAX_BP) / 10_000);
}

interface CompletedSale {
  orderNumber: number;
  items: ReceiptItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  paymentMethod: "cash" | "card";
  tenderCents?: number;
  changeCents?: number;
  createdAt: Date;
}

export default function PosRegister({
  products,
  categories,
  canEdit,
  locationName,
  cashierName,
}: {
  products: Product[];
  categories: PosCategory[];
  canEdit: boolean;
  locationName: string;
  cashierName: string;
}) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Map<string, TicketLine>>(new Map());
  const [pending, start] = useTransition();
  const [done, setDone] = useState<CompletedSale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tenderOpen, setTenderOpen] = useState(false);

  const lines = [...ticket.values()];
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + effectivePriceCents(l.product) * l.qty, 0),
    [lines],
  );
  const taxCents = useMemo(() => computeTax(subtotal), [subtotal]);
  const total = subtotal + taxCents;

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

  function receiptItems(): ReceiptItem[] {
    return lines.map((l) => {
      const unit = effectivePriceCents(l.product);
      return { name: l.product.name, quantity: l.qty, unitCents: unit, lineCents: unit * l.qty };
    });
  }

  function charge(method: "cash" | "card", tenderCents?: number) {
    if (!lines.length) return;
    setError(null);
    start(async () => {
      const res = await createPosOrder({
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.qty })),
      });
      if (res.ok && res.orderNumber != null) {
        setDone({
          orderNumber: res.orderNumber,
          items: receiptItems(),
          subtotalCents: subtotal,
          taxCents,
          totalCents: total,
          paymentMethod: method,
          tenderCents,
          changeCents: tenderCents != null ? Math.max(0, tenderCents - total) : undefined,
          createdAt: new Date(),
        });
        setTicket(new Map());
        setTenderOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "Sale failed.");
      }
    });
  }

  if (done) {
    return (
      <div className="flex-1 flex items-start justify-center p-8 bg-wheat overflow-auto">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-orchard text-wheat flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <p className="section-label mb-2">Sale complete</p>
            <h2 className="font-serif text-4xl text-cider mb-1">{formatUSD(done.totalCents)}</h2>
            {done.paymentMethod === "cash" && done.changeCents != null && done.changeCents > 0 && (
              <p className="font-serif text-2xl text-orchard mt-2">Change: {formatUSD(done.changeCents)}</p>
            )}
            <p className="text-ink-soft font-light text-sm mt-2">
              Order #{done.orderNumber} · {locationName}
            </p>
          </div>

          <Receipt
            orderNumber={done.orderNumber}
            locationName={locationName}
            cashierName={cashierName}
            items={done.items}
            subtotalCents={done.subtotalCents}
            taxCents={done.taxCents}
            totalCents={done.totalCents}
            tenderCents={done.tenderCents}
            changeCents={done.changeCents}
            paymentMethod={done.paymentMethod}
            createdAt={done.createdAt}
          />

          <div className="flex gap-3 mt-6 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 text-sm tracking-widest uppercase font-light border border-meadow text-meadow hover:bg-meadow hover:text-wheat transition-colors"
            >
              Print Receipt
            </button>
            <button onClick={() => setDone(null)} className="flex-1 btn-primary">
              New Sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-wheat">
      <BarcodeListener onScan={addToTicket} />
      <PosCatalog products={products} categories={categories} canEdit={canEdit} onAdd={addToTicket} />

      <aside className="lg:w-96 bg-wheat-dark/60 border-t lg:border-t-0 lg:border-l border-meadow/15 flex flex-col">
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
                        {sale && <span className="ml-2 text-cider">sale</span>}
                      </p>
                    </div>
                    <div className="flex items-center border border-meadow/20">
                      <button
                        onClick={() => setQty(l.product.id, l.qty - 1)}
                        className="w-8 h-8 text-meadow hover:bg-meadow hover:text-wheat"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">{l.qty}</span>
                      <button
                        onClick={() => setQty(l.product.id, l.qty + 1)}
                        className="w-8 h-8 text-meadow hover:bg-meadow hover:text-wheat"
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

        <div className="px-6 py-5 border-t border-meadow/15 space-y-3">
          <div className="text-sm text-ink-soft font-light flex justify-between">
            <span>Subtotal</span>
            <span>{formatUSD(subtotal)}</span>
          </div>
          <div className="text-sm text-ink-soft font-light flex justify-between">
            <span>Tax (KS 6.5%)</span>
            <span>{formatUSD(taxCents)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-meadow/15">
            <span className="font-serif text-xl text-ink">Total</span>
            <span className="font-serif text-3xl text-cider">{formatUSD(total)}</span>
          </div>
          {error && <p className="text-sm text-cider font-light">{error}</p>}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setTenderOpen(true)}
              disabled={!lines.length || pending}
              className="py-4 text-sm tracking-widest uppercase font-light border border-meadow text-meadow hover:bg-meadow hover:text-wheat transition-colors disabled:opacity-40"
            >
              Cash
            </button>
            <button
              onClick={() => charge("card")}
              disabled={!lines.length || pending}
              className="py-4 text-sm tracking-widest uppercase font-light bg-cider text-wheat hover:bg-cider-deep transition-colors disabled:opacity-40"
            >
              {pending ? "…" : "Card"}
            </button>
          </div>
          <p className="text-[11px] text-ink-soft/60 font-light text-center">Ringing up at {locationName}</p>
        </div>
      </aside>

      {tenderOpen && (
        <CashTenderModal
          totalCents={total}
          onConfirm={(t) => charge("cash", t)}
          onCancel={() => setTenderOpen(false)}
          pending={pending}
        />
      )}
    </div>
  );
}
