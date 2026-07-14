import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  tutorFindUnique: vi.fn(),
  courseFindFirst: vi.fn(),
  assignmentUpsert: vi.fn(),
  assignmentDeleteMany: vi.fn(),
  audit: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth-helpers", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/audit", () => ({ audit: mocks.audit }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/db", () => ({
  db: {
    tutorProfile: { findUnique: mocks.tutorFindUnique },
    course: { findFirst: mocks.courseFindFirst },
    tutorCourseAssignment: {
      upsert: mocks.assignmentUpsert,
      deleteMany: mocks.assignmentDeleteMany,
    },
  },
}));

import { assignTutorCourse, unassignTutorCourse } from "./tutor-course.actions";

describe("Admin tutor-course assignment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });
    mocks.audit.mockResolvedValue(undefined);
  });

  it("does not assign an unknown tutor", async () => {
    mocks.tutorFindUnique.mockResolvedValue(null);
    mocks.courseFindFirst.mockResolvedValue({ id: "course_1" });

    const result = await assignTutorCourse({ tutorId: "missing", courseId: "course_1" });

    expect(result).toEqual({ success: false, error: "Tutor not found" });
    expect(mocks.assignmentUpsert).not.toHaveBeenCalled();
  });

  it("creates an idempotent assignment and audit event", async () => {
    mocks.tutorFindUnique.mockResolvedValue({ id: "tutor_1" });
    mocks.courseFindFirst.mockResolvedValue({ id: "course_1" });
    mocks.assignmentUpsert.mockResolvedValue({ id: "assignment_1" });

    const result = await assignTutorCourse({ tutorId: "tutor_1", courseId: "course_1" });

    expect(result).toEqual({ success: true });
    expect(mocks.assignmentUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { tutorId_courseId: { tutorId: "tutor_1", courseId: "course_1" } },
      create: expect.objectContaining({ assignedById: "admin_1" }),
    }));
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "tutor.assign_course" }));
  });

  it("reports a missing assignment instead of deleting unrelated access", async () => {
    mocks.assignmentDeleteMany.mockResolvedValue({ count: 0 });

    const result = await unassignTutorCourse({ tutorId: "tutor_1", courseId: "course_1" });

    expect(result).toEqual({ success: false, error: "Course assignment not found" });
    expect(mocks.audit).not.toHaveBeenCalled();
  });
});
