import { db } from "@/lib/db";
import { sanitizeText } from "@/lib/sanitize";
import type { ReviewStatus } from "@/generated/prisma/client";

// Course reviews are moderation-gated (default PENDING) so teachers aren't
// sandbagged by abusive or off-topic content before an admin has a chance
// to look. Approval flips the review into the public feed and triggers a
// denormalised rating recalculation on the course.

export type SubmitReviewInput = {
  userId: string;
  courseId: string;
  rating: number;
  title?: string | null;
  body?: string | null;
};

export async function submitCourseReview(input: SubmitReviewInput) {
  const { userId, courseId, rating, title, body } = input;
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  if (!enrollment) {
    throw new Error("You must be enrolled to leave a review");
  }

  // Strip any HTML before persisting. Reviews are plain-text — a tag in the
  // body is either an XSS attempt or noise. Sanitising on write keeps the DB
  // clean and means every read path is safe without needing to remember.
  const cleanTitle = title ? sanitizeText(title) || null : null;
  const cleanBody = body ? sanitizeText(body) || null : null;

  return db.courseReview.upsert({
    where: { courseId_userId: { courseId, userId } },
    create: {
      courseId,
      userId,
      rating,
      title: cleanTitle,
      body: cleanBody,
      status: "PENDING",
    },
    update: {
      rating,
      title: cleanTitle,
      body: cleanBody,
      status: "PENDING",
    },
  });
}

export async function listApprovedReviews(
  courseId: string,
  opts: { limit?: number; cursor?: string } = {}
) {
  const limit = Math.min(opts.limit ?? 20, 50);
  return db.courseReview.findMany({
    where: { courseId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export async function listReviewsForModeration(opts: {
  status?: ReviewStatus;
  limit?: number;
} = {}) {
  return db.courseReview.findMany({
    where: { status: opts.status ?? "PENDING" },
    orderBy: { createdAt: "asc" },
    take: Math.min(opts.limit ?? 50, 100),
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, slug: true, title: true } },
    },
  });
}

export async function moderateReview(
  reviewId: string,
  status: "APPROVED" | "REJECTED"
) {
  const review = await db.courseReview.update({
    where: { id: reviewId },
    data: { status },
  });
  if (status === "APPROVED" || status === "REJECTED") {
    await recomputeCourseRating(review.courseId);
  }
  return review;
}

// Denormalised rating on Course is the read path for course cards and
// listing pages. Kept eventually consistent: recomputed whenever the set of
// APPROVED reviews for a course changes (approve, reject, delete).
export async function recomputeCourseRating(courseId: string) {
  const agg = await db.courseReview.aggregate({
    where: { courseId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const avg = Number(agg._avg.rating ?? 0);
  const count = agg._count._all ?? 0;
  await db.course.update({
    where: { id: courseId },
    data: {
      averageRating: Number(avg.toFixed(2)),
      reviewCount: count,
    },
  });
}
