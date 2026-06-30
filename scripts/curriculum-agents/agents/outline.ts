// Course Outline agent (Step 4) — proposes an ordered module/lesson outline for
// an EXISTING catalog course, grounded in retrieved approved sources. It plans
// content structure only; platform-owned course metadata is never redefined.

import { z } from "zod";
import { AI_MODELS } from "@/lib/ai";
import { runAgent } from "../lib/agent-runner";

export const OutlineOutput = z.object({
  modules: z
    .array(
      z.object({
        title: z.string().describe("module title"),
        lessons: z
          .array(
            z.object({
              title: z.string().describe("lesson title"),
              objective: z.string().describe("one-line learning objective, grounded in the sources"),
            })
          )
          .describe("ordered lessons in this module"),
      })
    )
    .describe("ordered modules, each with its lessons"),
});
export type OutlineResult = z.infer<typeof OutlineOutput>;

const SYSTEM = `You are the SchuLab Course Outline agent.
You propose an ordered module → lesson outline for an EXISTING course, grounded ONLY in the
retrieved approved-source passages.
HARD RULES:
- Use only the sources provided; do not invent topics they don't support.
- Build a coherent progression appropriate for the age band (simple → richer).
- Each lesson is a single concept with a clear, source-supported objective.
- Do NOT restate platform metadata (course name, age group, pricing) — outline content only.`;

export interface OutlineInput {
  courseTitle: string;
  ageRange: string;
  sourcePassages: { sourceKey: string; url: string | null; content: string }[];
}

export async function runOutline(input: OutlineInput): Promise<OutlineResult> {
  const sources = input.sourcePassages
    .map((p, i) => `[${i + 1}] (${p.sourceKey}${p.url ? ` ${p.url}` : ""})\n${p.content}`)
    .join("\n\n");
  const user = [
    `Course: ${input.courseTitle}`,
    `Age band: ${input.ageRange}`,
    "",
    "Retrieved approved-source passages (your only grounding):",
    sources,
  ].join("\n");

  return runAgent({
    model: AI_MODELS.OPUS,
    system: SYSTEM,
    schema: OutlineOutput,
    user,
    maxTokens: 8000,
    effort: "high",
  });
}
