import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Site-wide default Open Graph / social share image, generated in code (no binary
// asset to maintain or lose). 1200x630 is the standard OG/Twitter large-card size.
// v2 — aligned to the Schulab brand: indigo→purple→orange gradient + the rocket mark.
export const alt = "Schulab — Launch Young Minds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The brand tile (same geometry as src/app/icon.svg), inlined as a data URI so
// next/og can render it as an <img>.
const MARK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4F3FF0"/><stop offset="52%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#FF8A3D"/></linearGradient></defs>
<rect width="40" height="40" rx="10" fill="url(#g)"/>
<ellipse cx="12.8" cy="9.6" rx="20.8" ry="16" fill="#fff" opacity="0.1"/>
<path d="M20 4.8C23.2 7.2 26 12 26 17.6L26 23.2C26 26.8 23.2 28.4 20 28.4C16.8 28.4 14 26.8 14 23.2L14 17.6C14 12 16.8 7.2 20 4.8Z" fill="#fff"/>
<path d="M20 27.6C16 30 11.2 32.4 7.2 34.8C12 33.2 16.4 32.4 20 32.4C23.6 32.4 28 33.2 32.8 34.8C28.8 32.4 24 30 20 27.6Z" fill="#fff"/>
<path d="M14 21.6L9.6 26.8L14 25.6Z" fill="#fff"/><path d="M26 21.6L30.4 26.8L26 25.6Z" fill="#fff"/>
<circle cx="20" cy="16" r="3.4" fill="#FF8A3D"/>
<path d="M32 4.4L32.88 6.72L35.2 7.6L32.88 8.48L32 10.8L31.12 8.48L28.8 7.6L31.12 6.72Z" fill="#FF8A3D"/>
</svg>`,
  );

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
            "linear-gradient(135deg, #2A1E5C 0%, #4F3FF0 48%, #8B5CF6 78%, #FF8A3D 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img src={MARK} width={96} height={96} alt="" />
          <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>
            {siteConfig.name}
          </span>
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
              color: "rgba(255,255,255,0.82)",
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
            color: "rgba(255,255,255,0.7)",
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
