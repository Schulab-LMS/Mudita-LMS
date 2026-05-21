"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Verify the caller is the tutor who owns this booking. Returns the booking id
// on success, or an error result the action can return directly.
async function assertSessionTutor(
  bookingId: string
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { tutor: { select: { userId: true } } },
  });
  if (!booking) return { ok: false, error: "Session not found" };
  if (booking.tutor.userId !== session.user.id) {
    return { ok: false, error: "Only the session tutor can do that" };
  }
  return { ok: true, userId: session.user.id };
}

export async function setSessionLesson(bookingId: string, lessonId: string) {
  const guard = await assertSessionTutor(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true },
  });
  if (!lesson) return { success: false, error: "Lesson not found" };

  await db.booking.update({ where: { id: bookingId }, data: { lessonId } });
  revalidatePath(`/session/${bookingId}`);
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
  return { success: true };
}
