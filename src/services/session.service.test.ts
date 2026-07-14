import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ courseFindMany: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: { course: { findMany: mocks.courseFindMany } },
}));

import { getAssignableLessons } from "./session.service";

describe("getAssignableLessons", () => {
  it("requires both learner enrollment and explicit tutor-course assignment", async () => {
    mocks.courseFindMany.mockResolvedValue([]);

    await getAssignableLessons("student_1", "tutor_user_1");

    expect(mocks.courseFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        enrollments: {
          some: { userId: "student_1", status: { in: ["ACTIVE", "COMPLETED"] } },
        },
        tutorCourseAssignments: {
          some: { tutor: { userId: "tutor_user_1" } },
        },
      }),
    }));
  });
});
