import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { runCurriculumSync } from "@/services/curriculum-sync.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Scheduled / manual full resync of the curriculum repo. Protected with the
// shared CRON_SECRET bearer token, mirroring /api/cron/drip. Pass ?force=1 to
// bypass the "no new commit" short-circuit and re-sync the current HEAD.

function constantTimeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      console.error("[cron/curriculum-sync] CRON_SECRET is not configured");
      return NextResponse.json(
        { error: "Cron endpoint is not configured" },
        { status: 503 }
      );
    }
  } else {
    const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!supplied || !constantTimeEqual(supplied, expected)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const force = request.nextUrl.searchParams.get("force") === "1";
  const result = await runCurriculumSync({ trigger: "CRON", force });
  const httpStatus = result.status === "FAILED" ? 500 : 200;
  return NextResponse.json(result, { status: httpStatus });
}
