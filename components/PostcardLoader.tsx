"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, type MotionValue } from "framer-motion";
import { LeafMark } from "./Ornament";
import { loaderBridge } from "@/lib/loaderBridge";

type Phase = "entering" | "showing" | "flipping" | "expanding" | "done";

const PAPER = "#DECCB0";
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E\")";

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function PostcardLoader() {
  const [phase, setPhase] = useState<Phase>("entering");
  const [expandScale, setExpandScale] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);

  // Drive the flip with a real angle so the faces swap exactly at 90°
  // (a fixed time delay can't, because the easing front-loads the rotation).
  const rotateY = useMotionValue(0);
  const frontOpacity = useTransform(rotateY, [0, 89.99, 90, 180], [1, 1, 0, 0]);
  const backOpacity = useTransform(rotateY, [0, 89.99, 90, 180], [0, 0, 1, 1]);

  // Lock scroll for the duration
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Animation sequence
  useEffect(() => {
    (async () => {
      await sleep(350);
      setPhase("showing");       // card drops in
      await sleep(1700);
      setPhase("flipping");      // flip starts
      animate(rotateY, 180, { duration: 0.85, ease: [0.22, 1, 0.36, 1] });
      await sleep(950);
      // Compute exact scale needed to cover the viewport
      if (cardRef.current) {
        const { width, height } = cardRef.current.getBoundingClientRect();
        const sx = window.innerWidth / width;
        const sy = window.innerHeight / height;
        setExpandScale(Math.max(sx, sy) * 1.08);
      }
      setPhase("expanding");     // card grows to fill screen
      await sleep(1100);
      setPhase("done");          // overlay removed, hero now visible
      await sleep(350);          // brief moment for hero to settle
      loaderBridge.complete();   // signal Nav to slide down
    })();
  }, []);

  useEffect(() => {
    if (phase === "done") document.body.style.overflow = "";
  }, [phase]);

  const skip = () => {
    document.body.style.overflow = "";
    setPhase("done");
  };

  const expanding = phase === "expanding";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="postcard-loader"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "#2C3E1F" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: expanding ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: expanding ? 0.9 : 0.35,
            delay:    expanding ? 0.25 : 0,
            ease: "easeInOut",
          }}
        >
          {/* Subtle radial glow behind card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(196,134,42,0.08) 0%, transparent 70%)",
            }}
          />

          {/* 3-D scene */}
          <div style={{ perspective: "1400px" }}>
            <motion.div
              ref={cardRef}
              style={{
                width: "clamp(300px, 80vw, 520px)",
                aspectRatio: "8 / 5",
                transformStyle: "preserve-3d",
                position: "relative",
                rotateY,
              }}
              initial={{ opacity: 0, y: 40, scale: 0.86 }}
              animate={{
                opacity:  phase === "entering" ? 0 : 1,
                y:        phase === "entering" ? 40 : 0,
                scale:    expanding ? expandScale : 1,
              }}
              transition={{
                opacity:  { duration: 0.55, ease: "easeOut" },
                y:        { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
                scale: expanding
                  ? { duration: 0.65, ease: [0.4, 0, 0.2, 1] }
                  : { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <CardFront opacity={frontOpacity} />
              <CardBack opacity={backOpacity} />
            </motion.div>
          </div>

          {/* Skip button — only while showing front */}
          <AnimatePresence>
            {phase === "showing" && (
              <motion.button
                key="skip"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                onClick={skip}
                className="absolute bottom-8 right-8 text-cream/35 text-xs tracking-widest uppercase font-light hover:text-cream/60 transition-colors duration-200"
              >
                Skip →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Postcard Front ────────────────────────────────────────── */
function CardFront({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      // Opacity is driven by the flip angle and snaps to 0 exactly at 90°,
      // so the front is never seen facing backwards (guards against 3D flattening).
      style={{
        opacity,
        position: "absolute",
        inset: 0,
        borderRadius: 3,
        overflow: "hidden",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
        backgroundColor: PAPER,
        backgroundImage: GRAIN,
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(44,62,31,0.06), inset 0 0 0 1px rgba(255,255,255,0.45)",
      }}
    >
      <div style={{ position: "absolute", inset: "6%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

        {/* ── Top row ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{
              fontFamily: "var(--font-inter, system-ui, sans-serif)",
              fontWeight: 300,
              fontSize: "clamp(5px, 1.4vw, 8px)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(44,62,31,0.35)",
              lineHeight: 1.8,
            }}>
              Rose Hill · Kansas
            </p>
            <p style={{
              fontFamily: "var(--font-inter, system-ui, sans-serif)",
              fontWeight: 300,
              fontSize: "clamp(4px, 1.1vw, 6px)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(44,62,31,0.2)",
              lineHeight: 1,
            }}>
              Est. 2010
            </p>
          </div>

          {/* Stamp */}
          <div style={{
            border: "1px solid rgba(44,62,31,0.18)",
            padding: 3,
            marginLeft: 12,
            flexShrink: 0,
            width: "clamp(32px, 8vw, 52px)",
            height: "clamp(40px, 10vw, 65px)",
          }}>
            <div style={{
              width: "100%", height: "100%",
              backgroundColor: "rgba(44,62,31,0.04)",
              border: "1px solid rgba(44,62,31,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/meadowlark-logo.png"
                alt=""
                style={{
                  width: "80%",
                  height: "80%",
                  objectFit: "contain",
                  mixBlendMode: "multiply",
                  opacity: 0.55,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Centre message ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "4% 0" }}>
          <p style={{
            fontFamily: "var(--font-inter, system-ui, sans-serif)",
            fontWeight: 300,
            fontSize: "clamp(6px, 1.7vw, 10px)",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#C4862A",
            marginBottom: "5%",
          }}>
            Welcome to
          </p>

          <h2 style={{
            fontFamily: "var(--font-cormorant, Georgia, serif)",
            fontSize: "clamp(1.75rem, 7.5vw, 3.8rem)",
            color: "#2C3E1F",
            lineHeight: 1.1,
            fontWeight: 400,
          }}>
            Meadowlark<br />
            <em>Farm</em>
          </h2>

          {/* Ornament row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "5% 0" }}>
            <div style={{ height: 1, width: "clamp(16px,4vw,32px)", backgroundColor: "rgba(44,62,31,0.15)" }} />
            <LeafMark
              className="text-maroon"
              style={{ width: "clamp(8px,2vw,14px)", height: "auto", opacity: 0.6 }}
            />
            <div style={{ height: 1, width: "clamp(16px,4vw,32px)", backgroundColor: "rgba(44,62,31,0.15)" }} />
          </div>

          <p style={{
            fontFamily: "var(--font-inter, system-ui, sans-serif)",
            fontWeight: 300,
            fontSize: "clamp(5px, 1.3vw, 8px)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(44,62,31,0.28)",
          }}>
            Orchard & Cidery
          </p>
        </div>

        {/* ── Footer ── */}
        <div>
          <div style={{ height: 1, backgroundColor: "rgba(44,62,31,0.08)", marginBottom: "4%" }} />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <p style={{
              fontFamily: "var(--font-inter, system-ui, sans-serif)",
              fontWeight: 300,
              fontSize: "clamp(4px, 1.1vw, 7px)",
              color: "rgba(44,62,31,0.22)",
              lineHeight: 1.9,
            }}>
              11249 SW 160th St<br />Rose Hill, KS 67133
            </p>
            {/* Postmark */}
            <div style={{
              width: "clamp(28px,7vw,46px)",
              height: "clamp(28px,7vw,46px)",
              borderRadius: "50%",
              border: "1px solid rgba(44,62,31,0.18)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              opacity: 0.5, flexShrink: 0,
            }}>
              <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "clamp(3px,0.75vw,5px)", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(44,62,31,0.5)", lineHeight: 1.6 }}>Rose Hill</p>
              <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "clamp(3px,0.75vw,5px)", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(44,62,31,0.5)" }}>KS</p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

/* ── Postcard Back ─────────────────────────────────────────── */
// Layout and gradient intentionally match the homepage hero so the
// expand-and-fade transition feels like the card IS the landing page.
function CardBack({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      // Opacity is driven by the flip angle and snaps to 1 exactly at 90° —
      // paired with the front's fade-out so the correct face always shows,
      // even if the browser flattens the 3D transform context mid-animation.
      style={{
        opacity,
        position: "absolute",
        inset: 0,
        borderRadius: 3,
        overflow: "hidden",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
        transform: "rotateY(180deg)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      }}
    >
      {/* Background image carries the same warm "estate film" grade as the
          hero photo so the expand-to-hero hand-off is seamless. */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/images/cider-flight.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "saturate(0.88) contrast(1.05) brightness(0.98) sepia(0.12)",
      }} />

      {/* Same gradient as hero: heavy at bottom, fading up */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(44,62,31,0.85) 0%, rgba(44,62,31,0.25) 55%, transparent 100%)",
      }} />

      {/* Hero-matching content — bottom-left aligned */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        justifyContent: "flex-end",
        padding: "8% 8% 10%",
      }}>
        {/* Section label */}
        <p style={{
          fontFamily: "var(--font-inter, system-ui, sans-serif)",
          fontWeight: 300,
          fontSize: "clamp(5px, 0.9vw, 8px)",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#C9A84B",
          marginBottom: "5%",
        }}>
          Rose Hill, Kansas — Est. 2010
        </p>

        {/* Hero headline — same structure, sizes tuned to match hero after card expansion */}
        <h2 style={{
          fontFamily: "var(--font-cormorant, Georgia, serif)",
          fontWeight: 400,
          fontSize: "clamp(1.35rem, 3.8vw, 2.2rem)",
          color: "#DECCB0",
          lineHeight: 1.1,
          marginBottom: "5%",
        }}>
          Where the<br />orchard<br />
          <em style={{ color: "rgba(201,168,75,0.9)" }}>meets the glass.</em>
        </h2>

        {/* Body text */}
        <p style={{
          fontFamily: "var(--font-inter, system-ui, sans-serif)",
          fontWeight: 300,
          fontSize: "clamp(5px, 0.95vw, 9px)",
          color: "rgba(222,204,176,0.72)",
          lineHeight: 1.75,
          marginBottom: "7%",
          maxWidth: "80%",
        }}>
          Tom & Gina Brown planted 5,000 trees on Kansas prairie and pressed
          their first cider in 2010. Every bottle is still made from fruit
          grown right here.
        </p>

        {/* CTA buttons — match hero layout */}
        <div style={{ display: "flex", gap: "3%", flexWrap: "wrap" }}>
          <span style={{
            display: "inline-block",
            padding: "2.5% 7%",
            backgroundColor: "#6D1A28",
            color: "#DECCB0",
            fontFamily: "var(--font-inter, system-ui, sans-serif)",
            fontWeight: 300,
            fontSize: "clamp(4px, 0.8vw, 7px)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}>
            Shop Cider
          </span>
          <span style={{
            display: "inline-block",
            padding: "2.5% 7%",
            border: "1px solid rgba(222,204,176,0.45)",
            color: "#DECCB0",
            fontFamily: "var(--font-inter, system-ui, sans-serif)",
            fontWeight: 300,
            fontSize: "clamp(4px, 0.8vw, 7px)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}>
            Our Story
          </span>
        </div>
      </div>
    </motion.div>
  );
}
