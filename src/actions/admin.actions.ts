"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import {
  updateUserRoleSchema,
  toggleUserActiveSchema,
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

export async function createCourse(data: {
  title: string;
  description: string;
  ageGroup: string;
  level: string;
  category: string;
  isFree: boolean;
  price: number;
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

    await db.course.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        ageGroup: parsed.data.ageGroup as never,
        level: parsed.data.level as never,
        category: parsed.data.category,
        isFree: parsed.data.isFree,
        price: parsed.data.price,
        thumbnail: parsed.data.thumbnail ?? null,
        slug,
        createdById: session.user.id,
      },
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
    status: string;
    thumbnail: string | null;
  }>
) {
  try {
    await requireAdmin();
    const parsed = updateCourseSchema.safeParse({ courseId, data });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.course.update({ where: { id: parsed.data.courseId }, data: parsed.data.data as never });
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
    await requireAdmin();
    const parsed = deleteCourseSchema.safeParse({ courseId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      return { success: false, error: "Invalid status" };
    }

    await db.course.update({
      where: { id: parsed.data.courseId },
      data: { status: status as never },
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
    await requireAdmin();
    const parsed = createBadgeSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const slug = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await db.badge.create({
      data: {
        slug,
        name: parsed.data.name,
        description: parsed.data.description,
        icon: parsed.data.icon,
        criteria: parsed.data.criteria as never,
        points: parsed.data.points ?? 0,
      },
    });

    revalidatePath("/admin/badges");
    return { success: true };
  } catch (error) {
    console.error("createBadge error:", error);
    return { success: false, error: "Failed to create badge" };
  }
}
