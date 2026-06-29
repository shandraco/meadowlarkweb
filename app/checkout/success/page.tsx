import Link from "next/link";
import { LeafMark } from "@/components/Ornament";

export const metadata = { title: "Order Confirmed | Meadowlark Farm" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <section className="pt-44 pb-40 min-h-[70vh]">
      <div className="max-w-xl mx-auto px-6 text-center">
        <LeafMark className="w-7 h-10 text-maroon mx-auto mb-8" />
        <p className="section-label mb-4">Thank you</p>
        <h1 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight mb-6">
          Order placed.
        </h1>
        {order && (
          <p className="text-stone font-light text-lg mb-2">
            Your order number is <span className="text-orchard font-normal">#{order}</span>.
          </p>
        )}
        <p className="text-stone font-light leading-relaxed mb-10">
          We&apos;ve recorded your order. You&apos;ll get a note when it&apos;s ready for pickup or
          on its way. (Demo mode — no payment was charged.)
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/store" className="btn-primary">Keep Shopping</Link>
          <Link href="/" className="btn-outline">Back Home</Link>
        </div>
      </div>
    </section>
  );
}
