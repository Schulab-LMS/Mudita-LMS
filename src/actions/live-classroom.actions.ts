"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  classroomRoomName,
  isLiveKitConfigured,
  setParticipantPublishPermission,
} from "@/lib/livekit";
import { recordClassroomEvent } from "@/services/live-classroom.service";
import {
  closePoll as closePollService,
  listPolls,
  openPoll as openPollService,
  recordVote,
  type PollView,
} from "@/services/classroom-poll.service";

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

/**
 * Tutor-only: toggle a student's permission to publish audio/video tracks.
 * Reaches into LiveKit's server API to atomically update the participant's
 * grants — the change pushes to the connected student's client without
 * requiring a reconnect.
 */
export async function grantStudentMedia(
  bookingId: string,
  studentIdentity: string,
  allowed: boolean
): Promise<ActionResult> {
  const guard = await authorize(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };
  if (!guard.isTutor) {
    return { success: false, error: "Only the tutor can grant media access" };
  }
  if (!isLiveKitConfigured()) {
    return { success: false, error: "LiveKit is not configured" };
  }
  // Verify the target is actually the student on this booking. Without this
  // a tutor could elevate an arbitrary identity that happened to be in the
  // room via a stale token.
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { studentId: true },
  });
  if (!booking || booking.studentId !== studentIdentity) {
    return { success: false, error: "Identity is not the booking student" };
  }
  try {
    await setParticipantPublishPermission(
      classroomRoomName(bookingId),
      studentIdentity,
      allowed
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
  // Lowering the hand once we've granted (or revoked) media keeps the
  // roster's hand indicator in sync with the act of being addressed.
  await recordClassroomEvent({
    sessionId: guard.sessionId,
    userId: studentIdentity,
    type: "HAND_LOWER",
  });
  return { success: true };
}

// ───────────────────────────── Polls ─────────────────────────────────────

interface PollResult {
  success: boolean;
  pollId?: string;
  error?: string;
}

export async function openClassroomPoll(
  bookingId: string,
  question: string,
  options: string[]
): Promise<PollResult> {
  const guard = await authorize(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };
  if (!guard.isTutor) {
    return { success: false, error: "Only the tutor can open polls" };
  }
  try {
    const view = await openPollService({
      sessionId: guard.sessionId,
      openedBy: guard.userId,
      question,
      options,
    });
    return { success: true, pollId: view.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function closeClassroomPoll(
  bookingId: string,
  pollId: string
): Promise<ActionResult> {
  const guard = await authorize(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };
  if (!guard.isTutor) {
    return { success: false, error: "Only the tutor can close polls" };
  }
  // Bind the poll to the caller's session so a stale id from another
  // session can't be closed via this booking.
  const poll = await db.classroomPoll.findUnique({
    where: { id: pollId },
    select: { sessionId: true },
  });
  if (!poll || poll.sessionId !== guard.sessionId) {
    return { success: false, error: "Poll not found" };
  }
  await closePollService(pollId);
  return { success: true };
}

export async function voteOnClassroomPoll(
  bookingId: string,
  pollId: string,
  optionIndex: number
): Promise<ActionResult> {
  const guard = await authorize(bookingId);
  if (!guard.ok) return { success: false, error: guard.error };
  // Verify the poll belongs to this booking's session.
  const poll = await db.classroomPoll.findUnique({
    where: { id: pollId },
    select: { sessionId: true },
  });
  if (!poll || poll.sessionId !== guard.sessionId) {
    return { success: false, error: "Poll not found" };
  }
  try {
    await recordVote({ pollId, userId: guard.userId, optionIndex });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Re-fetch the polls panel state. Called by the client whenever a poll-event
 * data-channel ping arrives, or after a local open/vote/close.
 */
export async function getClassroomPolls(bookingId: string): Promise<PollView[]> {
  const guard = await authorize(bookingId);
  if (!guard.ok) return [];
  return listPolls(guard.sessionId, guard.userId);
}
