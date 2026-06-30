// Read model for the admin "AI Content" review queue (Task 5). Surfaces every
// lesson that is part of the AI-assisted production pipeline (aiStatus set),
// with its provenance and source-citation count, so reviewers can move it
// through the lifecycle. See docs/curriculum-production/tutor-and-review.md.

import { db } from "@/lib/db";
import type { AiContentStatus } from "@/generated/prisma/client";

export interface AiContentQueueItem {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  aiStatus: AiContentStatus;
  aiModel: string | null;
  aiReviewedById: string | null;
  lastVerifiedAt: Date | null;
  citationCount: number;
}

// Surface order: items needing attention first, finished ones last.
const STATUS_ORDER: AiContentStatus[] = [
  "REVISION_NEEDED",
  "UNDER_REVIEW",
  "AI_GENERATED",
  "SOURCE_COLLECTED",
  "APPROVED",
];

/**
 * List lessons in the AI pipeline (aiStatus set), optionally filtered to one
 * status. Ordered so review-actionable items surface first, then most-recent.
 */
export async function listAiContentQueue(
  status?: AiContentStatus
): Promise<AiContentQueueItem[]> {
  const rows = await db.lesson.findMany({
    where: { aiStatus: status ? status : { not: null } },
    select: {
      id: true,
      title: true,
      aiStatus: true,
      aiModel: true,
      aiReviewedById: true,
      lastVerifiedAt: true,
      module: {
        select: {
          title: true,
          course: { select: { id: true, slug: true, title: true } },
        },
      },
      _count: { select: { sourceCitations: true } },
    },
    // Lesson has no timestamp columns; sort by title, then re-sort by review
    // priority below (stable sort keeps the title order within each status).
    orderBy: { title: "asc" },
  });

  const items: AiContentQueueItem[] = rows
    // aiStatus is non-null by the where clause, but TS sees it as nullable.
    .filter((r): r is typeof r & { aiStatus: AiContentStatus } => r.aiStatus !== null)
    .map((r) => ({
      lessonId: r.id,
      lessonTitle: r.title,
      moduleTitle: r.module.title,
      courseId: r.module.course.id,
      courseSlug: r.module.course.slug,
      courseTitle: r.module.course.title,
      aiStatus: r.aiStatus,
      aiModel: r.aiModel,
      aiReviewedById: r.aiReviewedById,
      lastVerifiedAt: r.lastVerifiedAt,
      citationCount: r._count.sourceCitations,
    }));

  // Secondary sort by the review-priority order (DB already sorted by recency).
  return items.sort(
    (a, b) => STATUS_ORDER.indexOf(a.aiStatus) - STATUS_ORDER.indexOf(b.aiStatus)
  );
}

/** Count of lessons per aiStatus, for the queue header / nav badge. */
export async function aiContentCounts(): Promise<Record<AiContentStatus, number>> {
  const grouped = await db.lesson.groupBy({
    by: ["aiStatus"],
    where: { aiStatus: { not: null } },
    _count: { _all: true },
  });
  const out: Record<AiContentStatus, number> = {
    SOURCE_COLLECTED: 0,
    AI_GENERATED: 0,
    UNDER_REVIEW: 0,
    REVISION_NEEDED: 0,
    APPROVED: 0,
  };
  for (const g of grouped) {
    if (g.aiStatus) out[g.aiStatus] = g._count._all;
  }
  return out;
}
