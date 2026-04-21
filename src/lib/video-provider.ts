import type { VideoProvider as VideoProviderEnum } from "@/generated/prisma/client";
import {
  createDirectUpload,
  getAsset,
  isMuxConfigured,
  isMuxSigningConfigured,
  playbackUrl,
  signPlaybackToken,
  thumbnailUrl,
} from "@/lib/mux";

// Abstraction over the hosted-video providers we may swap in. The goal is
// that lesson content code never touches a provider SDK directly — it asks
// this module for a playback URL or a signed upload ticket.

export type CreatedUpload = {
  // Provider-side id for the upload itself (not the asset). We persist this
  // until the webhook tells us which asset id it became.
  providerUploadId: string;
  // Short-lived PUT URL the browser uploads the file to.
  uploadUrl: string;
  expiresAt: Date;
};

export type PlaybackRef = {
  provider: VideoProviderEnum;
  providerId: string;
  playbackId?: string | null;
  url: string;
  thumbnailUrl?: string | null;
  // When signed, the token embeds its own expiry — we surface it so the
  // client can re-fetch before it expires.
  expiresAt?: Date | null;
};

export interface VideoProvider {
  readonly id: VideoProviderEnum;
  createDirectUpload(input: {
    filenameHint?: string;
    maxDurationSeconds?: number;
    corsOrigin?: string;
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

// ─── Mux provider ────────────────────────────────────────────────────────

class MuxProvider implements VideoProvider {
  readonly id = "MUX" as const;

  async createDirectUpload(input: {
    maxDurationSeconds?: number;
    corsOrigin?: string;
  }): Promise<CreatedUpload> {
    if (!isMuxConfigured()) {
      throw new Error(
        "MUX provider is selected but MUX_TOKEN_ID/MUX_TOKEN_SECRET are not set."
      );
    }
    const upload = await createDirectUpload({
      maxDurationSeconds: input.maxDurationSeconds,
      corsOrigin: input.corsOrigin,
    });
    return {
      providerUploadId: upload.id,
      uploadUrl: upload.url,
      expiresAt: new Date(Date.now() + upload.timeout * 1000),
    };
  }

  async getPlaybackRef(input: {
    providerId: string;
    playbackId?: string | null;
    signedUrlTtlSeconds?: number;
  }): Promise<PlaybackRef> {
    if (!isMuxConfigured()) {
      throw new Error("MUX is not configured.");
    }

    // If the caller didn't already know the playback id (brand-new asset,
    // webhook may not have landed yet) fetch it from the Mux API.
    let playbackId = input.playbackId ?? null;
    if (!playbackId) {
      const asset = await getAsset(input.providerId);
      playbackId = asset.playback_ids?.[0]?.id ?? null;
    }
    if (!playbackId) {
      // No playback id yet — the asset is still processing. Surface a
      // placeholder URL; callers decide how to render "still processing".
      return {
        provider: "MUX",
        providerId: input.providerId,
        playbackId: null,
        url: "",
        thumbnailUrl: null,
        expiresAt: null,
      };
    }

    const ttl = input.signedUrlTtlSeconds ?? 60 * 60;
    if (isMuxSigningConfigured()) {
      const [videoToken, thumbToken] = await Promise.all([
        signPlaybackToken({
          playbackId,
          audience: "v",
          ttlSeconds: ttl,
        }),
        signPlaybackToken({
          playbackId,
          audience: "t",
          ttlSeconds: ttl,
        }),
      ]);
      return {
        provider: "MUX",
        providerId: input.providerId,
        playbackId,
        url: playbackUrl(playbackId, videoToken),
        thumbnailUrl: thumbnailUrl(playbackId, thumbToken),
        expiresAt: new Date(Date.now() + ttl * 1000),
      };
    }
    return {
      provider: "MUX",
      providerId: input.providerId,
      playbackId,
      url: playbackUrl(playbackId),
      thumbnailUrl: thumbnailUrl(playbackId),
      expiresAt: null,
    };
  }
}

// Cloudflare Stream remains stubbed — swap in when we evaluate providers.
class CloudflareStreamProvider implements VideoProvider {
  readonly id = "CLOUDFLARE_STREAM" as const;
  async createDirectUpload(): Promise<CreatedUpload> {
    throw new Error("Cloudflare Stream provider is not implemented yet.");
  }
  async getPlaybackRef(): Promise<PlaybackRef> {
    throw new Error("Cloudflare Stream provider is not implemented yet.");
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

// Expose for tests / callers that explicitly need to bypass env gating.
export function resetVideoProviderCache(): void {
  cached = null;
}
