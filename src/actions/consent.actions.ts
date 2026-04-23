"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  COOKIE_CONSENT_COOKIE,
  COOKIE_CONSENT_VERSION,
  type CookieConsentPayload,
  type StoredCookieConsent,
} from "@/lib/consent";

// Stores the visitor's cookie-category choices in an HTTP cookie so client
// scripts (analytics / marketing loaders) can read them before the first
// render. For authenticated users we also append two ConsentRecord rows
// (COOKIES_ANALYTICS + COOKIES_MARKETING) to the append-only ledger — a
// withdrawal is modelled as a new row with granted:false (see
// prisma/schema.prisma / src/lib/compliance.ts).
//
// Anonymous visitors only get the cookie; if they later log in, the cookie
// remains authoritative until they change their preference from inside the
// app and we persist it to the DB.

const schema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
});

export async function saveCookieConsent(input: CookieConsentPayload) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const payload: StoredCookieConsent = {
    v: COOKIE_CONSENT_VERSION,
    functional: true,
    analytics: parsed.data.analytics,
    marketing: parsed.data.marketing,
    ts: new Date().toISOString(),
  };

  const jar = await cookies();
  jar.set({
    name: COOKIE_CONSENT_COOKIE,
    value: JSON.stringify(payload),
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  // If the visitor is signed in, record their choices in the consent ledger
  // so our GDPR data-export reflects the decision. Best-effort — never
  // block the cookie write on a DB failure.
  try {
    const session = await auth();
    if (session?.user?.id) {
      const h = await headers().catch(() => null);
      const ipAddress =
        h?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        h?.get("x-real-ip") ??
        undefined;
      const userAgent = h?.get("user-agent") ?? undefined;

      await db.consentRecord.createMany({
        data: [
          {
            userId: session.user.id,
            type: "COOKIES_ANALYTICS",
            granted: parsed.data.analytics,
            version: COOKIE_CONSENT_VERSION,
            ipAddress,
            userAgent,
          },
          {
            userId: session.user.id,
            type: "COOKIES_MARKETING",
            granted: parsed.data.marketing,
            version: COOKIE_CONSENT_VERSION,
            ipAddress,
            userAgent,
          },
        ],
      });
    }
  } catch (err) {
    console.error("[consent] cookie consent ledger write failed:", err);
  }

  return { success: true as const };
}
