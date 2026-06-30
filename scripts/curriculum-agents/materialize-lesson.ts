// No-API entry point for the subscription / Claude-Code workflow. The lesson
// content is authored by Claude Code itself (on your Claude subscription —
// no ANTHROPIC_API_KEY, no Voyage), grounded in approved source text. This
// script just MATERIALIZES that authored draft: it reuses the same deterministic
// infrastructure as the API pipeline (lesson-writer + Task-7 verification) so
// the output is identical and sync-compatible.
//
// Input envelope JSON: { draft: LessonDraft, sourcePassages: string[] }
//   - draft          : the authored lesson (matches lesson-types.LessonDraft)
//   - sourcePassages : the approved-source text it was grounded in (for the
//                      over-copy + coverage checks)
//
// Usage:
//   npx tsx scripts/curriculum-agents/materialize-lesson.ts --in <envelope.json> --out <dir>

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { verifyLesson, type LessonSection } from "@/services/verification.service";
import { writeLessonFolder } from "./lib/lesson-writer";
import type { LessonDraft } from "./lib/lesson-types";

interface Envelope {
  draft: LessonDraft;
  sourcePassages: string[];
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const inPath = arg("--in");
  const outDir = resolve(arg("--out") ?? "curriculum-out");
  if (!inPath) {
    console.error("Usage: --in <envelope.json> --out <dir>");
    process.exit(2);
  }

  const env = JSON.parse(readFileSync(resolve(inPath), "utf8")) as Envelope;
  const { draft, sourcePassages } = env;

  // 1. Write the lesson folder (identical to the API pipeline's output).
  const written = writeLessonFolder(draft, outDir);
  const lessonDir = join(outDir, draft.slug);
  console.log(`→ Wrote ${written.length} files to ${lessonDir}`);

  // 2. Task-7 verification: coverage + over-copy + URL liveness.
  const urlForCite = (sourceKey?: string, sourceUrl?: string): string[] => {
    if (sourceUrl) return [sourceUrl];
    // Fall back to the draft's source URLs if a citation only carries a key.
    const all = [draft.source, ...draft.secondarySources];
    const hit = all.find(() => Boolean(sourceKey)); // keep simple; URL is primary
    return hit?.url ? [hit.url] : [];
  };
  const sections: LessonSection[] = (
    ["handout", "activity", "presentation"] as const
  ).map((name) => {
    const text =
      name === "handout"
        ? draft.handoutMd
        : name === "activity"
          ? draft.activityMd
          : draft.presentationMd;
    const cites = draft.citations.filter((c) => c.section === name);
    return {
      name,
      text,
      citedUrls: cites.flatMap((c) => urlForCite(c.sourceKey, c.sourceUrl)),
      sourcePassages,
    };
  });

  const report = await verifyLesson(sections);
  writeFileSync(
    join(lessonDir, "verification.report.json"),
    JSON.stringify(report, null, 2) + "\n"
  );
  console.log(
    `→ Verification: ${report.passed ? "PASSED" : `${report.issues.length} issue(s)`}`
  );
  for (const issue of report.issues) {
    console.log(`   - ${issue.check}${issue.section ? ` (${issue.section})` : ""}: ${issue.detail}`);
  }

  console.log("\nNext: review the folder, then PR with");
  console.log(
    `  npx tsx scripts/curriculum-agents/open-lesson-pr.ts --lesson ${lessonDir} ` +
      `--target <subject>/${draft.courseSlug}/modules/<module>/${draft.slug} ` +
      `--report ${join(lessonDir, "verification.report.json")}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
