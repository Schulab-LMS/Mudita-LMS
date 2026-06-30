// Provider-agnostic embeddings adapter for the curriculum RAG knowledge base.
// Default provider: Voyage AI (Anthropic's recommended embeddings partner).
// Lazy/keyless at import time, like ai.ts / stripe.ts — callers gate on
// `isEmbeddingsConfigured()`. The output dimension MUST match the
// SourceChunk.embedding column (vector(1024)); see EMBEDDING_DIM.

const apiKey = process.env.VOYAGE_API_KEY;

// voyage-3.5 emits 1024-dim vectors by default — must equal the pgvector
// column dimension. Changing the model/dimension requires a schema migration
// on SourceChunk.embedding.
export const EMBEDDING_MODEL = "voyage-3.5";
export const EMBEDDING_DIM = 1024;

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

export function isEmbeddingsConfigured(): boolean {
  return Boolean(apiKey);
}

/** Voyage distinguishes stored documents from search queries for better recall. */
export type EmbedInputType = "document" | "query";

interface VoyageResponse {
  data: { embedding: number[]; index: number }[];
}

/**
 * Embed a batch of texts. Returns exactly one vector per input, in input order.
 * Empty input returns [] without calling the API (no key required). For
 * non-empty input, throws if VOYAGE_API_KEY is unset (gate with
 * isEmbeddingsConfigured first), if the API errors, if the response count does
 * not match the input count, or if any vector has the wrong dimension.
 */
export async function embedTexts(
  texts: string[],
  inputType: EmbedInputType
): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set. Embeddings are disabled.");
  }

  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,
      model: EMBEDDING_MODEL,
      input_type: inputType,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Voyage embeddings failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as VoyageResponse;
  // Sort by index defensively — the API returns them in order, but don't rely on it.
  const ordered = [...(json.data ?? [])].sort((a, b) => a.index - b.index);
  const vectors = ordered.map((d) => d.embedding);

  // Guarantee one vector per input. A short/misaligned response must fail loudly
  // here, not silently mispair embeddings with chunks downstream (or surface as
  // an undefined deref in callers that index vectors[i]).
  if (vectors.length !== texts.length) {
    throw new Error(
      `Voyage returned ${vectors.length} embeddings for ${texts.length} inputs.`
    );
  }

  for (const v of vectors) {
    if (v.length !== EMBEDDING_DIM) {
      throw new Error(
        `Embedding dimension ${v.length} != expected ${EMBEDDING_DIM}. ` +
          `SourceChunk.embedding is vector(${EMBEDDING_DIM}).`
      );
    }
  }
  return vectors;
}

/** Embed a single text. Convenience wrapper around embedTexts. */
export async function embedOne(text: string, inputType: EmbedInputType): Promise<number[]> {
  const [v] = await embedTexts([text], inputType);
  return v;
}

/** Serialize a JS number[] into the pgvector literal form: "[0.1,0.2,...]". */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
