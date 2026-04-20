"use server";

import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-helpers";
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

export async function enrollInCourse(courseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const parsed = enrollInCourseSchema.safeParse({ courseId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // Only allow self-enrolment in published free courses. Paid courses must
    // go through Stripe checkout — granting access here would bypass payment.
    // Drafts and archived courses can still be administered via `adminEnrollUser`.
    const course = await db.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { title: true, slug: true, status: true, isFree: true, price: true },
    });
    if (!course) return { success: false, error: "Course not found" };
    if (course.status !== "PUBLISHED") {
      return { success: false, error: "This course is not available for enrolment" };
    }
    if (!course.isFree && Number(course.price) > 0) {
      return { success: false, error: "This course requires payment — please purchase it first" };
    }

    const consent = await assertMinorConsent(session.user.id);
    if (!consent.ok) {
      return {
        success: false,
        error:
          consent.reason === "consent_withdrawn"
            ? "A parent or guardian has withdrawn consent — please contact support"
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
