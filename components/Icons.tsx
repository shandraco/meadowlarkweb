// Custom Kansas-prairie icon set. Each icon is a lightweight inline SVG,
// sized via the parent (uses viewBox so `className="w-6 h-6"` works). Icons
// use `currentColor` for the stroke/fill so they inherit the text color of
// wherever they're rendered — set `text-sunflower` or `text-cider` on the
// parent to recolor.
//
// Themes:
//   • Farm subjects — Meadowlark, Sunflower, Apple, Peach, Pumpkin,
//     Strawberry, Wheat, Leaf, Barn, Tractor, CiderMug, CiderBottle
//   • Kansas markers — MapPin, KansasOutline, SunRays (flag flourish)
//   • UI — Search, Clock, Phone, Envelope, Cart, Menu, Close, ChevronRight,
//     Check, Star

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

// ── FARM SUBJECTS ─────────────────────────────────────────────────────────

export function Meadowlark(props: IconProps) {
  return (
    <svg {...base} {...props}>
      {/* Meadowlark bird — perched, wings folded, tail up */}
      <path d="M4 15c0-2.5 2-4.5 4.5-4.5S13 12.5 13 15" />
      <path d="M13 15c1-.5 3-1 5-1 1.5 0 3 .5 3 1.5S19.5 17 18 17" />
      <path d="M18 17c-.5 1-2 1.5-4 1.5H8" />
      <path d="M8 18.5c-1 .5-2 1.5-2 2.5" />
      <circle cx="9.5" cy="12.5" r=".7" fill="currentColor" stroke="none" />
      <path d="M11 13.5l2-.5" />
      <path d="M13 15v-3.5c0-1 .5-2 1.5-2" />
      <path d="M14.5 9.5c1 0 2 .5 2 1.5" />
    </svg>
  );
}

export function Sunflower(props: IconProps) {
  return (
    <svg {...base} {...props}>
      {/* Sunflower — Kansas state flower */}
      <circle cx="12" cy="10" r="2.5" fill="currentColor" fillOpacity="0.2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <path
          key={deg}
          d="M12 10 L12 4.5"
          transform={`rotate(${deg} 12 10)`}
          strokeWidth={1.6}
        />
      ))}
      <path d="M12 12.5v7.5" />
      <path d="M12 15c-1.5-.5-3-.5-4 .5" />
      <path d="M12 17c1.5-.3 3-.2 4 .8" />
    </svg>
  );
}

export function Apple(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 7.5C12 6 13 4.5 15 4.5" />
      <path d="M14 6.5c-.5 1-1.5 1.5-2 1.5" />
      <path d="M12 8c-3 0-6 2-6 6 0 3 2 6 4.5 6 1 0 1.5-.5 1.5-.5s.5.5 1.5.5c2.5 0 4.5-3 4.5-6 0-4-3-6-6-6z" />
    </svg>
  );
}

export function Peach(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 6.5C10.5 5 8 5.5 8 8" />
      <path d="M10 7c1-.5 2-.5 3 0" />
      <path d="M12 8c-3.5 0-6 2.5-6 6 0 3.5 2.5 6 6 6s6-2.5 6-6c0-3.5-2.5-6-6-6z" />
      <path d="M12 12c-1.5 0-2.5 1-3 2" />
    </svg>
  );
}

export function Pumpkin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 6c-.5-1-1.5-2-2.5-2" />
      <path d="M12 6c.5-1 1.5-2 2.5-2" />
      <path d="M12 6c-4 0-7 2.5-7 7s3 7 7 7 7-2.5 7-7-3-7-7-7z" />
      <path d="M9 8c-1.5 1-2 3-2 5s.5 4 2 5" />
      <path d="M15 8c1.5 1 2 3 2 5s-.5 4-2 5" />
      <path d="M12 8v10" />
    </svg>
  );
}

