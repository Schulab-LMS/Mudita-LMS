import { db } from "@/lib/db";
import { getVideoProvider } from "@/lib/video-provider";
import { getAsset, getUpload } from "@/lib/mux";

// Orchestration between the provider and our VideoAsset table. Callers
// (server actions, webhook handlers) go through here so we stay consistent
// about status transitions and idempotency.

export type CreateVideoAssetResult = {
  assetId: string; // Our VideoAsset.id
  uploadUrl: string; // Short-lived PUT URL for the browser
  expiresAt: Date;
  providerUploadId: string; // Stored as VideoAsset.providerId initially
};

// Creates a VideoAsset in UPLOADING state and returns the provider upload URL.
// On upload completion, webhook (or the confirm-upload action) swaps the
// row's providerId from the upload id to the actual asset id.
export async function createVideoUpload(opts: {
  maxDurationSeconds?: number;
  corsOrigin?: string;
} = {}): Promise<CreateVideoAssetResult> {
  const provider = getVideoProvider();
  const upload = await provider.createDirectUpload({
    maxDurationSeconds: opts.maxDurationSeconds,
    corsOrigin: opts.corsOrigin,
  });

  const asset = await db.videoAsset.create({
    data: {
      provider: provider.id,
      providerId: upload.providerUploadId,
      uploadUrl: upload.uploadUrl,
      status: "UPLOADING",
      languages: [],
    },
    select: { id: true },
  });

  return {
    assetId: asset.id,
    uploadUrl: upload.uploadUrl,
    expiresAt: upload.expiresAt,
    providerUploadId: upload.providerUploadId,
  };
}

// Called from the client right after PUT completes. We poll Mux once to see
// whether the upload has been converted to an asset yet. If yes we promote
// the row from "upload id" → "asset id"; if not, we leave it for the webhook
// to catch up.
export async function confirmVideoUpload(
  assetId: string
): Promise<{ status: "PROCESSING" | "UPLOADING" | "ERROR" }> {
  const row = await db.videoAsset.findUnique({
    where: { id: assetId },
    select: { provider: true, providerId: true, status: true },
  });
  if (!row) throw new Error("Video asset not found");
  if (row.provider !== "MUX") return { status: row.status as never };
  if (row.status !== "UPLOADING") {
    return { status: row.status as never };
  }

  try {
    const upload = await getUpload(row.providerId);
    if (upload.asset_id) {
      // Hand off from upload id → asset id. The webhook will move us to
      // READY once Mux finishes encoding.
      await db.videoAsset.update({
        where: { id: assetId },
        data: {
          providerId: upload.asset_id,
          status: "PROCESSING",
          uploadUrl: null,
        },
      });
      return { status: "PROCESSING" };
    }
    if (upload.status === "errored" || upload.status === "cancelled") {
      await db.videoAsset.update({
        where: { id: assetId },
        data: { status: "ERROR" },
      });
      return { status: "ERROR" };
    }
    return { status: "UPLOADING" };
  } catch (err) {
    console.error("[video.service] confirmVideoUpload:", err);
    return { status: "UPLOADING" };
  }
}

// Reconciles a VideoAsset row with the latest state from Mux. Used by the
// webhook handler for `video.asset.ready` / `video.asset.errored` events and
// from the player fallback path when polling.
export async function reconcileVideoAsset(assetId: string): Promise<void> {
  const row = await db.videoAsset.findUnique({
    where: { id: assetId },
    select: { provider: true, providerId: true },
  });
  if (!row || row.provider !== "MUX") return;
  const asset = await getAsset(row.providerId);
  const playbackId = asset.playback_ids?.[0]?.id ?? null;
  const status =
    asset.status === "ready"
      ? "READY"
      : asset.status === "errored"
        ? "ERROR"
        : "PROCESSING";
  await db.videoAsset.update({
    where: { id: assetId },
    data: {
      playbackId,
      status,
      duration: asset.duration ? Math.round(asset.duration) : undefined,
    },
  });
}

// Look up a VideoAsset by the provider's native id. Webhook payloads
// reference the asset id from Mux, not our surrogate.
export async function reconcileByProviderAssetId(
  providerAssetId: string,
  patch: {
    status?: "PROCESSING" | "READY" | "ERROR";
    playbackId?: string | null;
    duration?: number;
  }
): Promise<void> {
  await db.videoAsset.updateMany({
    where: { provider: "MUX", providerId: providerAssetId },
    data: {
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.playbackId !== undefined
        ? { playbackId: patch.playbackId }
        : {}),
      ...(patch.duration !== undefined ? { duration: patch.duration } : {}),
    },
  });
}

// Also handle upload-id based webhooks (e.g. `video.upload.asset_created`)
// by swapping providerId from upload id → asset id.
export async function linkUploadToAsset(
  uploadId: string,
  assetProviderId: string
): Promise<void> {
  await db.videoAsset.updateMany({
    where: { provider: "MUX", providerId: uploadId, status: "UPLOADING" },
    data: {
      providerId: assetProviderId,
      status: "PROCESSING",
      uploadUrl: null,
    },
  });
}

// Resolve a playable reference for a VideoAsset. Returns null when the asset
// isn't ready yet — the UI surfaces a "still processing" state in that case.
export async function resolvePlayback(
  assetId: string,
  opts: { ttlSeconds?: number } = {}
): Promise<{
  status: "UPLOADING" | "PROCESSING" | "READY" | "ERROR";
  url: string | null;
  thumbnailUrl: string | null;
  expiresAt: Date | null;
} | null> {
  const row = await db.videoAsset.findUnique({
    where: { id: assetId },
    select: {
      provider: true,
      providerId: true,
      playbackId: true,
      status: true,
    },
  });
  if (!row) return null;
  if (row.status !== "READY" || !row.playbackId) {
    return {
      status: row.status as "UPLOADING" | "PROCESSING" | "ERROR",
      url: null,
      thumbnailUrl: null,
      expiresAt: null,
    };
  }
  const provider = getVideoProvider();
  // Guard against config drift: if the row says MUX but the env selects a
  // different provider, fall back to the row's provider-native resolution.
  if (provider.id !== row.provider) {
    return {
      status: "READY",
      url: null,
      thumbnailUrl: null,
      expiresAt: null,
    };
  }
  const ref = await provider.getPlaybackRef({
    providerId: row.providerId,
    playbackId: row.playbackId,
    signedUrlTtlSeconds: opts.ttlSeconds,
  });
  return {
    status: "READY",
    url: ref.url || null,
    thumbnailUrl: ref.thumbnailUrl ?? null,
    expiresAt: ref.expiresAt ?? null,
  };
}
