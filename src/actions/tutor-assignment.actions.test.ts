import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  tutorFindUnique: vi.fn(),
  enrollmentFindUnique: vi.fn(),
  lessonFindFirst: vi.fn(),
  assignmentCreate: vi.fn(),
  assignmentFindFirst: vi.fn(),
  submissionFindFirst: vi.fn(),
  submissionUpsert: vi.fn(),
  submissionUpdate: vi.fn(),
  createNotification: vi.fn(),
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
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  createTutorAssignment,
  gradeTutorAssignment,
  submitTutorAssignment,
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

describe("tutor assignment authorization and lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "tutor_user_1", role: "TUTOR" } });
    mocks.createNotification.mockResolvedValue({});
  });

  it("rejects assignment creation when the learner has never booked the tutor", async () => {
    mocks.tutorFindUnique.mockResolvedValue({ id: "tutor_1", bookings: [] });

    const result = await createTutorAssignment(validAssignment);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/booked learners/i);
    expect(mocks.assignmentCreate).not.toHaveBeenCalled();
  });

  it("rejects assignment creation for a course the learner is not enrolled in", async () => {
    mocks.tutorFindUnique.mockResolvedValue({ id: "tutor_1", bookings: [{ id: "booking_1" }] });
    mocks.enrollmentFindUnique.mockResolvedValue(null);

    const result = await createTutorAssignment(validAssignment);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not enrolled/i);
    expect(mocks.assignmentCreate).not.toHaveBeenCalled();
  });

  it("rejects a lesson ID from another course", async () => {
    mocks.tutorFindUnique.mockResolvedValue({ id: "tutor_1", bookings: [{ id: "booking_1" }] });
    mocks.enrollmentFindUnique.mockResolvedValue({ status: "ACTIVE" });
    mocks.lessonFindFirst.mockResolvedValue(null);

    const result = await createTutorAssignment(validAssignment);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not in this course/i);
  });

  it("publishes an authorized assignment and notifies its learner", async () => {
    mocks.tutorFindUnique.mockResolvedValue({ id: "tutor_1", bookings: [{ id: "booking_1" }] });
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
      where: expect.objectContaining({ assignment: { tutor: { userId: "tutor_user_1" } } }),
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
