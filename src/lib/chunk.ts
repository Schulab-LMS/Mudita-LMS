// Pure text chunking for the RAG knowledge base. No DB, no network — kept in
// lib so it's unit-testable in isolation. Splits source text into overlapping
// windows that prefer to break on paragraph, then sentence, then word
// boundaries, so a chunk rarely cuts mid-sentence.

export interface ChunkOptions {
  /** Target maximum characters per chunk. */
  maxChars?: number;
  /** Characters of overlap carried from the end of one chunk into the next. */
  overlapChars?: number;
}

const DEFAULTS: Required<ChunkOptions> = { maxChars: 1200, overlapChars: 150 };

/** Find the best break point at or before `limit` within `s` (a soft boundary). */
function softBreak(s: string, limit: number): number {
  if (s.length <= limit) return s.length;
  const window = s.slice(0, limit);
  // Prefer paragraph break, then sentence end, then last whitespace.
  const para = window.lastIndexOf("\n\n");
  if (para > limit * 0.5) return para + 2;
  const sentence = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? "),
    window.lastIndexOf(".\n")
  );
  if (sentence > limit * 0.5) return sentence + 1;
  const space = window.lastIndexOf(" ");
  if (space > limit * 0.5) return space + 1;
  return limit; // no good boundary — hard cut
}

/**
 * Split `text` into overlapping chunks. Whitespace-only input yields no chunks.
 * Guarantees forward progress (never loops) even with pathological overlap.
 */
export function chunkText(text: string, opts: ChunkOptions = {}): string[] {
  const maxChars = Math.max(1, opts.maxChars ?? DEFAULTS.maxChars);
  const overlapChars = Math.min(
    Math.max(0, opts.overlapChars ?? DEFAULTS.overlapChars),
    maxChars - 1
  );

  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];

  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    const rest = normalized.slice(start);
    const end = softBreak(rest, maxChars);
    const chunk = rest.slice(0, end).trim();
    if (chunk) chunks.push(chunk);
    if (start + end >= normalized.length) break;
    // Advance, carrying overlap, but always move forward by at least 1.
    start += Math.max(1, end - overlapChars);
  }
  return chunks;
}
