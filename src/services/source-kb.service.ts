// Source knowledge base: ingest approved ReferenceSource content into the
// pgvector-backed SourceChunk table for RAG retrieval. See
// docs/curriculum-production/source-first-and-rag.md.
//
// Ingestion is source-first by construction: callers pass text that originated
// from an approved ReferenceSource row (the `sourceId`). The chunk inherits the
// source's `status`, so retrieval gating (rag.service) can exclude
// ENRICHMENT/HISTORICAL chunks from curriculum generation.

import { db } from "@/lib/db";
import { chunkText, type ChunkOptions } from "@/lib/chunk";
import { embedTexts, toVectorLiteral } from "@/lib/embeddings";
import type { SourceStatus } from "@/generated/prisma/client";

export interface IngestOptions extends ChunkOptions {
  url?: string | null;
  license?: string | null;
  ageRange?: string | null;
  /** Defaults to the source's own status. */
  status?: SourceStatus;
  /** Replace any existing chunks for this source first (idempotent re-ingest). */
  replace?: boolean;
}

export interface IngestResult {
  sourceId: string;
  inserted: number;
  replaced: boolean;
}

/**
 * Chunk → embed → store text for one approved source. The embedding column is
 * pgvector (Unsupported in Prisma Client), so each chunk row is created via the
 * typed client and its embedding written with a raw `::vector` UPDATE.
 *
 * Re-ingest with `replace: true` (the idempotent path). Append mode
 * (`replace: false`) derives chunkIndex from a live count, so two concurrent
 * appends to the SAME source can collide on the (sourceId, chunkIndex) unique
 * index — ingest one source at a time, or use replace mode.
 */
export async function ingestSourceText(
  sourceId: string,
  rawText: string,
  opts: IngestOptions = {}
): Promise<IngestResult> {
  const source = await db.referenceSource.findUnique({
    where: { id: sourceId },
    select: { id: true, status: true, url: true },
  });
  if (!source) throw new Error(`ReferenceSource ${sourceId} not found`);

  const chunks = chunkText(rawText, opts);
  if (chunks.length === 0) {
    return { sourceId, inserted: 0, replaced: false };
  }

  // Embed all chunks as documents (Voyage distinguishes document vs query).
  const vectors = await embedTexts(chunks, "document");

  const status = opts.status ?? source.status;
  const url = opts.url ?? source.url;

  const replaced = Boolean(opts.replace);
  await db.$transaction(async (tx) => {
    if (replaced) {
      await tx.sourceChunk.deleteMany({ where: { sourceId } });
    }
    const offset = replaced
      ? 0
      : await tx.sourceChunk.count({ where: { sourceId } });

    for (let i = 0; i < chunks.length; i++) {
      const row = await tx.sourceChunk.create({
        data: {
          sourceId,
          chunkIndex: offset + i,
          content: chunks[i],
          url,
          license: opts.license ?? null,
          ageRange: opts.ageRange ?? null,
          status,
        },
        select: { id: true },
      });
      await tx.$executeRawUnsafe(
        `UPDATE "SourceChunk" SET embedding = $1::vector WHERE id = $2`,
        toVectorLiteral(vectors[i]),
        row.id
      );
    }
  });

  return { sourceId, inserted: chunks.length, replaced };
}

/** Remove all KB chunks for a source (e.g. when it's retired). */
export async function clearSourceChunks(sourceId: string): Promise<number> {
  const { count } = await db.sourceChunk.deleteMany({ where: { sourceId } });
  return count;
}
