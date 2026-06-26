"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import {
  createBundleSchema,
  updateBundleSchema,
  deleteBundleSchema,
  addCourseToBundleSchema,
  removeCourseFromBundleSchema,
  setBundleCourseRequiredSchema,
  reorderBundleCoursesSchema,
} from "@/validators/action.schemas";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Bundle CRUD ─────────────────────────────────────────────────────────

export async function createBundle(data: {
  title: string;
  description: string;
  themeCategory: string;
  ageGroup: string;
  level: string;
  requiredPlan?: string | null;
  finalProjectTitle?: string | null;
  finalProjectDescription?: string | null;
  recommendedDurationWeeks?: number | null;
  thumbnail?: string | null;
}) {
  try {
    const session = await requireAdmin();
    const parsed = createBundleSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const created = await db.bundle.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        themeCategory: parsed.data.themeCategory,
        ageGroup: parsed.data.ageGroup as never,
        level: parsed.data.level as never,
        requiredPlan: (parsed.data.requiredPlan ?? null) as never,
        finalProjectTitle: parsed.data.finalProjectTitle ?? null,
        finalProjectDescription: parsed.data.finalProjectDescription ?? null,
        recommendedDurationWeeks: parsed.data.recommendedDurationWeeks ?? null,
        thumbnail: parsed.data.thumbnail ?? null,
        slug: slugify(parsed.data.title),
        createdById: session.user!.id,
      },
      select: { id: true, slug: true, title: true },
    });
    await audit({
      actorId: session.user!.id,
      action: "bundle.create",
      resource: "Bundle",
      resourceId: created.id,
      metadata: { slug: created.slug, title: created.title },
    });

    revalidatePath("/admin/bundles");
    return { success: true, bundleId: created.id };
  } catch (error) {
    console.error("createBundle error:", error);
    return { success: false, error: "Failed to create bundle" };
  }
}

export async function updateBundle(
  bundleId: string,
  data: Partial<{
    title: string;
    description: string;
    themeCategory: string;
    ageGroup: string;
    level: string;
    requiredPlan: string | null;
    status: string;
    finalProjectTitle: string | null;
    finalProjectDescription: string | null;
    recommendedDurationWeeks: number | null;
    thumbnail: string | null;
  }>
) {
  try {
    const session = await requireAdmin();
    const parsed = updateBundleSchema.safeParse({ bundleId, data });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.bundle.update({
      where: { id: parsed.data.bundleId },
      data: parsed.data.data as never,
    });
    await audit({
      actorId: session.user!.id,
      action: "bundle.update",
      resource: "Bundle",
      resourceId: parsed.data.bundleId,
      metadata: { fields: Object.keys(parsed.data.data ?? {}) },
    });

    revalidatePath("/admin/bundles");
    revalidatePath(`/admin/bundles/${parsed.data.bundleId}`);
    return { success: true };
  } catch (error) {
    console.error("updateBundle error:", error);
    return { success: false, error: "Failed to update bundle" };
  }
}

export async function deleteBundle(bundleId: string) {
  try {
    const session = await requireAdmin();
    const parsed = deleteBundleSchema.safeParse({ bundleId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // Cascades remove BundleCourse links; PathwayStage rows pointing at this
    // bundle also cascade (onDelete: Cascade on PathwayStage.bundle).
    await db.bundle.delete({ where: { id: parsed.data.bundleId } });
    await audit({
      actorId: session.user!.id,
      action: "bundle.delete",
      resource: "Bundle",
      resourceId: parsed.data.bundleId,
    });

    revalidatePath("/admin/bundles");
    return { success: true };
  } catch (error) {
    console.error("deleteBundle error:", error);
    return { success: false, error: "Failed to delete bundle" };
  }
}

export async function toggleBundleStatus(bundleId: string, status: string) {
  return updateBundle(bundleId, { status });
}

// ── Bundle ↔ Course links ───────────────────────────────────────────────

export async function addCourseToBundle(
  bundleId: string,
  courseId: string,
  isRequired = true
) {
  try {
    const session = await requireAdmin();
    const parsed = addCourseToBundleSchema.safeParse({ bundleId, courseId, isRequired });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const existing = await db.bundleCourse.findUnique({
      where: { bundleId_courseId: { bundleId, courseId } },
      select: { id: true },
    });
    if (existing) return { success: false, error: "Course is already in this bundle" };

    const last = await db.bundleCourse.findFirst({
      where: { bundleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    await db.bundleCourse.create({
      data: {
        bundleId,
        courseId,
        order: (last?.order ?? -1) + 1,
        isRequired: parsed.data.isRequired ?? true,
      },
    });
    await audit({
      actorId: session.user!.id,
      action: "bundle.addCourse",
      resource: "Bundle",
      resourceId: bundleId,
      metadata: { courseId },
    });

    revalidatePath(`/admin/bundles/${bundleId}/courses`);
    return { success: true };
  } catch (error) {
    console.error("addCourseToBundle error:", error);
    return { success: false, error: "Failed to add course to bundle" };
  }
}

export async function removeCourseFromBundle(bundleCourseId: string) {
  try {
    const session = await requireAdmin();
    const parsed = removeCourseFromBundleSchema.safeParse({ bundleCourseId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const link = await db.bundleCourse.delete({
      where: { id: parsed.data.bundleCourseId },
      select: { bundleId: true },
    });
    await audit({
      actorId: session.user!.id,
      action: "bundle.removeCourse",
      resource: "Bundle",
      resourceId: link.bundleId,
      metadata: { bundleCourseId },
    });

    revalidatePath(`/admin/bundles/${link.bundleId}/courses`);
    return { success: true };
  } catch (error) {
    console.error("removeCourseFromBundle error:", error);
    return { success: false, error: "Failed to remove course from bundle" };
  }
}

export async function setBundleCourseRequired(
  bundleCourseId: string,
  isRequired: boolean
) {
  try {
    await requireAdmin();
    const parsed = setBundleCourseRequiredSchema.safeParse({ bundleCourseId, isRequired });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const link = await db.bundleCourse.update({
      where: { id: parsed.data.bundleCourseId },
      data: { isRequired: parsed.data.isRequired },
      select: { bundleId: true },
    });

    revalidatePath(`/admin/bundles/${link.bundleId}/courses`);
    return { success: true };
  } catch (error) {
    console.error("setBundleCourseRequired error:", error);
    return { success: false, error: "Failed to update course requirement" };
  }
}

export async function reorderBundleCourses(
  bundleId: string,
  bundleCourseIds: string[]
) {
  try {
    await requireAdmin();
    const parsed = reorderBundleCoursesSchema.safeParse({ bundleId, bundleCourseIds });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // Guard: the provided ids must be exactly this bundle's link set, so a
    // partial list can't leave gaps and a foreign id can't rewrite another
    // bundle's ordering.
    const owned = await db.bundleCourse.findMany({
      where: { bundleId: parsed.data.bundleId },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((l) => l.id));
    const sameSet =
      parsed.data.bundleCourseIds.length === ownedIds.size &&
      parsed.data.bundleCourseIds.every((id) => ownedIds.has(id));
    if (!sameSet) {
      return { success: false, error: "Course list must cover exactly this bundle's courses" };
    }

    await db.$transaction(
      parsed.data.bundleCourseIds.map((id, index) =>
        db.bundleCourse.update({ where: { id }, data: { order: index } })
      )
    );

    revalidatePath(`/admin/bundles/${parsed.data.bundleId}/courses`);
    return { success: true };
  } catch (error) {
    console.error("reorderBundleCourses error:", error);
    return { success: false, error: "Failed to reorder courses" };
  }
}
