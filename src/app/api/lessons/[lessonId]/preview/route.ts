import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkLessonAccess } from "@/services/access.service";
import { EVENTS, track } from "@/lib/analytics";

// Returns playback-safe lesson metadata. Callers use this both for the
// "Watch free preview" CTA on the public course page and for in-course
// viewing. Denies with 403 when the caller has no access; the UI is
// expected to prompt purchase/login based on the reason string.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const role = session?.user?.role ?? null;

  const access = await checkLessonAccess({ lessonId, userId, role });
  if (!access.allowed) {
    const status = access.reason === "lesson_not_found" ? 404 : 403;
    return NextResponse.json({ error: access.reason }, { status });
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      content: true,
      videoUrl: true,
      videoAssetId: true,
      duration: true,
      type: true,
      isFree: true,
    },
  });
  if (!lesson) {
    return NextResponse.json({ error: "lesson_not_found" }, { status: 404 });
  }

  track({
    name: EVENTS.LESSON_STARTED,
    userId,
    properties: {
      lessonId: lesson.id,
      reason: access.reason,
      isFree: lesson.isFree,
    },
  }).catch(() => null);

  return NextResponse.json({ lesson, access: access.reason });
}
