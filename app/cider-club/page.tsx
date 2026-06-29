"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const tiers = [
  {
    name: "Orchard",
    price: "$120",
    period: "per season",
    description: "Two bottles of each seasonal release, four times a year.",
    perks: [
      "2 bottles per seasonal release",
      "Ships before public sale",
      "Tasting notes from the cidery",
      "10% off all shop purchases",
    ],
    highlight: false,
  },
  {
    name: "Reserve",
    price: "$220",
    period: "per season",
    description: "Everything in Orchard, plus exclusive small-batch and barrel-aged releases.",
    perks: [
      "4 bottles per seasonal release",
      "Access to barrel-aged & experimental batches",
      "Ships before public sale",
      "Tasting notes from the cidery",
      "15% off all shop purchases",
      "Annual farm dinner invitation",
    ],
    highlight: true,
  },
];

export default function CiderClubPage() {
  const [selectedTier, setSelectedTier] = useState("Reserve");

  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[450px] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=80"
          alt="Kansas countryside at dusk"
          fill
          priority
          className="estate-photo object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orchard/85 via-orchard/20 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <p className="section-label text-amber mb-4">Cider Club</p>
            <h1 className="font-serif text-6xl md:text-8xl text-cream leading-tight">
              First from the press.
              <br />
              <em>Every season.</em>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="section-label mb-6">How it works</p>
            <h2 className="section-heading mb-8">
              Cider the way it should be —
              <br />
              <em>anticipated.</em>
            </h2>
            <p className="text-stone font-light text-lg leading-relaxed">
              We press four times a year: a spring release, a summer peach
              release, the autumn harvest release, and a winter cellar release.
              Cider Club members get their allocation shipped before anything
              goes public — and they never miss a batch.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="py-16 bg-cream-dark">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "1", title: "Choose your tier", body: "Orchard or Reserve — both ship before public sale." },
              { n: "2", title: "We press", body: "Four seasonal batches per year, made from orchard fruit." },
              { n: "3", title: "You get first access", body: "Your allocation ships or is held for farm pickup." },
              { n: "4", title: "Come visit anytime", body: "Members drink free on your first tasting room visit." },
            ].map((s) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <p className="font-serif text-7xl text-maroon/40 mb-4">{s.n}</p>
                <h3 className="font-serif text-xl text-orchard mb-3">{s.title}</h3>
                <p className="text-sm text-stone font-light leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier cards */}
      <section className="py-24 md:py-36">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="section-label mb-4">Membership Tiers</p>
            <h2 className="section-heading">Choose your level.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tiers.map((t) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                onClick={() => setSelectedTier(t.name)}
                className={`p-10 cursor-pointer border-2 transition-all duration-300 ${
                  t.highlight
                    ? "border-amber bg-orchard text-cream"
                    : "border-cream-dark bg-cream hover:border-orchard/30"
                }`}
              >
                {t.highlight && (
                  <p className="section-label text-amber mb-4">Most Popular</p>
                )}
                <h3 className={`font-serif text-4xl mb-1 ${t.highlight ? "text-cream" : "text-orchard"}`}>
                  {t.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className={`font-serif text-5xl ${t.highlight ? "text-cream" : "text-orchard"}`}>
                    {t.price}
                  </span>
                  <span className={`text-sm font-light ${t.highlight ? "text-cream/60" : "text-stone"}`}>
                    {t.period}
                  </span>
                </div>
                <p className={`font-light text-sm mb-8 ${t.highlight ? "text-cream/75" : "text-stone"}`}>
                  {t.description}
                </p>
                <ul className="space-y-3 mb-10">
                  {t.perks.map((perk) => (
                    <li key={perk} className={`flex items-start gap-3 text-sm font-light ${t.highlight ? "text-cream/80" : "text-stone"}`}>
                      <span className={`mt-0.5 text-xs ${t.highlight ? "text-amber" : "text-maroon"}`}>✦</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 text-xs tracking-widest uppercase font-light transition-colors ${
                    t.highlight
                      ? "bg-amber text-orchard hover:bg-amber-light"
                      : "border border-orchard text-orchard hover:bg-orchard hover:text-cream"
                  }`}
                >
                  Join {t.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-cream-dark">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h2 className="section-heading mb-12 text-center">Questions.</h2>
          <div className="space-y-px">
            {[
              { q: "When do releases ship?", a: "We ship within the first two weeks of each season. You'll get an email when your box is packed." },
              { q: "Can I pick up instead of ship?", a: "Yes — choose farm pickup at checkout and we'll hold your allocation. Many members combine pickup with a farm visit." },
              { q: "What states do you ship to?", a: "We currently ship to Kansas, Missouri, Colorado, Nebraska, and Oklahoma. More states coming. Members in other states can always use farm pickup." },
              { q: "Can I cancel?", a: "You can pause or cancel before the next season's charge. No fees, no runaround." },
              { q: "Is this a gift option?", a: "Yes. Select 'Gift Membership' at checkout and we'll include a card and the recipient handles their own shipping details." },
            ].map((item) => (
              <details key={item.q} className="group bg-cream">
                <summary className="flex items-center justify-between px-8 py-6 cursor-pointer list-none">
                  <span className="font-serif text-xl text-orchard">{item.q}</span>
                  <span className="text-maroon text-xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="px-8 pb-6 text-stone font-light text-sm leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
