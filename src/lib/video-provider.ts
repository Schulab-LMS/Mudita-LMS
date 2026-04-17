import type { VideoProvider as VideoProviderEnum } from "@/generated/prisma/client";

// Abstraction over the hosted-video providers we may swap in. The goal is
// that lesson content code never touches a provider SDK directly — it asks
// this module for a playback URL or a signed upload ticket.

export type CreatedUpload = {
  assetProviderId: string;
  uploadUrl: string;
  expiresAt: Date;
};

export type PlaybackRef = {
  provider: VideoProviderEnum;
  providerId: string;
  playbackId?: string | null;
  url: string;
  thumbnailUrl?: string | null;
  expiresAt?: Date | null;
};

export interface VideoProvider {
  readonly id: VideoProviderEnum;
  createDirectUpload(input: {
    filenameHint?: string;
    maxDurationSeconds?: number;
  }): Promise<CreatedUpload>;
  getPlaybackRef(input: {
    providerId: string;
    playbackId?: string | null;
    signedUrlTtlSeconds?: number;
  }): Promise<PlaybackRef>;
}

// ─── Default / fallback provider ─────────────────────────────────────────
// Used when no provider is configured yet. Lets lessons keep playing a
// direct URL (e.g. Vimeo public, YouTube embed) while we migrate.
class ExternalUrlProvider implements VideoProvider {
  readonly id = "EXTERNAL" as const;

  async createDirectUpload(): Promise<CreatedUpload> {
    throw new Error(
      "EXTERNAL provider does not support direct uploads. Configure MUX or CLOUDFLARE_STREAM in env first."
    );
  }

  async getPlaybackRef(input: {
    providerId: string;
    playbackId?: string | null;
  }): Promise<PlaybackRef> {
    return {
      provider: "EXTERNAL",
      providerId: input.providerId,
      playbackId: input.playbackId ?? null,
      url: input.providerId,
    };
  }
}

// Stub implementations — real SDK work happens in a follow-up PR. The stubs
// exist so callers can integrate the abstraction now and only the provider
// implementation changes later.
class MuxProvider implements VideoProvider {
  readonly id = "MUX" as const;
  async createDirectUpload(): Promise<CreatedUpload> {
    throw new Error(
      "Mux provider is not implemented yet. Install @mux/mux-node and fill in createDirectUpload."
    );
  }
  async getPlaybackRef(): Promise<PlaybackRef> {
    throw new Error(
      "Mux provider is not implemented yet. Install @mux/mux-node and fill in getPlaybackRef."
    );
  }
}

class CloudflareStreamProvider implements VideoProvider {
  readonly id = "CLOUDFLARE_STREAM" as const;
  async createDirectUpload(): Promise<CreatedUpload> {
    throw new Error(
      "Cloudflare Stream provider is not implemented yet."
    );
  }
  async getPlaybackRef(): Promise<PlaybackRef> {
    throw new Error(
      "Cloudflare Stream provider is not implemented yet."
    );
  }
}

let cached: VideoProvider | null = null;
export function getVideoProvider(): VideoProvider {
  if (cached) return cached;
  const name = (process.env.VIDEO_PROVIDER ?? "EXTERNAL").toUpperCase();
  switch (name) {
    case "MUX":
      cached = new MuxProvider();
      break;
    case "CLOUDFLARE_STREAM":
      cached = new CloudflareStreamProvider();
      break;
    default:
      cached = new ExternalUrlProvider();
      break;
  }
  return cached;
}
