import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  isInPreviewMode: vi.fn(),
  tutorFindUnique: vi.fn(),
  enrollmentFindUnique: vi.fn(),
  lessonFindFirst: vi.fn(),
  assignmentCreate: vi.fn(),
  assignmentFindFirst: vi.fn(),
  attemptCreate: vi.fn(),
  rateLimit: vi.fn(),
  createNotification: vi.fn(),
  audit: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/view-as.server", () => ({
  isInPreviewMode: mocks.isInPreviewMode,
  PREVIEW_WRITE_BLOCKED_MESSAGE: "Preview blocked",
}));
vi.mock("@/lib/db", () => ({
  db: {
    tutorProfile: { findUnique: mocks.tutorFindUnique },
    enrollment: { findUnique: mocks.enrollmentFindUnique },
    lesson: { findFirst: mocks.lessonFindFirst },
    tutorAssignment: {
      create: mocks.assignmentCreate,
      findFirst: mocks.assignmentFindFirst,
    },
    tutorQuizAttempt: { create: mocks.attemptCreate },
  },
}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit }));
vi.mock("@/lib/audit", () => ({ audit: mocks.audit }));
vi.mock("@/services/notification.service", () => ({ createNotification: mocks.createNotification }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createTutorQuiz, submitTutorQuiz } from "./tutor-quiz.actions";

const validQuiz = {
  studentId: "student_1",
  courseId: "course_1",
  lessonId: null,
  title: "Science check-in",
  instructions: "Answer every question.",
  dueAt: null,
  passingScore: 70,
  questions: [
    {
      text: "Water freezes at which temperature?",
      type: "MULTIPLE_CHOICE" as const,
      points: 2,
      explanation: "Fresh water freezes at zero degrees Celsius.",
      answers: [
        { text: "0°C", isCorrect: true },
        { text: "100°C", isCorrect: false },
      ],
    },
  ],
};

const gradedAssignment = {
  id: "assignment_1",
  title: "Science check-in",
  passingScore: 70,
  tutor: { userId: "tutor_user_1" },
  quizQuestions: [
    {
      id: "question_1",
      text: "Water freezes at which temperature?",
      type: "MULTIPLE_CHOICE",
      points: 2,
      explanation: "At standard pressure.",
      answers: [
        { id: "answer_1", text: "0°C", isCorrect: true },
        { id: "answer_2", text: "100°C", isCorrect: false },
      ],
    },
    {
      id: "question_2",
      text: "Name the change from liquid to gas.",
      type: "SHORT_ANSWER",
      points: 3,
      explanation: null,
      answers: [{ id: "answer_3", text: "Evaporation", isCorrect: true }],
    },
  ],
};

describe("structured tutor quiz authorization and grading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "tutor_user_1", role: "TUTOR" } });
    mocks.isInPreviewMode.mockResolvedValue(false);
    mocks.rateLimit.mockResolvedValue({ success: true, remaining: 9, retryAfterSeconds: 0 });
    mocks.createNotification.mockResolvedValue({});
    mocks.audit.mockResolvedValue(undefined);
  });

  it("rejects quiz creation for a learner who never booked the tutor", async () => {
    mocks.tutorFindUnique.mockResolvedValue({ id: "tutor_1", bookings: [], courseAssignments: [{ id: "grant_1" }] });

    const result = await createTutorQuiz(validQuiz);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/booked learners/i);
    expect(mocks.assignmentCreate).not.toHaveBeenCalled();
  });

  it("rejects quiz creation without an explicit Admin course grant", async () => {
    mocks.tutorFindUnique.mockResolvedValue({ id: "tutor_1", bookings: [{ id: "booking_1" }], courseAssignments: [] });

    const result = await createTutorQuiz(validQuiz);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not assigned to teach/i);
    expect(mocks.enrollmentFindUnique).not.toHaveBeenCalled();
  });

  it("rejects quiz creation when the learner is not enrolled", async () => {
    mocks.tutorFindUnique.mockResolvedValue({ id: "tutor_1", bookings: [{ id: "booking_1" }], courseAssignments: [{ id: "grant_1" }] });
    mocks.enrollmentFindUnique.mockResolvedValue(null);

    const result = await createTutorQuiz(validQuiz);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not enrolled/i);
  });

  it("requires a correct answer for every structured question", async () => {
    const invalid = {
      ...validQuiz,
      questions: [{ ...validQuiz.questions[0], answers: validQuiz.questions[0].answers.map((answer) => ({ ...answer, isCorrect: false })) }],
    };

    const result = await createTutorQuiz(invalid);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/correct answer/i);
    expect(mocks.tutorFindUnique).not.toHaveBeenCalled();
  });

  it("publishes an authorized quiz with a server-side answer key", async () => {
    mocks.tutorFindUnique.mockResolvedValue({ id: "tutor_1", bookings: [{ id: "booking_1" }], courseAssignments: [{ id: "grant_1" }] });
    mocks.enrollmentFindUnique.mockResolvedValue({ status: "ACTIVE" });
    mocks.assignmentCreate.mockResolvedValue({ id: "assignment_1", title: "Science check-in" });

    const result = await createTutorQuiz(validQuiz);

    expect(result).toEqual({ success: true, assignmentId: "assignment_1" });
    expect(mocks.assignmentCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        kind: "QUIZ",
        maxPoints: 2,
        passingScore: 70,
        quizQuestions: expect.objectContaining({
          create: [expect.objectContaining({ answers: { create: [
            expect.objectContaining({ text: "0°C", isCorrect: true }),
            expect.objectContaining({ text: "100°C", isCorrect: false }),
          ] } })],
        }),
      }),
    }));
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "tutor.quiz_create" }));
    expect(mocks.createNotification).toHaveBeenCalledWith("student_1", expect.objectContaining({ title: "New quiz" }));
  });

  it("does not let another student attempt the quiz", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "student_2", role: "STUDENT" } });
    mocks.assignmentFindFirst.mockResolvedValue(null);

    const result = await submitTutorQuiz({ assignmentId: "assignment_1", answers: { question_1: "answer_1" } });

    expect(result.success).toBe(false);
    expect(mocks.assignmentFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ studentId: "student_2", kind: "QUIZ", status: "PUBLISHED" }),
    }));
    expect(mocks.attemptCreate).not.toHaveBeenCalled();
  });

  it("requires every question before grading", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "student_1", role: "STUDENT" } });
    mocks.assignmentFindFirst.mockResolvedValue(gradedAssignment);

    const result = await submitTutorQuiz({ assignmentId: "assignment_1", answers: { question_1: "answer_1" } });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/every question/i);
    expect(mocks.attemptCreate).not.toHaveBeenCalled();
  });

  it("auto-grades multiple-choice and normalized short answers", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "student_1", role: "STUDENT" } });
    mocks.assignmentFindFirst.mockResolvedValue(gradedAssignment);
    mocks.attemptCreate.mockResolvedValue({ id: "attempt_1", submittedAt: new Date("2026-07-18T12:00:00Z") });

    const result = await submitTutorQuiz({
      assignmentId: "assignment_1",
      answers: { question_1: "answer_1", question_2: "  EVAPORATION  " },
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(expect.objectContaining({ score: 100, passed: true, earnedPoints: 5, totalPoints: 5 }));
    expect(mocks.attemptCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ score: 100, passed: true, earnedPoints: 5, totalPoints: 5 }),
    }));
    expect(mocks.createNotification).toHaveBeenCalledWith("tutor_user_1", expect.objectContaining({ title: "Quiz completed" }));
  });

  it("calculates weighted partial scores and a failed outcome", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "student_1", role: "STUDENT" } });
    mocks.assignmentFindFirst.mockResolvedValue(gradedAssignment);
    mocks.attemptCreate.mockResolvedValue({ id: "attempt_2", submittedAt: new Date("2026-07-18T12:00:00Z") });

    const result = await submitTutorQuiz({
      assignmentId: "assignment_1",
      answers: { question_1: "answer_2", question_2: "evaporation" },
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(expect.objectContaining({ score: 60, passed: false, earnedPoints: 3, totalPoints: 5 }));
  });
});
