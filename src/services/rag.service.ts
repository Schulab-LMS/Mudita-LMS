// RAG retrieval — the technical enforcement of "AI must not invent content".
// Embeds a query and returns the nearest approved-source passages by cosine
// distance. Curriculum generation is GATED on this: no qualifying passage ⇒
// the caller must not generate. See docs/curriculum-production.

import { db } from "@/lib/db";
import { embedTexts, toVectorLiteral } from "@/lib/embeddings";
import type { SourceStatus } from "@/generated/prisma/client";

// Only these source tiers may ground *curriculum* generation. ENRICHMENT and
// HISTORICAL are retrievable only via an explicit override (enrichment prompts).
const CURRICULUM_STATUSES: SourceStatus[] = ["ACTIVE", "OPTIONAL"];
const ALL_STATUSES: SourceStatus[] = ["ACTIVE", "OPTIONAL", "ENRICHMENT", "HISTORICAL"];

export interface RetrievedChunk {
  id: string;
  sourceId: string;
  sourceKey: string;
  sourceName: string;
  chunkIndex: number;
  content: string;
  url: string | null;
  license: string | null;
  status: SourceStatus;
  /** Cosine distance in [0, 2]; lower is closer. */
  distance: number;
}

export interface RetrieveOptions {
  /** Top-k passages to return. */
  k?: number;
  /** Source tiers eligible for this query. Defaults to ACTIVE + OPTIONAL. */
  statuses?: SourceStatus[];
  /** Drop passages whose cosine distance exceeds this (the relevance gate). */
  maxDistance?: number;
}

function safeStatuses(statuses: SourceStatus[]): SourceStatus[] {
  // Validate against the known enum set so they can be inlined into SQL safely.
  const allowed = new Set<string>(ALL_STATUSES);
  const out = statuses.filter((s) => allowed.has(s));
  if (out.length === 0) throw new Error("No valid source statuses for retrieval");
  return out;
}

/**
 * Retrieve the nearest approved-source passages for `query`. Returns [] when
 * nothing qualifies — callers treat an empty result as "no source ⇒ block
 * generation". Results are ordered closest-first.
 */
export async function retrieve(
  query: string,
  opts: RetrieveOptions = {}
): Promise<RetrievedChunk[]> {
  const k = Math.max(1, Math.min(opts.k ?? 8, 50));
  const statuses = safeStatuses(opts.statuses ?? CURRICULUM_STATUSES);

  const [qvec] = await embedTexts([query], "query");
  const lit = toVectorLiteral(qvec);

  // Statuses are validated enum values (no injection surface); inline them as a
  // quoted IN list. The query vector and k are bound parameters.
  const inList = statuses.map((s) => `'${s}'`).join(", ");
  const rows = await db.$queryRawUnsafe<
    Array<{
      id: string;
      sourceId: string;
      sourceKey: string;
      sourceName: string;
      chunkIndex: number;
      content: string;
      url: string | null;
      license: string | null;
      status: SourceStatus;
      distance: number;
    }>
  >(
    `SELECT sc.id,
            sc."sourceId"   AS "sourceId",
            rs.key          AS "sourceKey",
            rs.name         AS "sourceName",
            sc."chunkIndex" AS "chunkIndex",
            sc.content,
            sc.url,
            sc.license,
            sc.status,
            (sc.embedding <=> $1::vector) AS distance
       FROM "SourceChunk" sc
       JOIN "ReferenceSource" rs ON rs.id = sc."sourceId"
      WHERE sc.embedding IS NOT NULL
        AND sc.status IN (${inList})
      ORDER BY sc.embedding <=> $1::vector
      LIMIT $2`,
    lit,
    k
  );

  const filtered =
    opts.maxDistance == null
      ? rows
      : rows.filter((r) => r.distance <= opts.maxDistance!);

  return filtered.map((r) => ({ ...r, distance: Number(r.distance) }));
}

export const RETRIEVAL = { CURRICULUM_STATUSES, ALL_STATUSES };
