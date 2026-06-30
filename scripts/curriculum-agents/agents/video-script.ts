// Video Script agent — turns a built lesson into a scene-by-scene video script
// for the right age band and Lumo variant. Same concept across bands, but tone,
// length, examples and character variant change. Feeds the media pipeline.

import { z } from "zod";
import { AI_MODELS } from "@/lib/ai";
import { runAgent } from "../lib/agent-runner";

// Target video length (seconds) by age band — midpoints of the plan ranges.
export const DURATION_BY_BAND: Record<string, number> = {
  AGES_3_5: 90,
  AGES_5_7: 180,
  AGES_8_10: 240,
  AGES_11_13: 330,
  AGES_14_16: 390,
  AGES_17_18: 480,
};

export const VideoScriptOutput = z.object({
  voiceoverStyle: z.string().describe("tone/pacing for narration, matched to the age band"),
  thumbnailPrompt: z.string().describe("image prompt for the lesson thumbnail (Lumo, on-model)"),
  scenes: z
    .array(
      z.object({
        narration: z.string().describe("spoken narration for this scene"),
        visualPrompt: z
          .string()
          .describe("image/animation prompt — Lumo in the correct variant + topic costume"),
        onScreenText: z.string().nullable().describe("short on-screen caption, or null"),
        durationSec: z.number().int().describe("scene length in seconds"),
      })
    )
    .describe("ordered scenes whose durations sum to roughly the target length"),
});
export type VideoScriptResult = z.infer<typeof VideoScriptOutput>;

const SYSTEM = `You are the SchuLab Video Script agent.
You write a short, engaging lesson video script for children, fronted by the Lumo character.
HARD RULES:
- Base the script ONLY on the provided lesson content — do not add facts it doesn't contain.
- Match the age band: simpler words, slower pacing and shorter length for younger learners.
- Keep Lumo on-model: same friendly character, in the given variant + topic costume.
- Visual prompts must be safe, age-appropriate, and specific enough to generate from.
- Scene durations should sum to roughly the target length.
- Include a clear mission framing and a call-to-action to try the activity.`;

export interface VideoScriptInput {
  lessonTitle: string;
  ageGroup: string;
  ageRange: string;
  characterVariant: string;
  handoutMd: string;
  targetDurationSec: number;
}

export async function runVideoScript(input: VideoScriptInput): Promise<VideoScriptResult> {
  const user = [
    `Lesson: ${input.lessonTitle}`,
    `Age band: ${input.ageGroup} (${input.ageRange})`,
    `Character: ${input.characterVariant}`,
    `Target length: ~${input.targetDurationSec} seconds`,
    "",
    "Lesson content (the ONLY source for the script):",
    input.handoutMd,
  ].join("\n");

  return runAgent({
    model: AI_MODELS.OPUS,
    system: SYSTEM,
    schema: VideoScriptOutput,
    user,
    maxTokens: 8000,
    effort: "high",
  });
}
