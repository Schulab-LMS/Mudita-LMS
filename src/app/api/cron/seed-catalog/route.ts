import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
// seed-catalog lives under prisma/ (shared with the CLI seeders). It only
// imports a `type PrismaClient` (erased) + pure data modules, so it bundles
// cleanly into this Node route and reuses the app's db singleton.
import { seedCatalog } from "../../../../../prisma/seed-catalog";

export const runtime = "nodejs";
// Catalog seeding does a lot of upserts; give it room beyond the default.
export const maxDuration = 300;

// Production-safe catalog seeder endpoint. Inserts/updates ONLY catalog content
// (reference sources, course master list, bundles, pathways + links) via the
// shared idempotent seedCatalog(). Never creates demo users. Invoked by the
// deploy pipeline (curl with CRON_SECRET) right after the app comes up.
function constantTimeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

async function handle(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      console.error("[cron/seed-catalog] CRON_SECRET is not configured");
      return NextResponse.json({ error: "Cron endpoint is not configured" }, { status: 503 });
    }
  } else {
    const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!supplied || !constantTimeEqual(supplied, expected)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // Catalog rows need a createdById. Prefer a real platform admin; fall back to
  // any existing user. Never create users from an HTTP endpoint.
  const author =
    (await db.user.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    })) ?? (await db.user.findFirst({ select: { id: true }, orderBy: { createdAt: "asc" } }));

  if (!author) {
    return NextResponse.json({ error: "no_user_to_attribute_content" }, { status: 409 });
  }

  try {
    await seedCatalog(db, author.id);
  } catch (err) {
    console.error("[cron/seed-catalog] failed:", err);
    return NextResponse.json({ error: "seed_failed" }, { status: 500 });
  }

  const [sources, courses, bundles, pathways] = await Promise.all([
    db.referenceSource.count(),
    db.course.count(),
    db.bundle.count(),
    db.learningPathway.count(),
  ]);
  return NextResponse.json({ ok: true, sources, courses, bundles, pathways });
}

export async function POST(request: NextRequest) {
  return handle(request);
}
