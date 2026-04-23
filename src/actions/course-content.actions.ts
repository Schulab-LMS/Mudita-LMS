"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import {
  createModuleSchema,
  updateModuleSchema,
  deleteModuleSchema,
  reorderModulesSchema,
  createLessonSchema,
  updateLessonSchema,
  deleteLessonSchema,
  reorderLessonsSchema,
} from "@/validators/action.schemas";

// ── Module CRUD ─────────────────────────────────────────────────────────

export async function createModule(data: {
  courseId: string;
  title: string;
  titleAr?: string;
  titleDe?: string;
  order: number;
}) {
  try {
    const session = await requireAdmin();
    const parsed = createModuleSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const mod = await db.module.create({
      data: {
        courseId: parsed.data.courseId,
        title: parsed.data.title,
        titleAr: parsed.data.titleAr || null,
        titleDe: parsed.data.titleDe || null,
        order: parsed.data.order,
      },
    });
    await audit({
      actorId: session.user!.id,
      action: "module.create",
      resource: "Module",
      resourceId: mod.id,
      metadata: { courseId: parsed.data.courseId, title: parsed.data.title },
    });

    revalidatePath(`/admin/courses/${parsed.data.courseId}`);
    return { success: true, moduleId: mod.id };
  } catch (error) {
    console.error("createModule error:", error);
    return { success: false, error: "Failed to create module" };
  }
}

