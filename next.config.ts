import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Content-Security-Policy ships in **Report-Only** mode first: it surfaces
// violations (browser console / report endpoint) WITHOUT breaking the page, so a
// wrong allowlist can't take down the launch. Tighten these directives against real
// beta traffic, then set CSP_ENFORCE=true (and rebuild) to promote it to enforcing
// before the public ramp. Allowlists are scoped to the platform's actual integrations:
// Stripe, PostHog/GA4, LiveKit (wss), Mux, UploadThing, YouTube/Vimeo embeds.
// next/font self-hosts fonts at build time, so font-src stays 'self'.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  // 'unsafe-inline' covers the dark-mode anti-FOUC script + inline styles (Reveal.js,
  // UI primitives); 'unsafe-eval' is required by some client libs. Replace with
  // nonces/hashes when promoting CSP to enforcing.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.posthog.com https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: https://*.mux.com https://stream.mux.com",
  "worker-src 'self' blob:",
  "connect-src 'self' https://*.posthog.com https://www.google-analytics.com https://api.stripe.com https://*.mux.com https://*.litix.io https://uploadthing.com https://*.uploadthing.com https://*.ufs.sh wss://*.livekit.cloud https://*.livekit.cloud",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://*.mux.com",
  "upgrade-insecure-requests",
].join("; ");

// Enforced immediately — none of these risk breaking app behavior. Permissions-Policy
// intentionally ALLOWS camera/microphone/display-capture for same-origin so the LiveKit
// live classroom keeps working; everything else is denied.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), display-capture=(self), geolocation=(), browsing-topics=()",
  },
  {
    // Report-Only by default (safe). Flip with CSP_ENFORCE=true + rebuild once beta
    // traffic has shown the report-only policy produces no legitimate violations.
    key:
      process.env.CSP_ENFORCE === "true"
        ? "Content-Security-Policy"
        : "Content-Security-Policy-Report-Only",
    value: contentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
