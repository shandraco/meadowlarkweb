"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BranchDivider, LeafMark, CircleText } from "@/components/Ornament";
import RemindMe from "@/components/RemindMe";
import FarmVideos from "@/components/home/FarmVideos";
import type { HomepageContent } from "@/lib/content";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.14 } } };

const marqueeItems = [
  "Meadowlark Red",
  "Meadowlark Gold",
  "Meadow Hopper",
  "Peach Cider",
  "Blackberry Cider",
  "Farmhouse Funk",
  "Scrumpy",
  "Prize 22",
  "All Seasons",
  "Strawberry Cider",
];
const marqueeStr = marqueeItems.map((i) => `${i}  ·  `).join("");

const stats = [
  { number: "5,000", label: "Peach & apple trees planted" },
  { number: "2010", label: "Year the farm was founded" },
  { number: "30+", label: "Apple varieties in the orchard" },
  { number: "10", label: "Ciders on offer" },
];

// Format a tap-list "bottles" text block as parsed tier rows. One row per line.
function parseTiers(text: string): { tier: string; price: string; names: string; desc: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s*·\s*/);
      const [tier = "", price = "", names = "", ...rest] = parts;
      return { tier, price, names, desc: rest.join(" · ") };
    });
}

export default function HomeView({ content }: { content: HomepageContent }) {
  const { hero, banner, story, tapList, activities, admission, clubTeaser, farmVideos } = content;

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const tiers = parseTiers(tapList.bottles);

  return (
    <>
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen min-h-[640px] flex items-end overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src={hero.imageUrl}
            alt="Meadowlark Farm orchard rows at golden hour, Rose Hill, Kansas"
            fill
            priority
            className="estate-photo object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep/85 via-meadow-deep/30 to-transparent" />

        {/* spinning badge */}
        <div className="absolute top-28 right-8 md:top-32 md:right-16 w-24 h-24 md:w-32 md:h-32 text-paper">
          <CircleText text="ESTATE CIDERY · ROSE HILL KS · SINCE 2010 · " className="w-full h-full" />
          <Image
            src="/images/meadowlark-logo.png"
            alt=""
            width={48}
            height={48}
            className="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 object-contain"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-32 w-full">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">
            <motion.p variants={fadeUp} className="text-xs tracking-widest uppercase font-light text-wheat mb-5">
              {hero.label}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-serif text-7xl md:text-9xl text-paper leading-[1.0] mb-8 tracking-tight"
            >
              {hero.line1}
              <br />
              {hero.line2}
              <br />
              <em className="text-wheat-light">{hero.emphasis}</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-paper/80 font-light text-lg md:text-xl leading-relaxed mb-12 max-w-xl"
            >
              {hero.body}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link href={hero.primaryHref} className="btn-accent">
                {hero.primaryLabel}
              </Link>
              <Link
                href={hero.secondaryHref}
                className="btn-outline border-paper/50 text-paper hover:bg-paper/10 hover:border-paper"
              >
                {hero.secondaryLabel}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* scroll line */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-paper/40">
          <span className="text-xs tracking-widest uppercase font-light">Scroll</span>
          <div className="h-10 w-px bg-paper/30 animate-pulse" />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="bg-meadow-deep py-5 overflow-hidden flex gap-0">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          <span className="font-serif text-xl md:text-2xl text-paper/60 italic pr-0">
            {marqueeStr}
            {marqueeStr}
          </span>
        </div>
      </div>

      {/* ── SEASONAL BANNER ── */}
      <div className="bg-sunset text-paper">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-xs tracking-widest uppercase font-light opacity-70">{banner.eyebrow}</span>
            <span className="h-px w-6 bg-paper/40" />
            <span className="font-serif text-lg md:text-xl">{banner.line1}</span>
            <span className="hidden md:inline h-4 w-px bg-paper/30" />
            <span className="font-serif text-lg md:text-xl opacity-80">{banner.line2}</span>
          </div>
          <Link
            href={banner.ctaHref}
            className="text-xs tracking-widest uppercase font-light border border-paper/40 px-5 py-2 hover:bg-paper/10 transition-colors whitespace-nowrap shrink-0"
          >
            {banner.ctaLabel}
          </Link>
        </div>
      </div>

      {/* ── PROVENANCE STRIP ── */}
      <section className="border-b border-meadow/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
            {[
              { mark: "Estate-Grown", sub: "Every apple from our own trees" },
              { mark: "No Concentrate", sub: "Whole-fruit pressed, never reconstituted" },
              { mark: "Wild-Fermented", sub: "Native orchard yeasts" },
              { mark: "Unfiltered", sub: "Nothing stripped from the glass" },
            ].map((p, i) => (
              <motion.div
                key={p.mark}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center px-2"
              >
                <LeafMark className="w-3.5 h-5 text-meadow mb-3" />
                <p className="font-serif text-xl md:text-2xl text-ink leading-none mb-2">{p.mark}</p>
                <p className="text-xs tracking-wide font-light text-stone leading-snug">{p.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAT BLOCK ── */}
      <section className="py-20 md:py-24 bg-paper-dark border-b border-meadow/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-meadow/10">
            {stats.map((s, i) => (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="px-6 md:px-10 py-4 text-center first:pl-0 last:pr-0"
              >
                <p className="font-serif text-6xl md:text-7xl text-meadow mb-2">{s.number}</p>
                <p className="text-xs tracking-widest uppercase font-light text-stone">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY (CMS-driven) ── */}
      <section className="py-28 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-12 gap-16 md:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="md:col-span-5 relative"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image src={story.primaryImageUrl} alt="Tom and Gina Brown at Meadowlark Farm" fill className="estate-photo object-cover" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                viewport={{ once: true }}
                className="absolute -bottom-10 -right-6 md:-right-12 w-2/3 aspect-square overflow-hidden border-4 border-paper"
              >
                <Image src={story.secondaryImageUrl} alt="The orchard in full bloom" fill className="estate-photo object-cover" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="md:col-span-6 md:col-start-7 pt-8 md:pt-0"
            >
              <p className="section-label mb-6">{story.eyebrow}</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl lg:text-7xl text-ink leading-tight mb-8">
                {story.headline}
                <br />
                <em>{story.emphasis}</em>
              </h2>

              <div className="space-y-5 text-ink-soft font-light leading-relaxed text-base">
                <p className="drop-cap">{story.paragraph1}</p>
                <p>{story.paragraph2}</p>
                <p>{story.paragraph3}</p>
              </div>

              <div className="mt-10 pl-6 border-l-2 border-wheat">
                <p className="font-serif text-2xl md:text-3xl text-meadow italic leading-snug">&ldquo;{story.quote}&rdquo;</p>
                <p className="section-label mt-4">{story.attribution}</p>
              </div>

              <Link href="/the-farm" className="btn-outline mt-10 inline-block">
                Read the Full Story
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER — BIG TYPE ── */}
      <section className="py-20 md:py-28 bg-meadow-deep overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <p className="font-serif text-[22vw] text-paper whitespace-nowrap leading-none">Estate Cider</p>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center">
          <LeafMark className="w-6 h-9 text-wheat mx-auto mb-8" />
          <p className="font-serif text-4xl md:text-6xl lg:text-7xl text-paper leading-tight">
            Every apple pressed at Meadowlark
            <br />
            <em className="text-wheat-light">was grown on this land.</em>
          </p>
          <p className="text-paper/50 font-light text-sm tracking-widest uppercase mt-8">100% Estate · Rose Hill, Kansas</p>
        </div>
      </section>

      {/* ── TAP LIST / TIERS ── */}
      <section className="py-20 md:py-28 bg-paper-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="section-label mb-4">{tapList.eyebrow}</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-ink leading-tight">
                {tapList.headline}
                <br />
                <em>{tapList.emphasis}</em>
              </h2>
            </div>
            <Link href="/store" className="btn-outline self-start md:self-auto whitespace-nowrap">
              Shop the Cellar →
            </Link>
          </div>
          {tapList.intro && <p className="text-ink-soft font-light max-w-2xl mb-10">{tapList.intro}</p>}
          <BranchDivider className="text-meadow mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-meadow/10 border border-meadow/10">
            {tiers.map((t, i) => (
              <motion.div
                key={t.tier + i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-paper p-10 md:p-12"
              >
                <p className="section-label mb-2">{t.tier}</p>
                <p className="font-serif text-6xl text-meadow mb-4">{t.price}</p>
                <p className="font-serif text-sm text-ink-soft italic mb-6 leading-relaxed">{t.names}</p>
                <div className="h-px w-10 bg-wheat mb-6" />
                <p className="text-sm text-ink-soft font-light leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
          <BranchDivider className="text-meadow mt-12" />
        </div>
      </section>

      {/* ── CIDER CLUB CTA — full bleed ── */}
      <section className="relative py-36 md:py-52 overflow-hidden">
        <Image src={clubTeaser.imageUrl} alt="Orchard rows at dusk" fill className="estate-photo object-cover object-center scale-105" />
        <div className="absolute inset-0 bg-meadow-deep/85" />
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <p
            className="font-serif leading-none whitespace-nowrap text-transparent"
            style={{
              fontSize: "clamp(5rem, 18vw, 18rem)",
              WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            }}
          >
            {clubTeaser.eyebrow}
          </p>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true }}>
            <p className="text-xs tracking-widest uppercase font-light text-wheat mb-6">{clubTeaser.eyebrow}</p>
            <h2 className="font-serif text-5xl md:text-7xl text-paper mb-6 leading-tight">
              {clubTeaser.headline}
              <br />
              <em>{clubTeaser.emphasis}</em>
            </h2>
            <p className="text-paper/70 font-light text-lg leading-relaxed mb-4 max-w-xl mx-auto">{clubTeaser.body}</p>
            <p className="text-paper/50 font-light text-sm mb-12">{clubTeaser.fineprint}</p>
            <Link href={clubTeaser.ctaHref} className="btn-accent">
              {clubTeaser.ctaLabel}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── ACTIVITIES ── */}
      <section className="py-28 md:py-40 bg-paper-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-start mb-16">
            <div>
              <p className="section-label mb-4">{activities.eyebrow}</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-ink leading-tight">
                {activities.headline}
                <br />
                <em>{activities.emphasis}</em>
              </h2>
            </div>
            <div className="text-ink-soft font-light leading-relaxed md:pt-12 space-y-4">
              <p>{activities.paragraph1}</p>
              <p>{activities.paragraph2}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Cider Flights", sub: "Order a flight in the tap room", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80" },
              { label: "U-Pick Orchard", sub: "Strawberries, peaches, 30+ apple varieties", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80" },
              { label: "Disc Golf", sub: "Family-friendly 9-hole course", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=700&q=80" },
              { label: "Pumpkin Patch", sub: "October weekends", image: "https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=700&q=80" },
              { label: "Farm Store", sub: "Jams, mustard, apple butter, salsa, honey", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=700&q=80" },
              { label: "Live Music", sub: "Concerts & cider-pairing events", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=80" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                viewport={{ once: true }}
                className="group relative aspect-square overflow-hidden"
              >
                <Image src={item.image} alt={item.label} fill className="estate-photo object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep/80 via-meadow-deep/10 to-transparent group-hover:from-meadow-deep/90 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                  <h3 className="font-serif text-xl md:text-2xl text-paper leading-tight">{item.label}</h3>
                  <p className="text-xs text-paper/60 font-light mt-1 hidden md:block">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/visit" className="btn-outline">
              See Everything at the Farm
            </Link>
          </div>
        </div>
      </section>

      {/* ── FARM VIDEOS ── */}
      <FarmVideos block={farmVideos} />

      {/* ── SEASON REMINDERS ── */}
      <RemindMe variant="section" />

      {/* ── ADMISSION NOTE ── */}
      <section className="bg-meadow-deep text-paper py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-paper/10">
            {[
              { label: "Admission", value: admission.admissionValue, sub: admission.admissionSub },
              { label: "Hours", value: admission.hoursValue, sub: admission.hoursSub },
              { label: "Location", value: admission.locationValue, sub: admission.locationSub },
            ].map((item) => (
              <div key={item.label} className="md:px-10 first:pl-0 last:pr-0 text-center md:text-left">
                <p className="text-xs tracking-widest uppercase font-light text-wheat mb-2">{item.label}</p>
                <p className="font-serif text-4xl text-paper mb-1">{item.value}</p>
                <p className="text-sm text-paper/50 font-light">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
