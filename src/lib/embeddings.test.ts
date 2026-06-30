import { describe, it, expect } from "vitest";
import {
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
  toVectorLiteral,
  isEmbeddingsConfigured,
  embedTexts,
} from "./embeddings";

describe("embeddings adapter", () => {
  it("dimension matches the SourceChunk.embedding column (vector(1024))", () => {
    expect(EMBEDDING_DIM).toBe(1024);
    expect(EMBEDDING_MODEL).toBe("voyage-3.5");
  });

  it("serializes vectors into the pgvector literal form", () => {
    expect(toVectorLiteral([0.1, 0.2, -0.3])).toBe("[0.1,0.2,-0.3]");
    expect(toVectorLiteral([])).toBe("[]");
  });

  it("empty input batch resolves to empty output without calling the API", async () => {
    await expect(embedTexts([], "document")).resolves.toEqual([]);
  });

  it("embedTexts rejects when no key is configured", async () => {
    if (!isEmbeddingsConfigured()) {
      await expect(embedTexts(["hello"], "query")).rejects.toThrow(/VOYAGE_API_KEY/);
    } else {
      expect(isEmbeddingsConfigured()).toBe(true);
    }
  });
});
