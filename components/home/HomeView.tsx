"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BranchDivider, LeafMark, CircleText } from "@/components/Ornament";
import RemindMe from "@/components/RemindMe";
import FarmVideos from "@/components/home/FarmVideos";
import type { HomepageContent } from "@/lib/content";
import type { FarmStatus } from "@/lib/farm-hours";

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

export default function HomeView({
  content,
  farmStatus,
}: {
  content: HomepageContent;
  farmStatus: FarmStatus;
}) {
  const { hero, banner, story, tapList, activities, admission, clubTeaser, farmVideos } = content;

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const tiers = parseTiers(tapList.bottles);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────
          Above the fold shows: name, tagline, address, hours, admission,
          and the two most-used CTAs. Everything a first-time visitor needs
          to know whether to come today OR shop now, without scrolling. */}
      <section ref={heroRef} className="relative h-screen min-h-[720px] flex items-end overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src={hero.imageUrl}
            alt="Meadowlark Farm orchard rows at golden hour, Rose Hill, Kansas"
            fill
            priority
            className="estate-photo object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep/90 via-meadow-deep/40 to-meadow-deep/10" />

        {/* Spinning brand badge */}
        <div className="absolute top-28 right-8 md:top-32 md:right-16 w-24 h-24 md:w-32 md:h-32 text-wheat">
          <CircleText text="ESTATE CIDERY · ROSE HILL KS · SINCE 2010 · " className="w-full h-full" />
          <Image
            src="/images/meadowlark-logo.png"
            alt=""
            width={48}
            height={48}
            className="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 object-contain"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-20 w-full">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">
            <motion.p variants={fadeUp} className="text-xs tracking-widest uppercase font-light text-sunflower mb-4">
              {hero.label}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-serif text-6xl md:text-8xl lg:text-9xl text-wheat leading-[1.0] mb-6 tracking-tight"
            >
              {hero.line1}
              <br />
              {hero.line2}
              <br />
              <em className="text-sunflower">{hero.emphasis}</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-wheat/85 font-light text-lg md:text-xl leading-relaxed mb-8 max-w-xl"
            >
              {hero.body}
            </motion.p>

            {/* Immediate facts strip — the "can I come now, where is it" info
                the client wants visible without scrolling. */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8 text-wheat/80 text-sm font-light"
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${farmStatus.open ? "bg-sunflower" : "bg-wheat/40"}`}
                  aria-hidden
                />
                <span className={farmStatus.open ? "text-sunflower" : ""}>
                  {farmStatus.open ? `Open now · ${farmStatus.todayLabel}` : farmStatus.nextOpenLabel ?? "Closed today"}
                </span>
              </span>
              <span className="w-1 h-1 rounded-full bg-wheat/30" />
              <span>{admission.locationValue} · {admission.locationSub.split(" · ")[0]}</span>
              <span className="hidden md:inline w-1 h-1 rounded-full bg-wheat/30" />
              <span className="hidden md:inline">Admission {admission.admissionValue}</span>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link href={hero.primaryHref} className="btn-accent">
                {hero.primaryLabel}
              </Link>
              <Link
                href={hero.secondaryHref}
                className="btn-outline border-wheat/60 text-wheat hover:bg-wheat/10 hover:border-wheat"
              >
                {hero.secondaryLabel}
              </Link>
              <Link
                href="/visit"
                className="btn-outline border-wheat/30 text-wheat/80 hover:bg-wheat/5 hover:border-wheat/60"
              >
                Plan a Visit
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-wheat/40">
          <span className="text-xs tracking-widest uppercase font-light">Scroll</span>
          <div className="h-8 w-px bg-wheat/30 animate-pulse" />
        </div>
      </section>

      {/* ── SEASONAL BANNER ── */}
      <div className="bg-cider text-wheat">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs tracking-widest uppercase font-light text-sunflower-light">{banner.eyebrow}</span>
            <span className="h-px w-6 bg-wheat/40" />
            <span className="font-serif text-lg md:text-xl">{banner.line1}</span>
            <span className="hidden md:inline h-4 w-px bg-wheat/30" />
            <span className="hidden md:inline font-serif text-lg md:text-xl opacity-85">{banner.line2}</span>
          </div>
          <Link
            href={banner.ctaHref}
            className="text-xs tracking-widest uppercase font-light border border-wheat/50 px-5 py-2 hover:bg-wheat/10 transition-colors whitespace-nowrap shrink-0"
          >
            {banner.ctaLabel}
          </Link>
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div className="bg-meadow-deep py-4 overflow-hidden flex gap-0 border-b border-sunflower/20">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          <span className="font-serif text-xl md:text-2xl text-sunflower/70 italic pr-0">
            {marqueeStr}
            {marqueeStr}
          </span>
        </div>
      </div>

      {/* ── QUICK-FACTS STRIP ─────────────────────────────────────────
          Notice-board style. Everything the client's "practical" visitor
          asks for, immediately visible on second scroll. */}
      <section className="bg-wheat-light border-y border-meadow/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
            <div className="info-pill">
              <span className="info-pill-label">Address</span>
              <span className="info-pill-value">Rose Hill, KS</span>
              <span className="info-pill-sub">11249 SW 160th St</span>
            </div>
            <div className="info-pill">
              <span className="info-pill-label">Today</span>
              <span className={`info-pill-value ${farmStatus.open ? "text-orchard" : "text-cider"}`}>
                {farmStatus.open ? "Open" : "Closed"}
              </span>
              <span className="info-pill-sub">
                {farmStatus.open ? farmStatus.todayLabel : farmStatus.nextOpenLabel ?? "See hours"}
              </span>
            </div>
            <div className="info-pill">
              <span className="info-pill-label">Admission</span>
              <span className="info-pill-value">{admission.admissionValue}</span>
              <span className="info-pill-sub">{admission.admissionSub}</span>
            </div>
            <div className="info-pill">
              <span className="info-pill-label">Contact</span>
              <a href="sms:3165188907" className="info-pill-value hover:text-cider transition-colors">
                (316) 518-8907
              </a>
              <span className="info-pill-sub">Text works best</span>
            </div>
          </div>
        </div>
      </section>

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
                <LeafMark className="w-3.5 h-5 text-cider mb-3" />
                <p className="font-serif text-xl md:text-2xl text-meadow leading-none mb-2">{p.mark}</p>
                <p className="text-xs tracking-wide font-light text-stone leading-snug">{p.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TAP LIST — surfaced early because "what can I buy" is what most
           visitors want next after "where are you" ── */}
      <section className="py-20 md:py-28 bg-wheat-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="section-label mb-4">{tapList.eyebrow}</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-meadow leading-tight">
                {tapList.headline}
                <br />
                <em>{tapList.emphasis}</em>
              </h2>
            </div>
            <Link href="/store" className="btn-primary self-start md:self-auto whitespace-nowrap">
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
                className="bg-wheat p-10 md:p-12"
              >
                <p className="section-label mb-2">{t.tier}</p>
                <p className="font-serif text-6xl text-cider mb-4">{t.price}</p>
                <p className="font-serif text-sm text-ink-soft italic mb-6 leading-relaxed">{t.names}</p>
                <div className="h-px w-10 bg-sunflower mb-6" />
                <p className="text-sm text-ink-soft font-light leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAT BLOCK ── */}
      <section className="py-16 md:py-20 bg-wheat">
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
                <p className="font-serif text-5xl md:text-6xl text-meadow mb-2">{s.number}</p>
                <p className="text-xs tracking-widest uppercase font-light text-stone">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY — deeper reveal, mid-page ── */}
      <section className="py-28 md:py-40 overflow-hidden">
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
                className="absolute -bottom-10 -right-6 md:-right-12 w-2/3 aspect-square overflow-hidden border-4 border-wheat"
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
              <h2 className="embossed font-serif text-5xl md:text-6xl lg:text-7xl text-meadow leading-tight mb-8">
                {story.headline}
                <br />
                <em>{story.emphasis}</em>
              </h2>

              <div className="space-y-5 text-ink-soft font-light leading-relaxed text-base">
                <p className="drop-cap">{story.paragraph1}</p>
                <p>{story.paragraph2}</p>
                <p>{story.paragraph3}</p>
              </div>

              <div className="mt-10 pl-6 border-l-2 border-sunflower">
                <p className="font-serif text-2xl md:text-3xl text-cider italic leading-snug">&ldquo;{story.quote}&rdquo;</p>
                <p className="section-label mt-4">{story.attribution}</p>
              </div>

              <Link href="/the-farm" className="btn-outline mt-10 inline-block">
                Read the Full Story
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── COME VISIT — activities ── */}
      <section className="py-24 md:py-32 bg-wheat-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-start mb-14">
            <div>
              <p className="section-label mb-4">{activities.eyebrow}</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-meadow leading-tight">
                {activities.headline}
                <br />
                <em>{activities.emphasis}</em>
              </h2>
            </div>
            <div className="text-ink-soft font-light leading-relaxed md:pt-8 space-y-4">
              <p>{activities.paragraph1}</p>
              <p>{activities.paragraph2}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Cider Flights", sub: "Order a flight in the tap room", image: "/images/cider-flight.jpg" },
              { label: "U-Pick Orchard", sub: "Strawberries, peaches, 30+ apple varieties", image: "/images/strawberry.jpg" },
              { label: "Disc Golf", sub: "Family-friendly 9-hole course", image: "/images/MAP.png" },
              { label: "Pumpkin Patch", sub: "October weekends", image: "https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=700&q=80" },
              { label: "Farm Store", sub: "Jams, mustard, apple butter, salsa, honey", image: "/images/farm-store-donuts.jpg" },
              { label: "Live Music", sub: "Concerts & cider-pairing events", image: "/images/tasting-dinner.jpg" },
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
                <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep/85 via-meadow-deep/10 to-transparent group-hover:from-meadow-deep/95 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                  <h3 className="font-serif text-xl md:text-2xl text-wheat leading-tight">{item.label}</h3>
                  <p className="text-xs text-sunflower-light font-light mt-1 hidden md:block">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/visit" className="btn-outline">
              Everything at the Farm →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FIELD TRIPS + BOOKINGS — the growth channel ─────────────────
          Surfaced with its own section per the transcript: field trips are
          the largest untapped revenue lever and were previously buried. */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-meadow text-wheat p-10 md:p-12 relative overflow-hidden"
            >
              <div className="absolute -bottom-8 -right-8 text-sunflower/10 pointer-events-none select-none">
                <LeafMark className="w-40 h-56" />
              </div>
              <p className="text-xs tracking-widest uppercase font-light text-sunflower mb-4">For Teachers</p>
              <h3 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
                Field trips <em className="text-sunflower">worth talking about.</em>
              </h3>
              <p className="text-wheat/80 font-light leading-relaxed mb-8 max-w-md">
                Kids meet the apples on the tree, then watch juice pressed from them. Hands-on programs, seasonal
                windows, and a schedule you can actually plan around.
              </p>
              <Link
                href="/visit/field-trips"
                className="inline-block px-8 py-3 bg-sunflower text-ink text-sm tracking-widest uppercase font-light hover:bg-sunflower-light transition-colors"
              >
                Request a Date
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              viewport={{ once: true }}
              className="bg-cider text-wheat p-10 md:p-12 relative overflow-hidden"
            >
              <div className="absolute -bottom-8 -right-8 text-sunflower/10 pointer-events-none select-none">
                <LeafMark className="w-40 h-56" />
              </div>
              <p className="text-xs tracking-widest uppercase font-light text-sunflower mb-4">For Groups</p>
              <h3 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
                Book the barn, <em className="text-sunflower">the shelters, the fields.</em>
              </h3>
              <p className="text-wheat/80 font-light leading-relaxed mb-8 max-w-md">
                Family reunions, birthdays, small weddings, corporate off-sites. Pick a space, check the calendar,
                request a date online.
              </p>
              <Link
                href="/visit/book"
                className="inline-block px-8 py-3 bg-sunflower text-ink text-sm tracking-widest uppercase font-light hover:bg-sunflower-light transition-colors"
              >
                See the Spaces
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CIDER CLUB CTA ── */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <Image src={clubTeaser.imageUrl} alt="Orchard rows at dusk" fill className="estate-photo object-cover object-center scale-105" />
        <div className="absolute inset-0 bg-meadow-deep/85" />
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <p
            className="font-serif leading-none whitespace-nowrap text-transparent"
            style={{
              fontSize: "clamp(5rem, 18vw, 18rem)",
              WebkitTextStroke: "1px rgba(217,166,33,0.08)",
            }}
          >
            {clubTeaser.eyebrow}
          </p>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true }}>
            <p className="text-xs tracking-widest uppercase font-light text-sunflower mb-6">{clubTeaser.eyebrow}</p>
            <h2 className="font-serif text-5xl md:text-7xl text-wheat mb-6 leading-tight">
              {clubTeaser.headline}
              <br />
              <em className="text-sunflower">{clubTeaser.emphasis}</em>
            </h2>
            <p className="text-wheat/80 font-light text-lg leading-relaxed mb-4 max-w-xl mx-auto">{clubTeaser.body}</p>
            <p className="text-sunflower/70 font-light text-sm mb-12">{clubTeaser.fineprint}</p>
            <Link href={clubTeaser.ctaHref} className="btn-accent">
              {clubTeaser.ctaLabel}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FARM VIDEOS ── */}
      <FarmVideos block={farmVideos} />

      {/* ── SEASON REMINDERS ── */}
      <RemindMe variant="section" />

      {/* ── DETAIL / ADMISSION — bottom of page for the studious ── */}
      <section className="bg-meadow-deep text-wheat py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-wheat/10">
            {[
              { label: "Admission", value: admission.admissionValue, sub: admission.admissionSub },
              { label: "Hours", value: admission.hoursValue, sub: admission.hoursSub },
              { label: "Location", value: admission.locationValue, sub: admission.locationSub },
            ].map((item) => (
              <div key={item.label} className="md:px-10 first:pl-0 last:pr-0 text-center md:text-left">
                <p className="text-xs tracking-widest uppercase font-light text-sunflower mb-2">{item.label}</p>
                <p className="font-serif text-4xl text-wheat mb-1">{item.value}</p>
                <p className="text-sm text-wheat/60 font-light">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
