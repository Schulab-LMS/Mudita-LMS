"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { registerSchema, type RegisterInput } from "@/validators/auth.schema";
import { rateLimit, REGISTER_RATE_LIMIT } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email";
import { sendVerificationEmail } from "@/actions/email-verification.actions";
import {
  PRIVACY_VERSION,
  TERMS_VERSION,
  isMinor,
  recordConsent,
} from "@/lib/compliance";
import { EVENTS, track } from "@/lib/analytics";

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const {
    name,
    password,
    role,
    dateOfBirth,
    parentalConsent,
    marketingOptIn,
  } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();
  const parentEmail = parsed.data.parentEmail?.trim().toLowerCase() || undefined;

  const rl = await rateLimit(`auth:register:${email}`, REGISTER_RATE_LIMIT);
  if (!rl.success) {
    return { error: "Too many attempts. Please try again later." };
  }

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime()) || dob > new Date()) {
    return { error: "Enter a valid date of birth" };
  }

  // Minors registering a learner account must have a verifying parent.
  // Parents and tutors are always adults.
  if (role === "STUDENT" && isMinor(dob)) {
    if (!parentalConsent) {
      return {
        error:
          "A parent or guardian must confirm consent before the child can register",
      };
    }
    if (!parentEmail) {
      return { error: "Parent or guardian email is required for minors" };
    }
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const headerList = await headers();
  const ipAddress =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    undefined;
  const userAgent = headerList.get("user-agent") ?? undefined;

  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as "STUDENT" | "PARENT" | "TUTOR",
        dateOfBirth: dob,
      },
    });

    // Audit trail — one row per document the user agreed to, plus marketing
    // if they opted in. Withdrawals are stored as separate rows later.
    await tx.consentRecord.createMany({
      data: [
        {
          userId: created.id,
          type: "TERMS_OF_SERVICE",
          version: TERMS_VERSION,
          granted: true,
          ipAddress,
          userAgent,
        },
        {
          userId: created.id,
          type: "PRIVACY_POLICY",
          version: PRIVACY_VERSION,
          granted: true,
          ipAddress,
          userAgent,
        },
        ...(role === "STUDENT" && isMinor(dob)
          ? [
              {
                userId: created.id,
                type: "PARENTAL_COPPA" as const,
                version: PRIVACY_VERSION,
                granted: true,
                ipAddress,
                userAgent,
              },
            ]
          : []),
        ...(marketingOptIn
          ? [
              {
                userId: created.id,
                type: "MARKETING_EMAIL" as const,
                version: PRIVACY_VERSION,
                granted: true,
                ipAddress,
                userAgent,
              },
            ]
          : []),
      ],
    });

    return created;
  });

  // Attach an additional parental-consent record when we captured a parent
  // email. We don't link it to a real parent user yet — a later verification
  // email will bind the two accounts together.
  if (role === "STUDENT" && isMinor(dob) && parentEmail) {
    await recordConsent(
      { userId: user.id, ipAddress, userAgent },
      "PARENTAL_GDPR_K",
      PRIVACY_VERSION
    );
  }

  // Send verification and welcome emails. Awaited (not fire-and-forget):
  // a floating promise in a server action can be cut short when the
  // response is flushed, which caused new users to never receive their
  // verification email. Promise.allSettled so a welcome-email failure
  // doesn't swallow the verification send.
  const [verifyResult, welcomeResult] = await Promise.allSettled([
    sendVerificationEmail(email),
    sendWelcomeEmail(email, name),
  ]);
  if (verifyResult.status === "rejected") {
    console.error("registerUser: verification email failed", verifyResult.reason);
  } else if (verifyResult.value && "success" in verifyResult.value && !verifyResult.value.success) {
    console.error("registerUser: verification email failed", verifyResult.value.error);
  }
  if (welcomeResult.status === "rejected") {
    console.error("registerUser: welcome email failed", welcomeResult.reason);
  }

  track({
    name: EVENTS.USER_SIGNED_UP,
    userId: user.id,
    properties: {
      role,
      isMinor: role === "STUDENT" && isMinor(dob),
      marketingOptIn: Boolean(marketingOptIn),
    },
  }).catch(() => null);

  return { success: true, userId: user.id, email };
}
