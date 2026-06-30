// Pure text-similarity metrics for the curriculum over-copying check (Task 7,
// Reviewer-prep). No DB, no network — unit-testable in isolation. Two signals:
//   1. shingleSimilarity — soft overlap (paraphrase-resistant Jaccard).
//   2. longestSharedWordRun — verbatim-span signal (a long identical run is a
//      strong "copied source text" indicator the reviewer checklist forbids).

/** Normalize to a lowercase word array, stripping punctuation and collapsing space. */
export function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Set of k-word shingles (contiguous k-grams). Empty when fewer than k words. */
export function wordShingles(text: string, k = 5): Set<string> {
  const w = words(text);
  const out = new Set<string>();
  if (w.length < k) {
    if (w.length > 0) out.add(w.join(" ")); // short text: one shingle of itself
    return out;
  }
  for (let i = 0; i + k <= w.length; i++) {
    out.add(w.slice(i, i + k).join(" "));
  }
  return out;
}

/** Jaccard overlap of two shingle sets, in [0, 1]. Empty-vs-empty is 0. */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const s of a) if (b.has(s)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Soft similarity (k-word-shingle Jaccard) between two texts, in [0, 1]. */
export function shingleSimilarity(a: string, b: string, k = 5): number {
  return jaccard(wordShingles(a, k), wordShingles(b, k));
}

/**
 * Length (in words) of the longest contiguous run of words present in BOTH
 * texts — a verbatim-copy signal. O(n·m) DP over word arrays, fine for
 * lesson-sized text. Returns 0 when there is no shared word at all.
 */
export function longestSharedWordRun(a: string, b: string): number {
  const wa = words(a);
  const wb = words(b);
  if (wa.length === 0 || wb.length === 0) return 0;

  // Rolling two-row LCS-of-contiguous-substring (suffix) DP.
  let prev = new Array<number>(wb.length + 1).fill(0);
  let best = 0;
  for (let i = 1; i <= wa.length; i++) {
    const curr = new Array<number>(wb.length + 1).fill(0);
    for (let j = 1; j <= wb.length; j++) {
      if (wa[i - 1] === wb[j - 1]) {
        curr[j] = prev[j - 1] + 1;
        if (curr[j] > best) best = curr[j];
      }
    }
    prev = curr;
  }
  return best;
}

export interface OverCopyResult {
  /** Max soft similarity against any source passage, in [0, 1]. */
  similarity: number;
  /** Max verbatim run (words) against any source passage. */
  longestRun: number;
}

/**
 * Score generated text against the source passages it was grounded in. Returns
 * the worst (highest) similarity and verbatim-run across all sources, so a
 * caller can flag over-copying with a single threshold pair.
 */
export function overCopyScore(generated: string, sources: string[]): OverCopyResult {
  let similarity = 0;
  let longestRun = 0;
  for (const src of sources) {
    similarity = Math.max(similarity, shingleSimilarity(generated, src));
    longestRun = Math.max(longestRun, longestSharedWordRun(generated, src));
  }
  return { similarity, longestRun };
}
