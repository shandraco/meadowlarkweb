import type { Metadata } from "next";
import { Cormorant_SC, Cormorant, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/store/CartProvider";

const cormorantSC = Cormorant_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal"],
  variable: "--font-cormorant",
});

// Flowing italic display face used for the emphasized <em> lines inside
// headings — the swashy italic plays against the engraved small caps.
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

export const metadata: Metadata = {
  title: "Meadowlark Farm | Orchard & Cidery — Wichita, Kansas",
  description:
    "Hard cider, peaches, apples, and pumpkins grown east of Wichita, Kansas. Visit the orchard, join the Cider Club, and shop our seasonal releases.",
  openGraph: {
    title: "Meadowlark Farm | Orchard & Cidery",
    description: "Hard cider and orchard fruit grown east of Wichita, Kansas.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorantSC.variable} ${cormorantDisplay.variable} ${playfair.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
