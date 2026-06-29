// Bottom edge of the nav: straight double-rule border + centred diamond ornament.
// Inspired by the midsection of vintage scroll banners — no curves.

const INK = "#2C2010";

export default function RibbonBanner() {
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        height: 14,
        pointerEvents: "none",
      }}
    >
      {/* Upper thin rule — full width */}
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: INK,
          opacity: 0.3,
        }}
      />
      {/* Lower main rule — full width */}
      <div
        style={{
          position: "absolute",
          top: 9,
          left: 0,
          right: 0,
          height: "1.5px",
          backgroundColor: INK,
          opacity: 0.65,
        }}
      />

      {/* Centred diamond ornament overlaid on the rules */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <svg
          viewBox="0 0 160 14"
          width={160}
          height={14}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
          aria-hidden="true"
        >
          {/* Left dot */}
          <circle cx="4"  cy="9" r="1.4" fill={INK} opacity="0.45" />
          {/* Left short rule (lower) */}
          <line x1="8"  y1="9" x2="62" y2="9"  stroke={INK} strokeWidth="0.8" opacity="0.4" />
          {/* Left thin rule (upper) */}
          <line x1="8"  y1="4" x2="62" y2="4"  stroke={INK} strokeWidth="0.5" opacity="0.22" />

          {/* Diamond centred at (80, 9) */}
          <path d="M80,4 L85,9 L80,14 L75,9 Z" fill={INK} opacity="0.65" />

          {/* Right thin rule (upper) */}
          <line x1="98" y1="4" x2="152" y2="4" stroke={INK} strokeWidth="0.5" opacity="0.22" />
          {/* Right short rule (lower) */}
          <line x1="98" y1="9" x2="152" y2="9" stroke={INK} strokeWidth="0.8" opacity="0.4" />
          {/* Right dot */}
          <circle cx="156" cy="9" r="1.4" fill={INK} opacity="0.45" />
        </svg>
      </div>
    </div>
  );
}
