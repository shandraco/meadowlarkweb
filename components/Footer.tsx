"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeafMark, WaxSeal } from "./Ornament";

export default function Footer() {
  const pathname = usePathname();
  if (/^\/(login|pos|admin)(\/|$)/.test(pathname)) return null;

  return (
    <footer className="bg-meadow-deep text-paper/80">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <LeafMark className="w-4 h-6 text-wheat" />
              <p className="font-serif text-2xl text-paper">Meadowlark Farm</p>
            </div>
            <p className="text-sm font-light leading-relaxed max-w-xs mb-2">
              An estate orchard and cidery east of Wichita, Kansas. Every cider made from fruit grown right here.
            </p>
            <p className="text-xs font-light text-paper/40">Tom & Gina Brown · Founders</p>

            <div className="mt-8">
              <p className="text-xs tracking-widest uppercase font-light text-wheat mb-3">Seasonal updates</p>
              <form className="flex gap-0 max-w-sm">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-meadow border border-paper/20 text-paper placeholder:text-paper/30 px-4 py-3 text-sm font-light outline-none focus:border-wheat/60 transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-wheat text-ink text-xs tracking-widest uppercase font-light hover:bg-wheat-light transition-colors shrink-0"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-1" />

          {/* Explore */}
          <div className="md:col-span-2">
            <p className="text-xs tracking-widest uppercase font-light text-wheat mb-6">Explore</p>
            <nav className="flex flex-col gap-4">
              {[
                { href: "/store", label: "Shop Cider" },
                { href: "/the-farm", label: "Our Story" },
                { href: "/cider-club", label: "Cider Club" },
                { href: "/visit", label: "Visit the Farm" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-light hover:text-paper transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Visit */}
          <div className="md:col-span-4">
            <p className="text-xs tracking-widest uppercase font-light text-wheat mb-6">Find Us</p>
            <address className="not-italic text-sm font-light leading-loose">
              11249 SW 160th St
              <br />
              Rose Hill, KS 67133
              <br />
              <br />
              Wed–Sun · 10am–5pm
              <br />
              Friday until 6:30pm
              <br />
              Open year-round · No appointment needed
              <br />
              <br />
              Text:{" "}
              <a href="sms:3165188907" className="hover:text-paper transition-colors">
                (316) 518-8907
              </a>
              <br />
              <a href="mailto:gina@themeadowlarkfarm.com" className="hover:text-paper transition-colors">
                gina@themeadowlarkfarm.com
              </a>
            </address>
            <div className="flex gap-5 mt-6">
              <a href="https://themeadowlarkfarm.com" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase hover:text-paper transition-colors">
                Website
              </a>
              <a href="#" className="text-xs tracking-widest uppercase hover:text-paper transition-colors">
                Instagram
              </a>
              <a href="#" className="text-xs tracking-widest uppercase hover:text-paper transition-colors">
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <WaxSeal className="w-20 h-20 md:w-24 md:h-24" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))" }} />
        </div>

        <div className="border-t border-paper/10 pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs font-light text-paper/75">
          <p>© {new Date().getFullYear()} Meadowlark Farm Orchard and Cidery. All rights reserved.</p>
          <p>Must be 21+ to purchase alcoholic cider · Cash preferred · Cards accepted</p>
        </div>
      </div>
    </footer>
  );
}
