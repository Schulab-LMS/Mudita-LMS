import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRawFile, curriculaBranch } from "@/lib/github-curricula";
import { hasMediaSegment, subjectRoot } from "@/lib/curriculum-structure";
import { isAdminRole } from "@/lib/auth-helpers";

// Authenticated proxy for curriculum media (images). Keeps assets inside the
// platform: only signed-in users enrolled in the course (or a free course) can
// fetch them, and bytes are streamed from the private repo — never a public
// URL. This is the gate referenced by the rewritten <img src> in synced HTML.
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ courseSlug: string; path: string[] }> }
) {
  const { courseSlug, path } = await ctx.params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, isFree: true, sourcePath: true, sourceCommitSha: true },
  });
  if (!course || !course.sourcePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Access gate (free courses are open to any signed-in user). Enrolled
  // learners pass; so do session participants — students with a booking for a
  // lesson in this course — mirroring the quiz-attempt gate. Platform admins
  // pass too: the learner-view page lets an admin preview any course's lessons
  // (view-as), so the images embedded in those lessons must load for them —
  // otherwise a previewed deck/handout shows broken media. Mirrors the admin
  // bypass in getCourseBySlug and the learn page's enrolment skip.
  if (!course.isFree && !isAdminRole(session.user.role)) {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      select: { id: true },
    });
    if (!enrollment) {
      const booking = await db.booking.findFirst({
        where: {
          studentId: session.user.id,
          lesson: { module: { courseId: course.id } },
        },
        select: { id: true },
      });
      if (!booking) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  // Reject path traversal — only files within the repo are reachable.
  if (path.some((seg) => seg === ".." || seg === "." || seg === "")) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }

  // Resolve the repo path. The sync-time rewriter emits two URL shapes, both
  // restricted to `_media` directories so the proxy can never stream raw
  // markdown (overview/quiz/handout pedagogy) to enrolled students:
  //   • course-relative — begins with `_media`: an asset inside the course
  //     folder, resolved against course.sourcePath.
  //   • subject-relative — begins with the subject folder and contains a
  //     `_media` segment: shared media that lives above the per-course folder
  //     (e.g. space-science/_media, shared across age-group courses). Served
  //     from the repo root, but scoped to the course's own top-level subject so
  //     an enrolment can't reach into another subject's tree.
  let repoPath: string;
  if (path[0] === "_media") {
    repoPath = `${course.sourcePath}/${path.join("/")}`;
  } else {
    const candidate = path.join("/");
    if (
      !hasMediaSegment(candidate) ||
      subjectRoot(candidate) !== subjectRoot(course.sourcePath)
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    repoPath = candidate;
  }
  const ref = course.sourceCommitSha || curriculaBranch();

  try {
    const { bytes, contentType } = await getRawFile(repoPath, ref);
    return new Response(bytes, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        // Private + immutable: pinned to a commit SHA, gated per-user.
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error(`[curricula/media] failed to fetch ${repoPath}:`, e);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
