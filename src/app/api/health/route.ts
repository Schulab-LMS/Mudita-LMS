import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Always run on the server, never cached. The deploy pipeline polls this
// endpoint after `docker compose up -d` to confirm the new container is
// reachable AND the database adapter can complete a round-trip query.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const startedAt = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ok",
        db: "ok",
        latencyMs: Date.now() - startedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/health] db check failed:", error);
    return NextResponse.json(
      {
        status: "degraded",
        db: "error",
        latencyMs: Date.now() - startedAt,
      },
      { status: 503 }
    );
  }
}
