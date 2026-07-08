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
        <LeafMark className="w-7 h-10 text-sunflower mx-auto mb-8" />
        <p className="section-label mb-4">Thank you</p>
        <h1 className="embossed font-serif text-5xl md:text-6xl text-meadow leading-tight mb-6">Order placed.</h1>
        {order && (
          <p className="text-ink-soft font-normal text-lg mb-2">
            Your order number is <span className="text-cider font-normal">#{order}</span>.
          </p>
        )}
        <p className="text-ink-soft font-normal leading-relaxed mb-6">
          A confirmation email is on its way. It includes a link you can bookmark to check on your order any time — no
          account needed.
        </p>
        <p className="text-xs text-stone font-normal mb-10">
          Don&apos;t see it in a minute or two? Check your spam folder, or text (316) 518-8907.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/store" className="btn-primary">
            Keep Shopping
          </Link>
          <Link href="/" className="btn-outline">
            Back Home
          </Link>
        </div>
      </div>
    </section>
  );
}
