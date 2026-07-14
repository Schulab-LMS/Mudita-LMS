import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  bookingFindUnique: vi.fn(),
  bookingUpdate: vi.fn(),
  lessonFindUnique: vi.fn(),
  enrollmentFindUnique: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({
  db: {
    booking: {
      findUnique: mocks.bookingFindUnique,
      update: mocks.bookingUpdate,
    },
    lesson: { findUnique: mocks.lessonFindUnique },
    enrollment: { findUnique: mocks.enrollmentFindUnique },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { markSessionNoShow, setSessionLesson } from "./session.actions";

describe("session tutor controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "tutor_user_1", role: "TUTOR" } });
    mocks.bookingUpdate.mockResolvedValue({});
  });

  it("rejects a tutor who does not own the booking", async () => {
    mocks.bookingFindUnique.mockResolvedValue({
      studentId: "student_1",
      tutor: { userId: "another_tutor" },
    });

    const result = await setSessionLesson("booking_1", "lesson_1");

    expect(result).toEqual({ success: false, error: "Only the session tutor can do that" });
    expect(mocks.lessonFindUnique).not.toHaveBeenCalled();
  });

  it("does not expose a lesson from a course the booked learner is not enrolled in", async () => {
    mocks.bookingFindUnique.mockResolvedValue({
      studentId: "student_1",
      tutor: { userId: "tutor_user_1" },
    });
    mocks.lessonFindUnique.mockResolvedValue({
      id: "lesson_1",
      module: { courseId: "course_1" },
    });
    mocks.enrollmentFindUnique.mockResolvedValue(null);

    const result = await setSessionLesson("booking_1", "lesson_1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not enrolled/i);
    expect(mocks.bookingUpdate).not.toHaveBeenCalled();
  });

  it("assigns a lesson when the booked learner has an active enrollment", async () => {
    mocks.bookingFindUnique.mockResolvedValue({
      studentId: "student_1",
      tutor: { userId: "tutor_user_1" },
    });
    mocks.lessonFindUnique.mockResolvedValue({
      id: "lesson_1",
      module: { courseId: "course_1" },
    });
    mocks.enrollmentFindUnique.mockResolvedValue({ status: "ACTIVE" });

    const result = await setSessionLesson("booking_1", "lesson_1");

    expect(result).toEqual({ success: true });
    expect(mocks.bookingUpdate).toHaveBeenCalledWith({
      where: { id: "booking_1" },
      data: { lessonId: "lesson_1" },
    });
  });

  it("records a no-show only on a booking owned by the tutor", async () => {
    mocks.bookingFindUnique.mockResolvedValue({
      studentId: "student_1",
      tutor: { userId: "tutor_user_1" },
    });

    const result = await markSessionNoShow("booking_1");

    expect(result).toEqual({ success: true });
    expect(mocks.bookingUpdate).toHaveBeenCalledWith({
      where: { id: "booking_1" },
      data: { status: "NO_SHOW" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/tutor/teaching");
  });
});
