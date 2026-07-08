import type { Metadata } from "next";
import { Cormorant_SC, Cormorant, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PostcardLoader from "@/components/PostcardLoader";
import { CartProvider } from "@/components/store/CartProvider";

const cormorantSC = Cormorant_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal"],
  variable: "--font-cormorant",
});

const cormorantDisplay = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic", "normal"],
  variable: "--font-cormorant-display",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://themeadowlarkfarm.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Meadowlark Farm | Orchard & Cidery — Wichita, Kansas",
    template: "%s | Meadowlark Farm",
  },
  description:
    "Hard cider, peaches, apples, and pumpkins grown east of Wichita, Kansas. Visit the orchard, join the Cider Club, and shop our seasonal releases.",
  keywords: [
    "cider",
    "hard cider",
    "orchard",
    "Kansas",
    "Rose Hill",
    "Wichita",
    "u-pick",
    "peaches",
    "apples",
    "farm",
    "cidery",
  ],
  openGraph: {
    title: "Meadowlark Farm | Orchard & Cidery",
    description: "Hard cider and orchard fruit grown east of Wichita, Kansas.",
    type: "website",
    locale: "en_US",
    siteName: "Meadowlark Farm",
    url: siteUrl,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Meadowlark Farm orchard at golden hour, Rose Hill, Kansas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meadowlark Farm | Orchard & Cidery",
    description: "Hard cider and orchard fruit grown east of Wichita, Kansas.",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorantSC.variable} ${cormorantDisplay.variable} ${playfair.variable} ${inter.variable}`}
    >
      <body>
        <PostcardLoader />
        <CartProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
