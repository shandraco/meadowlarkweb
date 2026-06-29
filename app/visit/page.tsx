"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LeafMark, BranchDivider } from "@/components/Ornament";
import RemindMe from "@/components/RemindMe";

const activities = [
  { name: "Cider Flights", sub: "Order a flight for the full Meadowlark experience — all tiers, side by side.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80", season: "Year-round" },
  { name: "Cider Pressing Demo", sub: "Watch how estate apples become cider, from pressing to fermentation. Runs seasonally during harvest.", image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&q=80", season: "Harvest Season" },
  { name: "U-Pick Strawberries", sub: "May only. Buckets provided. Pick-your-own straight from the patch.", image: "https://images.unsplash.com/photo-1464976062524-40e5b2199126?w=700&q=80", season: "May" },
  { name: "U-Pick Peaches", sub: "July and August. Our own peaches, hand-picked by visitors.", image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=700&q=80", season: "July–Aug" },
  { name: "U-Pick Apples", sub: "30+ apple varieties from August through October.", image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=700&q=80", season: "Aug–Oct" },
  { name: "Pumpkin Patch", sub: "Dozens of varieties, from pie pumpkins to giants.", image: "https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=700&q=80", season: "October" },
  { name: "Disc Golf", sub: "Family-friendly 9-hole course on the farm grounds. Free to play.", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=700&q=80", season: "Year-round" },
  { name: "Playground & Games", sub: "Kids playground, corn hole, table games, rubber duck races, and wide open space to roam.", image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=700&q=80", season: "Year-round" },
  { name: "Meet the Animals", sub: "Goats and farm animals roam the grounds. Kids always love this one.", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&q=80", season: "Year-round" },
  { name: "Farm Store", sub: "Jams, mustard, apple butter, salsa, honey, eggs, cheese, and local goods.", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=700&q=80", season: "Year-round" },
  { name: "Live Music & Events", sub: "Cider-pairing dinners, concerts, and seasonal celebrations.", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=80", season: "Seasonal" },
];

const amenities = [
  { icon: "🚻", label: "Restrooms", detail: "Full, clean restrooms on site" },
  { icon: "⛺", label: "Covered Areas", detail: "Covered and semi-covered picnic shelters available" },
  { icon: "🪑", label: "Seating", detail: "Plenty of picnic tables, benches, and lawn chair space" },
  { icon: "🧺", label: "Picnics Welcome", detail: "Bring your own food — outside picnics are always welcome" },
  { icon: "🅿️", label: "Parking", detail: "Large gravel lot with plenty of space, including bus & large vehicle parking" },
  { icon: "🚌", label: "Bus & Field Trips", detail: "Bus-friendly parking and group field trip arrangements available" },
  { icon: "🐐", label: "Farm Animals", detail: "Goats and animals roam the grounds — great for kids" },
  { icon: "🛝", label: "Kids Playground", detail: "Full playground structure on site" },
  { icon: "🐕", label: "Dogs Welcome", detail: "Dogs on leash are always welcome at the farm" },
];

const drinks = [
  { name: "Hard Cider", sub: "10 varieties — flights or pints", tag: "21+" },
  { name: "Sparkling Apple Cider", sub: "Fresh-pressed, non-alcoholic, on tap", tag: "All ages" },
  { name: "Root Beer", sub: "House-made, on tap", tag: "All ages" },
  { name: "Seasonal Slushies", sub: "Rotating fruit flavors — ask what's on today", tag: "All ages" },
];

export default function VisitPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[75vh] min-h-[520px] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1800&q=85"
          alt="Meadowlark Farm grounds in autumn, Rose Hill Kansas"
          fill
          priority
          className="estate-photo object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orchard/85 via-orchard/20 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-28 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <p className="section-label text-amber mb-5">Visit the Farm</p>
            <h1 className="font-serif text-7xl md:text-9xl text-cream leading-[1.0]">
              Come to
              <br />
              Rose Hill.
              <br />
              <em className="text-amber/85">Stay awhile.</em>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Quick info bar */}
      <div className="bg-orchard text-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-cream/10">
          {[
            { label: "Address", value: "11249 SW 160th St", sub: "Rose Hill, KS 67133 · ~20 min east of Wichita" },
            { label: "Hours", value: "Wed–Sun, 10am–5pm", sub: "Friday until 6:30pm · Year-round · No appointment needed" },
            { label: "Admission", value: "$3.50 / $4.00", sub: "Per person (10+) · Weekdays / Weekends · Under 10 free · Pay at shop counter" },
          ].map((item) => (
            <div key={item.label} className="md:px-10 first:pl-0 last:pr-0">
              <p className="section-label text-amber mb-2">{item.label}</p>
              <p className="font-serif text-3xl text-cream">{item.value}</p>
              <p className="text-sm text-cream/50 font-light mt-1 leading-snug">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact + Farmers Market strip */}
      <div className="bg-amber text-orchard">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6 text-sm font-light items-center">
            <span>Text: <a href="sms:3165188907" className="underline underline-offset-2">(316) 518-8907</a></span>
            <span className="hidden md:inline h-4 w-px bg-cream/30" />
            <span>Email: <a href="mailto:gina@themeadowlarkfarm.com" className="underline underline-offset-2">gina@themeadowlarkfarm.com</a></span>
            <span className="hidden md:inline h-4 w-px bg-cream/30" />
            <span className="font-light">Cash preferred · Cards accepted</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-light">
            <span className="text-xs tracking-widest uppercase opacity-70">Also find us:</span>
            <span className="font-serif text-base">Wichita Farmers Market — every Saturday</span>
          </div>
        </div>
      </div>

      {/* Farmers Market section */}
      <section className="py-20 md:py-24 border-b border-orchard/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              viewport={{ once: true }}
            >
              <p className="section-label mb-4">Farmers Market</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight mb-6">
                Find us in Wichita
                <br />
                <em>every Saturday.</em>
              </h2>
              <p className="text-stone font-light leading-relaxed mb-4">
                Can't make it out to Rose Hill? Catch Tom and Gina at the Wichita
                Farmers Market on Saturdays. We bring cider, farm goods, and
                seasonal produce — same Meadowlark quality, closer to town.
              </p>
              <p className="text-stone font-light leading-relaxed">
                Check our Facebook page or sign up for the newsletter for market
                day updates, what we're bringing, and any special Saturday offerings.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              viewport={{ once: true }}
              className="bg-cream-dark border border-orchard/10 p-10 md:p-12"
            >
              <p className="section-label mb-6">Market Details</p>
              <div className="space-y-5">
                {[
                  { label: "When", value: "Every Saturday" },
                  { label: "Where", value: "Wichita Farmers Market" },
                  { label: "What we bring", value: "Cider · Farm goods · Seasonal produce" },
                  { label: "Stay updated", value: "Newsletter or Facebook for market-day specifics" },
                ].map((row) => (
                  <div key={row.label} className="flex gap-6 pb-5 border-b border-orchard/10 last:border-0 last:pb-0">
                    <p className="section-label w-28 shrink-0">{row.label}</p>
                    <p className="text-orchard font-light text-sm">{row.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What's on tap */}
      <section className="py-20 md:py-28 bg-orchard text-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="section-label text-amber mb-5">At the Tap Room</p>
          <h2 className="font-serif text-5xl md:text-6xl text-cream mb-12 leading-tight">
            Something for everyone
            <br />
            <em>on tap.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-cream/10">
            {drinks.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-orchard p-8 md:p-10"
              >
                <span className={`text-xs tracking-widest uppercase font-light px-3 py-1 border mb-5 inline-block ${d.tag === "21+" ? "border-amber text-amber" : "border-cream/30 text-cream/50"}`}>
                  {d.tag}
                </span>
                <h3 className="font-serif text-2xl text-cream mb-2">{d.name}</h3>
                <p className="text-cream/50 font-light text-sm">{d.sub}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-cream/35 font-light text-xs mt-6">
            Seasonal slushie flavors change throughout the year — ask at the counter what's available today.
          </p>
        </div>
      </section>

      {/* Activities grid */}
      <section className="py-28 md:py-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="section-label mb-4">What to Do</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight">
                Walk, play,
                <br />
                <em>drink, eat, enjoy.</em>
              </h2>
            </div>
            <p className="text-stone font-light max-w-xs">
              A full day's worth of things to do for every age, every season.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {activities.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: (i % 6) * 0.07 }}
                viewport={{ once: true }}
                className={`group relative overflow-hidden ${i === 0 ? "col-span-2 md:col-span-1" : ""} aspect-square`}
              >
                <Image src={a.image} alt={a.name} fill className="estate-photo object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-orchard/80 via-orchard/15 to-transparent group-hover:from-orchard/90 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                  <p className="text-xs tracking-widest uppercase text-amber font-light mb-1">{a.season}</p>
                  <h3 className="font-serif text-xl md:text-2xl text-cream leading-tight">{a.name}</h3>
                  <p className="text-xs text-cream/60 font-light mt-1 hidden md:block leading-snug">{a.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <BranchDivider className="text-orchard max-w-7xl mx-auto px-6 md:px-12" />

      {/* Amenities */}
      <section className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-start mb-16">
            <div>
              <p className="section-label mb-4">Amenities</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight">
                Everything you need
                <br />
                <em>for a full day.</em>
              </h2>
            </div>
            <p className="text-stone font-light leading-relaxed md:pt-12">
              Meadowlark is built for long visits — bring the whole family, bring
              a blanket, bring a picnic. We've tried to think of everything so
              you don't have to.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-orchard/10 border border-orchard/10">
            {amenities.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                viewport={{ once: true }}
                className="bg-cream p-8"
              >
                <span className="text-2xl mb-4 block">{a.icon}</span>
                <h3 className="font-serif text-xl text-orchard mb-2">{a.label}</h3>
                <p className="text-sm text-stone font-light leading-relaxed">{a.detail}</p>
              </motion.div>
            ))}
          </div>

          {/* Parking & access detail */}
          <div className="mt-6 bg-cream-dark p-8 md:p-10 border border-orchard/10">
            <p className="section-label mb-4">Getting Around the Farm</p>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-stone font-light leading-relaxed">
              <p><strong className="text-orchard font-serif text-base block mb-1">Parking</strong>Large gravel parking lot on site. Ample space for cars, SUVs, buses, and large trucks. No fee for parking.</p>
              <p><strong className="text-orchard font-serif text-base block mb-1">Paths & Roads</strong>The farm has gravel roads and grass and dirt walking paths throughout the orchard and grounds. Wear comfortable shoes.</p>
              <p><strong className="text-orchard font-serif text-base block mb-1">Field Trips & Groups</strong>School field trips and large group visits welcome. Bus-friendly parking. Contact us ahead of time so we can prepare.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Season calendar */}
      <section className="py-28 md:py-36 bg-cream-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="section-label mb-6 text-center">Season Calendar</p>
          <h2 className="font-serif text-4xl md:text-5xl text-orchard text-center mb-16 leading-tight">
            Plan ahead —
            <br />
            <em>every season is different.</em>
          </h2>

          <div className="space-y-px">
            {[
              { period: "Every Saturday", activity: "Wichita Farmers Market", note: "Find us in town every Saturday with cider, farm goods, and seasonal produce." },
              { period: "May", activity: "Strawberry U-Pick", note: "Opens when berries are ready. Call or text ahead for availability." },
              { period: "July – August", activity: "Peach U-Pick · Peach Cider release", note: "Peak peach season. Some of the best days at the farm." },
              { period: "August – October", activity: "Apple U-Pick · 30+ Varieties", note: "Flagship and reserve cider season. Cider pressing demos run during harvest." },
              { period: "October", activity: "Pumpkin Patch · Sweet Cider on tap", note: "Fresh-pressed non-alcoholic sweet cider available all October." },
              { period: "Year-Round", activity: "Tap Room · Farm Store · Animals · Disc Golf", note: "Wed–Sun. Root beer and sparkling cider always on tap. No appointment needed." },
              { period: "Seasonal", activity: "Live Music · Cider Events · Slushies", note: "Slushie flavors rotate by season. Concert and pairing event dates on Facebook and newsletter." },
            ].map((row, i) => (
              <motion.div
                key={row.period}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-3 gap-4 md:gap-8 py-6 border-b border-orchard/10 items-start"
              >
                <p className="section-label">{row.period}</p>
                <p className="font-serif text-xl text-orchard">{row.activity}</p>
                <p className="text-sm text-stone font-light">{row.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RemindMe */}
      <RemindMe variant="section" />

      {/* Know Before You Come — disclaimer */}
      <section className="py-20 md:py-24 bg-cream-dark border-t border-orchard/10">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="flex items-start gap-6 mb-10">
            <LeafMark className="w-4 h-6 text-maroon shrink-0 mt-1" />
            <div>
              <p className="section-label mb-3">Know Before You Come</p>
              <h2 className="font-serif text-4xl md:text-5xl text-orchard leading-tight">
                We're a real working farm.
                <br />
                <em>Here's what that means.</em>
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Bugs & Wildflowers",
                body: "This is an active orchard with wildflowers, tall grasses, and all the insects that come with them — bees, butterflies, and more. We wouldn't have it any other way, but come prepared if you're sensitive.",
              },
              {
                title: "Pollen & Juniper",
                body: "We have juniper trees on the property, and during bloom season the air carries pollen. Allergy sufferers may want to bring antihistamines, especially in spring and early summer.",
              },
              {
                title: "Gravel Roads & Dirt Paths",
                body: "Getting around the farm means gravel roads and grass or dirt walking paths. Sturdy, comfortable footwear is recommended — heels are not your friend out here.",
              },
              {
                title: "Weather & Shade",
                body: "We have covered and semi-covered picnic areas, but Kansas weather does its own thing. Bring sunscreen and water. In summer, mornings are cooler — earlier visits are often the best.",
              },
              {
                title: "Animals on the Grounds",
                body: "Goats and farm animals are part of the Meadowlark experience. They're friendly, but remind little ones to be gentle. Keep dogs leashed — they get excited too.",
              },
              {
                title: "Cash is Preferred",
                body: "We accept cards, but cash is always preferred. Admission is paid at the shop counter when you arrive. Tabs are settled at departure.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-cream p-8 border border-orchard/8">
                <h3 className="font-serif text-xl text-orchard mb-3">{item.title}</h3>
                <p className="text-sm text-stone font-light leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Private events */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              viewport={{ once: true }}
            >
              <p className="section-label mb-5">Private Events & Field Trips</p>
              <h2 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight mb-8">
                Bring your
                <br />
                <em>people here.</em>
              </h2>
              <p className="text-stone font-light leading-relaxed mb-4">
                Meadowlark welcomes school field trips, private parties, photography
                sessions, and group gatherings. We have covered and semi-covered
                picnic shelters, plenty of seating, and bus-friendly parking.
              </p>
              <p className="text-stone font-light leading-relaxed mb-10">
                Groups of 10 or more — please call or text ahead so we can
                prepare for you.
              </p>
              <a href="mailto:gina@themeadowlarkfarm.com" className="btn-primary">Get in Touch</a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              viewport={{ once: true }}
              className="aspect-[4/3] relative overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=900&q=85"
                alt="Picnic and gathering space at Meadowlark Farm"
                fill
                className="estate-photo object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Getting here */}
      <section className="py-28 md:py-36 bg-orchard text-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <LeafMark className="w-5 h-8 text-amber mb-8" />
              <p className="section-label text-amber mb-5">Getting Here</p>
              <h2 className="font-serif text-5xl md:text-6xl text-cream leading-tight mb-8">
                East of Wichita.
                <br />
                <em>Worth the drive.</em>
              </h2>
              <div className="space-y-4 text-cream/65 font-light text-sm">
                <p>11249 SW 160th St<br />Rose Hill, KS 67133</p>
                <p>About 20 minutes east of downtown Wichita. Gravel road to the farm entrance.</p>
                <p>Text: <a href="sms:3165188907" className="text-amber hover:text-amber-light underline underline-offset-2">(316) 518-8907</a></p>
                <p>Email: <a href="mailto:gina@themeadowlarkfarm.com" className="text-amber hover:text-amber-light underline underline-offset-2">gina@themeadowlarkfarm.com</a></p>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/shop" className="btn-primary bg-amber text-orchard hover:bg-amber-light">Shop Online</Link>
                <Link href="/cider-club" className="btn-outline border-cream/40 text-cream hover:bg-cream/10">Join the Cider Club</Link>
              </div>
            </div>
            <div className="aspect-video relative overflow-hidden border border-cream/10">
              <iframe
                title="Meadowlark Farm location — 11249 SW 160th St, Rose Hill, KS"
                src="https://maps.google.com/maps?q=11249%20SW%20160th%20St%2C%20Rose%20Hill%2C%20KS%2067133&z=13&output=embed"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, filter: "saturate(0.9) sepia(0.08)" }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
