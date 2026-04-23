"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { assertEmailVerified, requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import {
  moderateReview,
  recomputeCourseRating,
  submitCourseReview,
} from "@/services/review.service";
import { db } from "@/lib/db";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

const submitReviewSchema = z.object({
  courseId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(160).optional(),
  body: z.string().max(4000).optional(),
});

export async function submitReview(input: {
  courseId: string;
  rating: number;
  title?: string;
  body?: string;
}): Promise<ActionResult<{ id: string; status: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const emailCheck = await assertEmailVerified(session.user.id);
  if (!emailCheck.ok) return { success: false, error: emailCheck.error };

  const parsed = submitReviewSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const review = await submitCourseReview({
      userId: session.user.id,
      courseId: parsed.data.courseId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
    });
    return { success: true, data: { id: review.id, status: review.status } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit review",
    };
  }
}

const moderateSchema = z.object({
  reviewId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function moderateReviewAction(input: {
  reviewId: string;
  status: "APPROVED" | "REJECTED";
}): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();
  const parsed = moderateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const review = await moderateReview(parsed.data.reviewId, parsed.data.status);
    await audit({
      actorId: session.user!.id,
      action: `review.${parsed.data.status.toLowerCase()}`,
      resource: "CourseReview",
      resourceId: review.id,
      metadata: { courseId: review.courseId, rating: review.rating },
    });
    return { success: true, data: { id: review.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to moderate review",
    };
  }
}

export async function deleteReviewAction(input: {
  reviewId: string;
}): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();

  try {
    const review = await db.courseReview.delete({
      where: { id: input.reviewId },
    });
    await recomputeCourseRating(review.courseId);
    await audit({
      actorId: session.user!.id,
      action: "review.delete",
      resource: "CourseReview",
      resourceId: review.id,
      metadata: { courseId: review.courseId },
    });
    return { success: true, data: { id: review.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete review",
    };
  }
}
