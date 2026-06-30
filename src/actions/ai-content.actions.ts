"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import { setLessonAiStatusSchema } from "@/validators/action.schemas";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Move a lesson through the AI-content review lifecycle (Task 5). Enforces the
 * source-first guarantee: a lesson cannot be APPROVED unless it carries at
 * least one source citation. On APPROVED we stamp the reviewer + verification
 * time so the publish gate (aiStatus = APPROVED + citations) is auditable.
 */
export async function setLessonAiStatus(
  lessonId: string,
  status: string
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    const parsed = setLessonAiStatusSchema.safeParse({ lessonId, status });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const lesson = await db.lesson.findUnique({
      where: { id: parsed.data.lessonId },
      select: {
        id: true,
        aiStatus: true,
        _count: { select: { sourceCitations: true } },
      },
    });
    if (!lesson) return { success: false, error: "Lesson not found" };

    // Source-first publish gate: approval requires at least one cited source.
    if (parsed.data.status === "APPROVED" && lesson._count.sourceCitations === 0) {
      return {
        success: false,
        error: "Cannot approve: lesson has no source citations.",
      };
    }

    const approving = parsed.data.status === "APPROVED";
    await db.lesson.update({
      where: { id: parsed.data.lessonId },
      data: {
        aiStatus: parsed.data.status,
        // Stamp reviewer + verification only when signing off; clear on reopen.
        aiReviewedById: approving ? session.user!.id : null,
        lastVerifiedAt: approving ? new Date() : null,
      },
    });

    await audit({
      actorId: session.user!.id,
      action: "ai_content.set_status",
      resource: "Lesson",
      resourceId: parsed.data.lessonId,
      metadata: { from: lesson.aiStatus, to: parsed.data.status },
    });

    revalidatePath("/admin/ai-content");
    return { success: true };
  } catch (error) {
    console.error("setLessonAiStatus error:", error);
    return { success: false, error: "Failed to update AI content status" };
  }
}
