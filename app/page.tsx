"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { BranchDivider, LeafMark, CircleText } from "@/components/Ornament";
import RemindMe from "@/components/RemindMe";
import PostcardLoader from "@/components/PostcardLoader";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_HERO, DEFAULT_BANNER } from "@/lib/content-types";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
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

const products = [
  {
    tier: "Flagship",
    name: "Meadowlark Red",
    description: "Our signature hard cider — approachable, well-balanced, and made entirely from estate apples. The one that started it all.",
    price: "$9.50",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=700&q=80",
    tag: "Estate",
  },
  {
    tier: "Sturnella Reserve",
    name: "Farmhouse Funk",
    description: "Wild-fermented and unapologetically rustic. Complex earthiness from apples grown right here in Rose Hill, KS.",
    price: "$14",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
    tag: "Reserve",
  },
  {
    tier: "Sturnella Reserve",
    name: "Peach Cider",
    description: "Hard cider fermented with our own Meadowlark peaches. Stone fruit aroma, bright finish, and a warmth that's unmistakably Kansas summer.",
    price: "$14",
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=700&q=80",
    tag: "Reserve",
  },
];

const stats = [
  { number: "5,000", label: "Peach & apple trees planted" },
  { number: "2010", label: "Year the farm was founded" },
  { number: "30+", label: "Apple varieties in the orchard" },
  { number: "10", label: "Ciders on offer" },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // CMS-driven copy (hero + seasonal banner). Defaults render immediately;
  // the postcard loader covers the hero until the DB values arrive.
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [banner, setBanner] = useState(DEFAULT_BANNER);
  useEffect(() => {
    createClient()
      .from("site_content")
      .select("key, value")
      .in("key", ["hero", "seasonal_banner"])
      .then(({ data }) => {
        for (const row of data ?? []) {
          if (row.key === "hero") setHero((h) => ({ ...h, ...(row.value as object) }));
          if (row.key === "seasonal_banner") setBanner((b) => ({ ...b, ...(row.value as object) }));
        }
      });
  }, []);

  return (
    <>
      <PostcardLoader />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen min-h-[640px] flex items-end overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1800&q=85"
            alt="Meadowlark Farm orchard rows at golden hour, Rose Hill, Kansas"
            fill
            priority
            className="estate-photo object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-orchard/85 via-orchard/25 to-transparent" />

        {/* spinning badge */}
        <div className="absolute top-28 right-8 md:top-32 md:right-16 w-24 h-24 md:w-32 md:h-32 text-orchard">
          <CircleText text="ESTATE CIDERY · ROSE HILL KS · SINCE 2010 · " className="w-full h-full" />
          <Image
            src="/images/meadowlark-logo.png"
            alt=""
            width={48}
            height={48}
            className="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-32 w-full">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">
            <motion.p variants={fadeUp} className="section-label mb-5">
              {hero.label}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-serif text-7xl md:text-9xl text-cream leading-[1.0] mb-8 tracking-tight"
            >
              {hero.line1}
              <br />
              {hero.line2}
              <br />
              <em className="text-amber/90">{hero.emphasis}</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-cream/75 font-light text-lg md:text-xl leading-relaxed mb-12 max-w-xl"
            >
              {hero.body}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link href={hero.primaryHref} className="btn-primary">
                {hero.primaryLabel}
              </Link>
              <Link href={hero.secondaryHref} className="btn-outline border-cream/50 text-cream hover:bg-cream/10 hover:border-cream">
                {hero.secondaryLabel}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* scroll line */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/40">
          <span className="text-xs tracking-widest uppercase font-light">Scroll</span>
          <div className="h-10 w-px bg-cream/30 animate-pulse" />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="bg-orchard py-5 overflow-hidden flex gap-0">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          <span className="font-serif text-xl md:text-2xl text-cream/60 italic pr-0">{marqueeStr}{marqueeStr}</span>
        </div>
      </div>

      {/* ── SEASONAL BANNER ── */}
      <div className="bg-maroon text-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-xs tracking-widest uppercase font-light opacity-70">{banner.eyebrow}</span>
            <span className="h-px w-6 bg-cream/40" />
            <span className="font-serif text-lg md:text-xl">{banner.line1}</span>
            <span className="hidden md:inline h-4 w-px bg-cream/30" />
            <span className="font-serif text-lg md:text-xl opacity-80">{banner.line2}</span>
          </div>
          <Link href={banner.ctaHref} className="text-xs tracking-widest uppercase font-light border border-cream/40 px-5 py-2 hover:bg-cream/10 transition-colors whitespace-nowrap shrink-0">
            {banner.ctaLabel}
          </Link>
        </div>
      </div>

      {/* ── PROVENANCE STRIP ── */}
      <section className="border-b border-orchard/10">
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
                <LeafMark className="w-3.5 h-5 text-maroon mb-3" />
                <p className="font-serif text-xl md:text-2xl text-orchard leading-none mb-2">{p.mark}</p>
                <p className="text-xs tracking-wide font-light text-stone leading-snug">{p.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAT BLOCK ── */}
      <section className="py-20 md:py-24 bg-cream-dark border-b border-orchard/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-orchard/10">
            {stats.map((s, i) => (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="px-6 md:px-10 py-4 text-center first:pl-0 last:pr-0"
              >
                <p className="font-serif text-6xl md:text-7xl text-orchard mb-2">{s.number}</p>
                <p className="text-xs tracking-widest uppercase font-light text-stone">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOM & GINA STORY ── */}
      <section className="py-28 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-12 gap-16 md:gap-8 items-center">

            {/* Images — stacked, offset */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="md:col-span-5 relative"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=85"
                  alt="Tom and Gina Brown at Meadowlark Farm"
                  fill
                  className="estate-photo object-cover"
                />
              </div>
              {/* offset second image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                viewport={{ once: true }}
                className="absolute -bottom-10 -right-6 md:-right-12 w-2/3 aspect-square overflow-hidden border-4 border-cream"
              >
                <Image
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80"
                  alt="The orchard in full bloom"
                  fill
                  className="estate-photo object-cover"
                />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="md:col-span-6 md:col-start-7 pt-8 md:pt-0"
            >
              <p className="section-label mb-6">Tom & Gina Brown</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl lg:text-7xl text-orchard leading-tight mb-8">
                Two lives abroad.
                <br />
                <em>One farm back home.</em>
              </h2>

              <div className="space-y-5 text-stone font-light leading-relaxed text-base">
                <p className="drop-cap">
                  Tom and Gina are Kansas born and raised — but for years, Kansas
                  wasn't home. Tom spent time in Pakistan and Afghanistan working
                  in agriculture development. Gina worked in healthcare. They lived
                  rich lives of creative work and friendships from all over the world.
                </p>
                <p>
                  When they came back, they brought everything they'd learned about
                  land, food, and community. In 2010, with the help of many friends,
                  they planted 5,000 peach and apple trees east of Wichita and
                  started building what Meadowlark is today.
                </p>
                <p>
                  Their cider is different because it has to be: every apple pressed
                  at Meadowlark was grown here, on this land. No concentrate. No
                  outside fruit. An estate cidery in the truest sense.
                </p>
              </div>

              {/* Pull quote */}
              <div className="mt-10 pl-6 border-l-2 border-maroon">
                <p className="font-serif text-2xl md:text-3xl text-orchard italic leading-snug">
                  "We love the good people of Kansas and we really enjoy our customers at the farm."
                </p>
                <p className="section-label mt-4">— Tom & Gina Brown</p>
              </div>

              <Link href="/the-farm" className="btn-outline mt-10 inline-block">
                Read the Full Story
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── GRAPHIC DIVIDER — BIG TYPE ── */}
      <section className="py-20 md:py-28 bg-orchard overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <p className="font-serif text-[22vw] text-cream whitespace-nowrap leading-none">
            Estate Cider
          </p>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center">
          <LeafMark className="w-6 h-9 text-amber mx-auto mb-8" />
          <p className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream leading-tight">
            Every apple pressed at Meadowlark
            <br />
            <em className="text-amber/80">was grown on this land.</em>
          </p>
          <p className="text-cream/50 font-light text-sm tracking-widest uppercase mt-8">
            100% Estate · Rose Hill, Kansas
          </p>
        </div>
      </section>

      {/* ── SHOP PREVIEW ── */}
      <section className="py-28 md:py-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="section-label mb-4">The Cellar</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight">
                Three tiers.
                <br />
                <em>One orchard.</em>
              </h2>
            </div>
            <Link href="/shop" className="btn-outline self-start md:self-auto whitespace-nowrap">
              All 10 Ciders →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-orchard/10">
            {products.map((p, i) => (
              <motion.article
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.12 }}
                viewport={{ once: true }}
                className="bg-cream group"
              >
                <Link href="/shop">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="estate-photo object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orchard/60 via-transparent to-transparent" />
                    <div className="absolute top-5 left-5 flex gap-2">
                      <span className="bg-amber text-orchard text-xs tracking-widest uppercase px-3 py-1">
                        {p.tag}
                      </span>
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="font-serif text-3xl text-cream leading-tight">{p.name}</p>
                      <p className="font-serif text-xl text-amber mt-1">{p.price}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="section-label mb-3">{p.tier}</p>
                    <p className="text-sm text-stone font-light leading-relaxed">{p.description}</p>
                    <p className="text-xs tracking-widest uppercase text-orchard font-light mt-5 group-hover:text-maroon transition-colors">
                      Add to Cart →
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CIDER TIERS GRAPHIC ── */}
      <section className="py-20 md:py-28 bg-cream-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <BranchDivider className="text-orchard mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-orchard/10 border border-orchard/10">
            {[
              { tier: "Flagship", price: "$9.50", names: "Meadowlark Red · Meadowlark Gold · Meadow Hopper", desc: "The everyday ciders. Balanced, drinkable, made for the tap room." },
              { tier: "Sturnella Reserve", price: "$14", names: "Peach · Blackberry · Strawberry · Scrumpy · Farmhouse Funk", desc: "Fruit-forward and wild-fermented. Each batch is its own season." },
              { tier: "Fine Cider", price: "$18", names: "Prize 22 · All Seasons", desc: "The top of the cellar. Complex, deliberate, and worth the patience." },
            ].map((t, i) => (
              <motion.div
                key={t.tier}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-cream p-10 md:p-12"
              >
                <p className="section-label mb-2">{t.tier}</p>
                <p className="font-serif text-6xl text-orchard mb-4">{t.price}</p>
                <p className="font-serif text-sm text-stone italic mb-6 leading-relaxed">{t.names}</p>
                <div className="h-px w-10 bg-maroon mb-6" />
                <p className="text-sm text-stone font-light leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
          <BranchDivider className="text-orchard mt-16" />
        </div>
      </section>

      {/* ── SEASONS STRIP ── */}
      <section className="py-28 md:py-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="section-label mb-4">Pick Your Season</p>
            <h2 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight">
              Something is always
              <br />
              <em>coming into season.</em>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[
              { month: "May", crop: "Strawberries", image: "https://images.unsplash.com/photo-1464976062524-40e5b2199126?w=600&q=80", tag: "U-Pick" },
              { month: "July–Aug", crop: "Peaches", image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&q=80", tag: "U-Pick" },
              { month: "Aug–Oct", crop: "30+ Apples", image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80", tag: "U-Pick + Cider" },
              { month: "October", crop: "Pumpkins", image: "https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=600&q=80", tag: "U-Pick" },
            ].map((s, i) => (
              <motion.div
                key={s.crop}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative aspect-[3/4] group overflow-hidden"
              >
                <Image src={s.image} alt={s.crop} fill className="estate-photo object-cover transition-transform duration-700 group-hover:scale-108" />
                <div className="absolute inset-0 bg-gradient-to-t from-orchard/80 via-orchard/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <p className="text-xs tracking-widest uppercase text-amber font-light mb-1">{s.month}</p>
                  <h3 className="font-serif text-2xl md:text-3xl text-cream leading-tight">{s.crop}</h3>
                  <p className="text-xs text-cream/60 font-light mt-1">{s.tag}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/visit" className="btn-outline">Plan Your Visit</Link>
          </div>
        </div>
      </section>

      {/* ── CIDER CLUB CTA — full bleed ── */}
      <section className="relative py-36 md:py-52 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1800&q=80"
          alt="Orchard rows at dusk"
          fill
          className="estate-photo object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-orchard/80" />
        {/* decorative large outlined type */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <p
            className="font-serif leading-none whitespace-nowrap text-transparent"
            style={{
              fontSize: "clamp(5rem, 18vw, 18rem)",
              WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            }}
          >
            Cider Club
          </p>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <p className="section-label text-amber mb-6">Cider Club</p>
            <h2 className="font-serif text-5xl md:text-7xl text-cream mb-6 leading-tight">
              First from the press.
              <br />
              <em>Every season.</em>
            </h2>
            <p className="text-cream/70 font-light text-lg leading-relaxed mb-4 max-w-xl mx-auto">
              Members receive their allocation before each release goes public —
              shipped to your door or held for farm pickup.
            </p>
            <p className="text-cream/50 font-light text-sm mb-12">
              From $120/season · Free first tasting room visit · 10–15% off the shop
            </p>
            <Link href="/cider-club" className="btn-primary bg-amber text-orchard hover:bg-amber-light">
              Become a Member
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── ACTIVITIES GRID ── */}
      <section className="py-28 md:py-40 bg-cream-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-start mb-16">
            <div>
              <p className="section-label mb-4">At the Farm</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight">
                Walk, play,
                <br />
                <em>drink, eat, enjoy.</em>
              </h2>
            </div>
            <div className="text-stone font-light leading-relaxed md:pt-12 space-y-4">
              <p>
                Meadowlark isn't just a place to buy cider — it's a place to spend
                an afternoon. Bring the family, bring your dog, bring a blanket.
                There's always something happening in Rose Hill.
              </p>
              <p>
                Hard cider on tap alongside sparkling apple cider, house-made root
                beer, and seasonal slushies — something for everyone, every age.
              </p>
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
                <div className="absolute inset-0 bg-gradient-to-t from-orchard/75 via-orchard/10 to-transparent group-hover:from-orchard/85 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                  <h3 className="font-serif text-xl md:text-2xl text-cream leading-tight">{item.label}</h3>
                  <p className="text-xs text-cream/60 font-light mt-1 hidden md:block">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/visit" className="btn-outline">See Everything at the Farm</Link>
          </div>
        </div>
      </section>

      {/* ── REMIND ME ── */}
      <RemindMe variant="section" />

      {/* ── ADMISSION NOTE ── */}
      <section className="bg-orchard text-cream py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-cream/10">
            {[
              { label: "Admission", value: "$3.50–$4.00", sub: "per person (10+) · Kids under 10 free" },
              { label: "Hours", value: "Wed–Sun", sub: "10am–5pm · Fri until 6:30pm · Year-round" },
              { label: "Location", value: "Rose Hill, KS", sub: "11249 SW 160th St · No appointment needed" },
            ].map((item) => (
              <div key={item.label} className="md:px-10 first:pl-0 last:pr-0 text-center md:text-left">
                <p className="section-label text-amber mb-2">{item.label}</p>
                <p className="font-serif text-4xl text-cream mb-1">{item.value}</p>
                <p className="text-sm text-cream/50 font-light">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
