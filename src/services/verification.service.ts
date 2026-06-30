// Reviewer-prep verification gate (Task 7). Three automated checks that must
// pass before an AI-generated lesson PR can be approved (see
// docs/curriculum-production/source-first-and-rag.md):
//   1. claim→source coverage — every content section cites at least one source.
//   2. over-copying — no section reuses a source too closely (similarity /
//      verbatim run), enforcing "no copied source text".
//   3. URL liveness — every cited source URL is reachable.
//
// Pure logic lives in lib/text-similarity; this service composes the checks and
// returns a single pass/fail report. The URL fetcher is injectable so the
// liveness check is testable without real network calls.

import { overCopyScore } from "@/lib/text-similarity";

export interface LessonSection {
  /** e.g. "handout", "activity", "presentation", "quiz". */
  name: string;
  /** Generated prose for this section. */
  text: string;
  /** Source URLs/keys cited for this section (may be empty → coverage failure). */
  citedUrls: string[];
  /** Source passages this section was grounded in (for over-copy scoring). */
  sourcePassages: string[];
}

export interface OverCopyThresholds {
  /** Max allowed shingle similarity to any single source passage. */
  maxSimilarity: number;
  /** Max allowed verbatim shared run (words) against any source passage. */
  maxVerbatimRun: number;
}

export const DEFAULT_OVERCOPY: OverCopyThresholds = {
  maxSimilarity: 0.4,
  maxVerbatimRun: 12,
};

export interface VerificationIssue {
  check: "coverage" | "overcopy" | "url";
  section?: string;
  url?: string;
  detail: string;
}

export interface VerificationReport {
  passed: boolean;
  issues: VerificationIssue[];
  checked: { sections: number; urls: number };
}

/** Sections with no qualifying source citation fail the source-first gate. */
export function checkCoverage(sections: LessonSection[]): VerificationIssue[] {
  const issues: VerificationIssue[] = [];
  for (const s of sections) {
    // A section with actual prose must cite at least one source.
    if (s.text.trim().length > 0 && s.citedUrls.filter((u) => u.trim()).length === 0) {
      issues.push({
        check: "coverage",
        section: s.name,
        detail: "section has content but cites no source",
      });
    }
  }
  return issues;
}

/** Flag sections that reuse a source passage too closely. */
export function checkOverCopy(
  sections: LessonSection[],
  thresholds: OverCopyThresholds = DEFAULT_OVERCOPY
): VerificationIssue[] {
  const issues: VerificationIssue[] = [];
  for (const s of sections) {
    if (!s.text.trim() || s.sourcePassages.length === 0) continue;
    const { similarity, longestRun } = overCopyScore(s.text, s.sourcePassages);
    if (similarity > thresholds.maxSimilarity) {
      issues.push({
        check: "overcopy",
        section: s.name,
        detail: `similarity ${similarity.toFixed(2)} exceeds ${thresholds.maxSimilarity}`,
      });
    }
    if (longestRun > thresholds.maxVerbatimRun) {
      issues.push({
        check: "overcopy",
        section: s.name,
        detail: `verbatim run of ${longestRun} words exceeds ${thresholds.maxVerbatimRun}`,
      });
    }
  }
  return issues;
}

/** Injectable so tests don't hit the network. Returns true if the URL is live. */
export type UrlProbe = (url: string) => Promise<boolean>;

/** Default probe: HEAD (falling back to GET) with a short timeout, 2xx/3xx = live. */
export const defaultUrlProbe: UrlProbe = async (url) => {
  const tryFetch = async (method: "HEAD" | "GET"): Promise<boolean> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: ctrl.signal,
      });
      return res.status < 400;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  };
  // Some servers reject HEAD; fall back to GET before declaring it dead.
  return (await tryFetch("HEAD")) || (await tryFetch("GET"));
};

/** Probe every distinct cited URL; dead/unreachable ones are issues. */
export async function checkUrlLiveness(
  sections: LessonSection[],
  probe: UrlProbe = defaultUrlProbe
): Promise<{ issues: VerificationIssue[]; urlCount: number }> {
  const urls = Array.from(
    new Set(sections.flatMap((s) => s.citedUrls).map((u) => u.trim()).filter(Boolean))
  );
  const results = await Promise.all(
    urls.map(async (url) => ({ url, ok: await probe(url) }))
  );
  const issues = results
    .filter((r) => !r.ok)
    .map((r): VerificationIssue => ({
      check: "url",
      url: r.url,
      detail: "source URL is unreachable",
    }));
  return { issues, urlCount: urls.length };
}

/**
 * Run all three checks and return a single gate report. `passed` is true only
 * when there are zero issues — Reviewer-prep blocks the PR otherwise.
 */
export async function verifyLesson(
  sections: LessonSection[],
  opts: { thresholds?: OverCopyThresholds; probe?: UrlProbe } = {}
): Promise<VerificationReport> {
  const coverage = checkCoverage(sections);
  const overcopy = checkOverCopy(sections, opts.thresholds);
  const { issues: urlIssues, urlCount } = await checkUrlLiveness(sections, opts.probe);

  const issues = [...coverage, ...overcopy, ...urlIssues];
  return {
    passed: issues.length === 0,
    issues,
    checked: { sections: sections.length, urls: urlCount },
  };
}
