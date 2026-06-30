// Lesson Builder agent — writes the grounded, age-adapted lesson content
// (handout / activity / presentation / tutor notes / parent note) from the
// retrieved source passages, in SchuLab's Lumo voice. Cites a source per
// section. This is the heart of the source-first guarantee.

import { z } from "zod";
import { AI_MODELS } from "@/lib/ai";
import { runAgent } from "../lib/agent-runner";

export const BuilderOutput = z.object({
  handoutMd: z.string().describe("Student handout in Markdown — the cited explanation + worked example"),
  activityMd: z.string().describe("A hands-on try-it-yourself activity in Markdown"),
  presentationMd: z
    .string()
    .describe("Reveal.js slide deck markdown (--- between slides), with YAML frontmatter for theme"),
  tutorMd: z.string().describe("Tutor-only notes: intent, sticking points, common questions"),
  parentNote: z.string().describe("Short note for parents"),
  safetyNote: z.string().nullable().describe("Safety note if the activity needs one, else null"),
  citations: z
    .array(
      z.object({
        section: z.enum(["handout", "activity", "presentation"]),
        sourceKey: z.string().nullable(),
        sourceUrl: z.string().nullable(),
        confidence: z.number(),
      })
    )
    .describe("One entry per section → the source passage that grounds it"),
  commonQuestions: z
    .array(
      z.object({
        question: z.string().describe("a question a learner of this age is likely to ask"),
        answer: z.string().describe("a clear, source-accurate answer for the tutor"),
      })
    )
    .describe("3–5 likely student questions + answers, seeded for tutors at publish"),
});
export type BuilderResult = z.infer<typeof BuilderOutput>;

const SYSTEM = `You are the SchuLab Lesson Builder. You write self-learning lesson content for children.
HARD RULES (non-negotiable):
- Use ONLY the retrieved source passages provided. Do not add facts they do not support.
- Never copy source sentences verbatim — rewrite in SchuLab's own words. Keep the science exact.
- Simplify the EXPLANATION for the age band; never simplify the underlying truth.
- Speak in the voice of the given Lumo character variant — curious, encouraging, mission-framed.
- Every section (handout, activity, presentation) must be grounded in at least one passage; record it in citations with the sourceKey.
- If a claim is not supported by any passage, omit it.
- Activities must be safe for the age band; add a safetyNote when relevant.`;

export interface BuilderInput {
  lessonTitle: string;
  conceptSummary: string;
  objectives: string[];
  ageGroup: string;
  ageRange: string;
  characterVariant: string;
  sourcePassages: { sourceKey: string; url: string | null; content: string }[];
}

export async function runLessonBuilder(input: BuilderInput): Promise<BuilderResult> {
  const sources = input.sourcePassages
    .map((p, i) => `[${i + 1}] (${p.sourceKey}${p.url ? ` ${p.url}` : ""})\n${p.content}`)
    .join("\n\n");
  const user = [
    `Lesson: ${input.lessonTitle}`,
    `Concept: ${input.conceptSummary}`,
    `Objectives:\n${input.objectives.map((o) => `- ${o}`).join("\n")}`,
    `Age band: ${input.ageGroup} (${input.ageRange})`,
    `Character: ${input.characterVariant}`,
    "",
    "Retrieved approved-source passages (your ONLY grounding — cite the sourceKey per section):",
    sources,
  ].join("\n");

  return runAgent({
    model: AI_MODELS.OPUS,
    system: SYSTEM,
    schema: BuilderOutput,
    user,
    maxTokens: 12000,
    effort: "high",
  });
}
