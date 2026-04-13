import { db } from "@/lib/db";

export async function getQuizByLessonId(lessonId: string) {
  try {
    const quiz = await db.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            answers: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
    return quiz;
  } catch (error) {
    console.error("Failed to get quiz by lesson id:", error);
    return null;
  }
}

export async function getQuizById(quizId: string) {
  try {
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            answers: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
    return quiz;
  } catch (error) {
    console.error("Failed to get quiz by id:", error);
    return null;
  }
}

export async function submitAttempt(
  userId: string,
  quizId: string,
  answers: Record<string, string>
) {
  try {
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!quiz) return null;

    let totalPoints = 0;
    let earnedPoints = 0;
    const questionResults: Array<{
      questionId: string;
      correct: boolean;
      correctAnswerId: string;
      selectedAnswerId: string;
    }> = [];

    // Normalise short-answer text the same way on both sides so trivial
    // differences (case, surrounding whitespace) don't cause false negatives.
    const normaliseShortAnswer = (value: string) =>
      value.trim().toLowerCase().replace(/\s+/g, " ");

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const submitted = answers[question.id];
      const correctAnswers = question.answers.filter((a) => a.isCorrect);
      // Display value: first correct answer is used by the review UI.
      const primaryCorrect = correctAnswers[0];

      let isCorrect = false;
      let storedSelected = submitted ?? "";

      if (submitted && correctAnswers.length > 0) {
        switch (question.type) {
          case "MULTIPLE_CHOICE":
          case "TRUE_FALSE":
            // The submitted value is an Answer.id. Accept any answer flagged
            // as correct (supports edge-case quizzes with multiple right
            // answers).
            isCorrect = correctAnswers.some((a) => a.id === submitted);
            break;
          case "SHORT_ANSWER": {
            // Submitted value is free text from the user. Compare against
            // the text of every Answer row marked correct.
            const normalised = normaliseShortAnswer(submitted);
            isCorrect = correctAnswers.some(
              (a) => normaliseShortAnswer(a.text) === normalised
            );
            // For the result payload, expose the matched correct answer's
            // id when the response was right; otherwise leave the raw text
            // so the review UI can still surface what the learner typed.
            if (isCorrect) {
              storedSelected =
                correctAnswers.find(
                  (a) => normaliseShortAnswer(a.text) === normalised
                )?.id ?? submitted;
            }
            break;
          }
        }
      }

      if (isCorrect) {
        earnedPoints += question.points;
      }

      questionResults.push({
        questionId: question.id,
        correct: isCorrect,
        correctAnswerId: primaryCorrect?.id ?? "",
        selectedAnswerId: storedSelected,
      });
    }

    const score =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await db.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        passed,
        answers: questionResults,
        completedAt: new Date(),
      },
    });

    return {
      attemptId: attempt.id,
      score,
      passed,
      totalPoints,
      earnedPoints,
      passingScore: quiz.passingScore,
      questionResults,
    };
  } catch (error) {
    console.error("Failed to submit quiz attempt:", error);
    return null;
  }
}

export async function getUserAttempts(userId: string, quizId: string) {
  try {
    const attempts = await db.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { startedAt: "desc" },
    });
    return attempts;
  } catch (error) {
    console.error("Failed to get user attempts:", error);
    return [];
  }
}
