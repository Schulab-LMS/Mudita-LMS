"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";

const assignmentSchema = z.object({
  tutorId: z.string().min(1),
  courseId: z.string().min(1),
});

export async function assignTutorCourse(input: z.input<typeof assignmentSchema>) {
  try {
    const session = await requireAdmin();
    const parsed = assignmentSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const [tutor, course] = await Promise.all([
      db.tutorProfile.findUnique({ where: { id: parsed.data.tutorId }, select: { id: true } }),
      db.course.findFirst({
        where: { id: parsed.data.courseId, status: { not: "ARCHIVED" } },
        select: { id: true },
      }),
    ]);
    if (!tutor) return { success: false, error: "Tutor not found" };
    if (!course) return { success: false, error: "Course not found or archived" };

    const assignment = await db.tutorCourseAssignment.upsert({
      where: {
        tutorId_courseId: {
          tutorId: parsed.data.tutorId,
          courseId: parsed.data.courseId,
        },
      },
      create: {
        tutorId: parsed.data.tutorId,
        courseId: parsed.data.courseId,
        assignedById: session.user!.id,
      },
      update: {},
      select: { id: true },
    });

    await audit({
      actorId: session.user!.id,
      action: "tutor.assign_course",
      resource: "TutorCourseAssignment",
      resourceId: assignment.id,
      metadata: parsed.data,
    });
    revalidatePath(`/admin/tutors/${parsed.data.tutorId}/courses`);
    revalidatePath("/tutor/teaching");
    return { success: true };
  } catch (error) {
    console.error("assignTutorCourse error:", error);
    return { success: false, error: "Failed to assign course" };
  }
}

export async function unassignTutorCourse(input: z.input<typeof assignmentSchema>) {
  try {
    const session = await requireAdmin();
    const parsed = assignmentSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const deleted = await db.tutorCourseAssignment.deleteMany({
      where: { tutorId: parsed.data.tutorId, courseId: parsed.data.courseId },
    });
    if (deleted.count === 0) return { success: false, error: "Course assignment not found" };

    await audit({
      actorId: session.user!.id,
      action: "tutor.unassign_course",
      resource: "TutorCourseAssignment",
      metadata: parsed.data,
    });
    revalidatePath(`/admin/tutors/${parsed.data.tutorId}/courses`);
    revalidatePath("/tutor/teaching");
    return { success: true };
  } catch (error) {
    console.error("unassignTutorCourse error:", error);
    return { success: false, error: "Failed to remove course assignment" };
  }
}
