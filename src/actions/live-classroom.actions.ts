"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordClassroomEvent } from "@/services/live-classroom.service";

// Server actions invoked by the LiveClassroom client component to persist
// realtime events to the ClassroomEvent audit/history table. The data
// channel is still the live transport — these calls are the durable mirror.
//
// All actions independently verify (a) the caller is signed in and (b) the
// caller is a participant on the booking. SLIDE_SET additionally requires
// the caller to be the tutor; the data channel itself can't enforce that.

interface ActionResult {
  success: boolean;
  error?: string;
}

async function authorize(bookingId: string): Promise<
  | { ok: true; userId: string; sessionId: string; isTutor: boolean }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      studentId: true,
      tutor: { select: { userId: true } },
      classroomSession: { select: { id: true } },
    },
  });
  if (!booking) return { ok: false, error: "Session not found" };

  const userId = session.user.id;
  const isTutor = booking.tutor.userId === userId;
  const isStudent = booking.studentId === userId;
  if (!isTutor && !isStudent) return { ok: false, error: "Forbidden" };
  if (!booking.classroomSession) {
    return { ok: false, error: "Classroom session not initialised" };
  }

  return {
    ok: true,
    userId,
    sessionId: booking.classroomSession.id,
    isTutor,
  };
}

export async function recordChatMessage(
  bookingId: string,
  body: string,
  name: string
): Promise<ActionResult> {
  const guard = await authorize(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };
  const trimmed = body.trim();
  if (!trimmed) return { success: false, error: "Empty message" };
  if (trimmed.length > 2000) {
    return { success: false, error: "Message too long" };
  }
  await recordClassroomEvent({
    sessionId: guard.sessionId,
    userId: guard.userId,
    type: "CHAT_MSG",
    payload: { body: trimmed, name: name.slice(0, 100) },
  });
  return { success: true };
}

export async function recordSlideChange(
  bookingId: string,
  slide: { h: number; v: number; f: number }
): Promise<ActionResult> {
  const guard = await authorize(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };
  if (!guard.isTutor) {
    return { success: false, error: "Only the tutor controls slides" };
  }
  if (
    !Number.isFinite(slide.h) ||
    !Number.isFinite(slide.v) ||
    !Number.isFinite(slide.f)
  ) {
    return { success: false, error: "Invalid slide coordinates" };
  }
  await recordClassroomEvent({
    sessionId: guard.sessionId,
    userId: guard.userId,
    type: "SLIDE_SET",
    payload: { h: slide.h, v: slide.v, f: slide.f },
  });
  return { success: true };
}

export async function recordHandState(
  bookingId: string,
  raised: boolean
): Promise<ActionResult> {
  const guard = await authorize(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };
  // Tutors can't raise their hand (their hand is always up — they're
  // talking). Silently accept and no-op to keep the client simple.
  if (guard.isTutor) return { success: true };
  await recordClassroomEvent({
    sessionId: guard.sessionId,
    userId: guard.userId,
    type: raised ? "HAND_RAISE" : "HAND_LOWER",
  });
  return { success: true };
}
