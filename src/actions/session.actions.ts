"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Verify the caller is the tutor who owns this booking. Returns the booking id
// on success, or an error result the action can return directly.
async function assertSessionTutor(
  bookingId: string
): Promise<
  | { ok: true; userId: string; studentId: string }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { studentId: true, tutor: { select: { userId: true } } },
  });
  if (!booking) return { ok: false, error: "Session not found" };
  if (booking.tutor.userId !== session.user.id) {
    return { ok: false, error: "Only the session tutor can do that" };
  }
  return { ok: true, userId: session.user.id, studentId: booking.studentId };
}

export async function setSessionLesson(bookingId: string, lessonId: string) {
  const guard = await assertSessionTutor(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { courseId: true } } },
  });
  if (!lesson) return { success: false, error: "Lesson not found" };

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: guard.studentId,
        courseId: lesson.module.courseId,
      },
    },
    select: { status: true },
  });
  if (!enrollment || !["ACTIVE", "COMPLETED"].includes(enrollment.status)) {
    return {
      success: false,
      error: "This learner is not enrolled in the selected lesson's course",
    };
  }

  await db.booking.update({ where: { id: bookingId }, data: { lessonId } });
  revalidatePath(`/session/${bookingId}`);
  revalidatePath("/tutor/teaching");
  return { success: true };
}

export async function setSessionMeetingUrl(bookingId: string, url: string) {
  const guard = await assertSessionTutor(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };

  const trimmed = url.trim();
  if (trimmed) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { success: false, error: "Meeting link must be an http(s) URL" };
      }
    } catch {
      return { success: false, error: "Enter a valid meeting URL" };
    }
  }

  await db.booking.update({
    where: { id: bookingId },
    data: { meetingUrl: trimmed || null },
  });
  revalidatePath(`/session/${bookingId}`);
  return { success: true };
}

export async function completeSession(bookingId: string) {
  const guard = await assertSessionTutor(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
  });
  revalidatePath(`/session/${bookingId}`);
  revalidatePath("/tutor/bookings");
  revalidatePath("/tutor/teaching");
  return { success: true };
}

export async function markSessionNoShow(bookingId: string) {
  const guard = await assertSessionTutor(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "NO_SHOW" },
  });
  revalidatePath(`/session/${bookingId}`);
  revalidatePath("/tutor/bookings");
  revalidatePath("/tutor/teaching");
  return { success: true };
}