export function Strawberry(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 6l4-1 4 1" />
      <path d="M10 5.5V8" />
      <path d="M14 5.5V8" />
      <path d="M12 5V8" />
      <path d="M12 8c-4 0-6.5 2.5-6.5 5.5 0 4 3.5 6.5 6.5 6.5s6.5-2.5 6.5-6.5C18.5 10.5 16 8 12 8z" />
      <circle cx="9.5" cy="12" r=".5" fill="currentColor" stroke="none" />
      <circle cx="13" cy="13" r=".5" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="15.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="14" cy="16" r=".5" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="17.5" r=".5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Wheat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21V6" />
      <path d="M12 8c-1.5-1.5-3-1.5-4 0 1.5 1.5 3 1.5 4 0z" />
      <path d="M12 8c1.5-1.5 3-1.5 4 0-1.5 1.5-3 1.5-4 0z" />
      <path d="M12 11c-1.5-1.5-3-1.5-4 0 1.5 1.5 3 1.5 4 0z" />
      <path d="M12 11c1.5-1.5 3-1.5 4 0-1.5 1.5-3 1.5-4 0z" />
      <path d="M12 14c-1.5-1.5-3-1.5-4 0 1.5 1.5 3 1.5 4 0z" />
      <path d="M12 14c1.5-1.5 3-1.5 4 0-1.5 1.5-3 1.5-4 0z" />
      <path d="M12 6c-1-1-2-1.5-3-1.5" />
      <path d="M12 6c1-1 2-1.5 3-1.5" />
    </svg>
  );
}

export function Leaf(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
      <path d="M5 19c3-3 7-6 14-14" />
    </svg>
  );
}

export function Barn(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 20V10l9-5 9 5v10" />
      <path d="M3 20h18" />
      <path d="M9 20v-7h6v7" />
      <path d="M9 13h6" />
      <path d="M12 13v7" />
      <path d="M6 10l3-2" />
      <path d="M18 10l-3-2" />
    </svg>
  );
}

export function Tractor(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="7" cy="17" r="3" />
      <circle cx="17.5" cy="18" r="2" />
      <path d="M4 17V11h7l1 3h5.5V18" />
      <path d="M11 11V7h3v4" />
      <path d="M17.5 14v-2h2" />
    </svg>
  );
}

export function CiderMug(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 8h10v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z" />
      <path d="M16 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
      <path d="M6 11h10" />
      <path d="M8 5c0 1 1 1 1 2" />
      <path d="M11 5c0 1 1 1 1 2" />
      <path d="M14 5c0 1 1 1 1 2" />
    </svg>
  );
}

export function CiderBottle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 3h4" />
      <path d="M10 3v3.5c0 1-2 2-2 4V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V10.5c0-2-2-3-2-4V3" />
      <path d="M8 12h8" />
      <rect x="9" y="14" width="6" height="4" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

// ── KANSAS MARKERS ────────────────────────────────────────────────────────

export function MapPin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21c4-5 7-8 7-12a7 7 0 0 0-14 0c0 4 3 7 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function KansasOutline(props: IconProps) {
  return (
    <svg {...base} {...props} viewBox="0 0 24 16">
      {/* Simplified rectangular Kansas outline with the notch */}
      <path d="M1 2h13.5l1 1.5H23v10.5H1z" />
    </svg>
  );
}

export function SunRays(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.15" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <path key={deg} d="M12 12 L12 3" transform={`rotate(${deg} 12 12)`} strokeWidth={1.2} />
      ))}
    </svg>
  );
}

// ── UI ────────────────────────────────────────────────────────────────────

export function Search(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </svg>
  );
}

export function Clock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export function Phone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4h4l2 5-2.5 1.5c1 2.5 3 4.5 5.5 5.5L15.5 13l5 2v4a2 2 0 0 1-2 2C9 21 3 15 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function Envelope(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 6l9 7 9-7" />
    </svg>
  );
}

export function Cart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L21 7H6" />
      <circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Menu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function Close(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5l4 4L19 6.5" />
    </svg>
  );
}

export function Star(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
    </svg>
  );
}

// ── COMPOSITE — a decorative header flourish used above CTAs ─────────────

export function SunflowerFlourish({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-8 bg-current opacity-40" />
      <Sunflower className="w-4 h-4" />
      <span className="h-px w-8 bg-current opacity-40" />
    </div>
  );
}
