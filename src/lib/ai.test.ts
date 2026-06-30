import { describe, it, expect } from "vitest";
import {
  AI_MODELS,
  assertAllowedModel,
  isAiConfigured,
  anthropic,
} from "./ai";

describe("AI model policy", () => {
  it("exposes exactly the two sanctioned bare model ids (no date suffixes)", () => {
    expect(AI_MODELS.OPUS).toBe("claude-opus-4-8");
    expect(AI_MODELS.SONNET).toBe("claude-sonnet-4-6");
    expect(Object.values(AI_MODELS)).toHaveLength(2);
  });

  it("accepts the two allowed models", () => {
    expect(() => assertAllowedModel("claude-opus-4-8")).not.toThrow();
    expect(() => assertAllowedModel("claude-sonnet-4-6")).not.toThrow();
  });

  it("rejects any other model — including Haiku and date-suffixed variants", () => {
    expect(() => assertAllowedModel("claude-haiku-4-5")).toThrow();
    expect(() => assertAllowedModel("claude-opus-4-8-20251114")).toThrow();
    expect(() => assertAllowedModel("gpt-4")).toThrow();
    expect(() => assertAllowedModel("")).toThrow();
  });
});

describe("Anthropic client gating", () => {
  it("anthropic() and isAiConfigured() agree on availability", () => {
    if (isAiConfigured()) {
      expect(() => anthropic()).not.toThrow();
    } else {
      // No key configured (the default in CI/tests) — must throw, never boot a
      // broken client.
      expect(() => anthropic()).toThrow(/ANTHROPIC_API_KEY/);
    }
  });
});
