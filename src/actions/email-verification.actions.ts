"use server";

import { db } from "@/lib/db";
import { sendEmailVerification } from "@/lib/email";
import {
  rateLimit,
  EMAIL_VERIFY_SEND_RATE_LIMIT,
  EMAIL_VERIFY_CONSUME_RATE_LIMIT,
} from "@/lib/rate-limit";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "@/lib/tokens";

const VERIFY_PREFIX = "email-verify:";

/**
 * Send a verification email to the user.
 * Called after registration.
 */
export async function sendVerificationEmail(email: string) {
  try {
    const normalised = email.toLowerCase().trim();

    // Always respond with a generic success to prevent enumeration,
    // but bail out early when the rate limit kicks in.
    const limit = await rateLimit(`verify-send:${normalised}`, EMAIL_VERIFY_SEND_RATE_LIMIT);
    if (!limit.success) {
      return {
        success: false,
        error: `Too many requests. Try again in ${limit.retryAfterSeconds}s.`,
      };
    }

    const user = await db.user.findUnique({
      where: { email: normalised },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user || user.emailVerified) {
      return { success: true }; // Already verified or doesn't exist
    }

    const token = generateVerificationToken();
    const tokenHash = hashVerificationToken(token);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const identifier = `${VERIFY_PREFIX}${user.email}`;

    // Store only the hash. The raw token goes out in the email — a DB dump
    // on its own is no longer enough to confirm someone else's email.
    // Replace any previous token for this identifier atomically so we
    // never end up with two valid tokens at the same time.
    await db.$transaction([
      db.verificationToken.deleteMany({ where: { identifier } }),
      db.verificationToken.create({
        data: { identifier, token: tokenHash, expires },
      }),
    ]);

    await sendEmailVerification(user.email, token);

    return { success: true };
  } catch (error) {
    console.error("sendVerificationEmail error:", error);
    return { success: false, error: "Failed to send verification email" };
  }
}

/**
 * Verify the email with the provided token.
 */
export async function verifyEmail(token: string) {
  try {
    // Rate-limit by token to prevent brute forcing valid tokens.
    const limit = await rateLimit(`verify-consume:${token}`, EMAIL_VERIFY_CONSUME_RATE_LIMIT);
    if (!limit.success) {
      return { success: false, error: "Too many attempts. Please try again shortly." };
    }

    // The DB stores a hash — hash the user-supplied token the same way to
    // look it up.
    const tokenHash = hashVerificationToken(token);

    const result = await db.$transaction(async (tx) => {
      const verificationToken = await tx.verificationToken.findUnique({
        where: { token: tokenHash },
      });

      if (!verificationToken) {
        return { ok: false as const, error: "Invalid verification link" };
      }

      if (verificationToken.expires < new Date()) {
        await tx.verificationToken.delete({ where: { token: tokenHash } });
        return {
          ok: false as const,
          error: "Verification link has expired. Please request a new one.",
        };
      }

      if (!verificationToken.identifier.startsWith(VERIFY_PREFIX)) {
        return { ok: false as const, error: "Invalid verification link" };
      }

      const email = verificationToken.identifier.slice(VERIFY_PREFIX.length);

      await tx.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });

      await tx.verificationToken.delete({ where: { token: tokenHash } });

      return { ok: true as const };
    });

    if (!result.ok) return { success: false, error: result.error };
    return { success: true };
  } catch (error) {
    console.error("verifyEmail error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
