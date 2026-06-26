"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { assertCourseEditable } from "@/lib/curriculum-guard";
import { audit } from "@/lib/audit";
import { grantComp, revokeComp } from "@/services/comp-access.service";
import {
  updateUserRoleSchema,
  toggleUserActiveSchema,
  compAccessSchema,
  createCourseSchema,
  updateCourseSchema,
  deleteCourseSchema,
  createBadgeSchema,
} from "@/validators/action.schemas";

export async function updateUserRole(userId: string, role: string) {
  try {
    const session = await requireAdmin();
    const parsed = updateUserRoleSchema.safeParse({ userId, role });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const prev = await db.user.findUnique({
      where: { id: parsed.data.userId },
      select: { role: true },
    });
    await db.user.update({ where: { id: parsed.data.userId }, data: { role: parsed.data.role as never } });
    await audit({
      actorId: session.user!.id,
      action: "user.update_role",
      resource: "User",
      resourceId: parsed.data.userId,
      metadata: { from: prev?.role, to: parsed.data.role },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("updateUserRole error:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function toggleUserActive(userId: string) {
  try {
    const session = await requireAdmin();
    const parsed = toggleUserActiveSchema.safeParse({ userId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const user = await db.user.findUnique({ where: { id: parsed.data.userId }, select: { isActive: true } });
    if (!user) return { success: false, error: "User not found" };
    await db.user.update({ where: { id: parsed.data.userId }, data: { isActive: !user.isActive } });
    await audit({
      actorId: session.user!.id,
      action: user.isActive ? "user.deactivate" : "user.activate",
      resource: "User",
      resourceId: parsed.data.userId,
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("toggleUserActive error:", error);
    return { success: false, error: "Failed to toggle user status" };
  }
}

// Grant complimentary ("comp") full access — an ACTIVE LIFETIME subscription with no
// Stripe, used during the payments-off beta to clear requiredPlan gating for invited
// users. Idempotent; see src/services/comp-access.service.ts.
export async function grantCompAccess(userId: string) {
  try {
    const session = await requireAdmin();
    const parsed = compAccessSchema.safeParse({ userId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const user = await db.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true } });
    if (!user) return { success: false, error: "User not found" };

    const created = await grantComp(parsed.data.userId);
    await audit({
      actorId: session.user!.id,
      action: "user.comp_grant",
      resource: "User",
      resourceId: parsed.data.userId,
      metadata: { created },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("grantCompAccess error:", error);
    return { success: false, error: "Failed to grant comp access" };
  }
}

export async function revokeCompAccess(userId: string) {
  try {
    const session = await requireAdmin();
    const parsed = compAccessSchema.safeParse({ userId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const revoked = await revokeComp(parsed.data.userId);
    await audit({
      actorId: session.user!.id,
      action: "user.comp_revoke",
      resource: "User",
      resourceId: parsed.data.userId,
      metadata: { revoked },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("revokeCompAccess error:", error);
    return { success: false, error: "Failed to revoke comp access" };
  }
}

export async function createCourse(data: {
  title: string;
  description: string;
  ageGroup: string;
  level: string;
  category: string;
  isFree: boolean;
  price: number;
  requiredPlan?: string | null;
  thumbnail?: string | null;
}) {
  try {
    const session = await requireAdmin();
    const parsed = createCourseSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const slug = parsed.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const created = await db.course.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        ageGroup: parsed.data.ageGroup as never,
        level: parsed.data.level as never,
        category: parsed.data.category,
        isFree: parsed.data.isFree,
        price: parsed.data.price,
        requiredPlan: (parsed.data.requiredPlan ?? null) as never,
        thumbnail: parsed.data.thumbnail ?? null,
        slug,
        createdById: session.user.id,
      },
      select: { id: true, slug: true, title: true },
    });
    await audit({
      actorId: session.user!.id,
      action: "course.create",
      resource: "Course",
      resourceId: created.id,
      metadata: { slug: created.slug, title: created.title },
    });

    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("createCourse error:", error);
    return { success: false, error: "Failed to create course" };
  }
}

export async function updateCourse(
  courseId: string,
  data: Partial<{
    title: string;
    description: string;
    ageGroup: string;
    level: string;
    category: string;
    isFree: boolean;
    price: number;
    requiredPlan: string | null;
    status: string;
    thumbnail: string | null;
  }>
) {
  try {
    const session = await requireAdmin();
    const parsed = updateCourseSchema.safeParse({ courseId, data });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // No content guard here: course metadata (name, description, age group,
    // level, category, price/plan gating, thumbnail) is platform-owned and
    // stays editable even for Git-managed courses. The Git sync only writes
    // CONTENT (modules/lessons) and never overwrites these fields, so an admin
    // edit cannot be clobbered by the next sync. Content edits remain guarded
    // (see course-content.actions / quiz-admin.actions).
    await db.course.update({ where: { id: parsed.data.courseId }, data: parsed.data.data as never });
    await audit({
      actorId: session.user!.id,
      action: "course.update",
      resource: "Course",
      resourceId: parsed.data.courseId,
      metadata: { fields: Object.keys(parsed.data.data ?? {}) },
    });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("updateCourse error:", error);
    return { success: false, error: "Failed to update course" };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const session = await requireAdmin();
    const parsed = deleteCourseSchema.safeParse({ courseId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const editable = await assertCourseEditable({ courseId: parsed.data.courseId });
    if (!editable.ok) return { success: false, error: editable.error };

    const course = await db.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { slug: true, title: true },
    });
    await db.course.delete({ where: { id: parsed.data.courseId } });
    await audit({
      actorId: session.user!.id,
      action: "course.delete",
      resource: "Course",
      resourceId: parsed.data.courseId,
      metadata: course ?? null,
    });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("deleteCourse error:", error);
    return { success: false, error: "Failed to delete course" };
  }
}

export async function toggleCourseStatus(courseId: string, status: string) {
  try {
    const session = await requireAdmin();
    const parsed = deleteCourseSchema.safeParse({ courseId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      return { success: false, error: "Invalid status" };
    }

    // Visibility/status is platform-owned (the sync never sets it), so admins
    // can publish/unpublish a Git-managed course freely — no content guard.

    const prev = await db.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { status: true },
    });
    await db.course.update({
      where: { id: parsed.data.courseId },
      data: { status: status as never },
    });
    await audit({
      actorId: session.user!.id,
      action: "course.status_change",
      resource: "Course",
      resourceId: parsed.data.courseId,
      metadata: { from: prev?.status, to: status },
    });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("toggleCourseStatus error:", error);
    return { success: false, error: "Failed to update course status" };
  }
}

export async function createBadge(data: {
  name: string;
  description: string;
  icon: string;
  criteria: Record<string, unknown>;
  points?: number;
}) {
  try {
    const session = await requireAdmin();
    const parsed = createBadgeSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const slug = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const created = await db.badge.create({
      data: {
        slug,
        name: parsed.data.name,
        description: parsed.data.description,
        icon: parsed.data.icon,
        criteria: parsed.data.criteria as never,
        points: parsed.data.points ?? 0,
      },
      select: { id: true, slug: true, name: true },
    });
    await audit({
      actorId: session.user!.id,
      action: "badge.create",
      resource: "Badge",
      resourceId: created.id,
      metadata: { slug: created.slug, name: created.name },
    });

    revalidatePath("/admin/badges");
    return { success: true };
  } catch (error) {
    console.error("createBadge error:", error);
    return { success: false, error: "Failed to create badge" };
  }
}
