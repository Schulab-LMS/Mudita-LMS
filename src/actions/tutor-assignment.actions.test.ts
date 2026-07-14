import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  tutorFindUnique: vi.fn(),
  enrollmentFindUnique: vi.fn(),
  lessonFindFirst: vi.fn(),
  assignmentCreate: vi.fn(),
  assignmentFindFirst: vi.fn(),
  assignmentUpdate: vi.fn(),
  assignmentDeleteMany: vi.fn(),
  submissionFindFirst: vi.fn(),
  submissionUpsert: vi.fn(),
  submissionUpdate: vi.fn(),
  createNotification: vi.fn(),
  audit: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({
  db: {
    tutorProfile: { findUnique: mocks.tutorFindUnique },
    enrollment: { findUnique: mocks.enrollmentFindUnique },
    lesson: { findFirst: mocks.lessonFindFirst },
    tutorAssignment: {
      create: mocks.assignmentCreate,
      findFirst: mocks.assignmentFindFirst,
      update: mocks.assignmentUpdate,
      deleteMany: mocks.assignmentDeleteMany,
    },
    tutorAssignmentSubmission: {
      findFirst: mocks.submissionFindFirst,
      upsert: mocks.submissionUpsert,
      update: mocks.submissionUpdate,
    },
  },
}));
vi.mock("@/services/notification.service", () => ({
  createNotification: mocks.createNotification,
}));
vi.mock("@/lib/audit", () => ({ audit: mocks.audit }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  createTutorAssignment,
  deleteTutorAssignment,
  gradeTutorAssignment,
  setTutorAssignmentStatus,
  submitTutorAssignment,
  updateTutorAssignment,
} from "./tutor-assignment.actions";

const validAssignment = {
  studentId: "student_1",
  courseId: "course_1",
  lessonId: "lesson_1",
  title: "Build a rover",
  instructions: "Create and explain your rover.",
  kind: "PROJECT" as const,
  dueAt: "2026-08-01T12:00",
  maxPoints: 100,
};

const validUpdate = {
  assignmentId: "assignment_1",
  title: "Build a safer rover",
  instructions: "Create, test, and explain your rover.",
  kind: "PROJECT" as const,
  dueAt: "2026-08-02T12:00",
  maxPoints: 120,
};

describe("tutor assignment authorization and lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "tutor_user_1", role: "TUTOR" } });
    mocks.createNotification.mockResolvedValue({});
  });

  it("rejects assignment creation when the learner has never booked the tutor", async () => {
    mocks.tutorFindUnique.mockResolvedValue({
      id: "tutor_1",
      bookings: [],
      courseAssignments: [{ id: "course_assignment_1" }],
    });

    const result = await createTutorAssignment(validAssignment);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/booked learners/i);
    expect(mocks.assignmentCreate).not.toHaveBeenCalled();
  });

  it("rejects assignment creation for a course the learner is not enrolled in", async () => {
    mocks.tutorFindUnique.mockResolvedValue({
      id: "tutor_1",
      bookings: [{ id: "booking_1" }],
      courseAssignments: [{ id: "course_assignment_1" }],
    });
    mocks.enrollmentFindUnique.mockResolvedValue(null);

    const result = await createTutorAssignment(validAssignment);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not enrolled/i);
    expect(mocks.assignmentCreate).not.toHaveBeenCalled();
  });

  it("rejects assignment creation when Admin has not assigned the tutor to the course", async () => {
    mocks.tutorFindUnique.mockResolvedValue({
      id: "tutor_1",
      bookings: [{ id: "booking_1" }],
      courseAssignments: [],
    });

    const result = await createTutorAssignment(validAssignment);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not assigned to teach/i);
    expect(mocks.enrollmentFindUnique).not.toHaveBeenCalled();
    expect(mocks.assignmentCreate).not.toHaveBeenCalled();
  });

  it("rejects a lesson ID from another course", async () => {
    mocks.tutorFindUnique.mockResolvedValue({
      id: "tutor_1",
      bookings: [{ id: "booking_1" }],
      courseAssignments: [{ id: "course_assignment_1" }],
    });
    mocks.enrollmentFindUnique.mockResolvedValue({ status: "ACTIVE" });
    mocks.lessonFindFirst.mockResolvedValue(null);

    const result = await createTutorAssignment(validAssignment);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not in this course/i);
  });

  it("publishes an authorized assignment and notifies its learner", async () => {
    mocks.tutorFindUnique.mockResolvedValue({
      id: "tutor_1",
      bookings: [{ id: "booking_1" }],
      courseAssignments: [{ id: "course_assignment_1" }],
    });
    mocks.enrollmentFindUnique.mockResolvedValue({ status: "ACTIVE" });
    mocks.lessonFindFirst.mockResolvedValue({ id: "lesson_1" });
    mocks.assignmentCreate.mockResolvedValue({ id: "assignment_1", title: "Build a rover" });

    const result = await createTutorAssignment(validAssignment);

    expect(result).toEqual({ success: true, assignmentId: "assignment_1" });
    expect(mocks.assignmentCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tutorId: "tutor_1", studentId: "student_1", courseId: "course_1" }),
    }));
    expect(mocks.createNotification).toHaveBeenCalledWith("student_1", expect.objectContaining({ type: "ASSIGNMENT" }));
  });

  it("does not let another tutor edit an assignment", async () => {
    mocks.assignmentFindFirst.mockResolvedValue(null);

    const result = await updateTutorAssignment(validUpdate);

    expect(result).toEqual({ success: false, error: "Assignment not found" });
    expect(mocks.assignmentFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        tutor: { userId: "tutor_user_1" },
        course: { tutorCourseAssignments: { some: { tutor: { userId: "tutor_user_1" } } } },
      }),
    }));
    expect(mocks.assignmentUpdate).not.toHaveBeenCalled();
  });

  it("preserves submitted terms by rejecting assignment edits after submission", async () => {
    mocks.assignmentFindFirst.mockResolvedValue({
      id: "assignment_1",
      title: "Build a rover",
      studentId: "student_1",
      status: "PUBLISHED",
      submissions: [{ id: "submission_1" }],
    });

    const result = await updateTutorAssignment(validUpdate);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/cannot be edited after work has been submitted/i);
    expect(mocks.assignmentUpdate).not.toHaveBeenCalled();
  });

  it("updates an unsubmitted assignment and records an audit entry", async () => {
    mocks.assignmentFindFirst.mockResolvedValue({
      id: "assignment_1",
      title: "Build a rover",
      studentId: "student_1",
      status: "PUBLISHED",
      submissions: [],
    });
    mocks.assignmentUpdate.mockResolvedValue({});

    const result = await updateTutorAssignment(validUpdate);

    expect(result).toEqual({ success: true });
    expect(mocks.assignmentUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "assignment_1" },
      data: expect.objectContaining({ title: "Build a safer rover", maxPoints: 120 }),
    }));
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      actorId: "tutor_user_1",
      action: "tutor.assignment_update",
      resourceId: "assignment_1",
    }));
    expect(mocks.createNotification).toHaveBeenCalledWith("student_1", expect.objectContaining({ title: "Assignment updated" }));
  });

  it("closes an owned assignment and notifies the learner", async () => {
    mocks.assignmentFindFirst.mockResolvedValue({
      id: "assignment_1",
      title: "Build a rover",
      studentId: "student_1",
      status: "PUBLISHED",
    });
    mocks.assignmentUpdate.mockResolvedValue({});

    const result = await setTutorAssignmentStatus({ assignmentId: "assignment_1", status: "CLOSED" });

    expect(result).toEqual({ success: true });
    expect(mocks.assignmentUpdate).toHaveBeenCalledWith({ where: { id: "assignment_1" }, data: { status: "CLOSED" } });
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "tutor.assignment_close" }));
    expect(mocks.createNotification).toHaveBeenCalledWith("student_1", expect.objectContaining({ title: "Assignment closed" }));
  });

  it("does not let another tutor close or reopen an assignment", async () => {
    mocks.assignmentFindFirst.mockResolvedValue(null);

    const result = await setTutorAssignmentStatus({ assignmentId: "assignment_1", status: "CLOSED" });

    expect(result).toEqual({ success: false, error: "Assignment not found" });
    expect(mocks.assignmentUpdate).not.toHaveBeenCalled();
  });

  it("does not delete an assignment that has submitted work", async () => {
    mocks.assignmentFindFirst.mockResolvedValue({
      id: "assignment_1",
      title: "Build a rover",
      studentId: "student_1",
      _count: { submissions: 1 },
    });

    const result = await deleteTutorAssignment({ assignmentId: "assignment_1" });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/cannot be deleted/i);
    expect(mocks.assignmentDeleteMany).not.toHaveBeenCalled();
  });

  it("does not let another tutor delete an assignment", async () => {
    mocks.assignmentFindFirst.mockResolvedValue(null);

    const result = await deleteTutorAssignment({ assignmentId: "assignment_1" });

    expect(result).toEqual({ success: false, error: "Assignment not found" });
    expect(mocks.assignmentDeleteMany).not.toHaveBeenCalled();
  });

  it("deletes an unsubmitted assignment with a guarded write and audit entry", async () => {
    mocks.assignmentFindFirst.mockResolvedValue({
      id: "assignment_1",
      title: "Build a rover",
      studentId: "student_1",
      _count: { submissions: 0 },
    });
    mocks.assignmentDeleteMany.mockResolvedValue({ count: 1 });

    const result = await deleteTutorAssignment({ assignmentId: "assignment_1" });

    expect(result).toEqual({ success: true });
    expect(mocks.assignmentDeleteMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "assignment_1", submissions: { none: {} } }),
    }));
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "tutor.assignment_delete" }));
    expect(mocks.createNotification).toHaveBeenCalledWith("student_1", expect.objectContaining({ title: "Assignment removed" }));
  });

  it("does not let a student submit another learner's assignment", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "student_2", role: "STUDENT" } });
    mocks.assignmentFindFirst.mockResolvedValue(null);

    const result = await submitTutorAssignment({ assignmentId: "assignment_1", content: "My work" });

    expect(result.success).toBe(false);
    expect(mocks.assignmentFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ studentId: "student_2", status: "PUBLISHED" }),
    }));
    expect(mocks.submissionUpsert).not.toHaveBeenCalled();
  });

  it("does not let another tutor grade a submission", async () => {
    mocks.submissionFindFirst.mockResolvedValue(null);

    const result = await gradeTutorAssignment({
      submissionId: "submission_1",
      points: 80,
      feedback: "Good work",
      outcome: "REVIEWED",
    });

    expect(result.success).toBe(false);
    expect(mocks.submissionFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        assignment: expect.objectContaining({ tutor: { userId: "tutor_user_1" } }),
      }),
    }));
    expect(mocks.submissionUpdate).not.toHaveBeenCalled();
  });

  it("rejects points above the assignment maximum", async () => {
    mocks.submissionFindFirst.mockResolvedValue({
      id: "submission_1",
      studentId: "student_1",
      assignment: { id: "assignment_1", title: "Build a rover", maxPoints: 100 },
    });

    const result = await gradeTutorAssignment({
      submissionId: "submission_1",
      points: 101,
      feedback: "Good work",
      outcome: "REVIEWED",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/cannot exceed 100/i);
    expect(mocks.submissionUpdate).not.toHaveBeenCalled();
  });
});
