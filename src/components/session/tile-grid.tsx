"use client";

import { useMemo } from "react";
import {
  TrackRefContext,
  useParticipants,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track, type Participant } from "livekit-client";
import { Hand, Mic, MicOff, VideoOff } from "lucide-react";

import { grantStudentMedia } from "@/actions/live-classroom.actions";

// Participant tile grid for the live classroom. Renders one tile per
// participant whose camera is published, plus a "card" placeholder for
// participants with no video (mic-only or fully subscriber). The local
// participant is pinned first; remote participants follow.
//
// Tutors get a "Mic on" / "Mic off" affordance under each student's tile to
// grant or revoke their right to publish A/V (LiveKit pushes the permission
// change live, so the student doesn't need to reconnect).

interface TileGridProps {
  bookingId: string;
  isTutor: boolean;
  handsRaised: Set<string>;
  studentIdentity: string | null;
}

export function TileGrid({
  bookingId,
  isTutor,
  handsRaised,
  studentIdentity,
}: TileGridProps) {
  const participants = useParticipants();
  // useTracks with sources auto-filters to camera + mic publications across
  // every participant. We split the result into per-participant maps so the
  // tile renderer can look up "what's published for THIS identity".
  const trackRefs = useTracks(
    [Track.Source.Camera, Track.Source.Microphone],
    { onlySubscribed: false }
  );

  const byParticipant = useMemo(() => {
    const map = new Map<
      string,
      {
        camera?: (typeof trackRefs)[number];
        mic?: (typeof trackRefs)[number];
      }
    >();
    for (const ref of trackRefs) {
      const id = ref.participant.identity;
      if (!map.has(id)) map.set(id, {});
      const entry = map.get(id)!;
      if (ref.source === Track.Source.Camera) entry.camera = ref;
      if (ref.source === Track.Source.Microphone) entry.mic = ref;
    }
    return map;
  }, [trackRefs]);

  // Local first, then remote — keeps the tutor's own preview where they
  // expect it. Stable order across re-renders so tiles don't jump.
  const ordered = useMemo(
    () => [...participants].sort((a, b) => (a.isLocal ? -1 : b.isLocal ? 1 : 0)),
    [participants]
  );

  if (ordered.length === 0) {
    return (
      <div className="card-premium flex items-center justify-center p-6 text-xs text-muted-foreground">
        Connecting…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {ordered.map((p) => (
        <ParticipantTile
          key={p.identity}
          participant={p}
          tracks={byParticipant.get(p.identity)}
          handRaised={handsRaised.has(p.identity)}
          showGrantButton={isTutor && !p.isLocal && p.identity === studentIdentity}
          bookingId={bookingId}
        />
      ))}
    </div>
  );
}

function ParticipantTile({
  participant,
  tracks,
  handRaised,
  showGrantButton,
  bookingId,
}: {
  participant: Participant;
  tracks: { camera?: { source: Track.Source }; mic?: { source: Track.Source } } | undefined;
  handRaised: boolean;
  showGrantButton: boolean;
  bookingId: string;
}) {
  // We can't infer "is the student currently allowed to publish?" from the
  // server-rendered token alone, so the button reads the participant's live
  // permission flag at render time.
  const canPublish = Boolean(participant.permissions?.canPublish);
  const cameraTrack = tracks?.camera;
  const micPublication = participant.getTrackPublication(Track.Source.Microphone);
  const micMuted = !micPublication || micPublication.isMuted;

  const onToggleGrant = async () => {
    const next = !canPublish;
    const result = await grantStudentMedia(bookingId, participant.identity, next);
    if (!result.success) {
      console.warn("[live-classroom] grant failed:", result.error);
    }
  };

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      {cameraTrack ? (
        // TrackRefContext lets <VideoTrack> resolve which track to render
        // without the component having to know about participant-context.
        <TrackRefContext.Provider value={cameraTrack as never}>
          <VideoTrack className="h-full w-full object-cover" />
        </TrackRefContext.Provider>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
          <VideoOff className="h-5 w-5" aria-hidden />
          <span className="mt-1 text-[11px] font-medium">No camera</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[11px] text-white">
        <span className="truncate font-semibold">
          {participant.name || participant.identity}
          {participant.isLocal && <span className="ms-1 opacity-70">(you)</span>}
        </span>
        <span className="flex items-center gap-1">
          {handRaised && (
            <Hand className="h-3.5 w-3.5 text-amber-300" aria-label="Hand raised" />
          )}
          {micMuted ? (
            <MicOff className="h-3.5 w-3.5 opacity-70" aria-label="Muted" />
          ) : (
            <Mic className="h-3.5 w-3.5" aria-label="Live mic" />
          )}
        </span>
      </div>
      {showGrantButton && (
        <button
          type="button"
          onClick={onToggleGrant}
          className={`absolute right-1.5 top-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors ${
            canPublish
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-white/85 text-foreground hover:bg-white"
          }`}
        >
          {canPublish ? "Revoke mic" : "Allow mic"}
        </button>
      )}
    </div>
  );
}
