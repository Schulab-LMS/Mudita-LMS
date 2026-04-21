"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { deleteAsset as muxDeleteAsset } from "@/lib/mux";
import {
  confirmVideoUpload,
  createVideoUpload,
} from "@/services/video.service";
import { cuidSchema } from "@/validators/action.schemas";

// Admin-only: creates a new VideoAsset in UPLOADING state and returns a
// direct-upload URL the browser can PUT the file to. The returned assetId
// should be stored on the owning resource (e.g. Lesson.videoAssetId).
export async function createDirectUploadTicket(input: {
  maxDurationSeconds?: number;
} = {}): Promise<
  | {
      success: true;
      assetId: string;
      uploadUrl: string;
      expiresAt: string;
    }
  | { success: false; error: string }
> {
  try {
    await requireAdmin();
    const parsed = z
      .object({ maxDurationSeconds: z.number().int().positive().optional() })
      .safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }
    const res = await createVideoUpload({
      maxDurationSeconds: parsed.data.maxDurationSeconds,
      // Browser uploads go cross-origin. In production callers can tighten
      // this via NEXT_PUBLIC_APP_URL if they prefer same-origin only.
      corsOrigin: process.env.NEXT_PUBLIC_APP_URL ?? "*",
    });
    return {
      success: true,
      assetId: res.assetId,
      uploadUrl: res.uploadUrl,
      expiresAt: res.expiresAt.toISOString(),
    };
  } catch (err) {
    console.error("createDirectUploadTicket:", err);
    return {
      success: false,
      error:
        err instanceof Error && err.message.includes("MUX")
          ? err.message
          : "Failed to create upload ticket",
    };
  }
}

// Called by the admin UI after the browser PUT finishes. We poll the
// provider once and return the current processing state so the UI can
// display progress without waiting for the webhook round-trip.
export async function confirmDirectUpload(input: {
  assetId: string;
}): Promise<
  | { success: true; status: "UPLOADING" | "PROCESSING" | "ERROR" }
  | { success: false; error: string }
> {
  try {
    await requireAdmin();
    const parsed = z.object({ assetId: cuidSchema }).safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }
    const res = await confirmVideoUpload(parsed.data.assetId);
    return { success: true, status: res.status };
  } catch (err) {
    console.error("confirmDirectUpload:", err);
    return { success: false, error: "Failed to confirm upload" };
  }
}

// Admin-only: attach a VideoAsset to a Lesson. The upload itself is done
// client-side; this action links the asset once the upload has been
// confirmed.
export async function attachVideoAssetToLesson(input: {
  lessonId: string;
  assetId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const parsed = z
      .object({ lessonId: cuidSchema, assetId: cuidSchema })
      .safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }
    const [lesson, asset] = await Promise.all([
      db.lesson.findUnique({
        where: { id: parsed.data.lessonId },
        select: { id: true, videoAssetId: true },
      }),
      db.videoAsset.findUnique({
        where: { id: parsed.data.assetId },
        select: { id: true },
      }),
    ]);
    if (!lesson) return { success: false, error: "Lesson not found" };
    if (!asset) return { success: false, error: "Video asset not found" };

    // If the lesson already had a different video asset, detach it. We
    // deliberately don't delete the old one — admins may want to reuse it
    // or recover from a mis-click. A separate cleanup job can reap orphans.
    await db.lesson.update({
      where: { id: parsed.data.lessonId },
      data: {
        videoAssetId: parsed.data.assetId,
        // Clear the legacy URL field so the player prefers the managed asset.
        videoUrl: null,
      },
    });
    return { success: true };
  } catch (err) {
    console.error("attachVideoAssetToLesson:", err);
    return { success: false, error: "Failed to attach video" };
  }
}

// Admin-only: detach and delete the video from Mux. We tolerate a missing
// remote asset (Mux returns 404) because the admin may have already removed
// it upstream.
export async function detachAndDeleteVideoAsset(input: {
  assetId: string;
  lessonId?: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const parsed = z
      .object({ assetId: cuidSchema, lessonId: cuidSchema.optional() })
      .safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const row = await db.videoAsset.findUnique({
      where: { id: parsed.data.assetId },
      select: { provider: true, providerId: true, status: true },
    });
    if (!row) return { success: false, error: "Video asset not found" };

    if (parsed.data.lessonId) {
      await db.lesson.updateMany({
        where: { id: parsed.data.lessonId, videoAssetId: parsed.data.assetId },
        data: { videoAssetId: null },
      });
    }

    if (row.provider === "MUX" && row.status !== "UPLOADING") {
      await muxDeleteAsset(row.providerId).catch((err) => {
        console.warn(
          "[video.actions] Mux delete failed (continuing):",
          err
        );
      });
    }

    await db.videoAsset.delete({ where: { id: parsed.data.assetId } });
    return { success: true };
  } catch (err) {
    console.error("detachAndDeleteVideoAsset:", err);
    return { success: false, error: "Failed to remove video" };
  }
}
