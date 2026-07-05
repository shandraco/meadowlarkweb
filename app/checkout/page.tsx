"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/store/CartProvider";
import { formatUSD } from "@/lib/money";
import { placeOnlineOrder } from "./actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotalCents, count, clear, hydrated } = useCart();

  const requiresAgeCheck = useMemo(() => lines.some((l) => l.requiresAgeCheck), [lines]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "ship">("pickup");
  const [address, setAddress] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (requiresAgeCheck && !ageConfirmed) {
      setError("Please confirm you are 21 or older.");
      return;
    }
    setError(null);
    setLoading(true);
    const res = await placeOnlineOrder({
      lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      customer: { name, email, phone },
      fulfillment,
      address,
      ageConfirmed,
    });
    setLoading(false);
    if (res.ok && res.orderNumber) {
      clear();
      router.push(`/checkout/success?order=${res.orderNumber}`);
    } else {
      setError(res.error ?? "Something went wrong.");
    }
  }

  if (hydrated && count === 0) {
    return (
      <section className="pt-36 pb-40 min-h-[60vh]">
        <div className="max-w-md mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl text-ink mb-4">Nothing to check out.</h1>
          <p className="text-ink-soft font-light mb-8">Your basket is empty.</p>
          <Link href="/store" className="btn-primary">
            Browse the Cellar
          </Link>
        </div>
      </section>
    );
  }

  const inputCls =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-4 py-3 text-sm font-light outline-none focus:border-meadow transition-colors";

  return (
    <section className="pt-36 pb-28 md:pb-40">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <p className="section-label mb-3">Checkout</p>
        <h1 className="embossed font-serif text-5xl md:text-6xl text-ink leading-tight mb-12">Almost yours.</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <fieldset>
              <legend className="section-label mb-5">Contact</legend>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  className={inputCls}
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className={inputCls}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className={`${inputCls} sm:col-span-2`}
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="section-label mb-5">Fulfillment</legend>
              <div className="grid sm:grid-cols-2 gap-3">
                {(
                  [
                    { id: "pickup", label: "Farm Pickup", sub: "Held at the farm store — free" },
                    { id: "ship", label: "Ship to Me", sub: "KS, MO, CO, NE, OK · 21+ signature" },
                  ] as const
                ).map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setFulfillment(opt.id)}
                    className={`text-left p-5 border transition-colors ${
                      fulfillment === opt.id
                        ? "border-meadow bg-meadow text-paper"
                        : "border-meadow/20 hover:border-meadow/50"
                    }`}
                  >
                    <p className="font-serif text-xl leading-tight">{opt.label}</p>
                    <p className={`text-xs font-light mt-1 ${fulfillment === opt.id ? "text-paper/70" : "text-ink-soft"}`}>
                      {opt.sub}
                    </p>
                  </button>
                ))}
              </div>
              {fulfillment === "ship" && (
                <textarea
                  className={`${inputCls} mt-4`}
                  rows={3}
                  placeholder="Shipping address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              )}
            </fieldset>

            {requiresAgeCheck && (
              <fieldset>
                <legend className="section-label mb-5">Age Confirmation</legend>
                <label className="flex items-start gap-3 p-4 border border-meadow/20 bg-wheat/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-meadow"
                  />
                  <span className="text-sm text-ink font-light leading-snug">
                    I confirm I am 21 years of age or older. Carrier will verify ID on delivery — packages with no valid
                    21+ ID will be returned to the farm.
                  </span>
                </label>
              </fieldset>
            )}

            <fieldset>
              <legend className="section-label mb-5">Payment</legend>
              <div className="border border-meadow/20 bg-paper-dark/40 p-6">
                <p className="font-serif text-lg text-meadow mb-1">Settled at pickup or by invoice.</p>
                <p className="text-sm text-ink-soft font-light">
                  We&apos;ll reach out to arrange payment once your order is placed. Card processing coming online soon.
                </p>
              </div>
            </fieldset>

            {error && <p className="text-sm text-sunset font-light">{error}</p>}
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-paper-dark border border-meadow/10 p-8 sticky top-32">
              <p className="section-label mb-6">Your Order</p>
              <div className="space-y-3 mb-6 max-h-64 overflow-auto">
                {lines.map((l) => (
                  <div key={l.productId} className="flex justify-between gap-3 text-sm">
                    <span className="text-ink-soft font-light">
                      {l.name} <span className="text-ink-soft/60">× {l.quantity}</span>
                    </span>
                    <span className="text-ink whitespace-nowrap">{formatUSD(l.unitPriceCents * l.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-meadow/15 pt-5 flex justify-between items-baseline mb-8">
                <span className="font-serif text-xl text-ink">Total</span>
                <span className="font-serif text-2xl text-meadow">{formatUSD(subtotalCents)}</span>
              </div>
              <button
                type="submit"
                disabled={loading || (requiresAgeCheck && !ageConfirmed)}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? "Placing order…" : "Place Order"}
              </button>
              <Link
                href="/cart"
                className="block text-center text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors mt-5"
              >
                Back to Cart
              </Link>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}
