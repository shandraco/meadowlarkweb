"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { loaderBridge } from "@/lib/loaderBridge";
import CartIndicator from "@/components/store/CartIndicator";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/the-farm", label: "The Farm" },
  { href: "/cider-club", label: "Cider Club" },
  { href: "/visit", label: "Visit" },
];

const PAPER = "#DECCB0";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  // Staff areas use their own chrome — hide the marketing nav there.
  const isStaffArea = /^\/(login|pos|admin)(\/|$)/.test(pathname);

  // On the homepage the nav starts off-screen and slides in after the
  // PostcardLoader signals completion. On every other page it's visible immediately.
  const [navVisible, setNavVisible] = useState(!isHomepage);

  useEffect(() => {
    if (!isHomepage) {
      setNavVisible(true);
      return;
    }
    // Re-entering the homepage: hide the nav while the loader runs
    setNavVisible(false);
    return loaderBridge.addListener(() => setNavVisible(true));
  }, [isHomepage]);

  if (isStaffArea) return null;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ filter: "drop-shadow(0px 4px 14px rgba(44,62,31,0.18))" }}
      initial={{ y: isHomepage ? "-100%" : "0%" }}
      animate={{ y: navVisible ? "0%" : "-100%" }}
      transition={{ y: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
    >
      {/* Paper sheet — nav bar + mobile menu inside one continuous piece */}
      <div
        className="relative"
        style={{
          backgroundColor: PAPER,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\' opacity=\'0.07\'/%3E%3C/svg%3E")',
        }}
      >
        {/* Nav bar row */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-20 md:h-28">
          {/* Logo — vintage ribbon banner.
               mix-blend-mode: multiply turns the white bg transparent on parchment */}
          <Link href="/" aria-label="Meadowlark Farm">
            <Image
              src="/images/meadowlark-banner.png"
              alt="Meadowlark Farm — Orchard & Cidery"
              width={600}
              height={220}
              style={{
                height: 88,
                width: "auto",
                display: "block",
                mixBlendMode: "multiply",
              }}
              priority
            />
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-base tracking-widest font-display text-orchard/80 hover:text-orchard transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/store"
              className="text-base tracking-widest font-display px-5 py-2 border border-orchard text-orchard hover:bg-orchard hover:text-cream transition-all duration-300"
            >
              Order Now
            </Link>
            <CartIndicator className="text-orchard hover:text-maroon transition-colors" />
          </nav>

          {/* Mobile cart + hamburger */}
          <div className="md:hidden flex items-center gap-5">
          <CartIndicator className="text-orchard" />
          <button
            className="flex flex-col gap-[5px] text-orchard p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block h-px w-6 bg-current origin-center transition-transform duration-300 ${
                menuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-6 bg-current transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-px w-6 bg-current origin-center transition-transform duration-300 ${
                menuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
          </div>
        </div>

        {/* Mobile menu — inside the paper, above the torn edge */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-72 pb-6" : "max-h-0"
          }`}
        >
          <div className="border-t border-orchard/10 mx-6 pt-5" />
          <nav className="flex flex-col items-center gap-5 px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-xs tracking-widest uppercase font-light text-orchard/80 hover:text-orchard transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className="mt-1 text-xs tracking-widest uppercase font-light px-6 py-3 border border-orchard text-orchard hover:bg-orchard hover:text-cream transition-all"
            >
              Order Now
            </Link>
          </nav>
        </div>

      </div>
    </motion.header>
  );
}
