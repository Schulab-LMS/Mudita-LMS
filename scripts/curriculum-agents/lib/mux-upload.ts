// Upload a finished lesson video to Mux and attach it to a Lesson, reusing the
// existing video.service flow (createVideoUpload → PUT → confirmVideoUpload).
// The actual video file comes from the media pipeline (image/TTS/assembly tools
// fulfilling the assets-manifest). This is the last hop: file → VideoAsset.

import { readFile } from "node:fs/promises";

import { db } from "@/lib/db";
import { isMuxConfigured } from "@/lib/mux";
import { createVideoUpload, confirmVideoUpload } from "@/services/video.service";

export interface UploadResult {
  assetId: string;
  status: "PROCESSING" | "UPLOADING" | "ERROR";
  attachedToLesson: boolean;
}

/**
 * Upload `filePath` to Mux and (optionally) attach the resulting VideoAsset to
 * `lessonId`. Mirrors the admin flow but callable from the media pipeline /
 * scripts. Requires Mux to be configured.
 */
export async function uploadLessonVideo(opts: {
  filePath: string;
  lessonId?: string;
  contentType?: string;
}): Promise<UploadResult> {
  if (!isMuxConfigured()) {
    throw new Error("Mux is not configured (MUX_TOKEN_ID / MUX_TOKEN_SECRET).");
  }

  // 1. Create the upload ticket + VideoAsset row.
  const { assetId, uploadUrl } = await createVideoUpload();

  // 2. PUT the file to the signed upload URL.
  const body = await readFile(opts.filePath);
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": opts.contentType ?? "video/mp4" },
    body: new Uint8Array(body),
  });
  if (!res.ok) {
    await db.videoAsset.update({ where: { id: assetId }, data: { status: "ERROR" } });
    throw new Error(`Upload PUT failed (${res.status})`);
  }

  // 3. Poll once to promote upload → asset (the webhook moves it to READY).
  const { status } = await confirmVideoUpload(assetId);

  // 4. Attach to the lesson if requested.
  let attachedToLesson = false;
  if (opts.lessonId) {
    await db.lesson.update({
      where: { id: opts.lessonId },
      data: { videoAssetId: assetId },
    });
    attachedToLesson = true;
  }

  return { assetId, status, attachedToLesson };
}