export async function updateModule(data: {
  moduleId: string;
  title: string;
  titleAr?: string;
  titleDe?: string;
  order?: number;
}) {
  try {
    const session = await requireAdmin();
    const parsed = updateModuleSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const mod = await db.module.update({
      where: { id: parsed.data.moduleId },
      data: {
        title: parsed.data.title,
        titleAr: parsed.data.titleAr || null,
        titleDe: parsed.data.titleDe || null,
        ...(parsed.data.order !== undefined && { order: parsed.data.order }),
      },
      select: { courseId: true },
    });
    await audit({
      actorId: session.user!.id,
      action: "module.update",
      resource: "Module",
      resourceId: parsed.data.moduleId,
      metadata: { courseId: mod.courseId },
    });

    revalidatePath(`/admin/courses/${mod.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("updateModule error:", error);
    return { success: false, error: "Failed to update module" };
  }
}

export async function deleteModule(moduleId: string) {
  try {
    const session = await requireAdmin();
    const parsed = deleteModuleSchema.safeParse({ moduleId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const mod = await db.module.delete({
      where: { id: parsed.data.moduleId },
      select: { courseId: true },
    });
    await audit({
      actorId: session.user!.id,
      action: "module.delete",
      resource: "Module",
      resourceId: parsed.data.moduleId,
      metadata: { courseId: mod.courseId },
    });

    revalidatePath(`/admin/courses/${mod.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("deleteModule error:", error);
    return { success: false, error: "Failed to delete module" };
  }
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  try {
    await requireAdmin();
    const parsed = reorderModulesSchema.safeParse({ courseId, moduleIds });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.$transaction(
      parsed.data.moduleIds.map((id, index) =>
        db.module.update({ where: { id }, data: { order: index } })
      )
    );

    revalidatePath(`/admin/courses/${parsed.data.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("reorderModules error:", error);
    return { success: false, error: "Failed to reorder modules" };
  }
}

// ── Lesson CRUD ─────────────────────────────────────────────────────────

export async function createLesson(data: {
  moduleId: string;
  title: string;
  titleAr?: string;
  titleDe?: string;
  content?: string;
  contentAr?: string;
  contentDe?: string;
  videoUrl?: string;
  thumbnail?: string | null;
  duration?: number;
  type: string;
  order: number;
  isFree: boolean;
}) {
  try {
    const session = await requireAdmin();
    const parsed = createLessonSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const lesson = await db.lesson.create({
      data: {
        moduleId: parsed.data.moduleId,
        title: parsed.data.title,
        titleAr: parsed.data.titleAr || null,
        titleDe: parsed.data.titleDe || null,
        content: parsed.data.content || null,
        contentAr: parsed.data.contentAr || null,
        contentDe: parsed.data.contentDe || null,
        videoUrl: parsed.data.videoUrl || null,
        thumbnail: parsed.data.thumbnail ?? null,
        duration: parsed.data.duration || null,
        type: parsed.data.type as never,
        order: parsed.data.order,
        isFree: parsed.data.isFree,
      },
      include: { module: { select: { courseId: true } } },
    });
    await audit({
      actorId: session.user!.id,
      action: "lesson.create",
      resource: "Lesson",
      resourceId: lesson.id,
      metadata: {
        moduleId: parsed.data.moduleId,
        courseId: lesson.module.courseId,
        type: parsed.data.type,
      },
    });

    revalidatePath(`/admin/courses/${lesson.module.courseId}`);
    return { success: true, lessonId: lesson.id };
  } catch (error) {
    console.error("createLesson error:", error);
    return { success: false, error: "Failed to create lesson" };
  }
}

export async function updateLesson(data: {
  lessonId: string;
  title: string;
  titleAr?: string;
  titleDe?: string;
  content?: string;
  contentAr?: string;
  contentDe?: string;
  videoUrl?: string;
  thumbnail?: string | null;
  duration?: number;
  type: string;
  order?: number;
  isFree: boolean;
}) {
  try {
    const session = await requireAdmin();
    const parsed = updateLessonSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const lesson = await db.lesson.update({
      where: { id: parsed.data.lessonId },
      data: {
        title: parsed.data.title,
        titleAr: parsed.data.titleAr || null,
        titleDe: parsed.data.titleDe || null,
        content: parsed.data.content || null,
        contentAr: parsed.data.contentAr || null,
        contentDe: parsed.data.contentDe || null,
        videoUrl: parsed.data.videoUrl || null,
        thumbnail: parsed.data.thumbnail ?? null,
        duration: parsed.data.duration || null,
        type: parsed.data.type as never,
        ...(parsed.data.order !== undefined && { order: parsed.data.order }),
        isFree: parsed.data.isFree,
      },
      include: { module: { select: { courseId: true } } },
    });
    await audit({
      actorId: session.user!.id,
      action: "lesson.update",
      resource: "Lesson",
      resourceId: parsed.data.lessonId,
      metadata: { courseId: lesson.module.courseId, type: parsed.data.type },
    });

    revalidatePath(`/admin/courses/${lesson.module.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("updateLesson error:", error);
    return { success: false, error: "Failed to update lesson" };
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    const session = await requireAdmin();
    const parsed = deleteLessonSchema.safeParse({ lessonId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const lesson = await db.lesson.delete({
      where: { id: parsed.data.lessonId },
      include: { module: { select: { courseId: true } } },
    });
    await audit({
      actorId: session.user!.id,
      action: "lesson.delete",
      resource: "Lesson",
      resourceId: parsed.data.lessonId,
      metadata: { courseId: lesson.module.courseId },
    });

    revalidatePath(`/admin/courses/${lesson.module.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("deleteLesson error:", error);
    return { success: false, error: "Failed to delete lesson" };
  }
}

export async function reorderLessons(moduleId: string, lessonIds: string[]) {
  try {
    await requireAdmin();
    const parsed = reorderLessonsSchema.safeParse({ moduleId, lessonIds });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const mod = await db.module.findUnique({
      where: { id: parsed.data.moduleId },
      select: { courseId: true },
    });
    if (!mod) return { success: false, error: "Module not found" };

    await db.$transaction(
      parsed.data.lessonIds.map((id, index) =>
        db.lesson.update({ where: { id }, data: { order: index } })
      )
    );

    revalidatePath(`/admin/courses/${mod.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("reorderLessons error:", error);
    return { success: false, error: "Failed to reorder lessons" };
  }
}
