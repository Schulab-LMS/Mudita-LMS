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
  practiceTasks: z
    .array(z.string())
    .describe("2–4 short hands-on practice tasks reinforcing the lesson"),
  projectRubric: z
    .array(
      z.object({
        criterion: z.string().describe("what is assessed in the lesson's project/activity"),
        meets: z.string().describe("what 'meets expectations' looks like"),
        exceeds: z.string().describe("what 'exceeds expectations' looks like"),
      })
    )
    .describe("rubric rows for the lesson's project/activity"),
  certificateCriteria: z
    .array(z.string())
    .describe("completion criteria a learner must satisfy to earn the lesson's certificate/badge"),
});
export type AssessmentResult = z.infer<typeof AssessmentOutput>;

const SYSTEM = `You are the SchuLab Assessment agent.
You build the assessment for ONE lesson: a quiz, practice tasks, a project rubric, and certificate criteria.
HARD RULES:
- Everything must be derivable purely from the provided lesson handout — no outside knowledge.
- Quiz: exactly one correct option per question; set answerIndex to its 0-based position; explanations reference what the lesson taught.
- Match the age band: 3–5 quiz questions for younger learners, up to ~10 for older.
- Practice tasks are short, safe, hands-on, and reinforce the objective.
- The rubric describes the lesson's project/activity in 'meets' / 'exceeds' terms.
- Certificate criteria are concrete, observable completion conditions (not vague).
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
