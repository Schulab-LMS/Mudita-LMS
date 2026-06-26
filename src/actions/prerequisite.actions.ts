"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import {
  addPrerequisiteSchema,
  removePrerequisiteSchema,
} from "@/validators/action.schemas";

// Would adding "courseId requires prerequisiteId" close a cycle? It does iff
// prerequisiteId already (transitively) requires courseId. We only enforce
// DIRECT prerequisites at enrol time, but a cycle would still deadlock the
// affected courses (each needs the other completed first), so reject it.
async function createsCycle(courseId: string, prerequisiteId: string): Promise<boolean> {
  const visited = new Set<string>();
  let frontier = [prerequisiteId];
  while (frontier.length > 0) {
    const rows = await db.coursePrerequisite.findMany({
      where: { courseId: { in: frontier } },
      select: { prerequisiteId: true },
    });
    const next: string[] = [];
    for (const r of rows) {
      if (r.prerequisiteId === courseId) return true;
      if (!visited.has(r.prerequisiteId)) {
        visited.add(r.prerequisiteId);
        next.push(r.prerequisiteId);
      }
    }
    frontier = next;
  }
  return false;
}

export async function addCoursePrerequisite(courseId: string, prerequisiteId: string) {
  try {
    const session = await requireAdmin();
    const parsed = addPrerequisiteSchema.safeParse({ courseId, prerequisiteId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const existing = await db.coursePrerequisite.findUnique({
      where: { courseId_prerequisiteId: { courseId, prerequisiteId } },
      select: { id: true },
    });
    if (existing) return { success: false, error: "That prerequisite is already set" };

    if (await createsCycle(courseId, prerequisiteId)) {
      return { success: false, error: "That would create a prerequisite cycle" };
    }

    await db.coursePrerequisite.create({ data: { courseId, prerequisiteId } });
    await audit({
      actorId: session.user!.id,
      action: "course.addPrerequisite",
      resource: "Course",
      resourceId: courseId,
      metadata: { prerequisiteId },
    });

    revalidatePath(`/admin/courses/${courseId}/prerequisites`);
    return { success: true };
  } catch (error) {
    console.error("addCoursePrerequisite error:", error);
    return { success: false, error: "Failed to add prerequisite" };
  }
}

export async function removeCoursePrerequisite(prerequisiteRowId: string) {
  try {
    const session = await requireAdmin();
    const parsed = removePrerequisiteSchema.safeParse({ prerequisiteRowId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const row = await db.coursePrerequisite.delete({
      where: { id: parsed.data.prerequisiteRowId },
      select: { courseId: true, prerequisiteId: true },
    });
    await audit({
      actorId: session.user!.id,
      action: "course.removePrerequisite",
      resource: "Course",
      resourceId: row.courseId,
      metadata: { prerequisiteId: row.prerequisiteId },
    });

    revalidatePath(`/admin/courses/${row.courseId}/prerequisites`);
    return { success: true };
  } catch (error) {
    console.error("removeCoursePrerequisite error:", error);
    return { success: false, error: "Failed to remove prerequisite" };
  }
}
