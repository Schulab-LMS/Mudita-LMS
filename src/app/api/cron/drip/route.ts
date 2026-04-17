import { NextRequest, NextResponse } from "next/server";
import {
  processDueDripRows,
  seedCartAbandonmentJourney,
  seedParentDigestJourney,
} from "@/services/drip.service";

export const runtime = "nodejs";

// Cron entry point. Runs three passes in sequence:
//  1. Seed cart-abandonment journeys for pending purchases older than the
//     configured grace window.
//  2. Seed the weekly parent-digest journey (idempotent via upsert).
//  3. Process every DripState row whose nextSendAt has elapsed.
//
// Protected with a shared secret (CRON_SECRET) supplied as a bearer token.
// Intended to be invoked by an external scheduler (Vercel Cron, GitHub
// Action, cron-job.org, etc.) every 15 minutes.

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const supplied = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");
    if (supplied !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const { searchParams } = request.nextUrl;
    const skipSeed = searchParams.get("skipSeed") === "1";

    const isSunday = new Date().getUTCDay() === 0;
    const seeds = skipSeed
      ? null
      : {
          cart: await seedCartAbandonmentJourney(),
          parentDigest: isSunday
            ? await seedParentDigestJourney()
            : { enrolled: 0 },
        };

    const processed = await processDueDripRows();
    return NextResponse.json({ ok: true, seeds, processed });
  } catch (err) {
    console.error("[cron/drip] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
