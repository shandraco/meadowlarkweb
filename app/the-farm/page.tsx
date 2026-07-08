"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BranchDivider, LeafMark } from "@/components/Ornament";

export default function TheFarmPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[560px] flex items-end overflow-hidden">
        <Image
          src="/images/dog-blossom.jpg"
          alt="Meadowlark Farm orchard in bloom, Rose Hill, Kansas"
          fill
          priority
          className="estate-photo object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orchard-deep/90 via-orchard-deep/45 to-orchard-deep/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-28 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <p className="section-label text-amber mb-5">The Farm</p>
            <h1 className="font-serif text-7xl md:text-9xl text-cream leading-[1.0]">
              Grown here.
              <br />
              <em>Pressed here.</em>
              <br />
              <span className="text-amber/80">Always.</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Tom & Gina — full story */}
      <section className="py-28 md:py-44">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-12 gap-16 md:gap-12">

            {/* Sticky sidebar portrait */}
            <div className="md:col-span-5 md:col-start-1">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <Image
                    src="/images/cider-press.jpg"
                    alt="A Meadowlark founder working the cider press"
                    fill
                    className="estate-photo object-cover"
                  />
                </div>
                {/* Floating name card */}
                <div className="absolute -bottom-6 -right-4 md:-right-10 bg-amber text-meadow p-6 md:p-8 max-w-[220px]">
                  <p className="font-serif text-2xl leading-tight">Tom & Gina Brown</p>
                  <p className="text-xs tracking-widest uppercase font-light mt-2 opacity-80">Founders, Meadowlark Farm</p>
                  <p className="text-xs font-light mt-1 opacity-70">Est. 2010 · Rose Hill, KS</p>
                </div>
              </motion.div>

              {/* Second image */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.3 }}
                viewport={{ once: true }}
                className="mt-16 aspect-video relative overflow-hidden"
              >
                <Image
                  src="/images/tree-planting.jpg"
                  alt="Bare-root fruit trees ready to plant at Meadowlark Farm"
                  fill
                  className="estate-photo object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orchard-deep/95 via-orchard-deep/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <p className="font-serif text-6xl text-cream">5,000</p>
                  <p className="text-xs tracking-widest uppercase text-cream/90 font-light mt-1">Peach & apple trees planted</p>
                </div>
              </motion.div>
            </div>

            {/* Story text */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="md:col-span-6 md:col-start-7 pt-4"
            >
              <p className="section-label mb-6">Two lives abroad. One farm back home.</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight mb-10">
                From Pakistan and Afghanistan
                <br />
                <em>to the Kansas prairie.</em>
              </h2>

              <div className="space-y-6 text-stone font-light leading-relaxed text-base md:text-lg">
                <p className="drop-cap">
                  Tom and Gina Brown are Kansas born and raised. But for many years,
                  Kansas wasn't home. Tom spent time working in agriculture development
                  in Pakistan and Afghanistan. Gina provided healthcare in communities
                  far from the flatlands they grew up on.
                </p>
                <p>
                  They describe those years as "rich lives of creative work and friends
                  from all over the world." The kind of life that changes how you see a
                  place when you finally come back to it.
                </p>
                <p>
                  In 2010, they came home — and they came home with intention. With the
                  help of many friends, they planted approximately 5,000 peach and apple
                  trees east of Wichita on the Kansas prairie they'd always known. The
                  farm was open. Meadowlark had begun.
                </p>
              </div>

              {/* Pull quote */}
              <div className="my-12 border-l-2 border-maroon pl-8">
                <p className="font-serif text-3xl md:text-4xl text-orchard italic leading-snug">
                  "We love the good people of Kansas and we really enjoy our customers at the farm."
                </p>
                <p className="section-label mt-4">— Tom & Gina Brown</p>
              </div>

              <div className="space-y-6 text-stone font-light leading-relaxed text-base md:text-lg">
                <p>
                  The cidery grew from a simple conviction: that good cider comes
                  entirely from good fruit, grown on good land. At Meadowlark, every
                  apple that goes through the press was grown right here in Rose Hill.
                  No concentrate. No outside fruit. An estate cidery — one of the only
                  true estate cideries in Kansas.
                </p>
                <p>
                  They've been at it now for over fifteen years. The trees are mature.
                  The ciders have names and stories. And Tom and Gina are still the
                  ones walking the rows.
                </p>
              </div>

              <BranchDivider className="text-orchard my-12" />

              <div className="grid grid-cols-2 gap-8">
                {[
                  { n: "2010", label: "Founded" },
                  { n: "5,000", label: "Trees planted" },
                  { n: "30+", label: "Apple varieties" },
                  { n: "10", label: "Ciders on offer" },
                ].map((s) => (
                  <div key={s.n}>
                    <p className="font-serif text-6xl text-orchard">{s.n}</p>
                    <p className="text-xs tracking-widest uppercase font-light text-stone mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 md:py-36 bg-orchard-deep relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <p className="font-serif text-[20vw] text-cream whitespace-nowrap leading-none">Mission</p>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12">
          <p className="section-label text-amber mb-8 text-center">What We're About</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "✦", title: "Estate Cidery", body: "Every apple pressed at Meadowlark was grown here. No exceptions." },
              { icon: "✦", title: "Careful Land Stewardship", body: "Conscientious crop husbandry. We take care of the land because the land takes care of us." },
              { icon: "✦", title: "Supporting Local", body: "Our farm store carries eggs, cheese, honey, and produce from local Kansas farmers we trust." },
              { icon: "✦", title: "A Place for People", body: "A Kansas nature space for families and friends to walk, play, drink, eat, and enjoy." },
            ].map((item) => (
              <div key={item.title} className="border border-cream/10 p-8">
                <span className="text-amber text-sm block mb-4">{item.icon}</span>
                <h3 className="font-serif text-2xl text-cream mb-3">{item.title}</h3>
                <p className="text-cream/80 font-light text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The orchard through the seasons */}
      <section className="py-28 md:py-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <LeafMark className="w-5 h-8 text-maroon mx-auto mb-6" />
            <p className="section-label mb-4">The Year at Meadowlark</p>
            <h2 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight">
              Every season has
              <br />
              <em>its own language.</em>
            </h2>
          </div>

          <div className="space-y-0">
            {[
              {
                season: "Spring",
                months: "March – May",
                heading: "The orchard wakes up.",
                body: "Peach blossoms arrive first — pale pink against bare branches. Apple trees follow weeks later. Strawberries ripen in May, and we open for the first U-pick of the year.",
                image: "/images/peach-blossom.jpg",
              },
              {
                season: "Summer",
                months: "June – August",
                heading: "Peach season.",
                body: "July and August bring the peach harvest. We pick by hand, every one of them. What doesn't go to the stand or the kitchen goes straight to the press for our Peach Cider. The farm smells sweet and warm all month long.",
                image: "/images/cider-peeling.jpg",
              },
              {
                season: "Harvest",
                months: "August – October",
                heading: "The apple harvest.",
                body: "30+ varieties — Honeycrisp, Gala, heirlooms, and everything in between — come off the trees from August through October. The cidery presses through autumn. Fresh sweet cider (non-alcoholic) becomes available in October. The pumpkin patch opens.",
                image: "/images/cider-conveyor.jpg",
              },
              {
                season: "Winter",
                months: "November – February",
                heading: "Quiet patience.",
                body: "The cider ferments slowly in the cellar. We prune, we plan, we rest. The farm is open year-round — no appointment needed — but the pace slows. The best cider is patient. We've learned to be too.",
                image: "/images/bonfire.jpg",
              },
            ].map((s, i) => (
              <motion.div
                key={s.season}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`grid md:grid-cols-2 gap-0 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="aspect-video md:aspect-auto relative overflow-hidden min-h-[300px]">
                  <Image src={s.image} alt={s.season} fill className="estate-photo object-cover" />
                </div>
                <div className="p-12 md:p-16 lg:p-20 flex flex-col justify-center bg-cream-dark">
                  <div className="flex items-center gap-4 mb-6">
                    <p className="section-label">{s.season}</p>
                    <span className="h-px w-6 bg-amber/40" />
                    <p className="text-xs text-stone font-light">{s.months}</p>
                  </div>
                  <h3 className="font-serif text-4xl md:text-5xl text-orchard mb-5 leading-tight">
                    <em>{s.heading}</em>
                  </h3>
                  <p className="font-light text-stone leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orchard-deep text-cream py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <LeafMark className="w-5 h-8 text-amber mx-auto mb-8" />
          <h2 className="font-serif text-5xl md:text-6xl mb-8 leading-tight">
            Come see it for yourself.
          </h2>
          <p className="text-cream/85 font-light mb-10">
            Open Wed–Sun, 10am–5pm (Fri until 6:30). No appointment needed.
            <br />
            11249 SW 160th St, Rose Hill, KS 67133
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/visit" className="btn-primary bg-amber text-orchard hover:bg-amber-light">Plan Your Visit</Link>
            <Link href="/shop" className="btn-outline border-cream/50 text-cream hover:bg-cream/10">Shop Online</Link>
          </div>
        </div>
      </section>
    </>
  );
}
