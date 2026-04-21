import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/mux";
import {
  linkUploadToAsset,
  reconcileByProviderAssetId,
} from "@/services/video.service";

// Prisma unique-violation code (duplicate webhook delivery).
const PRISMA_UNIQUE_VIOLATION = "P2002";

// Signature validation needs the raw body, so cache and static optimisation
// are both disabled.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Events we actually act on. Everything else is acked (200) so Mux stops
// retrying but without running any handler logic.
type MuxEventType =
  | "video.upload.asset_created"
  | "video.upload.errored"
  | "video.upload.cancelled"
  | "video.asset.ready"
  | "video.asset.errored"
  | "video.asset.deleted";

type MuxEvent = {
  type: MuxEventType | string;
  id: string; // Event id, used for idempotency
  object: { type: "upload" | "asset" | string; id: string };
  data: {
    id?: string;
    status?: string;
    asset_id?: string;
    duration?: number;
    playback_ids?: { id: string; policy: string }[];
    errors?: { messages: string[] };
  };
};

export async function POST(request: Request) {
  if (!process.env.MUX_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Mux webhook not configured" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("mux-signature");
  const valid = await verifyWebhookSignature({
    rawBody,
    header: signature,
  });
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  let event: MuxEvent;
  try {
    event = JSON.parse(rawBody) as MuxEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!event.id || !event.type) {
    return NextResponse.json(
      { error: "Missing event id/type" },
      { status: 400 }
    );
  }

  // Idempotency claim. Duplicate delivery → ack 200 without re-running.
  try {
    await db.webhookEvent.create({
      data: { id: event.id, provider: "mux", type: event.type },
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === PRISMA_UNIQUE_VIOLATION
    ) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error(`[mux/webhook] dedupe insert failed for ${event.id}:`, err);
    return NextResponse.json(
      { error: "Webhook dedupe failed" },
      { status: 500 }
    );
  }

  try {
    switch (event.type) {
      case "video.upload.asset_created": {
        // The upload object now has a concrete asset id — swap our row to
        // reference that asset id instead of the upload id.
        const uploadId = event.object.id;
        const assetId = event.data.asset_id;
        if (uploadId && assetId) {
          await linkUploadToAsset(uploadId, assetId);
        }
        break;
      }
      case "video.upload.errored":
      case "video.upload.cancelled": {
        const uploadId = event.object.id;
        await db.videoAsset.updateMany({
          where: { provider: "MUX", providerId: uploadId },
          data: { status: "ERROR" },
        });
        break;
      }
      case "video.asset.ready": {
        const assetId = event.object.id;
        const playbackId = event.data.playback_ids?.[0]?.id ?? null;
        const duration = event.data.duration
          ? Math.round(event.data.duration)
          : undefined;
        await reconcileByProviderAssetId(assetId, {
          status: "READY",
          playbackId,
          duration,
        });
        break;
      }
      case "video.asset.errored": {
        const assetId = event.object.id;
        await reconcileByProviderAssetId(assetId, { status: "ERROR" });
        break;
      }
      case "video.asset.deleted": {
        // The asset is gone on Mux's side. Clear the playback id but leave
        // the row in ERROR — admins can decide whether to purge it.
        const assetId = event.object.id;
        await reconcileByProviderAssetId(assetId, {
          status: "ERROR",
          playbackId: null,
        });
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[mux/webhook] handler error for ${event.type}:`, err);
    // Release the dedupe claim so Mux's retry can try again.
    await db.webhookEvent
      .delete({ where: { id: event.id } })
      .catch(() => null);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
