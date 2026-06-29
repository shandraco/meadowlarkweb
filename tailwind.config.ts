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
        orchard: "#2C3E1F",
        "orchard-light": "#3D5429",
        maroon: "#6D1A28",
        "maroon-light": "#8B2236",
        amber: "#C9A84B",
        "amber-light": "#D9C06E",
        cream: "#DECCB0",
        "cream-dark": "#C8AE8A",
        bark: "#8B6914",
        stone: "#474137",
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
