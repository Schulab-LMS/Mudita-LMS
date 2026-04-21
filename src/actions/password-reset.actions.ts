"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, FORGOT_PASSWORD_RATE_LIMIT } from "@/lib/rate-limit";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "@/lib/tokens";
import { z } from "zod";

const requestResetSchema = z.object({
  email: z.string().email(),
});

const RESET_PREFIX = "pwd-reset:";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * Request a password reset. Always returns success to prevent email enumeration.
 */
export async function requestPasswordReset(email: string) {
  const parsed = requestResetSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: true }; // Don't reveal validation errors
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  // Rate limit by email
  const rl = rateLimit(`auth:reset:${normalizedEmail}`, FORGOT_PASSWORD_RATE_LIMIT);
  if (!rl.success) {
    return { success: true }; // Don't reveal rate limiting
  }

  try {
    // Find user
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    // Always return success even if user doesn't exist
    if (!user) {
      return { success: true };
    }

    const token = generateVerificationToken();
    const tokenHash = hashVerificationToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const identifier = `${RESET_PREFIX}${user.email}`;

    // Store only the hash — the raw token goes in the emailed link.
    // A DB dump on its own cannot be used to hijack the reset flow.
    // Replace any existing reset token for this user atomically.
    await db.$transaction([
      db.verificationToken.deleteMany({ where: { identifier } }),
      db.verificationToken.create({
        data: { identifier, token: tokenHash, expires },
      }),
    ]);

    // Send email
    await sendPasswordResetEmail(user.email, token);

    return { success: true };
  } catch (error) {
    console.error("requestPasswordReset error:", error);
    return { success: true }; // Don't reveal errors
  }
}

/**
 * Complete the password reset with a valid token.
 */
export async function resetPassword(token: string, password: string) {
  const parsed = resetPasswordSchema.safeParse({ token, password });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // Hash the new password BEFORE entering the transaction so we keep the
    // transaction short — bcrypt is intentionally slow.
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    // Hash the user-supplied token the same way we did on write.
    const tokenHash = hashVerificationToken(parsed.data.token);

    const result = await db.$transaction(async (tx) => {
      const verificationToken = await tx.verificationToken.findUnique({
        where: { token: tokenHash },
      });

      if (!verificationToken) {
        return { ok: false as const, error: "Invalid or expired reset link" };
      }

      if (verificationToken.expires < new Date()) {
        await tx.verificationToken.delete({ where: { token: tokenHash } });
        return {
          ok: false as const,
          error: "Reset link has expired. Please request a new one.",
        };
      }

      if (!verificationToken.identifier.startsWith(RESET_PREFIX)) {
        return { ok: false as const, error: "Invalid or expired reset link" };
      }

      const email = verificationToken.identifier.slice(RESET_PREFIX.length);

      await tx.user.update({
        where: { email },
        data: { passwordHash },
      });

      await tx.verificationToken.delete({ where: { token: tokenHash } });

      return { ok: true as const };
    });

    if (!result.ok) return { success: false, error: result.error };
    return { success: true };
  } catch (error) {
    console.error("resetPassword error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
