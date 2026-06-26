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

// A student's capstone submission for a bundle (+ admin feedback).
export async function getBundleSubmission(bundleId: string, studentId: string) {
  try {
    return await db.activitySubmission.findUnique({
      where: { studentId_bundleId: { studentId, bundleId } },
      select: {
        id: true,
        content: true,
        status: true,
        feedback: true,
        feedbackAt: true,
        updatedAt: true,
      },
    });
  } catch {
    return null;
  }
}

// All of a student's bundle capstone submissions, newest first, with the
// bundle's title/slug for the portfolio list.
export async function getPortfolioSubmissions(studentId: string) {
  try {
    return await db.activitySubmission.findMany({
      where: { studentId, bundleId: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        content: true,
        status: true,
        feedback: true,
        feedbackAt: true,
        updatedAt: true,
        bundle: { select: { slug: true, title: true, titleAr: true, titleDe: true } },
      },
    });
  } catch {
    return [];
  }
}
