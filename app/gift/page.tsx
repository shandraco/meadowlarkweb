import Image from "next/image";
import Link from "next/link";
import { getActivePlans } from "@/lib/subscriptions";
import BuyGiftForm from "@/components/gift/BuyGiftForm";
import { SunflowerFlourish } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Gift a Membership | Meadowlark Farm",
  description: "Send someone a Cider Club membership. Instant email, no shipping needed.",
};

export default async function GiftPage() {
  const plans = await getActivePlans();

  return (
    <>
      <section className="relative min-h-[50vh] pt-24 md:pt-32 flex items-end overflow-hidden">
        <Image
          src="/images/cider-bottles.jpg"
          alt="Meadowlark cider bottles"
          fill
          priority
          className="estate-photo object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep/90 via-meadow-deep/35 to-meadow-deep/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-14 w-full">
          <p className="text-xs tracking-widest uppercase font-light text-sunflower mb-4">Gift a Membership</p>
          <h1 className="font-serif text-5xl md:text-7xl text-wheat leading-tight">
            The best cider they&apos;ll
            <br />
            <em className="text-sunflower">get all year.</em>
          </h1>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="text-center text-sunflower mb-8">
            <SunflowerFlourish />
          </div>
          <p className="text-ink-soft font-light text-lg leading-relaxed text-center mb-12">
            Pick a plan, tell us who it&apos;s for, and we&apos;ll email them a claim link. They pick ship or pickup on redemption. You get invoiced when they claim — nothing sooner, nothing later.
          </p>

          <BuyGiftForm plans={plans} />

          <div className="mt-12 text-center">
            <Link href="/cider-club" className="text-xs tracking-widest uppercase text-cider hover:text-cider-deep">
              Not a gift? Buy for yourself →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
