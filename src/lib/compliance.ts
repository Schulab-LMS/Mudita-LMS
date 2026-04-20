import { db } from "@/lib/db";
import type { ConsentType } from "@/generated/prisma/client";

// Digital age of consent varies by jurisdiction (COPPA=13 in the US;
// GDPR-K ranges 13–16, with DE pinned at 16). We take the strictest
// default so we never enrol a minor without verified parental consent.
export const CHILD_AGE_THRESHOLD = Number(
  process.env.CHILD_AGE_THRESHOLD ?? 16
);

export const TERMS_VERSION =
  process.env.TERMS_VERSION ?? new Date().toISOString().slice(0, 10);

export const PRIVACY_VERSION =
  process.env.PRIVACY_VERSION ?? new Date().toISOString().slice(0, 10);

export function ageInYears(dateOfBirth: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const monthDelta = now.getMonth() - dateOfBirth.getMonth();
  const dayDelta = now.getDate() - dateOfBirth.getDate();
  if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) age -= 1;
  return age;
}

export function isMinor(dateOfBirth: Date, now: Date = new Date()): boolean {
  return ageInYears(dateOfBirth, now) < CHILD_AGE_THRESHOLD;
}

export type ConsentContext = {
  userId: string;
  grantedById?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function recordConsent(
  ctx: ConsentContext,
  type: ConsentType,
  version: string,
  granted: boolean = true
) {
  return db.consentRecord.create({
    data: {
      userId: ctx.userId,
      grantedById: ctx.grantedById,
      type,
      version,
      granted,
      ipAddress: ctx.ipAddress ?? undefined,
      userAgent: ctx.userAgent ?? undefined,
    },
  });
}

export async function hasActiveConsent(
  userId: string,
  type: ConsentType,
  minVersion?: string
): Promise<boolean> {
  const latest = await db.consentRecord.findFirst({
    where: { userId, type },
    orderBy: { grantedAt: "desc" },
    select: { granted: true, version: true },
  });
  if (!latest?.granted) return false;
  if (minVersion && latest.version < minVersion) return false;
  return true;
}

// Gate minor-specific actions (enrolment, purchase, content access) on a
// live parental consent record. A row with `granted:false` supersedes an
// earlier `granted:true` for the same type, so a withdrawal blocks the
// child going forward. Adults always pass.
export type MinorConsentCheck =
  | { ok: true }
  | { ok: false; reason: "consent_withdrawn" | "consent_missing" };

export async function assertMinorConsent(
  userId: string
): Promise<MinorConsentCheck> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { dateOfBirth: true },
  });
  if (!user?.dateOfBirth) return { ok: true };
  if (!isMinor(user.dateOfBirth)) return { ok: true };

  const latest = await db.consentRecord.findFirst({
    where: { userId, type: { in: ["PARENTAL_COPPA", "PARENTAL_GDPR_K"] } },
    orderBy: { grantedAt: "desc" },
    select: { granted: true },
  });
  if (!latest) return { ok: false, reason: "consent_missing" };
  if (!latest.granted) return { ok: false, reason: "consent_withdrawn" };
  return { ok: true };
}
