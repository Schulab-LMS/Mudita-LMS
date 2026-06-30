// Character Consistency agent (Step 8) — emits the locked Lumo prompt-template
// for a lesson's age variant + topic, so every generated image/video stays
// on-model. Preserves the core face/color/logo DNA across variants.

import { z } from "zod";
import { AI_MODELS } from "@/lib/ai";
import { runAgent } from "../lib/agent-runner";

export const CharacterOutput = z.object({
  variant: z.string().describe("the Lumo age variant, e.g. 'Lumo Creator'"),
  topicCostume: z.string().describe("topic costume/accessory, e.g. 'astronaut headset (space)'"),
  faceDna: z.string().describe("the invariant face description shared across all variants"),
  colorPalette: z.string().describe("the SchuLab color family to keep consistent"),
  promptTemplate: z
    .string()
    .describe("a reusable image/video generation prompt with {scene} placeholder"),
  thumbnailPrompt: z.string().describe("thumbnail image prompt for the lesson"),
  doList: z.array(z.string()).describe("on-model do's"),
  dontList: z.array(z.string()).describe("off-model don'ts"),
});
export type CharacterResult = z.infer<typeof CharacterOutput>;

const SYSTEM = `You are the SchuLab Character Consistency agent for the Lumo character system.
You produce a LOCKED prompt-template for one lesson's age variant + topic so all generated
art stays on-model.
HARD RULES:
- Preserve Lumo's invariant DNA across every variant: same face identity, same color family,
  same logo mark, same friendly expression ("SchuLab visual DNA").
- Apply only the correct age variant (Mini/Junior/Creator/Explorer/Innovator/Mentor) and the
  topic costume (space→astronaut headset, AI→robot sidekick, coding→code blocks/laptop, …).
- The prompt template must be safe, age-appropriate, and specific; include a {scene} placeholder.
- Never invent a different character or break the visual DNA.`;

export interface CharacterInput {
  lessonTitle: string;
  topic: string;
  ageRange: string;
  characterVariant: string;
}

export async function runCharacter(input: CharacterInput): Promise<CharacterResult> {
  const user = [
    `Lesson: ${input.lessonTitle}`,
    `Topic: ${input.topic}`,
    `Age band: ${input.ageRange}`,
    `Lumo variant: ${input.characterVariant}`,
  ].join("\n");

  return runAgent({
    model: AI_MODELS.SONNET,
    system: SYSTEM,
    schema: CharacterOutput,
    user,
    effort: "medium",
  });
}
