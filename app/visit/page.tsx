import Image from "next/image";
import Link from "next/link";
import { LeafMark, BranchDivider } from "@/components/Ornament";
import RemindMe from "@/components/RemindMe";
import OpenNowBadge from "@/components/home/OpenNowBadge";
import { getFarmStatus } from "@/lib/farm-hours";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Visit | Meadowlark Farm — Rose Hill, Kansas",
  description:
    "Hours, admission, activities, amenities, and what to expect at Meadowlark Farm — 11249 SW 160th St, Rose Hill KS.",
};

const activities = [
  { name: "Cider Flights", sub: "Order a flight in the tap room — 10 ciders across three tiers.", season: "Year-round", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80" },
  { name: "Cider Pressing Demo", sub: "Watch estate apples become cider during harvest season.", season: "Aug–Oct", image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&q=80" },
  { name: "U-Pick Strawberries", sub: "Buckets provided. Pick straight from the patch.", season: "May", image: "https://images.unsplash.com/photo-1464976062524-40e5b2199126?w=700&q=80" },
  { name: "U-Pick Peaches", sub: "Our own peaches, hand-picked by visitors.", season: "July–Aug", image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=700&q=80" },
  { name: "U-Pick Apples", sub: "30+ apple varieties across the season.", season: "Aug–Oct", image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=700&q=80" },
  { name: "Pumpkin Patch", sub: "Dozens of varieties, from pie pumpkins to giants.", season: "October", image: "https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=700&q=80" },
  { name: "Disc Golf", sub: "Family-friendly 9-hole course on the farm grounds. Free to play.", season: "Year-round", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=700&q=80" },
  { name: "Playground & Games", sub: "Kids playground, corn hole, table games, rubber duck races.", season: "Year-round", image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=700&q=80" },
  { name: "Meet the Animals", sub: "Goats and farm animals roam the grounds.", season: "Year-round", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&q=80" },
  { name: "Farm Store", sub: "Jams, mustard, apple butter, salsa, honey, eggs, cheese, local goods.", season: "Year-round", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=700&q=80" },
  { name: "Live Music & Events", sub: "Cider-pairing dinners, concerts, and seasonal celebrations.", season: "Seasonal", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=80" },
];

const amenities = [
  { label: "Restrooms", detail: "Full, clean restrooms on site" },
  { label: "Covered Areas", detail: "Covered and semi-covered picnic shelters available" },
  { label: "Seating", detail: "Picnic tables, benches, and lawn chair space" },
  { label: "Picnics Welcome", detail: "Bring your own food — outside picnics are always OK" },
  { label: "Parking", detail: "Large gravel lot; bus and RV parking available" },
  { label: "Bus & Field Trips", detail: "Group arrangements available — book online" },
  { label: "Farm Animals", detail: "Goats and animals roam the grounds" },
  { label: "Kids Playground", detail: "Full playground structure on site" },
  { label: "Dogs Welcome", detail: "Dogs on leash are always welcome" },
];

const drinks = [
  { name: "Hard Cider", sub: "10 varieties — flights or pints", tag: "21+" },
  { name: "Sparkling Apple Cider", sub: "Fresh-pressed, non-alcoholic, on tap", tag: "All ages" },
  { name: "House Root Beer", sub: "House-made, on tap", tag: "All ages" },
  { name: "Seasonal Slushies", sub: "Rotating fruit flavors — ask what's on today", tag: "All ages" },
];

const beforeYouCome = [
  { label: "Bugs + wildflowers", detail: "Prairie ecosystem. Bug spray in summer isn't a bad idea." },
  { label: "Pollen + juniper", detail: "Sensitive folks: expect real prairie air." },
  { label: "Gravel roads + dirt", detail: "Sneakers or boots. Skip the white shoes." },
  { label: "Weather + shade", detail: "Some sections covered, others open. Hat + water in summer." },
  { label: "Animals on the ground", detail: "Goats and chickens roam. Watch your step." },
  { label: "Cash preferred", detail: "We accept cards, but cash keeps our fees down." },
];

const faq = [
  { q: "Do we need reservations?", a: "No — just show up during hours. Field trips, bookings, and Cider Club members are the exceptions." },
  { q: "Can I bring my dog?", a: "Yes, on leash. There's plenty of space to walk them and water bowls near the tap room." },
  { q: "Is there an entry fee?", a: "$3.50 weekdays, $4.00 weekends per person aged 10+. Kids under 10 are free." },
  { q: "Can I bring outside food?", a: "Yes — picnic-friendly. We just ask you buy drinks from us." },
  { q: "What about kids?", a: "Playground, animals, disc golf, and rubber duck races. Under 10 free at the gate." },
  { q: "Is there Wi-Fi?", a: "Limited — this is a working farm. Coverage is patchy in the far orchard." },
  { q: "Are you open in winter?", a: "Yes, year-round. Hours are shorter and the pumpkin patch closes after October." },
];

export default async function VisitPage() {
  const farmStatus = getFarmStatus();

  return (
    <>
      {/* ── HERO — everything a first-time visitor needs above the fold. */}
      <section className="relative h-[80vh] min-h-[560px] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1800&q=85"
          alt="Meadowlark Farm grounds in autumn, Rose Hill Kansas"
          fill
          priority
          className="estate-photo object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep/90 via-meadow-deep/35 to-meadow-deep/10" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-20 w-full">
          <p className="text-xs tracking-widest uppercase font-light text-sunflower mb-4">Visit the Farm</p>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-wheat leading-[1.0] mb-6">
            Come to
            <br />
            Rose Hill.
            <br />
            <em className="text-sunflower">Stay awhile.</em>
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8 text-wheat/85 font-light">
            <OpenNowBadge variant="light" />
            <span>11249 SW 160th St, Rose Hill, KS 67133</span>
            <span className="hidden md:inline w-1 h-1 rounded-full bg-wheat/40" />
            <span className="hidden md:inline">Admission $3.50–$4.00 · Kids &lt; 10 free</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/visit/book" className="btn-accent">
              Book a Space
            </Link>
            <Link
              href="/visit/field-trips"
              className="btn-outline border-wheat/60 text-wheat hover:bg-wheat/10 hover:border-wheat"
            >
              School Field Trips
            </Link>
            <a
              href="https://maps.google.com/?q=11249+SW+160th+St,+Rose+Hill,+KS+67133"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline border-wheat/30 text-wheat/80 hover:bg-wheat/5"
            >
              Get Directions →
            </a>
          </div>
        </div>
      </section>

      {/* ── QUICK FACTS STRIP ── */}
      <section className="bg-cider text-wheat">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-wheat/15">
          {[
            { label: "Address", value: "11249 SW 160th St", sub: "Rose Hill, KS 67133 · ~20 min east of Wichita" },
            { label: "Hours", value: "Wed–Sun, 10am–5pm", sub: "Friday until 6:30pm · Year-round · No appointment needed" },
            {
              label: "Admission",
              value: "$3.50–$4.00",
              sub: `${farmStatus.open ? "Open now" : farmStatus.nextOpenLabel ?? "See hours"} · Under 10 free · Pay at shop counter`,
            },
          ].map((item) => (
            <div key={item.label} className="md:px-10 first:pl-0 last:pr-0">
              <p className="text-xs tracking-widest uppercase font-light text-sunflower-light mb-2">{item.label}</p>
              <p className="font-serif text-3xl text-wheat">{item.value}</p>
              <p className="text-sm text-wheat/60 font-light mt-1 leading-snug">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ACTIVITIES — full list, scroll-only, no clicks to reveal ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-14">
            <p className="section-label mb-4">What to do here</p>
            <h2 className="embossed font-serif text-5xl md:text-6xl text-meadow leading-tight">
              Eleven ways to
              <br />
              <em>spend the day.</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {activities.map((a) => (
              <article key={a.name} className="group relative aspect-square overflow-hidden">
                <Image src={a.image} alt={a.name} fill className="estate-photo object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-meadow-deep/85 via-meadow-deep/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
                  <p className="text-[10px] tracking-widest uppercase text-sunflower font-light mb-1">{a.season}</p>
                  <h3 className="font-serif text-lg md:text-xl text-wheat leading-tight">{a.name}</h3>
                  <p className="text-xs text-wheat/60 font-light mt-1 hidden md:block">{a.sub}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── AMENITIES + DRINKS ── */}
      <section className="py-20 md:py-24 bg-wheat-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16">
          <div>
            <p className="section-label mb-4">Amenities</p>
            <h2 className="embossed font-serif text-4xl md:text-5xl text-meadow leading-tight mb-8">
              What&apos;s on the grounds
            </h2>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {amenities.map((a) => (
                <li key={a.label} className="border-l-2 border-sunflower pl-4">
                  <p className="font-serif text-lg text-meadow">{a.label}</p>
                  <p className="text-sm text-ink-soft font-light leading-snug">{a.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="section-label mb-4">Tap Room</p>
            <h2 className="embossed font-serif text-4xl md:text-5xl text-meadow leading-tight mb-8">What we pour</h2>
            <ul className="space-y-5">
              {drinks.map((d) => (
                <li key={d.name} className="flex items-baseline justify-between gap-4 border-b border-meadow/10 pb-4">
                  <div>
                    <p className="font-serif text-xl text-meadow">{d.name}</p>
                    <p className="text-sm text-ink-soft font-light">{d.sub}</p>
                  </div>
                  <span
                    className={`text-[10px] tracking-widest uppercase px-2 py-1 whitespace-nowrap ${
                      d.tag === "21+" ? "bg-cider text-wheat" : "bg-orchard text-wheat"
                    }`}
                  >
                    {d.tag}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-soft/70 font-light mt-6 italic">
              Must be 21+ to order alcoholic cider. Non-alcoholic drinks on tap for the whole family.
            </p>
          </div>
        </div>
      </section>

      {/* ── BEFORE YOU COME ── */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-12 max-w-2xl">
            <p className="section-label mb-4">Before you come</p>
            <h2 className="embossed font-serif text-4xl md:text-5xl text-meadow leading-tight">
              A working farm.
              <br />
              <em>Here&apos;s what to expect.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            {beforeYouCome.map((b, i) => (
              <div key={b.label} className="border-t border-meadow/10 pt-4">
                <p className="text-xs tracking-widest uppercase text-cider font-light mb-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="font-serif text-xl text-meadow mb-1">{b.label}</p>
                <p className="text-sm text-ink-soft font-light leading-snug">{b.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — inline, no clicks needed to scan ── */}
      <section className="py-20 md:py-28 bg-wheat-dark">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <p className="section-label mb-4 text-center">Questions we get a lot</p>
          <h2 className="section-heading text-center mb-12">Answers, in short.</h2>
          <div className="space-y-px">
            {faq.map((item) => (
              <details key={item.q} className="group bg-wheat border border-meadow/10">
                <summary className="flex items-center justify-between px-6 md:px-8 py-5 cursor-pointer list-none">
                  <span className="font-serif text-lg md:text-xl text-meadow">{item.q}</span>
                  <span className="text-cider text-xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="px-6 md:px-8 pb-6 text-ink-soft font-light text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIRECTIONS + CONTACT ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <BranchDivider className="text-meadow mb-12" />
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <p className="section-label mb-3">Address</p>
              <p className="font-serif text-2xl text-meadow leading-tight">
                11249 SW 160th St
                <br />
                Rose Hill, KS 67133
              </p>
              <a
                href="https://maps.google.com/?q=11249+SW+160th+St,+Rose+Hill,+KS+67133"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-widest uppercase text-cider hover:text-cider-deep mt-4 inline-block"
              >
                Open in Google Maps →
              </a>
            </div>
            <div>
              <p className="section-label mb-3">Text or call</p>
              <p className="font-serif text-2xl text-meadow">
                <a href="sms:3165188907" className="hover:text-cider transition-colors">
                  (316) 518-8907
                </a>
              </p>
              <p className="text-sm text-ink-soft font-light mt-2">Text works best — we&apos;re usually outside.</p>
            </div>
            <div>
              <p className="section-label mb-3">Email</p>
              <p className="font-serif text-2xl text-meadow">
                <a href="mailto:gina@themeadowlarkfarm.com" className="hover:text-cider transition-colors">
                  gina@themeadowlarkfarm.com
                </a>
              </p>
              <p className="text-sm text-ink-soft font-light mt-2">Bookings + field trip inquiries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEASON REMINDERS ── */}
      <RemindMe variant="section" />
    </>
  );
}
