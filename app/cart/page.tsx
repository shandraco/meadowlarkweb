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
        <h1 className="embossed font-serif text-5xl md:text-6xl text-ink leading-tight mb-12">The basket.</h1>

        {!hydrated ? null : count === 0 ? (
          <div className="border-t border-meadow/10 pt-12 text-center">
            <p className="font-serif text-2xl text-meadow mb-3">Your basket is empty.</p>
            <p className="text-ink-soft font-light mb-8">Add a few bottles from the cellar to begin.</p>
            <Link href="/store" className="btn-primary">
              Browse the Cellar
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 divide-y divide-meadow/10 border-t border-meadow/10">
              {lines.map((l) => (
                <div key={l.productId} className="flex gap-5 py-6">
                  <Link href={`/store/${l.slug}`} className="relative w-24 h-28 shrink-0 overflow-hidden bg-paper-dark">
                    {l.imageUrl && (
                      <Image src={l.imageUrl} alt={l.name} fill sizes="96px" className="estate-photo object-cover" />
                    )}
                  </Link>

                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/store/${l.slug}`}>
                        <h3 className="font-serif text-xl text-ink hover:text-meadow transition-colors">{l.name}</h3>
                      </Link>
                      <p className="font-serif text-lg text-meadow whitespace-nowrap">
                        {formatUSD(l.unitPriceCents * l.quantity)}
                      </p>
                    </div>
                    <p className="text-sm text-ink-soft font-light mt-1">{formatUSD(l.unitPriceCents)} each</p>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-meadow/20">
                        <button
                          onClick={() => setQty(l.productId, l.quantity - 1)}
                          className="w-9 h-9 text-meadow hover:bg-meadow hover:text-paper transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm text-ink tabular-nums">{l.quantity}</span>
                        <button
                          onClick={() => setQty(l.productId, l.quantity + 1)}
                          className="w-9 h-9 text-meadow hover:bg-meadow hover:text-paper transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(l.productId)}
                        className="text-xs tracking-widest uppercase font-light text-stone hover:text-sunset transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-paper-dark border border-meadow/10 p-8 sticky top-32">
                <p className="section-label mb-6">Order Summary</p>
                <div className="flex justify-between text-ink-soft font-light mb-3">
                  <span>Subtotal</span>
                  <span className="text-ink">{formatUSD(subtotalCents)}</span>
                </div>
                <div className="flex justify-between text-ink-soft font-light mb-3">
                  <span>Shipping</span>
                  <span className="text-ink-soft/70">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-ink-soft font-light mb-6">
                  <span>Tax</span>
                  <span className="text-ink-soft/70">Calculated at checkout</span>
                </div>
                <div className="border-t border-meadow/15 pt-5 flex justify-between items-baseline mb-8">
                  <span className="font-serif text-xl text-ink">Total</span>
                  <span className="font-serif text-2xl text-meadow">{formatUSD(subtotalCents)}</span>
                </div>
                <Link href="/checkout" className="btn-primary w-full text-center">
                  Proceed to Checkout
                </Link>
                <Link
                  href="/store"
                  className="block text-center text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors mt-5"
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
