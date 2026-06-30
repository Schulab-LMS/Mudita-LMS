// Curriculum Mapper agent — turns a target lesson title + retrieved source
// passages into a concrete lesson plan (objectives, difficulty, slug). Bound to
// the canonical catalog: it maps INTO an existing course, never invents one.

import { z } from "zod";
import { AI_MODELS } from "@/lib/ai";
import { runAgent } from "../lib/agent-runner";

export const MapperOutput = z.object({
  lessonSlug: z
    .string()
    .describe("kebab-case lesson slug, e.g. '03-moon-phases' (no spaces)"),
  conceptSummary: z
    .string()
    .describe("1–2 sentence summary of the single concept this lesson teaches"),
  objectives: z
    .array(z.string())
    .describe("2–6 measurable learning objectives, grounded in the sources"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  moduleHint: z
    .string()
    .describe("short module/folder name this lesson belongs under, e.g. 'module_01_our_moon'"),
});
export type MapperResult = z.infer<typeof MapperOutput>;

const SYSTEM = `You are the SchuLab Curriculum Mapper.
You map a target lesson into an EXISTING course using ONLY the retrieved source passages provided.
Hard rules:
- Never invent facts, sources, or a different course — work within the given course + sources.
- Objectives must be supported by the retrieved passages.
- Keep the lesson to a single coherent concept appropriate for the age band.
- The slug is kebab-case and stable; the moduleHint matches the repo's module_xx_name style.`;

export interface MapperInput {
  lessonTitle: string;
  courseSlug: string;
  courseTitle: string;
  ageGroup: string;
  ageRange: string;
  /** Retrieved approved-source passages (the only grounding allowed). */
  sourcePassages: { sourceKey: string; url: string | null; content: string }[];
}

export async function runMapper(input: MapperInput): Promise<MapperResult> {
  const sources = input.sourcePassages
    .map((p, i) => `[${i + 1}] (${p.sourceKey}${p.url ? ` ${p.url}` : ""})\n${p.content}`)
    .join("\n\n");
  const user = [
    `Target lesson title: ${input.lessonTitle}`,
    `Course: ${input.courseTitle} (slug: ${input.courseSlug})`,
    `Age band: ${input.ageGroup} (${input.ageRange})`,
    "",
    "Retrieved approved-source passages (your only grounding):",
    sources,
  ].join("\n");

  return runAgent({
    model: AI_MODELS.SONNET,
    system: SYSTEM,
    schema: MapperOutput,
    user,
    effort: "medium",
  });
}
