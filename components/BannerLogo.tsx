// Vintage ribbon banner logo — hand-traced SVG inspired by the reference image.
// Arched ribbon with MEADOWLARK FARM / Orchard & Cidery on curved text paths,
// ornate scroll/wing ends in engraving style.

import Link from "next/link";

const FACE   = "#F0E4C8"; // ribbon face (slightly lighter than nav paper)
const SHADOW = "#C8A880"; // fold / underside / scroll layers
const DEEP   = "#B09060"; // deep shadow in tightest curl areas
const INK    = "#1A0E06"; // near-black ink for all strokes + text

export default function BannerLogo() {
  return (
    <Link href="/" aria-label="Meadowlark Farm — Orchard & Cidery" style={{ flexShrink: 0, display: "block" }}>
      <svg
        viewBox="0 0 600 145"
        height={72}
        style={{ display: "block", width: "auto" }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Text paths — both follow the same arch curvature as the ribbon */}
          <path id="ml-main" d="M118,114 Q300,52 482,114" />
          <path id="ml-sub"  d="M132,127 Q300,66 468,127" />
        </defs>

        {/* ════════════════════════════════
            FILL LAYERS  (back → front)
        ════════════════════════════════ */}

        {/* ── Left outer wing fills ── */}
        {/* Upper flame */}
        <path d="M32,104 Q26,88 34,78 Q44,70 52,80 Q56,90 48,98" fill={DEEP} opacity="0.55"/>
        {/* Lower flame */}
        <path d="M40,128 Q34,142 44,148 Q54,152 60,142 Q62,132 54,126" fill={DEEP} opacity="0.55"/>
        {/* Outer wing loop */}
        <path d="M14,102 Q4,94 6,108 Q8,120 20,118 Q28,116 32,108 Q28,104 20,104 Z" fill={SHADOW} opacity="0.6"/>
        <path d="M16,124 Q4,128 4,116 Q4,106 16,106 Q22,106 26,112 Q22,118 16,116 Z" fill={SHADOW} opacity="0.5"/>
        {/* Main outer wing */}
        <path d="M32,104 Q14,94 8,106 Q2,118 14,128 Q28,136 46,126 Z" fill={SHADOW}/>
        {/* Left curl fill */}
        <path d="M68,100 Q46,90 32,102 Q20,114 32,126 Q46,138 70,132 L70,124 Q52,130 44,118 Q38,108 48,100 Q58,92 70,100 Z" fill={SHADOW}/>
        {/* Left fold fill */}
        <path d="M90,108 L68,100 L52,114 L68,138 L90,138 Z" fill={SHADOW}/>

        {/* ── Right outer wing fills (mirror) ── */}
        {/* Upper flame */}
        <path d="M568,104 Q574,88 566,78 Q556,70 548,80 Q544,90 552,98" fill={DEEP} opacity="0.55"/>
        {/* Lower flame */}
        <path d="M560,128 Q566,142 556,148 Q546,152 540,142 Q538,132 546,126" fill={DEEP} opacity="0.55"/>
        {/* Outer wing loop */}
        <path d="M586,102 Q596,94 594,108 Q592,120 580,118 Q572,116 568,108 Q572,104 580,104 Z" fill={SHADOW} opacity="0.6"/>
        <path d="M584,124 Q596,128 596,116 Q596,106 584,106 Q578,106 574,112 Q578,118 584,116 Z" fill={SHADOW} opacity="0.5"/>
        {/* Main outer wing */}
        <path d="M568,104 Q586,94 592,106 Q598,118 586,128 Q572,136 554,126 Z" fill={SHADOW}/>
        {/* Right curl fill */}
        <path d="M532,100 Q554,90 568,102 Q580,114 568,126 Q554,138 530,132 L530,124 Q548,130 556,118 Q562,108 552,100 Q542,92 530,100 Z" fill={SHADOW}/>
        {/* Right fold fill */}
        <path d="M510,108 L532,100 L548,114 L532,138 L510,138 Z" fill={SHADOW}/>

        {/* ── Main ribbon face ── */}
        <path d="M90,108 Q300,42 510,108 L510,138 Q300,72 90,138 Z" fill={FACE}/>


        {/* ════════════════════════════════
            INK / STROKE LAYERS
        ════════════════════════════════ */}

        {/* ── Main ribbon outline ── */}
        <path d="M90,108 Q300,42 510,108 L510,138 Q300,72 90,138 Z"
              stroke={INK} strokeWidth="1.4" fill="none"/>

        {/* Inner double-rule (classic ribbon detail) */}
        <path d="M96,111 Q300,46 504,111" stroke={INK} strokeWidth="0.55" fill="none" opacity="0.22"/>
        <path d="M96,134 Q300,68 504,134" stroke={INK} strokeWidth="0.55" fill="none" opacity="0.22"/>

        {/* ── Left fold ── */}
        <path d="M90,108 L68,100 L52,114 L68,138 L90,138"
              stroke={INK} strokeWidth="1.2" fill="none"/>
        {/* fold hatching */}
        <line x1="82" y1="104" x2="62" y2="116" stroke={INK} strokeWidth="0.45" opacity="0.18"/>
        <line x1="86" y1="108" x2="66" y2="120" stroke={INK} strokeWidth="0.45" opacity="0.18"/>
        <line x1="88" y1="113" x2="70" y2="125" stroke={INK} strokeWidth="0.45" opacity="0.18"/>
        <line x1="89" y1="119" x2="72" y2="131" stroke={INK} strokeWidth="0.45" opacity="0.18"/>

        {/* ── Left curl ── */}
        <path d="M68,100 Q46,90 32,102 Q20,114 32,126 Q46,138 70,132"
              stroke={INK} strokeWidth="1.1" fill="none"/>
        {/* inner curl line */}
        <path d="M44,100 Q34,106 36,118 Q40,128 56,130"
              stroke={INK} strokeWidth="0.65" fill="none" opacity="0.45"/>

        {/* ── Left main outer wing ── */}
        <path d="M32,102 Q14,92 8,106 Q2,118 14,128 Q28,138 46,128"
              stroke={INK} strokeWidth="0.9" fill="none"/>
        {/* wing sub-loops */}
        <path d="M8,106 Q0,98 2,112 Q4,122 16,120"
              stroke={INK} strokeWidth="0.65" fill="none" opacity="0.5"/>
        <path d="M14,128 Q2,132 2,120 Q2,110 14,110"
              stroke={INK} strokeWidth="0.65" fill="none" opacity="0.5"/>

        {/* Left upper flame */}
        <path d="M32,102 Q26,86 34,76 Q44,68 54,80 Q58,90 50,98"
              stroke={INK} strokeWidth="0.85" fill="none" opacity="0.7"/>
        <path d="M50,98 Q44,82 50,74 Q56,68 62,76"
              stroke={INK} strokeWidth="0.6" fill="none" opacity="0.4"/>
        {/* Left lower flame */}
        <path d="M42,128 Q36,142 46,148 Q56,152 62,142 Q64,132 56,126"
              stroke={INK} strokeWidth="0.85" fill="none" opacity="0.7"/>
        <path d="M56,126 Q62,136 56,144 Q50,150 44,144"
              stroke={INK} strokeWidth="0.6" fill="none" opacity="0.4"/>

        {/* ── Right fold ── */}
        <path d="M510,108 L532,100 L548,114 L532,138 L510,138"
              stroke={INK} strokeWidth="1.2" fill="none"/>
        {/* fold hatching */}
        <line x1="518" y1="104" x2="538" y2="116" stroke={INK} strokeWidth="0.45" opacity="0.18"/>
        <line x1="514" y1="108" x2="534" y2="120" stroke={INK} strokeWidth="0.45" opacity="0.18"/>
        <line x1="512" y1="113" x2="530" y2="125" stroke={INK} strokeWidth="0.45" opacity="0.18"/>
        <line x1="511" y1="119" x2="528" y2="131" stroke={INK} strokeWidth="0.45" opacity="0.18"/>

        {/* ── Right curl ── */}
        <path d="M532,100 Q554,90 568,102 Q580,114 568,126 Q554,138 530,132"
              stroke={INK} strokeWidth="1.1" fill="none"/>
        <path d="M556,100 Q566,106 564,118 Q560,128 544,130"
              stroke={INK} strokeWidth="0.65" fill="none" opacity="0.45"/>

        {/* ── Right main outer wing ── */}
        <path d="M568,102 Q586,92 592,106 Q598,118 586,128 Q572,138 554,128"
              stroke={INK} strokeWidth="0.9" fill="none"/>
        <path d="M592,106 Q600,98 598,112 Q596,122 584,120"
              stroke={INK} strokeWidth="0.65" fill="none" opacity="0.5"/>
        <path d="M586,128 Q598,132 598,120 Q598,110 586,110"
              stroke={INK} strokeWidth="0.65" fill="none" opacity="0.5"/>

        {/* Right upper flame */}
        <path d="M568,102 Q574,86 566,76 Q556,68 546,80 Q542,90 550,98"
              stroke={INK} strokeWidth="0.85" fill="none" opacity="0.7"/>
        <path d="M550,98 Q556,82 550,74 Q544,68 538,76"
              stroke={INK} strokeWidth="0.6" fill="none" opacity="0.4"/>
        {/* Right lower flame */}
        <path d="M558,128 Q564,142 554,148 Q544,152 538,142 Q536,132 544,126"
              stroke={INK} strokeWidth="0.85" fill="none" opacity="0.7"/>
        <path d="M544,126 Q538,136 544,144 Q550,150 556,144"
              stroke={INK} strokeWidth="0.6" fill="none" opacity="0.4"/>


        {/* ════════════════════════════════
            TEXT
        ════════════════════════════════ */}

        {/* MEADOWLARK FARM — follows top arch */}
        <text
          fontFamily="var(--font-playfair, Georgia, serif)"
          fontSize="23"
          fontWeight="600"
          fill={INK}
          letterSpacing="2"
        >
          <textPath href="#ml-main" textAnchor="middle" startOffset="50%">
            MEADOWLARK FARM
          </textPath>
        </text>

        {/* Orchard & Cidery — follows lower arch */}
        <text
          fontFamily="var(--font-playfair, Georgia, serif)"
          fontSize="13"
          fill={INK}
          opacity="0.78"
          letterSpacing="1"
        >
          <textPath href="#ml-sub" textAnchor="middle" startOffset="50%">
            Orchard &amp; Cidery
          </textPath>
        </text>
      </svg>
    </Link>
  );
}
