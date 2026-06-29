export function BranchDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div className="flex-1 h-px bg-current opacity-20" />
      <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="opacity-40 flex-shrink-0">
        <path d="M20 2 C14 2 8 8 8 12 C8 16 14 22 20 22 C26 22 32 16 32 12 C32 8 26 2 20 2Z" stroke="currentColor" strokeWidth="1" fill="none"/>
        <path d="M20 12 L4 12 M20 12 L36 12" stroke="currentColor" strokeWidth="1"/>
        <path d="M20 12 L12 4 M20 12 L28 4 M20 12 L12 20 M20 12 L28 20" stroke="currentColor" strokeWidth="0.75" opacity="0.6"/>
      </svg>
      <div className="flex-1 h-px bg-current opacity-20" />
    </div>
  );
}

export function LeafMark({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 36" fill="none" className={className} style={style}>
      <path d="M12 2 C6 8 2 16 2 22 C2 29 6 34 12 34 C18 34 22 29 22 22 C22 16 18 8 12 2Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M12 2 L12 34" stroke="currentColor" strokeWidth="0.75" opacity="0.5"/>
      <path d="M12 10 C8 12 5 16 5 20" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
      <path d="M12 10 C16 12 19 16 19 20" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
    </svg>
  );
}

export function WaxSeal({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  const r = 38;
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      <defs>
        {/* Domed wax shading */}
        <radialGradient id="wax-fill" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#8B2236" />
          <stop offset="55%" stopColor="#6D1A28" />
          <stop offset="100%" stopColor="#4E0F1C" />
        </radialGradient>
        <path id="wax-text-path" d={`M 60,60 m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} />
      </defs>
      {/* Irregular pressed-wax blob */}
      <path
        d="M60 6 C72 8 78 2 88 8 C98 14 96 24 104 30 C112 36 116 46 112 56 C108 66 116 74 110 84 C104 94 94 92 86 100 C78 108 70 114 60 112 C50 114 42 108 34 100 C26 92 16 94 10 84 C4 74 12 66 8 56 C4 46 8 36 16 30 C24 24 22 14 32 8 C42 2 48 8 60 6Z"
        fill="url(#wax-fill)"
      />
      {/* Inner stamped rim */}
      <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" transform="translate(0,-1.2)" />
      {/* Circular legend */}
      <text fill="rgba(255,235,220,0.55)" fontSize="8" letterSpacing="2.4" fontFamily="var(--font-inter)">
        <textPath href="#wax-text-path" startOffset="0">MEADOWLARK · ORCHARD &amp; CIDERY · </textPath>
      </text>
      {/* Embossed Meadowlark logo monogram */}
      <image
        href="/images/meadowlark-logo.png"
        x="38" y="38" width="44" height="44"
        preserveAspectRatio="xMidYMid meet"
        style={{ mixBlendMode: "screen", opacity: 0.85 }}
      />
    </svg>
  );
}

export function CircleText({ text, className = "" }: { text: string; className?: string }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const chars = text.split("");
  const angleStep = 360 / chars.length;
  return (
    <svg viewBox="0 0 120 120" className={`animate-spin-slow ${className}`}>
      <defs>
        <path id="circle-path" d={`M 60,60 m -${r},0 a ${r},${r} 0 1,1 ${r*2},0 a ${r},${r} 0 1,1 -${r*2},0`} />
      </defs>
      <text className="fill-current" fontSize="8.5" letterSpacing="3" fontFamily="var(--font-inter)">
        <textPath href="#circle-path">{text}</textPath>
      </text>
    </svg>
  );
}
