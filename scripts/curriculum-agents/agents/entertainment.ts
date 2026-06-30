// Entertainment Layer agent (Step 6) — wraps a built lesson in a mission /
// quest / story / challenge framing, WITHOUT changing the learning content or
// adding facts. Reinforces the objective; never distracts from it.

import { z } from "zod";
import { AI_MODELS } from "@/lib/ai";
import { runAgent } from "../lib/agent-runner";

export const EntertainmentOutput = z.object({
  title: z.string().describe("the mission/quest title, e.g. 'Moon Detective Mission'"),
  storyHook: z.string().describe("1–3 sentence story hook in the Lumo character's voice"),
  challenge: z.string().describe("the core challenge/quest framing tied to the lesson objective"),
  badgeName: z.string().describe("a short badge name awarded on completion"),
});
export type EntertainmentResult = z.infer<typeof EntertainmentOutput>;

const SYSTEM = `You are the SchuLab Entertainment Layer agent.
You turn a finished lesson into a fun mission / quest / story / challenge fronted by the Lumo character.
HARD RULES:
- Reinforce the lesson's learning objective — never distract from it or change any fact.
- Do NOT add new content or claims; only frame the existing lesson as a mission.
- Age-appropriate, safe, and encouraging; match the given Lumo variant's voice.
- Keep it short and motivating: a title, a story hook, a challenge, and a badge.`;

export interface EntertainmentInput {
  lessonTitle: string;
  objectives: string[];
  ageRange: string;
  characterVariant: string;
  handoutMd: string;
}

export async function runEntertainment(input: EntertainmentInput): Promise<EntertainmentResult> {
  const user = [
    `Lesson: ${input.lessonTitle}`,
    `Objectives:\n${input.objectives.map((o) => `- ${o}`).join("\n")}`,
    `Age band: ${input.ageRange}`,
    `Character: ${input.characterVariant}`,
    "",
    "Lesson content to frame as a mission (do not change it):",
    input.handoutMd,
  ].join("\n");

  return runAgent({
    model: AI_MODELS.SONNET,
    system: SYSTEM,
    schema: EntertainmentOutput,
    user,
    effort: "medium",
  });
}
