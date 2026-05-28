import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isLiveKitConfigured, verifyLiveKitWebhook } from "@/lib/livekit";

// LiveKit Cloud webhook receiver. Two responsibilities:
//
//   1. Attendance — `participant_joined` opens a ClassroomAttendance row;
//      `participant_left` closes it (sets leftAt + durationSec). Rejoins
//      always open a new row so totals are an aggregate, not a single span.
//
//   2. Session lifecycle — `room_started` flips ClassroomSession.status to
//      LIVE and stamps startedAt; `room_finished` flips to ENDED and stamps
//      endedAt. Used by post-session UIs (recordings, attendance reports)
//      to know when a session "officially" began and ended.
//
// Authentication is delegated to livekit-server-sdk's WebhookReceiver, which
// validates the JWT in the Authorization header against our API secret.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      { error: "LiveKit not configured" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const authHeader = request.headers.get("authorization");

  let event;
  try {
    event = await verifyLiveKitWebhook(rawBody, authHeader);
  } catch (e) {
    console.warn("[livekit] webhook verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const roomName = event.room?.name;
  const participantIdentity = event.participant?.identity;

  // We only care about events that name a room we know about.
  if (!roomName) return NextResponse.json({ ok: true, ignored: event.event });

  const classroom = await db.classroomSession.findUnique({
    where: { livekitRoom: roomName },
    select: { id: true },
  });
  if (!classroom) {
    // Could be a non-classroom room or an event from before we persisted
    // the session row — silently acknowledge.
    return NextResponse.json({ ok: true, ignored: "unknown room" });
  }

  switch (event.event) {
    case "room_started": {
      await db.classroomSession.update({
        where: { id: classroom.id },
        data: { status: "LIVE", startedAt: new Date() },
      });
      break;
    }
    case "room_finished": {
      await db.classroomSession.update({
        where: { id: classroom.id },
        data: { status: "ENDED", endedAt: new Date() },
      });
      // Best-effort: close any attendance rows that never received a
      // matching participant_left (graceful tab close, network drop, etc.).
      await db.classroomAttendance.updateMany({
        where: { sessionId: classroom.id, leftAt: null },
        data: { leftAt: new Date() },
      });
      break;
    }
    case "participant_joined": {
      if (!participantIdentity) break;
      await db.classroomAttendance.create({
        data: { sessionId: classroom.id, userId: participantIdentity },
      });
      break;
    }
    case "participant_left": {
      if (!participantIdentity) break;
      // Close the most recent still-open attendance row for this user.
      const open = await db.classroomAttendance.findFirst({
        where: { sessionId: classroom.id, userId: participantIdentity, leftAt: null },
        orderBy: { joinedAt: "desc" },
        select: { id: true, joinedAt: true },
      });
      if (open) {
        const now = new Date();
        const durationSec = Math.max(
          0,
          Math.round((now.getTime() - open.joinedAt.getTime()) / 1000)
        );
        await db.classroomAttendance.update({
          where: { id: open.id },
          data: { leftAt: now, durationSec },
        });
      }
      break;
    }
    default:
      // Track-published / track-unpublished / egress / ingress events all
      // pass through without action in P2.
      break;
  }

  return NextResponse.json({ ok: true });
}
