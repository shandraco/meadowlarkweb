"use client";

import { formatUSD } from "@/lib/money";

// 58mm-thermal-friendly receipt. Rendered inside a print container that
// hides the rest of the POS chrome when the browser print dialog opens.
// A generic printer works too — the print CSS just widens the box.

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitCents: number;
  lineCents: number;
}

export default function Receipt({
  orderNumber,
  locationName,
  cashierName,
  items,
  subtotalCents,
  taxCents,
  totalCents,
  tenderCents,
  changeCents,
  paymentMethod,
  createdAt,
}: {
  orderNumber: number;
  locationName: string;
  cashierName: string;
  items: ReceiptItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  tenderCents?: number;
  changeCents?: number;
  paymentMethod: "cash" | "card";
  createdAt: Date;
}) {
  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pos-receipt,
          #pos-receipt * {
            visibility: visible;
          }
          #pos-receipt {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 0;
          }
        }
      `}</style>
      <div
        id="pos-receipt"
        className="max-w-xs mx-auto bg-white p-4 text-black font-mono text-xs leading-snug"
        style={{ width: "58mm" }}
      >
        <div className="text-center border-b border-black/30 pb-2 mb-2">
          <p className="font-bold text-sm">MEADOWLARK FARM</p>
          <p>Orchard &amp; Cidery</p>
          <p>11249 SW 160th St, Rose Hill KS</p>
          <p>(316) 518-8907</p>
        </div>

        <div className="flex justify-between mb-2">
          <span>Order #{orderNumber}</span>
          <span>{createdAt.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between mb-3">
          <span>{createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <span>{locationName}</span>
        </div>

        <div className="border-t border-black/30 pt-2 mb-2">
          {items.map((it, i) => (
            <div key={i} className="mb-1">
              <div className="flex justify-between">
                <span className="truncate max-w-[70%]">{it.name}</span>
                <span>{formatUSD(it.lineCents)}</span>
              </div>
              <div className="text-black/60 pl-1">
                {it.quantity} × {formatUSD(it.unitCents)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-black/30 pt-2 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatUSD(subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatUSD(taxCents)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-black/40 pt-1">
            <span>TOTAL</span>
            <span>{formatUSD(totalCents)}</span>
          </div>
          {paymentMethod === "cash" && tenderCents != null && changeCents != null && (
            <>
              <div className="flex justify-between pt-1">
                <span>Cash</span>
                <span>{formatUSD(tenderCents)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Change</span>
                <span>{formatUSD(changeCents)}</span>
              </div>
            </>
          )}
          {paymentMethod === "card" && (
            <div className="text-center pt-1">— CARD —</div>
          )}
        </div>

        <div className="text-center border-t border-black/30 pt-2 mt-3">
          <p>Cashier: {cashierName}</p>
          <p className="mt-2">Thank you!</p>
          <p>themeadowlarkfarm.com</p>
        </div>
      </div>
    </>
  );
}
