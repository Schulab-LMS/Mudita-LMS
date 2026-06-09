import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales, defaultLocale } from "@/i18n/config";

const base = siteConfig.url.replace(/\/$/, "");

// Authenticated / non-indexable areas. Each is blocked at both the unprefixed
// (default-locale) path and its localized variants (/de/admin, /ar/login, …),
// matching the "as-needed" locale prefixing.
const privateSegments = [
  "account",
  "admin",
  "dashboard",
  "messages",
  "notifications",
  "onboarding",
  "parent",
  "session",
  "student",
  "tutor",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
];

function buildDisallow(): string[] {
  const rules = new Set<string>(["/api/"]);
  for (const segment of privateSegments) {
    for (const locale of locales) {
      const prefix = locale === defaultLocale ? "" : `/${locale}`;
      rules.add(`${prefix}/${segment}`);
    }
  }
  return [...rules];
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: buildDisallow(),
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
