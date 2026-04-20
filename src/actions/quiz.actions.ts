"use server";

import { auth } from "@/lib/auth";
import { submitAttempt } from "@/services/quiz.service";
import { submitQuizAttemptSchema } from "@/validators/action.schemas";
import { rateLimit } from "@/lib/rate-limit";

// Quiz attempts are rate-limited per user+quiz to stop brute-forcing the
// answer set. The window is intentionally forgiving for legitimate retries.
const QUIZ_SUBMIT_RATE_LIMIT = { maxRequests: 10, windowSeconds: 60 };

export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const parsed = submitQuizAttemptSchema.safeParse({ quizId, answers });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const limit = rateLimit(
      `quiz-submit:${session.user.id}:${parsed.data.quizId}`,
      QUIZ_SUBMIT_RATE_LIMIT
    );
    if (!limit.success) {
      return {
        success: false,
        error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.`,
      };
    }

    const result = await submitAttempt(
      session.user.id,
      parsed.data.quizId,
      parsed.data.answers
    );

    if ("error" in result) {
      switch (result.error) {
        case "not_found":
          return { success: false, error: "Quiz not found" };
        case "not_enrolled":
          return {
            success: false,
            error: "You must be enrolled in this course to take the quiz",
          };
        default:
          return { success: false, error: "Failed to submit quiz attempt" };
      }
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("submitQuizAttempt action error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
