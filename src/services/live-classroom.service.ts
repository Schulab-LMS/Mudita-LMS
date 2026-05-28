import { db } from "@/lib/db";
import {
  classroomRoomName,
  isLiveKitConfigured,
  issueLiveKitToken,
  liveKitUrl,
  type LiveClassroomRole,
} from "@/lib/livekit";

// Server-side orchestration of a live classroom. Three jobs:
//
//   1. ensureClassroomSession(bookingId) — idempotent upsert that returns the
//      ClassroomSession row for a Booking. Lazily created so unused bookings
//      don't litter the table.
//
//   2. joinClassroom(bookingId, userId) — authorisation + token issuance.
//      Verifies the caller is the booking's tutor or student, then mints a
//      short-lived LiveKit JWT with role-appropriate grants.
//
//   3. recordEvent / loadChatHistory — append to and read from the
//      ClassroomEvent audit table. The live transport is the LiveKit data
//      channel; this is the durable mirror used for late-joiner chat
//      scrollback and post-session analytics.

export interface ClassroomJoinResult {
  token: string;
  livekitUrl: string;
  roomName: string;
  sessionId: string;
  role: LiveClassroomRole;
  currentSlide: SlidePosition | null;
}

export interface SlidePosition {
  h: number;
  v: number;
  f: number;
}

// Look up the booking and return the role of the caller, or null if the
// caller is neither the tutor nor the student on this booking.
async function resolveBookingRole(
  bookingId: string,
  userId: string
): Promise<{
  role: LiveClassroomRole;
  displayName: string;
} | null> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      studentId: true,
      student: { select: { name: true } },
      tutor: { select: { userId: true, user: { select: { name: true } } } },
    },
  });
  if (!booking) return null;
  if (booking.tutor.userId === userId) {
    return { role: "TUTOR", displayName: booking.tutor.user.name };
  }
  if (booking.studentId === userId) {
    return { role: "STUDENT", displayName: booking.student.name };
  }
  return null;
}

export async function ensureClassroomSession(bookingId: string) {
  const roomName = classroomRoomName(bookingId);
  // upsert so concurrent first-joiners don't race to create two rows. The
  // unique constraint on bookingId is what makes this safe.
  return db.classroomSession.upsert({
    where: { bookingId },
    create: { bookingId, livekitRoom: roomName },
    update: {},
  });
}

/**
 * Authorise the caller for the live classroom and mint a LiveKit JWT.
 * Returns null when the caller isn't a participant on this booking; throws
 * when LiveKit isn't configured (callers should check isLiveKitConfigured()
 * first and surface a graceful UI).
 */
export async function joinClassroom(
  bookingId: string,
  userId: string
): Promise<ClassroomJoinResult | null> {
  if (!isLiveKitConfigured()) {
    throw new Error("Live classroom is not configured on this deployment");
  }
  const who = await resolveBookingRole(bookingId, userId);
  if (!who) return null;

  const session = await ensureClassroomSession(bookingId);
  const token = await issueLiveKitToken({
    role: who.role,
    identity: userId,
    name: who.displayName,
    roomName: session.livekitRoom,
  });

  return {
    token,
    livekitUrl: liveKitUrl(),
    roomName: session.livekitRoom,
    sessionId: session.id,
    role: who.role,
    currentSlide: (session.currentSlide as SlidePosition | null) ?? null,
  };
}

/**
 * Append an event to the audit/history mirror. Slide updates additionally
 * mutate ClassroomSession.currentSlide so refresh/late-join can hydrate
 * without re-replaying every event.
 */
export async function recordClassroomEvent(input: {
  sessionId: string;
  userId: string;
  type: "SLIDE_SET" | "CHAT_MSG" | "HAND_RAISE" | "HAND_LOWER";
  payload?: Record<string, unknown>;
}): Promise<void> {
  await db.classroomEvent.create({
    data: {
      sessionId: input.sessionId,
      userId: input.userId,
      type: input.type,
      // payload is JSON-safe by construction (came from a validated request body)
      payload: (input.payload ?? {}) as never,
    },
  });

  if (input.type === "SLIDE_SET" && input.payload) {
    const slide = input.payload as Partial<SlidePosition>;
    if (
      typeof slide.h === "number" &&
      typeof slide.v === "number" &&
      typeof slide.f === "number"
    ) {
      await db.classroomSession.update({
        where: { id: input.sessionId },
        data: {
          currentSlide: { h: slide.h, v: slide.v, f: slide.f } as never,
        },
      });
    }
  }
}

// Used by the session page server component (and a future /history endpoint)
// to hydrate the chat panel on join.
export async function loadChatHistory(sessionId: string, limit = 100) {
  const rows = await db.classroomEvent.findMany({
    where: { sessionId, type: "CHAT_MSG" },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      userId: true,
      payload: true,
      createdAt: true,
    },
  });
  return rows.map((r) => {
    const p = (r.payload ?? {}) as { body?: unknown; name?: unknown };
    return {
      id: r.id,
      userId: r.userId,
      name: typeof p.name === "string" ? p.name : null,
      body: typeof p.body === "string" ? p.body : "",
      createdAt: r.createdAt,
    };
  });
}
