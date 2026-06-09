import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import "./globals.css";

// metadataBase makes every relative metadata URL (OpenGraph/Twitter images,
// canonicals) resolve to the live origin. Driven by NEXT_PUBLIC_APP_URL, so it
// flips to https://schulab.com automatically at the domain cutover.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: "Schulab – Launch Young Minds",
    template: "%s | Schulab",
  },
  description:
    "Schulab launches young minds. Interactive STEM courses, live tutoring, and hands-on kits for children ages 3–18.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "Schulab – Launch Young Minds",
    description: siteConfig.description,
    url: "/",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Schulab – Launch Young Minds",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
