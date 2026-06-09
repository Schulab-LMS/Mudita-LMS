import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Site-wide default Open Graph / social share image, generated in code (no binary
// asset to maintain or lose). 1200x630 is the standard OG/Twitter large-card size.
// Next injects og:image (+ width/height/type) into <head> automatically; Twitter
// falls back to og:image for its large card. Statically generated at build time.
export const alt = "Schulab — Launch Young Minds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0f766e 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          <span style={{ color: "#5eead4" }}>{siteConfig.name}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {siteConfig.tagline}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 34,
              color: "#cbd5e1",
            }}
          >
            Interactive STEM · Live Tutoring · Certificates — Ages 3–18
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#94a3b8",
          }}
        >
          <div style={{ display: "flex" }}>schulab.com</div>
          <div style={{ display: "flex" }}>EN · AR · DE</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
