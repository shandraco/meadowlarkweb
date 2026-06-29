"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BranchDivider, LeafMark } from "@/components/Ornament";

const flagship = [
  { name: "Meadowlark Red", desc: "Our signature estate cider. Balanced, medium-dry, and endlessly drinkable. The one that started it all.", price: "$9.50", abv: "5% ABV", image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=700&q=80" },
  { name: "Meadowlark Gold", desc: "A slightly sweeter expression of our estate apples — golden and bright, with a clean Kansas finish.", price: "$9.50", abv: "5% ABV", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80" },
  { name: "Meadow Hopper", desc: "Dry-hopped hard cider with a subtle herbal edge. A crossover for the craft beer crowd.", price: "$9.50", abv: "5% ABV", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80" },
];

const reserve = [
  { name: "Peach Cider", desc: "Fermented with our own Meadowlark peaches. Stone fruit aroma, bright finish, and a warmth that's unmistakably Kansas summer.", price: "$14", abv: "5% ABV", image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=700&q=80" },
  { name: "Blackberry Cider", desc: "Deep berry character layered over a dry cider base. Dark, complex, and worth every sip.", price: "$14", abv: "5% ABV", image: "https://images.unsplash.com/photo-1464976062524-40e5b2199126?w=700&q=80" },
  { name: "Strawberry Cider", desc: "Made with May-harvest strawberries from the farm. Fragrant, semi-sweet, and bright red in the glass.", price: "$14", abv: "5% ABV", image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=700&q=80" },
  { name: "Scrumpy", desc: "Traditional English-style cider — rough, rustic, and full of character. Made the old way, no apologies.", price: "$14", abv: "5% ABV", image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=700&q=80" },
  { name: "Farmhouse Funk", desc: "Wild-fermented with native orchard yeasts. Funky, complex, and a little unpredictable — just like the best things in life.", price: "$14", abv: "5% ABV", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80" },
];

const fine = [
  { name: "Prize 22", desc: "Our flagship fine cider — named for the 2022 harvest. Exceptionally balanced, from a single apple variety at peak ripeness.", price: "$18", abv: "5% ABV", image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&q=80" },
  { name: "All Seasons", desc: "A blend across the full year's harvest — spring, summer, fall. Every sip holds the whole orchard.", price: "$18", abv: "5% ABV", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&q=80" },
];

const farmGoods = [
  { name: "Apple Butter", price: "$8", desc: "Slow-cooked from estate apples. Spiced, dark, and deeply concentrated.", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80" },
  { name: "Cider Mustard", price: "$7", desc: "Made with Meadowlark hard cider. Goes on everything.", image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80" },
  { name: "Peach Jam", price: "$9", desc: "Orchard peaches, cane sugar, nothing else.", image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80" },
  { name: "Farm Salsa", price: "$8", desc: "Tomatoes, peppers, and herbs from the farm and local partners.", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80" },
];

function ProductCard({ name, desc, price, abv, image, tag }: { name: string; desc: string; price: string; abv?: string; image: string; tag?: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="aspect-[4/5] relative overflow-hidden mb-5">
        <Image src={image} alt={name} fill className="estate-photo object-cover transition-transform duration-700 group-hover:scale-105" />
        {tag && (
          <div className="absolute top-4 left-4">
            <span className="bg-amber text-orchard text-xs tracking-widest uppercase px-3 py-1">{tag}</span>
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-serif text-2xl text-orchard">{name}</h3>
        <span className="font-serif text-xl text-orchard whitespace-nowrap">{price}</span>
      </div>
      {abv && <p className="section-label mb-3">{abv} · Estate Cider</p>}
      <p className="text-sm text-stone font-light leading-relaxed mb-5">{desc}</p>
      <button className="btn-primary w-full">Add to Cart</button>
    </motion.article>
  );
}

export default function ShopPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-36 pb-0 bg-orchard relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <p className="font-serif text-[24vw] text-cream whitespace-nowrap leading-none">The Cellar</p>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-24">
          <p className="section-label text-amber mb-5">The Cellar</p>
          <h1 className="font-serif text-7xl md:text-9xl text-cream leading-tight">
            10 ciders.
            <br />
            <em>One orchard.</em>
          </h1>
          <p className="text-cream/60 font-light text-lg mt-6 max-w-lg">
            Every cider on this list was made from apples grown at Meadowlark
            Farm, 11249 SW 160th St, Rose Hill, Kansas. No concentrate. No outside
            fruit. Just estate.
          </p>
        </div>
      </section>

      {/* Age notice */}
      <div className="bg-amber text-orchard text-center py-3 px-6">
        <p className="text-xs tracking-wide font-light">You must be 21 or older to purchase alcoholic cider. By proceeding you confirm your age.</p>
      </div>

      {/* Flagship */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end gap-6 mb-14">
            <LeafMark className="w-4 h-6 text-maroon flex-shrink-0" />
            <div>
              <p className="section-label mb-1">Flagship</p>
              <h2 className="font-serif text-5xl text-orchard"><em>$9.50 / bottle</em></h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-14">
            {flagship.map((p) => <ProductCard key={p.name} {...p} tag="Flagship" />)}
          </div>
        </div>
      </section>

      <BranchDivider className="text-orchard mx-6 md:mx-12 max-w-7xl xl:mx-auto" />

      {/* Reserve */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end gap-6 mb-14">
            <LeafMark className="w-4 h-6 text-maroon flex-shrink-0" />
            <div>
              <p className="section-label mb-1">Sturnella Reserve</p>
              <h2 className="font-serif text-5xl text-orchard"><em>$14 / bottle</em></h2>
            </div>
          </div>
          <p className="text-stone font-light text-base max-w-xl mb-14 -mt-8">
            Named for the Western Meadowlark — Kansas's state bird. These are the
            fruit-forward, wild-fermented, and specialty ciders.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-14">
            {reserve.map((p) => <ProductCard key={p.name} {...p} tag="Reserve" />)}
          </div>
        </div>
      </section>

      <BranchDivider className="text-orchard mx-6 md:mx-12 max-w-7xl xl:mx-auto" />

      {/* Fine Cider */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end gap-6 mb-14">
            <LeafMark className="w-4 h-6 text-maroon flex-shrink-0" />
            <div>
              <p className="section-label mb-1">Fine Cider</p>
              <h2 className="font-serif text-5xl text-orchard"><em>$18 / bottle</em></h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14">
            {fine.map((p) => <ProductCard key={p.name} {...p} tag="Fine" />)}
          </div>
        </div>
      </section>

      {/* Farm Store */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="section-label mb-4">Farm Store</p>
          <h2 className="embossed font-serif text-5xl md:text-6xl text-orchard mb-4">
            From the kitchen.
          </h2>
          <p className="text-stone font-light mb-14 max-w-lg">
            Jams, preserves, mustard, vinegar, apple butter, and salsa — all made at the farm or sourced from local Kansas partners.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {farmGoods.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="aspect-square relative overflow-hidden mb-4">
                  <Image src={g.image} alt={g.name} fill className="estate-photo object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-serif text-xl text-orchard">{g.name}</h3>
                  <span className="text-stone font-light text-sm">{g.price}</span>
                </div>
                <p className="text-xs text-stone font-light mt-1">{g.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Season Pass */}
      <section className="bg-orchard text-cream py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="section-label text-amber mb-5">Season Pass</p>
          <h2 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">
            Unlimited entry.
            <br />
            <em>All year long.</em>
          </h2>
          <p className="text-cream/65 font-light leading-relaxed mb-10">
            An annual Season Pass gets you unlimited farm entry plus free seasonal
            produce, cider discounts, and punch card rewards. Best value for
            regular visitors.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/cider-club" className="btn-primary bg-amber text-orchard hover:bg-amber-light">Join the Cider Club</Link>
            <a href="mailto:gina@themeadowlarkfarm.com" className="btn-outline border-cream/50 text-cream hover:bg-cream/10">Ask About Season Pass</a>
          </div>
        </div>
      </section>
    </>
  );
}
