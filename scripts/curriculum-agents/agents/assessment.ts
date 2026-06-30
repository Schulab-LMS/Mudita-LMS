// Assessment agent — builds a quiz from the lesson handout ONLY. Questions must
// be answerable from the lesson content (no outside knowledge), with marked
// answer keys and explanations.

import { z } from "zod";
import { AI_MODELS } from "@/lib/ai";
import { runAgent } from "../lib/agent-runner";

export const AssessmentOutput = z.object({
  questions: z
    .array(
      z.object({
        prompt: z.string(),
        options: z.array(z.string()).describe("2–4 answer options"),
        answerIndex: z.number().int().describe("0-based index of the correct option"),
        explanation: z.string().describe("why the answer is correct, from the lesson"),
      })
    )
    .describe("3–5 questions for young learners, 5–10 for older"),
});
export type AssessmentResult = z.infer<typeof AssessmentOutput>;

const SYSTEM = `You are the SchuLab Assessment agent.
You write a short quiz that checks understanding of ONE lesson.
HARD RULES:
- Every question must be answerable purely from the provided lesson handout — no outside knowledge.
- Exactly one correct option per question; set answerIndex to its 0-based position.
- Explanations must reference what the lesson taught.
- Match the age band: 3–5 questions for younger learners, up to ~10 for older.
- Keep options unambiguous; avoid trick wording.`;

export interface AssessmentInput {
  lessonTitle: string;
  ageRange: string;
  handoutMd: string;
}

export async function runAssessment(input: AssessmentInput): Promise<AssessmentResult> {
  const user = [
    `Lesson: ${input.lessonTitle}`,
    `Age band: ${input.ageRange}`,
    "",
    "Lesson handout (the ONLY source for questions):",
    input.handoutMd,
  ].join("\n");

  return runAgent({
    model: AI_MODELS.SONNET,
    system: SYSTEM,
    schema: AssessmentOutput,
    user,
    effort: "medium",
  });
}
