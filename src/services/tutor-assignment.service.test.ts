import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assignmentFindFirst: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    tutorAssignment: { findFirst: mocks.assignmentFindFirst },
  },
}));

import { getStudentTutorQuiz } from "./tutor-assignment.service";

describe("student tutor quiz selector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assignmentFindFirst.mockResolvedValue(null);
  });

  it("scopes the quiz to the learner and never selects answer keys", async () => {
    await getStudentTutorQuiz("student_1", "quiz_1");

    const query = mocks.assignmentFindFirst.mock.calls[0][0];
    expect(query.where).toEqual({
      id: "quiz_1",
      studentId: "student_1",
      kind: "QUIZ",
      status: { in: ["PUBLISHED", "CLOSED"] },
    });
    expect(query.select.quizQuestions.select.answers.select).toEqual({
      id: true,
      text: true,
      order: true,
    });
    expect(query.select.quizQuestions.select.answers.select).not.toHaveProperty("isCorrect");
  });
});
