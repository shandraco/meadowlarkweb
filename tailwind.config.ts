import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Meadowlark palette — Kansas prairie sky
        // "meadow" = the vibrant sky blue Tom asked for
        meadow: "#1E5FA8",
        "meadow-deep": "#0A2E5C",
        "meadow-light": "#4A96D6",
        "meadow-sky": "#B7D6EF",

        // Warm accents — harvest gold and sunset
        wheat: "#D4A745",
        "wheat-light": "#E5C275",
        sunset: "#C2523A",

        // Neutrals — paper, ink, softened shadows
        paper: "#F6EEDA",
        "paper-dark": "#EBDEBE",
        ink: "#12294A",
        "ink-soft": "#3A4A67",
        stone: "#6C6960",

        // Kept for backward compatibility during rollout — will be removed
        // once every consumer moves onto the meadow palette. Mapped to the
        // closest new token so old classes don't break the page.
        orchard: "#1E5FA8",
        "orchard-light": "#4A96D6",
        maroon: "#C2523A",
        "maroon-light": "#D66B54",
        amber: "#D4A745",
        "amber-light": "#E5C275",
        cream: "#F6EEDA",
        "cream-dark": "#EBDEBE",
        bark: "#8B6914",
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
