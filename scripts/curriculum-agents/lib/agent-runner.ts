// The single LLM boundary for the curriculum agent pipeline (Task 3). Every
// agent calls runAgent() — it enforces the model allowlist (Opus 4.8 / Sonnet
// 4.6 only), forces structured (schema-valid) output, and returns a typed,
// validated object. This is the ONLY file that needs ANTHROPIC_API_KEY; the
// rest of the pipeline (catalog, writer, gap-check, verification) runs without.

import type { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, assertAllowedModel, type AiModel } from "@/lib/ai";

export interface AgentRunOptions<S extends z.ZodType> {
  /** Which sanctioned model runs this agent (claude-opus-4-8 | claude-sonnet-4-6). */
  model: AiModel;
  /** Stable system prompt — the agent's role + hard rules. */
  system: string;
  /** The per-call input: the task plus the retrieved source passages. */
  user: string;
  /** Zod schema the output is forced to satisfy. */
  schema: S;
  maxTokens?: number;
  effort?: "low" | "medium" | "high";
}

/**
 * Run one agent turn with structured output. Throws if the model is not
 * sanctioned, if ANTHROPIC_API_KEY is unset (via anthropic()), or if the model
 * returns nothing parseable. The result is validated against `schema`.
 */
export async function runAgent<S extends z.ZodType>(
  opts: AgentRunOptions<S>
): Promise<z.infer<S>> {
  assertAllowedModel(opts.model);

  const message = await anthropic().messages.parse({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 8000,
    system: opts.system,
    output_config: {
      format: zodOutputFormat(opts.schema),
      effort: opts.effort ?? "high",
    },
    messages: [{ role: "user", content: opts.user }],
  });

  if (message.stop_reason === "refusal") {
    throw new Error("Agent request was refused by safety classifiers.");
  }
  const parsed = message.parsed_output;
  if (parsed == null) {
    throw new Error("Agent returned no structured output.");
  }
  return parsed as z.infer<S>;
}
