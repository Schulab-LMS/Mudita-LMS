import {
  AccessToken,
  RoomServiceClient,
  WebhookReceiver,
  type WebhookEvent,
} from "livekit-server-sdk";

// LiveKit Cloud integration. Mirrors the lazy-init pattern used by Stripe
// (src/lib/stripe.ts): a `configured` predicate plus accessors that throw if
// env vars are missing, so the rest of the app can build / boot cleanly even
// when LiveKit hasn't been wired up yet.
//
// Required env vars:
//   LIVEKIT_URL            — wss://… of the LiveKit Cloud project
//   LIVEKIT_API_KEY        — API key
//   LIVEKIT_API_SECRET     — API secret (used for both token signing and
//                            webhook verification — LiveKit re-uses the same
//                            credential for both flows)
//
// Optional env vars:
//   NEXT_PUBLIC_LIVEKIT_URL — client-side mirror of LIVEKIT_URL; populated
//                            automatically by the session page so we don't
//                            need to ship the server URL through props.

export type LiveClassroomRole = "TUTOR" | "STUDENT";

export interface TokenInput {
  role: LiveClassroomRole;
  identity: string; // userId — must be unique per participant
  name: string; // display name
  roomName: string;
  // P2 ships a data-channel-only experience: tutor + students can publish
  // data (slide events, chat, raise-hand) but no audio/video tracks. P3
  // flips canPublishAv on for the tutor and on-demand for students.
  canPublishAv?: boolean;
  ttlSeconds?: number;
}

export function isLiveKitConfigured(): boolean {
  return Boolean(
    process.env.LIVEKIT_URL &&
      process.env.LIVEKIT_API_KEY &&
      process.env.LIVEKIT_API_SECRET
  );
}

export function liveKitUrl(): string {
  const url = process.env.LIVEKIT_URL;
  if (!url) throw new Error("LIVEKIT_URL is not configured");
  return url;
}

// Deterministic room name from a Booking id. Same booking → same room across
// reconnects, refreshes, and tutor/student joins; collisions across bookings
// are impossible because Booking ids are cuids.
export function classroomRoomName(bookingId: string): string {
  return `classroom-${bookingId}`;
}

/**
 * Mint a short-lived JWT a participant uses to join the LiveKit room.
 * Tutors get room-admin + canPublishData; students get canPublishData only
 * (needed for chat / raise-hand). Track-publishing permission stays off in
 * P2 — flipped on in P3 via the canPublishAv flag.
 */
export async function issueLiveKitToken(input: TokenInput): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("LIVEKIT_API_KEY / LIVEKIT_API_SECRET are not configured");
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: input.identity,
    name: input.name,
    ttl: input.ttlSeconds ?? 3600,
  });

  const isTutor = input.role === "TUTOR";
  at.addGrant({
    room: input.roomName,
    roomJoin: true,
    // Tutors can also create the room implicitly on first join; we don't
    // pre-create rooms server-side because LiveKit auto-creates on first
    // participant join.
    roomCreate: isTutor,
    // Tutors get admin so they can mute/remove participants later (used in
    // P3); students don't.
    roomAdmin: isTutor,
    canSubscribe: true,
    // Data channel is the spine of the slide-sync / chat / raise-hand
    // protocol. Everyone publishes data; only tutor (or P3 raised-hand
    // students) publishes A/V.
    canPublishData: true,
    canPublish: input.canPublishAv ?? false,
  });

  return at.toJwt();
}

/**
 * Verify and parse a LiveKit webhook delivery. The receiver checks the JWT
 * in the Authorization header against our API secret and surfaces a typed
 * event we can switch on (room_started, participant_joined, …).
 */
export async function verifyLiveKitWebhook(
  rawBody: string,
  authHeader: string | null
): Promise<WebhookEvent> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("LIVEKIT_API_KEY / LIVEKIT_API_SECRET are not configured");
  }
  const receiver = new WebhookReceiver(apiKey, apiSecret);
  return receiver.receive(rawBody, authHeader ?? undefined);
}

// LiveKit's server-to-server REST endpoint lives on the HTTPS host of the
// same project, not the wss:// realtime host. The SDK accepts either, but we
// normalise here so callers can use LIVEKIT_URL verbatim.
function liveKitRestHost(): string {
  return liveKitUrl().replace(/^wss:/i, "https:").replace(/^ws:/i, "http:");
}

/**
 * Server-side admin client. Used to mutate participant state (grant a raised
 * hand the right to publish their mic, say) and to inspect the room from
 * outside the room. Lazily constructed because not every code path needs it.
 */
export function roomServiceClient(): RoomServiceClient {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("LIVEKIT_API_KEY / LIVEKIT_API_SECRET are not configured");
  }
  return new RoomServiceClient(liveKitRestHost(), apiKey, apiSecret);
}

/**
 * Toggle a student's ability to publish audio/video tracks. Used when the
 * tutor approves a raised hand. LiveKit pushes the new permission to the
 * connected client without requiring a reconnect.
 */
export async function setParticipantPublishPermission(
  roomName: string,
  identity: string,
  canPublish: boolean
): Promise<void> {
  const client = roomServiceClient();
  await client.updateParticipant(roomName, identity, {
    permission: {
      canPublish,
      canSubscribe: true,
      canPublishData: true,
      hidden: false,
      recorder: false,
      canUpdateMetadata: false,
      canSubscribeMetrics: false,
      // LiveKit's UpdateParticipant treats `permission` atomically — any
      // permission you don't set is reset to its zero value. The block above
      // therefore lists every flag we care about (defaults to "everything
      // students need except A/V publish, which is the toggle").
      canPublishSources: [],
      agent: false,
    },
  });
}
