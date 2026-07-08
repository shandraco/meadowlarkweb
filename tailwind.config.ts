import type { Config } from "tailwindcss";

// Meadowlark Prairie — Kansas flag (navy + gold) + the farm's rustic warmth
// (cider burgundy, prairie green, wheat cream). Ties every surface back to
// the Kansas state palette and the meadowlark bird's own colors: gold breast,
// dark head/back, prairie tones.
//
// Token strategy: semantic first (meadow / sunflower / cider / orchard),
// legacy aliases (maroon, amber, cream, orchard) still resolve so components
// mid-migration keep rendering.
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Primary structural ───────────────────────────────────────
        // Prairie navy — Kansas flag, meadowlark's back, night sky over
        // wheat. Used for nav, footers, headings on cream.
        meadow: "#1F3A5C",
        "meadow-deep": "#122540",
        "meadow-light": "#3E5E85",
        "meadow-sky": "#B7CCE3",

        // Sunflower gold — Kansas state flower, meadowlark's chest,
        // late-season wheat. CTAs, price highlights, accents.
        sunflower: "#D9A621",
        "sunflower-light": "#EBC65C",
        "sunflower-deep": "#A97F0F",

        // Cider burgundy — sunset over the prairie, wine, aged cider.
        // The warm red the client asked for.
        cider: "#8B1E20",
        "cider-light": "#B03A3C",
        "cider-deep": "#611013",

        // Prairie / orchard green — leaves, sunflower stems, tallgrass.
        orchard: "#5D7A3E",
        "orchard-light": "#7C9C58",
        "orchard-deep": "#3E5626",

        // ── Neutrals ────────────────────────────────────────────────
        // Wheat cream — page background, cards, straw bales.
        wheat: "#F4EAD1",
        "wheat-light": "#FBF5E4",
        "wheat-dark": "#E5D5B4",

        // Ink — darkest text, deep prairie shadow.
        ink: "#1B2A3D",
        "ink-soft": "#3E5470",
        // Muted taupe for labels/secondary copy. Darkened from #7C6E5B so it
        // clears WCAG AA (4.5:1) on the wheat page background (now 5.64:1).
        stone: "#655A48",

        // Legacy aliases so pages still mid-migration keep rendering
        // (they now resolve to the Prairie palette).
        paper: "#F4EAD1",
        "paper-dark": "#E5D5B4",
        sunset: "#8B1E20",
        maroon: "#8B1E20",
        "maroon-light": "#B03A3C",
        amber: "#D9A621",
        "amber-light": "#EBC65C",
        cream: "#F4EAD1",
        "cream-dark": "#E5D5B4",
        bark: "#7C6E5B",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.25em",
      },
      animation: {
        "spin-slow": "spin 18s linear infinite",
        "marquee": "marquee 28s linear infinite",
        "marquee2": "marquee2 28s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
