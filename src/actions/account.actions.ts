"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { recordConsent, PRIVACY_VERSION } from "@/lib/compliance";
import {
  updateAccountProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "@/validators/action.schemas";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function requireSessionUserId(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" };
  }
  return { ok: true, userId: session.user.id };
}

async function requestMeta() {
  try {
    const h = await headers();
    return {
      ipAddress:
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        h.get("x-real-ip") ??
        null,
      userAgent: h.get("user-agent") ?? null,
    };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}

// ── Profile ──────────────────────────────────────────────────────────────

export async function updateAccountProfile(input: {
  name: string;
  locale: string;
  avatar?: string;
  dateOfBirth?: string | Date;
}): Promise<ActionResult> {
  const sess = await requireSessionUserId();
  if (!sess.ok) return { success: false, error: sess.error };

  const parsed = updateAccountProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const avatar =
    parsed.data.avatar && parsed.data.avatar.length > 0
      ? parsed.data.avatar
      : null;

  try {
    await db.user.update({
      where: { id: sess.userId },
      data: {
        name: parsed.data.name,
        locale: parsed.data.locale,
        avatar,
        ...(parsed.data.dateOfBirth instanceof Date
          ? { dateOfBirth: parsed.data.dateOfBirth }
          : {}),
      },
    });
    revalidatePath("/account");
    revalidatePath("/student");
    revalidatePath("/student/courses");
    return { success: true };
  } catch (err) {
    console.error("updateAccountProfile error:", err);
    return { success: false, error: "Failed to update profile" };
  }
}

// ── Password ─────────────────────────────────────────────────────────────

export async function changeAccountPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  const sess = await requireSessionUserId();
  if (!sess.ok) return { success: false, error: sess.error };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const user = await db.user.findUnique({
    where: { id: sess.userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return {
      success: false,
      error:
        "Your account uses a social login. Set a password via 'Forgot password' first.",
    };
  }

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return { success: false, error: "Current password is incorrect" };
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return {
      success: false,
      error: "New password must be different from your current password",
    };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({
    where: { id: sess.userId },
    data: { passwordHash: newHash },
  });

  await audit({
    actorId: sess.userId,
    action: "account.password_changed",
    resource: "user",
    resourceId: sess.userId,
  });

  return { success: true };
}

// ── Data export ──────────────────────────────────────────────────────────

export async function exportAccountData(): Promise<
  ActionResult<{ filename: string; json: string }>
> {
  const sess = await requireSessionUserId();
  if (!sess.ok) return { success: false, error: sess.error };

  try {
    const user = await db.user.findUnique({
      where: { id: sess.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        locale: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        profile: true,
        onboardingProfile: true,
        enrollments: {
          select: {
            courseId: true,
            enrolledAt: true,
            completedAt: true,
            progress: true,
          },
        },
        progress: {
          select: {
            lessonId: true,
            completed: true,
            timeSpent: true,
            lastAccess: true,
          },
        },
        quizAttempts: {
          select: {
            id: true,
            quizId: true,
            score: true,
            passed: true,
            startedAt: true,
            completedAt: true,
          },
        },
        certificates: {
          select: { id: true, code: true, courseId: true, issuedAt: true },
        },
        badges: {
          select: { badgeId: true, earnedAt: true },
        },
        points: {
          select: {
            id: true,
            action: true,
            points: true,
            createdAt: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            currency: true,
            createdAt: true,
          },
        },
        coursePurchases: {
          select: {
            id: true,
            courseId: true,
            status: true,
            amount: true,
            currency: true,
            createdAt: true,
          },
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            planId: true,
            currentPeriodEnd: true,
            createdAt: true,
          },
        },
        invoices: {
          select: {
            id: true,
            number: true,
            total: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        },
        bookingsAsStudent: {
          select: {
            id: true,
            tutorId: true,
            startTime: true,
            endTime: true,
            status: true,
            createdAt: true,
          },
        },
        consentRecords: {
          select: {
            type: true,
            version: true,
            granted: true,
            grantedAt: true,
          },
        },
        courseReviews: {
          select: {
            courseId: true,
            rating: true,
            title: true,
            body: true,
            createdAt: true,
          },
        },
        competitionRegs: {
          select: {
            competitionId: true,
            score: true,
            teamName: true,
            registeredAt: true,
          },
        },
      },
    });

    if (!user) return { success: false, error: "Account not found" };

    const payload = {
      exportedAt: new Date().toISOString(),
      exportVersion: 1,
      user,
    };

    await audit({
      actorId: sess.userId,
      action: "account.data_exported",
      resource: "user",
      resourceId: sess.userId,
    });

    return {
      success: true,
      data: {
        filename: `schulab-data-${sess.userId}.json`,
        json: JSON.stringify(payload, null, 2),
      },
    };
  } catch (err) {
    console.error("exportAccountData error:", err);
    return { success: false, error: "Failed to export data" };
  }
}

// ── Delete account ───────────────────────────────────────────────────────

// Soft-delete: we anonymize PII and mark the account inactive, but retain
// financial records (orders, invoices, purchases, certificates) to meet tax
// and accounting retention obligations. Messages are left in place but the
// sender/receiver name displays as "Deleted user". Users signing in with
// the anonymized email will fail, effectively terminating access.
export async function deleteMyAccount(input: {
  password?: string;
  confirmation: string;
}): Promise<ActionResult> {
  const sess = await requireSessionUserId();
  if (!sess.ok) return { success: false, error: sess.error };

  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const user = await db.user.findUnique({
    where: { id: sess.userId },
    select: {
      id: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  });
  if (!user) return { success: false, error: "Account not found" };

  // Credentials users must re-enter their password; OAuth-only users
  // confirmed by typing DELETE which the schema already enforced.
  if (user.passwordHash) {
    if (!parsed.data.password) {
      return { success: false, error: "Enter your current password to confirm" };
    }
    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) return { success: false, error: "Password is incorrect" };
  }

  // Admin roles must not be self-deleted — require another admin to act so
  // a compromised admin session cannot lock everyone out. Super-admins in
  // particular can only be removed by a peer via the admin tools.
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    return {
      success: false,
      error:
        "Admin accounts cannot self-delete. Contact another admin to remove your account.",
    };
  }

  const meta = await requestMeta();

  // Build an irrecoverable-by-login email so the row stays unique but no
  // one can ever sign in as this user again. `@deleted.invalid` uses a
  // reserved TLD that will never resolve / receive mail.
  const suffix = randomBytes(8).toString("hex");
  const deletedEmail = `deleted-${Date.now()}-${suffix}@deleted.invalid`;

  try {
    await db.$transaction(async (tx) => {
      // Detach social logins + sessions. Both cascade on User delete in the
      // schema, but we're not deleting the user — just terminating sessions.
      await tx.account.deleteMany({ where: { userId: sess.userId } });
      await tx.session.deleteMany({ where: { userId: sess.userId } });

      // Profile + onboarding hold free-text PII — drop outright.
      await tx.profile.deleteMany({ where: { userId: sess.userId } });
      await tx.onboardingProfile.deleteMany({ where: { userId: sess.userId } });

      // Anonymize the user row. We keep id + role so historical foreign
      // keys (orders, certificates, audit logs) remain valid.
      await tx.user.update({
        where: { id: sess.userId },
        data: {
          email: deletedEmail,
          name: "Deleted user",
          avatar: null,
          dateOfBirth: null,
          passwordHash: null,
          emailVerified: null,
          isActive: false,
          locale: "en",
          stripeCustomerId: null,
        },
      });
    });

    // Record consent withdrawal + audit trail outside the transaction so
    // their failure can't undo the erasure.
    await recordConsent(
      {
        userId: sess.userId,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
      "PRIVACY_POLICY",
      PRIVACY_VERSION,
      false
    ).catch((err) => console.error("consent withdrawal record failed:", err));

    await audit({
      actorId: sess.userId,
      action: "account.self_deleted",
      resource: "user",
      resourceId: sess.userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: { originalEmail: user.email },
    });

    return { success: true };
  } catch (err) {
    console.error("deleteMyAccount error:", err);
    return { success: false, error: "Failed to delete account" };
  }
}
