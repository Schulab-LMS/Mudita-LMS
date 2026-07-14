import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  tutorFindUnique: vi.fn(),
  bookingFindMany: vi.fn(),
  enrollmentFindMany: vi.fn(),
  progressFindMany: vi.fn(),
  attemptFindMany: vi.fn(),
  submissionFindMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    tutorProfile: { findUnique: mocks.tutorFindUnique },
    booking: { findMany: mocks.bookingFindMany },
    enrollment: { findMany: mocks.enrollmentFindMany },
    lessonProgress: { findMany: mocks.progressFindMany },
    quizAttempt: { findMany: mocks.attemptFindMany },
    activitySubmission: { findMany: mocks.submissionFindMany },
  },
}));

import { getTutorTeachingOverview } from "./tutor-teaching.service";

describe("getTutorTeachingOverview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null for a user without a tutor profile", async () => {
    mocks.tutorFindUnique.mockResolvedValue(null);

    await expect(getTutorTeachingOverview("student_1")).resolves.toBeNull();
    expect(mocks.bookingFindMany).not.toHaveBeenCalled();
  });

  it("returns an empty scoped workspace when the tutor has no learners", async () => {
    mocks.tutorFindUnique.mockResolvedValue({
      id: "tutor_1",
      courseAssignments: [{ courseId: "course_1" }],
    });
    mocks.bookingFindMany.mockResolvedValue([]);

    const result = await getTutorTeachingOverview("tutor_user_1");

    expect(result?.totals).toEqual({
      learners: 0,
      courses: 0,
      awaitingReview: 0,
      recordedSessions: 0,
    });
    expect(mocks.enrollmentFindMany).not.toHaveBeenCalled();
  });

  it("aggregates only the tutor's booked learners, progress, reviews, quizzes, and attendance", async () => {
    mocks.tutorFindUnique.mockResolvedValue({
      id: "tutor_1",
      courseAssignments: [{ courseId: "course_1" }],
    });
    mocks.bookingFindMany.mockResolvedValue([
      {
        id: "booking_1",
        studentId: "student_1",
        subject: "Coding",
        startTime: new Date("2026-07-14T10:00:00Z"),
        endTime: new Date("2026-07-14T11:00:00Z"),
        status: "COMPLETED",
        lessonId: "lesson_1",
        student: {
          id: "student_1",
          name: "Aisha",
          email: "aisha@example.com",
          avatar: null,
        },
        lesson: {
          id: "lesson_1",
          title: "Sequences",
          module: { course: { id: "course_1", title: "Little Coders" } },
        },
        classroomSession: {
          attendance: [
            {
              userId: "student_1",
              joinedAt: new Date("2026-07-14T10:00:00Z"),
              leftAt: new Date("2026-07-14T10:20:00Z"),
              durationSec: 1200,
            },
          ],
        },
      },
    ]);
    mocks.enrollmentFindMany.mockResolvedValue([
      {
        userId: "student_1",
        status: "ACTIVE",
        progress: 25,
        user: {
          id: "student_1",
          name: "Aisha",
          email: "aisha@example.com",
          avatar: null,
        },
        course: { id: "course_1", title: "Little Coders", slug: "little-coders" },
      },
    ]);
    mocks.progressFindMany.mockResolvedValue([
      {
        userId: "student_1",
        completed: true,
        lesson: { module: { courseId: "course_1" } },
      },
    ]);
    mocks.attemptFindMany.mockResolvedValue([
      {
        id: "attempt_1",
        userId: "student_1",
        score: 80,
        passed: true,
        completedAt: new Date("2026-07-14T10:30:00Z"),
        user: { name: "Aisha" },
        quiz: {
          title: "Sequence check",
          lesson: { module: { course: { id: "course_1", title: "Little Coders" } } },
        },
      },
    ]);
    mocks.submissionFindMany.mockResolvedValue([
      {
        id: "submission_1",
        studentId: "student_1",
        bookingId: null,
        status: "SUBMITTED",
        feedback: null,
        updatedAt: new Date("2026-07-14T10:25:00Z"),
        student: { name: "Aisha" },
        lesson: {
          id: "lesson_1",
          title: "Sequences",
          module: { course: { id: "course_1", title: "Little Coders" } },
        },
      },
    ]);

    const result = await getTutorTeachingOverview("tutor_user_1");

    expect(result?.totals).toEqual({
      learners: 1,
      courses: 1,
      awaitingReview: 1,
      recordedSessions: 1,
    });
    expect(result?.learners[0].courses[0]).toMatchObject({
      id: "course_1",
      progress: 25,
      completedLessons: 1,
    });
    expect(result?.reviews[0].reviewSessionId).toBe("booking_1");
    expect(result?.attendance[0]).toMatchObject({ joined: true, durationSec: 1200 });
  });
});
