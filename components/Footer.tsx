import Link from "next/link";
import { LeafMark, WaxSeal } from "./Ornament";

export default function Footer() {
  return (
    <footer className="bg-orchard text-cream/80">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <LeafMark className="w-4 h-6 text-amber" />
              <p className="font-serif text-2xl text-cream">Meadowlark Farm</p>
            </div>
            <p className="text-sm font-light leading-relaxed max-w-xs mb-2">
              An estate orchard and cidery east of Wichita, Kansas.
              Every cider made from fruit grown right here.
            </p>
            <p className="text-xs font-light text-cream/40">
              Tom & Gina Brown · Founders
            </p>

            {/* Email signup */}
            <div className="mt-8">
              <p className="section-label text-amber mb-3">Seasonal updates</p>
              <form className="flex gap-0 max-w-sm">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-orchard-light border border-cream/20 text-cream placeholder:text-cream/25 px-4 py-3 text-sm font-light outline-none focus:border-amber/50 transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-amber text-orchard text-xs tracking-widest uppercase font-light hover:bg-amber-light transition-colors shrink-0"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Spacer */}
          <div className="md:col-span-1" />

          {/* Explore */}
          <div className="md:col-span-2">
            <p className="section-label text-amber mb-6">Explore</p>
            <nav className="flex flex-col gap-4">
              {[
                { href: "/shop", label: "Shop Cider" },
                { href: "/the-farm", label: "Our Story" },
                { href: "/cider-club", label: "Cider Club" },
                { href: "/visit", label: "Visit the Farm" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-light hover:text-cream transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Visit */}
          <div className="md:col-span-4">
            <p className="section-label text-amber mb-6">Find Us</p>
            <address className="not-italic text-sm font-light leading-loose">
              11249 SW 160th St<br />
              Rose Hill, KS 67133<br />
              <br />
              Wed–Sun · 10am–5pm<br />
              Friday until 6:30pm<br />
              Open year-round · No appointment needed<br />
              <br />
              Text: <a href="sms:3165188907" className="hover:text-cream transition-colors">(316) 518-8907</a><br />
              <a href="mailto:gina@themeadowlarkfarm.com" className="hover:text-cream transition-colors">gina@themeadowlarkfarm.com</a>
            </address>
            <div className="flex gap-5 mt-6">
              <a href="https://themeadowlarkfarm.com" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase hover:text-cream transition-colors">Website</a>
              <a href="#" className="text-xs tracking-widest uppercase hover:text-cream transition-colors">Instagram</a>
              <a href="#" className="text-xs tracking-widest uppercase hover:text-cream transition-colors">Facebook</a>
            </div>
          </div>
        </div>

        {/* Wax seal */}
        <div className="flex justify-center mb-10">
          <WaxSeal
            className="w-20 h-20 md:w-24 md:h-24"
            style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))" }}
          />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs font-light text-cream/75">
          <p>© {new Date().getFullYear()} Meadowlark Farm Orchard and Cidery. All rights reserved.</p>
          <p>Must be 21+ to purchase alcoholic cider · Cash preferred · Cards accepted</p>
        </div>
      </div>
    </footer>
  );
}
