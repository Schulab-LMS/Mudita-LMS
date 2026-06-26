"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import {
  createPathwaySchema,
  updatePathwaySchema,
  deletePathwaySchema,
  addPathwayStageSchema,
  removePathwayStageSchema,
  reorderPathwayStagesSchema,
} from "@/validators/action.schemas";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Pathway CRUD ────────────────────────────────────────────────────────

export async function createPathway(data: {
  title: string;
  description: string;
  ageGroup: string;
  order?: number;
  thumbnail?: string | null;
}) {
  try {
    const session = await requireAdmin();
    const parsed = createPathwaySchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const created = await db.learningPathway.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        ageGroup: parsed.data.ageGroup as never,
        order: parsed.data.order ?? 0,
        thumbnail: parsed.data.thumbnail ?? null,
        slug: slugify(parsed.data.title),
        createdById: session.user!.id,
      },
      select: { id: true, slug: true, title: true },
    });
    await audit({
      actorId: session.user!.id,
      action: "pathway.create",
      resource: "LearningPathway",
      resourceId: created.id,
      metadata: { slug: created.slug, title: created.title },
    });

    revalidatePath("/admin/pathways");
    return { success: true, pathwayId: created.id };
  } catch (error) {
    console.error("createPathway error:", error);
    return { success: false, error: "Failed to create pathway" };
  }
}

export async function updatePathway(
  pathwayId: string,
  data: Partial<{
    title: string;
    description: string;
    ageGroup: string;
    status: string;
    order: number;
    thumbnail: string | null;
  }>
) {
  try {
    const session = await requireAdmin();
    const parsed = updatePathwaySchema.safeParse({ pathwayId, data });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.learningPathway.update({
      where: { id: parsed.data.pathwayId },
      data: parsed.data.data as never,
    });
    await audit({
      actorId: session.user!.id,
      action: "pathway.update",
      resource: "LearningPathway",
      resourceId: parsed.data.pathwayId,
      metadata: { fields: Object.keys(parsed.data.data ?? {}) },
    });

    revalidatePath("/admin/pathways");
    revalidatePath(`/admin/pathways/${parsed.data.pathwayId}`);
    return { success: true };
  } catch (error) {
    console.error("updatePathway error:", error);
    return { success: false, error: "Failed to update pathway" };
  }
}

export async function deletePathway(pathwayId: string) {
  try {
    const session = await requireAdmin();
    const parsed = deletePathwaySchema.safeParse({ pathwayId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.learningPathway.delete({ where: { id: parsed.data.pathwayId } });
    await audit({
      actorId: session.user!.id,
      action: "pathway.delete",
      resource: "LearningPathway",
      resourceId: parsed.data.pathwayId,
    });

    revalidatePath("/admin/pathways");
    return { success: true };
  } catch (error) {
    console.error("deletePathway error:", error);
    return { success: false, error: "Failed to delete pathway" };
  }
}

export async function togglePathwayStatus(pathwayId: string, status: string) {
  return updatePathway(pathwayId, { status });
}

// ── Pathway stages ──────────────────────────────────────────────────────

// `bundleId` XOR `courseId` — the schema's .refine enforces exactly one, and
// the DB CHECK constraint backs it up.
export async function addPathwayStage(data: {
  pathwayId: string;
  title?: string | null;
  bundleId?: string;
  courseId?: string;
}) {
  try {
    const session = await requireAdmin();
    const parsed = addPathwayStageSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const last = await db.pathwayStage.findFirst({
      where: { pathwayId: parsed.data.pathwayId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    await db.pathwayStage.create({
      data: {
        pathwayId: parsed.data.pathwayId,
        order: (last?.order ?? -1) + 1,
        title: parsed.data.title ?? null,
        bundleId: parsed.data.bundleId ?? null,
        courseId: parsed.data.courseId ?? null,
      },
    });
    await audit({
      actorId: session.user!.id,
      action: "pathway.addStage",
      resource: "LearningPathway",
      resourceId: parsed.data.pathwayId,
      metadata: { bundleId: parsed.data.bundleId, courseId: parsed.data.courseId },
    });

    revalidatePath(`/admin/pathways/${parsed.data.pathwayId}/stages`);
    return { success: true };
  } catch (error) {
    console.error("addPathwayStage error:", error);
    return { success: false, error: "Failed to add stage" };
  }
}

export async function removePathwayStage(stageId: string) {
  try {
    const session = await requireAdmin();
    const parsed = removePathwayStageSchema.safeParse({ stageId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const stage = await db.pathwayStage.delete({
      where: { id: parsed.data.stageId },
      select: { pathwayId: true },
    });
    await audit({
      actorId: session.user!.id,
      action: "pathway.removeStage",
      resource: "LearningPathway",
      resourceId: stage.pathwayId,
      metadata: { stageId },
    });

    revalidatePath(`/admin/pathways/${stage.pathwayId}/stages`);
    return { success: true };
  } catch (error) {
    console.error("removePathwayStage error:", error);
    return { success: false, error: "Failed to remove stage" };
  }
}

export async function reorderPathwayStages(pathwayId: string, stageIds: string[]) {
  try {
    await requireAdmin();
    const parsed = reorderPathwayStagesSchema.safeParse({ pathwayId, stageIds });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // Guard: the provided ids must be exactly this pathway's stage set. This
    // rejects partial lists (which would collide on the UNIQUE(pathwayId,order)
    // settle pass and roll back) and foreign ids from another pathway.
    const owned = await db.pathwayStage.findMany({
      where: { pathwayId: parsed.data.pathwayId },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((s) => s.id));
    const sameSet =
      parsed.data.stageIds.length === ownedIds.size &&
      parsed.data.stageIds.every((id) => ownedIds.has(id));
    if (!sameSet) {
      return { success: false, error: "Stage list must cover exactly this pathway's stages" };
    }

    // The (pathwayId, order) unique constraint means we can't shuffle to final
    // positions directly (transient collisions). Offset into a temporary high
    // band first, then settle to 0..n-1. Because every row is offset, the temp
    // band is disjoint from the final 0..n-1 range.
    await db.$transaction([
      ...parsed.data.stageIds.map((id, index) =>
        db.pathwayStage.update({ where: { id }, data: { order: index + 1000 } })
      ),
      ...parsed.data.stageIds.map((id, index) =>
        db.pathwayStage.update({ where: { id }, data: { order: index } })
      ),
    ]);

    revalidatePath(`/admin/pathways/${parsed.data.pathwayId}/stages`);
    return { success: true };
  } catch (error) {
    console.error("reorderPathwayStages error:", error);
    return { success: false, error: "Failed to reorder stages" };
  }
}
