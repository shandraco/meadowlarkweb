import Image from "next/image";
import Link from "next/link";
import BuyPassForm from "@/components/season-pass/BuyPassForm";
import { SEASON_PASS } from "@/lib/season-pass";
import { Sunflower, KansasOutline, SunflowerFlourish } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Season Pass | Meadowlark Farm",
  description: "Unlimited farm entry for a year. Kansas' best value in orchard tourism.",
};

const perks = [
  { title: "Unlimited entry", body: "As many visits as you want, Wed through Sun, all year." },
  { title: "Kids under 10 always free", body: "Bring the family. No separate pass needed for the little ones." },
  { title: "Skip the gate line", body: "Show your pass on your phone at the shop counter." },
  { title: "5% off the farm store", body: "Jams, mustard, apple butter, salsa — every visit." },
];

export default function SeasonPassPage() {
  return (
    <>
      <section className="relative min-h-[55vh] pt-24 md:pt-32 flex items-end overflow-hidden">
        <Image
          src="/images/pavilion.jpg"
          alt="The picnic pavilion and grounds at Meadowlark Farm"
          fill
          priority
          className="estate-photo object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep/90 via-meadow-deep/40 to-meadow-deep/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-20 w-full">
          <p className="text-xs tracking-widest uppercase font-light text-sunflower mb-4">Annual Pass</p>
          <h1 className="font-serif text-6xl md:text-8xl text-wheat leading-[1.0]">
            One year.
            <br />
            <em className="text-sunflower">Unlimited farm.</em>
          </h1>
          <p className="text-wheat/80 font-light text-lg mt-4 max-w-lg">
            The best value for anyone who wants to bring the family more than a few times a year — regular visitors save
            fast.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-14">
            <div>
              <div className="text-sunflower mb-6">
                <SunflowerFlourish className="text-sunflower" />
              </div>
              <p className="section-label mb-4">What&apos;s included</p>
              <h2 className="embossed font-serif text-4xl md:text-5xl text-meadow leading-tight mb-8">
                Pay once, come often.
              </h2>
              <ul className="space-y-5">
                {perks.map((p) => (
                  <li key={p.title} className="flex gap-4">
                    <Sunflower className="w-6 h-6 text-sunflower shrink-0 mt-1" />
                    <div>
                      <p className="font-serif text-xl text-meadow">{p.title}</p>
                      <p className="text-sm text-ink-soft font-light leading-relaxed">{p.body}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-6 border-t border-meadow/10">
                <p className="text-xs text-stone font-light mb-2 flex items-center gap-2">
                  <KansasOutline className="w-4 h-3 text-cider" />
                  Rose Hill, Kansas
                </p>
                <p className="text-sm text-ink-soft font-light leading-relaxed">
                  Pass covers admission only. Cider, farm store goods, u-pick fruit, and event tickets are separate.
                  Field trips and space bookings are their own thing —{" "}
                  <Link href="/visit/book" className="text-cider underline">
                    book those here
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div>
              <p className="section-label mb-3">Get your pass</p>
              <h3 className="font-serif text-3xl text-meadow mb-6">Now — issued in seconds.</h3>
              <BuyPassForm priceCents={SEASON_PASS.priceCents} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-wheat-dark">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <p className="section-label mb-2">Also worth knowing</p>
          <p className="text-ink-soft font-light leading-relaxed">
            Season passes are for one named holder. They&apos;re not transferable and don&apos;t stack with Cider Club
            member discounts. Kids under 10 always get in free — no pass needed.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/visit" className="btn-outline">
              Plan a Visit
            </Link>
            <Link href="/cider-club" className="btn-primary">
              Cider Club Instead →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
