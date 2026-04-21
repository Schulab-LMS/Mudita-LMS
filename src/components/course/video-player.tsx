"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Play } from "lucide-react";

// Three input shapes:
// 1. `assetId`    — our VideoAsset.id. Preferred path for uploaded content.
//                    The component fetches a signed playback URL on mount.
// 2. `url`        — legacy path: YouTube/Vimeo/Direct URL embedded or linked.
// 3. Neither      — empty placeholder.
interface VideoPlayerProps {
  url?: string | null;
  assetId?: string | null;
  title: string;
  poster?: string | null;
}

type PlaybackState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "processing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; url: string; thumbnail: string | null };

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

// Best-effort HLS detection. Safari + iOS play m3u8 natively; other browsers
// need an HLS polyfill (hls.js) or mux-player. We detect the native case
// via canPlayType so the common case "just works" without adding a dep.
function canPlayHlsNatively(): boolean {
  if (typeof document === "undefined") return false;
  const v = document.createElement("video");
  return (
    v.canPlayType("application/vnd.apple.mpegurl") !== "" ||
    v.canPlayType("application/x-mpegURL") !== ""
  );
}

type ManagedState = Exclude<PlaybackState, { kind: "idle" }>;

function ManagedAssetPlayer({
  assetId,
  title,
  poster,
}: {
  assetId: string;
  title: string;
  poster?: string | null;
}) {
  const [state, setState] = useState<ManagedState>({ kind: "loading" });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/videos/${assetId}/playback`, {
          cache: "no-store",
        });
        if (cancelled) return;
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setState({
            kind: "error",
            message: body.error ?? `Failed to load video (${res.status})`,
          });
          return;
        }
        const data = (await res.json()) as {
          status: "UPLOADING" | "PROCESSING" | "READY" | "ERROR";
          url: string | null;
          thumbnailUrl: string | null;
        };
        if (cancelled) return;
        if (data.status !== "READY" || !data.url) {
          setState(
            data.status === "ERROR"
              ? {
                  kind: "error",
                  message: "This video failed to process. Please re-upload.",
                }
              : { kind: "processing" }
          );
          return;
        }
        setState({ kind: "ready", url: data.url, thumbnail: data.thumbnailUrl });
      } catch (err) {
        if (cancelled) return;
        setState({
          kind: "error",
          message:
            err instanceof Error ? err.message : "Failed to load video",
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [assetId]);

  if (state.kind === "loading") {
    return (
      <div className="relative flex w-full aspect-video items-center justify-center overflow-hidden rounded-xl bg-black text-white/70">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (state.kind === "processing") {
    return (
      <div className="relative flex w-full aspect-video items-center justify-center overflow-hidden rounded-xl bg-black text-white/70">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Video is still processing — check back in a moment.</p>
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="relative flex w-full aspect-video items-center justify-center overflow-hidden rounded-xl bg-black text-white/70">
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <AlertCircle className="h-6 w-6" />
          <p className="text-sm">{state.message}</p>
        </div>
      </div>
    );
  }

  const native = canPlayHlsNatively();
  if (!native) {
    // The HLS URL exists but this browser can't play it without a polyfill.
    // We surface a clear message rather than a silently black <video>.
    return (
      <div className="relative flex w-full aspect-video items-center justify-center overflow-hidden rounded-xl bg-black text-white/70">
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <Play className="h-8 w-8" />
          <p className="text-sm">
            This browser needs an HLS player to view the video.
          </p>
          <a
            href={state.url}
            className="text-xs underline hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            Open stream directly
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full"
        controls
        playsInline
        preload="metadata"
        poster={poster ?? state.thumbnail ?? undefined}
        src={state.url}
        aria-label={title}
      />
    </div>
  );
}

export function VideoPlayer({ url, assetId, title, poster }: VideoPlayerProps) {
  if (assetId) {
    return <ManagedAssetPlayer assetId={assetId} title={title} poster={poster} />;
  }

  if (url && (url.includes("youtube") || url.includes("youtu.be"))) {
    const videoId = getYouTubeId(url);
    return (
      <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  if (url && url.includes("vimeo")) {
    const videoId = getVimeoId(url);
    return (
      <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-black aspect-video">
      <div className="flex flex-col items-center gap-3 text-white/70">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
          <Play className="h-8 w-8" />
        </div>
        <p className="text-sm font-medium">{title}</p>
        {!url && (
          <p className="text-xs text-white/40">No video available</p>
        )}
      </div>
    </div>
  );
}
