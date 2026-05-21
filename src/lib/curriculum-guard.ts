import { db } from "@/lib/db";

// Git is the single source of truth for managed curriculum. These courses are
// read-only in the admin UI — any write action must refuse, so an admin edit
// can't be silently overwritten by the next repo sync.
export const MANAGED_COURSE_ERROR =
  "This course is managed in the STEM-Curricula Git repo and is read-only here. Make changes in Git instead.";

type CourseRef = {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  quizId?: string;
  questionId?: string;
};

const courseSel = { select: { managedByGit: true } };

// Resolve the owning course's managedByGit flag from any content id, then
// block the write if it's Git-managed.
export async function assertCourseEditable(
  ref: CourseRef
): Promise<{ ok: true } | { ok: false; error: string }> {
  let managed: boolean | undefined;

  if (ref.courseId) {
    const c = await db.course.findUnique({
      where: { id: ref.courseId },
      ...courseSel,
    });
    managed = c?.managedByGit;
  } else if (ref.moduleId) {
    const m = await db.module.findUnique({
      where: { id: ref.moduleId },
      select: { course: courseSel },
    });
    managed = m?.course.managedByGit;
  } else if (ref.lessonId) {
    const l = await db.lesson.findUnique({
      where: { id: ref.lessonId },
      select: { module: { select: { course: courseSel } } },
    });
    managed = l?.module.course.managedByGit;
  } else if (ref.quizId) {
    const q = await db.quiz.findUnique({
      where: { id: ref.quizId },
      select: { lesson: { select: { module: { select: { course: courseSel } } } } },
    });
    managed = q?.lesson.module.course.managedByGit;
  } else if (ref.questionId) {
    const q = await db.question.findUnique({
      where: { id: ref.questionId },
      select: {
        quiz: {
          select: { lesson: { select: { module: { select: { course: courseSel } } } } },
        },
      },
    });
    managed = q?.quiz.lesson.module.course.managedByGit;
  }

  if (managed) return { ok: false, error: MANAGED_COURSE_ERROR };
  return { ok: true };
}
