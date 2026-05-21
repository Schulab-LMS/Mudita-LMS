import { db } from "@/lib/db";

// A student's own submission for a lesson's hands-on activity (+ tutor feedback).
export async function getActivitySubmission(lessonId: string, studentId: string) {
  return db.activitySubmission.findUnique({
    where: { studentId_lessonId: { studentId, lessonId } },
    select: {
      id: true,
      content: true,
      status: true,
      feedback: true,
      feedbackAt: true,
      updatedAt: true,
    },
  });
}
