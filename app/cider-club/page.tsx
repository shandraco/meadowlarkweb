import Image from "next/image";
import { getActivePlans } from "@/lib/subscriptions";
import JoinClubForm from "@/components/club/JoinClubForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Cider Club | Meadowlark Farm",
  description: "First from the press, every season. Join the Meadowlark Cider Club for early access to every batch.",
};

export default async function CiderClubPage() {
  const plans = await getActivePlans();

  return (
    <>
      <section className="relative min-h-[60vh] pt-24 md:pt-32 flex items-end overflow-hidden">
        <Image
          src="/images/cider-bottling.jpg"
          alt="Bottling estate cider at Meadowlark Farm"
          fill
          priority
          className="estate-photo object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep/85 via-meadow-deep/25 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24 w-full">
          <p className="text-xs tracking-widest uppercase font-light text-wheat mb-4">Cider Club</p>
          <h1 className="font-serif text-6xl md:text-8xl text-paper leading-tight">
            First from the press.
            <br />
            <em>Every season.</em>
          </h1>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <p className="section-label mb-6">How it works</p>
          <h2 className="section-heading mb-8">
            Cider the way it should be — <em>anticipated.</em>
          </h2>
          <p className="text-ink-soft font-light text-lg leading-relaxed">
            Members get their allocation before each release goes public. Every shipment includes a hand-stamped postcard
            with tasting notes, and — sometimes — a scent card from the orchard.
          </p>
        </div>
      </section>

      <section className="py-14 bg-paper-dark">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "1", title: "Choose your tier", body: "All tiers ship or hold before public sale." },
              { n: "2", title: "We press", body: "Four seasonal batches per year, from orchard fruit." },
              { n: "3", title: "You get first access", body: "Your allocation ships to your door or waits at the farm." },
              { n: "4", title: "Come visit anytime", body: "Members drink free on their first tasting room visit." },
            ].map((s) => (
              <div key={s.n}>
                <p className="font-serif text-7xl text-wheat/50 mb-4">{s.n}</p>
                <h3 className="font-serif text-xl text-ink mb-3">{s.title}</h3>
                <p className="text-sm text-ink-soft font-light leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-36">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <p className="section-label mb-4">Join the club</p>
            <h2 className="section-heading">Pick a plan.</h2>
          </div>
          <JoinClubForm plans={plans} />
        </div>
      </section>

      <section className="py-24 bg-paper-dark">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h2 className="section-heading mb-12 text-center">Questions.</h2>
          <div className="space-y-px">
            {[
              { q: "When do releases ship?", a: "Within the first two weeks of each season. You'll get an email when your box is packed." },
              { q: "Can I pick up instead of ship?", a: "Yes — pick 'Farm pickup' at sign-up. Members often combine pickup with a farm visit." },
              { q: "What states do you ship to?", a: "Currently KS, MO, CO, NE, OK. Members in other states use farm pickup." },
              { q: "Can I cancel?", a: "Pause or cancel any time from your member link. No fees, no runaround." },
              { q: "Is this a gift option?", a: "Yes — pick a plan on our /gift page. They'll get a claim link by email; you're only charged when they redeem." },
            ].map((item) => (
              <details key={item.q} className="group bg-paper">
                <summary className="flex items-center justify-between px-8 py-6 cursor-pointer list-none">
                  <span className="font-serif text-xl text-ink">{item.q}</span>
                  <span className="text-meadow text-xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="px-8 pb-6 text-ink-soft font-light text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
