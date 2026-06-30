import Anthropic from "@anthropic-ai/sdk";

// Lazy-initialised Anthropic client for the AI-assisted curriculum pipeline.
// Mirrors the Stripe/Mux pattern: nothing here runs at import time, so the app
// boots fine without ANTHROPIC_API_KEY. Callers gate on `isAiConfigured()`
// before any generation path.
//
// Model policy (hard rule): the curriculum pipeline uses ONLY Claude Opus 4.8
// and Claude Sonnet 4.6. Opus for drafting/mapping/scripts; Sonnet for lighter
// classification, URL/similarity checks, and high-volume passes. No other model
// id may be passed to `aiMessage()`.

const apiKey = process.env.ANTHROPIC_API_KEY;

let instance: Anthropic | null = null;

export function isAiConfigured(): boolean {
  return Boolean(apiKey);
}

export function anthropic(): Anthropic {
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. AI curriculum generation is disabled."
    );
  }
  if (!instance) {
    instance = new Anthropic({ apiKey });
  }
  return instance;
}

// The only two models the pipeline may use. Bare ids, no date suffixes.
export const AI_MODELS = {
  /** Drafting, mapping, lesson building, video scripts — reasoning + long context. */
  OPUS: "claude-opus-4-8",
  /** Classification, URL-liveness, similarity checks, high-volume passes. */
  SONNET: "claude-sonnet-4-6",
} as const;

export type AiModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

const ALLOWED_MODELS = new Set<string>(Object.values(AI_MODELS));

/** Throw unless `model` is one of the two sanctioned curriculum models. */
export function assertAllowedModel(model: string): asserts model is AiModel {
  if (!ALLOWED_MODELS.has(model)) {
    throw new Error(
      `Model "${model}" is not permitted for curriculum generation. ` +
        `Use one of: ${Object.values(AI_MODELS).join(", ")}.`
    );
  }
}
