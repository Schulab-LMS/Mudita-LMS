import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminRole } from "@/lib/auth-helpers";
import { checkLessonAccess } from "@/services/access.service";
import { resolvePlayback } from "@/services/video.service";

// Returns a short-lived signed playback URL for a VideoAsset.
//
// Access model:
// - We look up every Lesson that references this asset. The caller must have
//   access to at least one of those lessons (free preview, enrollment, or
//   admin/author). A loose asset (no lessons) is only viewable by admins —
//   this happens briefly in the authoring flow before the admin attaches
//   the freshly-uploaded asset to a lesson.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const role = session?.user?.role ?? null;

  const lessons = await db.lesson.findMany({
    where: { videoAssetId: assetId },
    select: { id: true },
  });

  if (lessons.length === 0) {
    if (!isAdminRole(role ?? undefined)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  } else {
    // Allow if any associated lesson grants access. Lessons in multiple
    // courses (reused asset) widen access to the union of those courses.
    const checks = await Promise.all(
      lessons.map((l) =>
        checkLessonAccess({ lessonId: l.id, userId, role })
      )
    );
    if (!checks.some((c) => c.allowed)) {
      const status =
        checks.every((c) => c.reason === "not_authenticated") ? 401 : 403;
      return NextResponse.json(
        { error: checks[0]?.reason ?? "forbidden" },
        { status }
      );
    }
  }

  const playback = await resolvePlayback(assetId);
  if (!playback) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    status: playback.status,
    url: playback.url,
    thumbnailUrl: playback.thumbnailUrl,
    expiresAt: playback.expiresAt?.toISOString() ?? null,
  });
}
