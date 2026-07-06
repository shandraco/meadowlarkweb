import { ImageResponse } from "next/og";

// Dynamic OG card for the site root — regenerated per request but cached
// aggressively by Vercel. Uses the Meadowlark Prairie palette. Avoids
// external fonts (Cormorant/Inter aren't bundled with the Node runtime by
// default), so text renders in the sans-serif system fallback the ImageResponse
// engine ships with.

export const runtime = "edge";
export const alt = "Meadowlark Farm — Orchard & Cidery, Rose Hill, Kansas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1F3A5C 0%, #122540 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* Sunflower flourish — pure SVG so no font work needed */}
        <div style={{ position: "absolute", top: 60, right: 80, opacity: 0.15 }}>
          <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="#D9A621" strokeWidth={1}>
            <circle cx="12" cy="12" r="3" fill="#D9A621" fillOpacity={0.3} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <path
                key={deg}
                d="M12 12 L12 3"
                transform={`rotate(${deg} 12 12)`}
                strokeWidth={1.4}
              />
            ))}
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              color: "#D9A621",
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 300,
              display: "flex",
            }}
          >
            Rose Hill, Kansas · Est. 2010
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#F4EAD1",
              fontSize: 84,
              lineHeight: 1.05,
              letterSpacing: -1,
              fontWeight: 500,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex" }}>Meadowlark Farm</div>
            <div style={{ display: "flex", color: "#D9A621", fontStyle: "italic" }}>
              Orchard &amp; Cidery
            </div>
          </div>
          <div
            style={{
              marginTop: 24,
              color: "#F4EAD1",
              fontSize: 24,
              opacity: 0.7,
              display: "flex",
              maxWidth: 800,
            }}
          >
            Hard cider, peaches, apples, and pumpkins — grown east of Wichita.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(244,234,209,0.15)",
          }}
        >
          <div
            style={{
              color: "#F4EAD1",
              fontSize: 20,
              opacity: 0.75,
              display: "flex",
            }}
          >
            themeadowlarkfarm.com
          </div>
          <div
            style={{
              color: "#8B1E20",
              background: "#D9A621",
              padding: "10px 24px",
              fontSize: 16,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontWeight: 500,
              display: "flex",
            }}
          >
            Shop Cider
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
