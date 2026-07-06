import Link from "next/link";
import OrderLookup from "@/components/orders/OrderLookup";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order Lookup | Meadowlark Farm" };

export default async function OrderLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; order?: string }>;
}) {
  const { token, order } = await searchParams;

  return (
    <section className="pt-36 pb-28 md:pb-40 min-h-[60vh]">
      <div className="max-w-xl mx-auto px-6 md:px-12">
        <Link
          href="/"
          className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors"
        >
          ← Home
        </Link>
        <p className="section-label mt-6 mb-2">Your order</p>
        <h1 className="font-serif text-5xl md:text-6xl text-meadow leading-tight mb-4">
          {order ? `#${order}` : "Order lookup"}
        </h1>
        <p className="text-ink-soft font-light mb-10">
          {token
            ? "One quick email check and we'll show you the receipt."
            : "Every order confirmation email includes a personal link to view your receipt."}
        </p>

        <OrderLookup initialToken={token} />

        <p className="mt-8 text-xs text-stone font-light text-center">
          Questions? Text <a href="sms:3165188907" className="text-cider">(316) 518-8907</a> or reply to your
          confirmation email.
        </p>
      </div>
    </section>
  );
}
