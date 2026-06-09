import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales, defaultLocale } from "@/i18n/config";

const base = siteConfig.url.replace(/\/$/, "");

// Public, indexable marketing + legal routes (path relative to the locale root).
// Auth/dashboard/api routes are intentionally excluded — they're blocked in robots.ts.
const publicPaths = [
  "",
  "/courses",
  "/tutors",
  "/pricing",
  "/how-it-works",
  "/for-schools",
  "/competitions",
  "/stem-kits",
  "/about",
  "/contact",
  "/faq",
  "/terms",
  "/privacy",
  "/impressum",
  "/agb",
  "/widerruf",
];

// localePrefix is "as-needed" (see src/i18n/navigation.ts): the default locale (en)
// has no path prefix; ar/de are prefixed (e.g. /de/courses).
function localizedUrl(path: string, locale: string): string {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return `${base}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicPaths.map((path) => ({
    url: localizedUrl(path, defaultLocale),
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, localizedUrl(path, locale)]),
      ),
    },
  }));
}
