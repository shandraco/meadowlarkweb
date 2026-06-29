"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/store/CartProvider";
import { formatUSD } from "@/lib/money";

export default function CartPage() {
  const { lines, subtotalCents, setQty, remove, count, hydrated } = useCart();

  return (
    <section className="pt-36 pb-28 md:pb-40 min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <p className="section-label mb-3">Your Order</p>
        <h1 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight mb-12">
          The basket.
        </h1>

        {!hydrated ? null : count === 0 ? (
          <div className="border-t border-orchard/10 pt-12 text-center">
            <p className="font-serif text-2xl text-orchard mb-3">Your basket is empty.</p>
            <p className="text-stone font-light mb-8">Add a few bottles from the cellar to begin.</p>
            <Link href="/store" className="btn-primary">Browse the Cellar</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Lines */}
            <div className="lg:col-span-2 divide-y divide-orchard/10 border-t border-orchard/10">
              {lines.map((l) => (
                <div key={l.productId} className="flex gap-5 py-6">
                  <Link href={`/store/${l.slug}`} className="relative w-24 h-28 shrink-0 overflow-hidden bg-cream-dark">
                    {l.imageUrl && (
                      <Image src={l.imageUrl} alt={l.name} fill sizes="96px" className="estate-photo object-cover" />
                    )}
                  </Link>

                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/store/${l.slug}`}>
                        <h3 className="font-serif text-xl text-orchard hover:text-maroon transition-colors">{l.name}</h3>
                      </Link>
                      <p className="font-serif text-lg text-orchard whitespace-nowrap">
                        {formatUSD(l.unitPriceCents * l.quantity)}
                      </p>
                    </div>
                    <p className="text-sm text-stone font-light mt-1">{formatUSD(l.unitPriceCents)} each</p>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-orchard/20">
                        <button
                          onClick={() => setQty(l.productId, l.quantity - 1)}
                          className="w-9 h-9 text-orchard hover:bg-orchard hover:text-cream transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm text-orchard tabular-nums">{l.quantity}</span>
                        <button
                          onClick={() => setQty(l.productId, l.quantity + 1)}
                          className="w-9 h-9 text-orchard hover:bg-orchard hover:text-cream transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(l.productId)}
                        className="text-xs tracking-widest uppercase font-light text-stone hover:text-maroon transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <aside className="lg:col-span-1">
              <div className="bg-cream-dark border border-orchard/10 p-8 sticky top-32">
                <p className="section-label mb-6">Order Summary</p>
                <div className="flex justify-between text-stone font-light mb-3">
                  <span>Subtotal</span>
                  <span className="text-orchard">{formatUSD(subtotalCents)}</span>
                </div>
                <div className="flex justify-between text-stone font-light mb-3">
                  <span>Shipping</span>
                  <span className="text-stone/70">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-stone font-light mb-6">
                  <span>Tax</span>
                  <span className="text-stone/70">Calculated at checkout</span>
                </div>
                <div className="border-t border-orchard/15 pt-5 flex justify-between items-baseline mb-8">
                  <span className="font-serif text-xl text-orchard">Total</span>
                  <span className="font-serif text-2xl text-orchard">{formatUSD(subtotalCents)}</span>
                </div>
                <Link href="/checkout" className="btn-primary w-full text-center">
                  Proceed to Checkout
                </Link>
                <Link
                  href="/store"
                  className="block text-center text-xs tracking-widest uppercase font-light text-stone hover:text-orchard transition-colors mt-5"
                >
                  Continue Shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
