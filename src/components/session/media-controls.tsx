"use client";

import { useLocalParticipantPermissions, useTrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

// Local mic + camera toggle buttons. Visible whenever the local participant
// has `canPublish` (tutors always, students once granted by the tutor).
// Hidden entirely for subscriber-only participants so we don't tease them
// with controls they can't use.
export function MediaControls() {
  const perms = useLocalParticipantPermissions();
  const mic = useTrackToggle({ source: Track.Source.Microphone });
  const camera = useTrackToggle({ source: Track.Source.Camera });

  if (!perms?.canPublish) return null;

  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-2">
      <ToggleButton
        on={mic.enabled}
        onClick={() => mic.toggle()}
        labelOn="Mute mic"
        labelOff="Unmute mic"
        IconOn={Mic}
        IconOff={MicOff}
      />
      <ToggleButton
        on={camera.enabled}
        onClick={() => camera.toggle()}
        labelOn="Stop camera"
        labelOff="Start camera"
        IconOn={Video}
        IconOff={VideoOff}
      />
    </div>
  );
}

function ToggleButton({
  on,
  onClick,
  labelOn,
  labelOff,
  IconOn,
  IconOff,
}: {
  on: boolean;
  onClick: () => void;
  labelOn: string;
  labelOff: string;
  IconOn: React.ElementType;
  IconOff: React.ElementType;
}) {
  const Icon = on ? IconOn : IconOff;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={on ? labelOn : labelOff}
      title={on ? labelOn : labelOff}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
        on
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-muted text-muted-foreground hover:bg-muted/70"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
