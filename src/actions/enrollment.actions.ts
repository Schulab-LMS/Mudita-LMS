"use server";

import { auth } from "@/lib/auth";
import { assertEmailVerified, requireAdmin } from "@/lib/auth-helpers";
import { enrollUser, unenroll } from "@/services/enrollment.service";
import {
  markLessonComplete,
  recalculateProgress,
} from "@/services/progress.service";
import {
  enrollInCourseSchema,
  adminEnrollSchema,
  adminUnenrollSchema,
  markLessonDoneSchema,
} from "@/validators/action.schemas";
import { revalidatePath } from "next/cache";
import { sendEnrollmentConfirmation } from "@/lib/email";
import { db } from "@/lib/db";
import { assertMinorConsent } from "@/lib/compliance";
import { hasActivePlanAtLeast } from "@/lib/subscription-access";
import { assertSameTenant } from "@/lib/tenant";

export async function enrollInCourse(courseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const parsed = enrollInCourseSchema.safeParse({ courseId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const emailCheck = await assertEmailVerified(session.user.id);
    if (!emailCheck.ok) return { success: false, error: emailCheck.error };

    // Access model for self-enrolment (admin enrolment bypasses all of this
    // via adminEnrollUser):
    //   1. Course must be PUBLISHED.
    //   2. Free courses (isFree) are open to any verified user.
    //   3. Subscription-gated courses (requiredPlan != null) are open to
    //      any user with an active subscription at or above that tier.
    //   4. One-time-purchase courses must go through Stripe checkout —
    //      enrolling here would bypass payment.
    const course = await db.course.findUnique({
      where: { id: parsed.data.courseId },
      select: {
        title: true,
        slug: true,
        status: true,
        isFree: true,
        price: true,
        requiredPlan: true,
        organizationId: true,
      },
    });
    if (!course) return { success: false, error: "Course not found" };
    if (course.status !== "PUBLISHED") {
      return { success: false, error: "This course is not available for enrolment" };
    }

    // Tenant gate. Look up the caller's org from the DB rather than trusting
    // the session token alone — the token is JWT-cached and could be stale
    // if their org assignment changed since sign-in.
    const enroller = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, organizationId: true },
    });
    if (enroller) {
      const tenantError = assertSameTenant(enroller, course);
      if (tenantError) {
        // Mirror getCourseBySlug's "treat as not-found" stance so we don't
        // leak the existence of another org's catalog via a 403.
        return { success: false, error: "Course not found" };
      }
    }

    const isFree = course.isFree || Number(course.price) === 0;
    if (!isFree) {
      if (course.requiredPlan) {
        const ok = await hasActivePlanAtLeast(session.user.id, course.requiredPlan);
        if (!ok) {
          return {
            success: false,
            error: "This course is included with a subscription — please subscribe first",
          };
        }
      } else {
        return {
          success: false,
          error: "This course requires payment — please purchase it first",
        };
      }
    }

    const consent = await assertMinorConsent(session.user.id);
    if (!consent.ok) {
      return {
        success: false,
        error:
          consent.reason === "consent_withdrawn"
            ? "A parent or guardian has withdrawn consent — please contact support"
            : consent.reason === "dob_missing"
              ? "Please add your date of birth to your profile before enrolling"
              : "Parental consent is required before enrolling",
      };
    }

    const enrollment = await enrollUser(session.user.id, parsed.data.courseId);
    if (!enrollment) {
      return { success: false, error: "Failed to enroll" };
    }

    // Send enrollment confirmation email (non-blocking)
    if (session.user.email) {
      sendEnrollmentConfirmation(
        session.user.email,
        session.user.name || "Student",
        course.title
      ).catch(() => null);
    }

    return { success: true, data: enrollment };
  } catch (error) {
    console.error("enrollInCourse action error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function markLessonDone(lessonId: string, courseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const parsed = markLessonDoneSchema.safeParse({ lessonId, courseId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const progress = await markLessonComplete(session.user.id, parsed.data.lessonId);
    if (!progress) {
      return { success: false, error: "Failed to mark lesson complete" };
    }

    const updatedProgress = await recalculateProgress(
      session.user.id,
      parsed.data.courseId
    );

    return { success: true, data: { progress: updatedProgress } };
  } catch (error) {
    console.error("markLessonDone action error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function adminEnrollUser(userId: string, courseId: string) {
  try {
    await requireAdmin();
    const parsed = adminEnrollSchema.safeParse({ userId, courseId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const enrollment = await enrollUser(parsed.data.userId, parsed.data.courseId);
    if (!enrollment) {
      return { success: false, error: "Failed to enroll user (may already be enrolled)" };
    }

    revalidatePath("/admin/courses");
    return { success: true, data: enrollment };
  } catch (error) {
    console.error("adminEnrollUser error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function adminUnenrollUser(userId: string, courseId: string) {
  try {
    await requireAdmin();
    const parsed = adminUnenrollSchema.safeParse({ userId, courseId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const result = await unenroll(parsed.data.userId, parsed.data.courseId);
    if (!result.success) {
      return { success: false, error: "Failed to unenroll user" };
    }

    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("adminUnenrollUser error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
