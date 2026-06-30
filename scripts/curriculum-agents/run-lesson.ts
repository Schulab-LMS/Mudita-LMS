// Task 3 orchestrator. Produces one source-grounded, RAG-gated lesson folder
// for an EXISTING catalog course, ready for Task 4 (open-lesson-pr) to PR into
// STEM-Curricula. See docs/curriculum-production.
//
// Pipeline: load canonical catalog → gap-check (never duplicate a `keep`
// lesson) → RAG retrieve (the "no source ⇒ no generation" gate) → Mapper →
// Lesson Builder → Assessment → write folder → Task-7 verification report.
//
// Needs DATABASE_URL (gap-check + RAG), VOYAGE_API_KEY (query embedding) and
// ANTHROPIC_API_KEY (agents). The catalog + gap-check run without keys; the
// pipeline stops at the RAG gate with a clear error if a key is missing.
//
// Usage:
//   npx tsx --env-file=.env scripts/curriculum-agents/run-lesson.ts \
//     --course <course-slug> --title "<lesson title>" \
//     [--out <dir>] [--k 8] [--max-distance 0.6]

import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { db } from "@/lib/db";
import { retrieve, type RetrievedChunk } from "@/services/rag.service";
import { verifyLesson, type LessonSection } from "@/services/verification.service";

import {
  loadCatalog,
  findCourse,
  lumoForBand,
  ageRangeForBand,
} from "./lib/catalog";
import { writeLessonFolder } from "./lib/lesson-writer";
import type { LessonDraft, MetaSource, SectionCitation } from "./lib/lesson-types";
import { runMapper } from "./agents/mapper";
import { runLessonBuilder } from "./agents/lesson-builder";
import { runAssessment } from "./agents/assessment";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function main() {
  const courseSlug = arg("--course");
  const title = arg("--title");
  const outDir = resolve(arg("--out") ?? "curriculum-out");
  const k = Number(arg("--k") ?? 8);
  const maxDistance = arg("--max-distance") ? Number(arg("--max-distance")) : undefined;

  if (!courseSlug || !title) {
    fail('Usage: --course <slug> --title "<lesson title>" [--out <dir>] [--k N] [--max-distance N]');
  }

  // 1. Canonical binding — the course must exist in the catalog.
  const catalog = loadCatalog();
  const course = findCourse(catalog, courseSlug);
  if (!course) {
    fail(`Course "${courseSlug}" is not in the catalog. Agents may only target existing courses.`);
  }
  const band = course.ageGroup;
  console.log(`→ Course: ${course.title} (${band}) · character ${lumoForBand(band)}`);

  // 2. Gap-check — never regenerate a lesson that already exists with content.
  const existing = await db.lesson.findMany({
    where: { module: { course: { slug: courseSlug } } },
    select: { title: true, content: true, presentationContent: true },
  });
  const target = normalize(title);
  const clash = existing.find(
    (l) => normalize(l.title) === target && (l.content || l.presentationContent)
  );
  if (clash) {
    fail(`A lesson titled "${title}" already exists with content in this course (keep). Won't duplicate.`);
  }

  // 3. RAG gate — no qualifying approved source ⇒ no generation.
  console.log("→ Retrieving approved-source passages…");
  const chunks: RetrievedChunk[] = await retrieve(`${title}. ${course.title}`, { k, maxDistance });
  if (chunks.length === 0) {
    fail("No qualifying approved-source passage retrieved. Per the source-first rule, generation is blocked.");
  }
  console.log(`→ ${chunks.length} passage(s) from: ${[...new Set(chunks.map((c) => c.sourceKey))].join(", ")}`);

  const sourcePassages = chunks.map((c) => ({
    sourceKey: c.sourceKey,
    url: c.url,
    content: c.content,
  }));

  // 4. Agents: map → build → assess.
  console.log("→ Mapper…");
  const plan = await runMapper({
    lessonTitle: title,
    courseSlug,
    courseTitle: course.title,
    ageGroup: band,
    ageRange: ageRangeForBand(band),
    sourcePassages,
  });

  console.log("→ Lesson Builder…");
  const built = await runLessonBuilder({
    lessonTitle: title,
    conceptSummary: plan.conceptSummary,
    objectives: plan.objectives,
    ageGroup: band,
    ageRange: ageRangeForBand(band),
    characterVariant: lumoForBand(band),
    sourcePassages,
  });

  console.log("→ Assessment…");
  const assessment = await runAssessment({
    lessonTitle: title,
    ageRange: ageRangeForBand(band),
    handoutMd: built.handoutMd,
  });

  // 5. Assemble the LessonDraft. Primary source = closest chunk; secondaries =
  //    other distinct sources. Provenance comes straight from the KB chunks.
  const byKey = new Map<string, RetrievedChunk>();
  for (const c of chunks) if (!byKey.has(c.sourceKey)) byKey.set(c.sourceKey, c);
  const toMetaSource = (c: RetrievedChunk): MetaSource => ({
    provider: c.sourceName,
    url: c.url ?? "",
    license: c.license ?? undefined,
  });
  const ordered = Array.from(byKey.values());
  const source = toMetaSource(ordered[0]);
  const secondarySources = ordered.slice(1).map(toMetaSource);

  const citations: SectionCitation[] = built.citations.map((c) => ({
    section: c.section,
    sourceKey: c.sourceKey ?? undefined,
    sourceUrl: c.sourceUrl ?? undefined,
    confidence: c.confidence,
  }));

  const draft: LessonDraft = {
    slug: plan.lessonSlug,
    title,
    ageGroup: band,
    ageRange: ageRangeForBand(band),
    category: course.category,
    courseSlug,
    characterVariant: lumoForBand(band),
    source,
    secondarySources,
    learningObjectives: plan.objectives,
    handoutMd: built.handoutMd,
    activityMd: built.activityMd,
    presentationMd: built.presentationMd,
    tutorMd: built.tutorMd,
    parentNote: built.parentNote,
    safetyNote: built.safetyNote ?? undefined,
    quizId: `${plan.lessonSlug}-quiz`,
    quiz: assessment.questions,
    resources: [],
    citations,
  };

  // 6. Write the folder.
  const written = writeLessonFolder(draft, outDir);
  const lessonDir = join(outDir, draft.slug);
  console.log(`→ Wrote ${written.length} files to ${lessonDir}`);

  // 7. Task-7 verification → report alongside the lesson.
  const urlForKey = (key?: string, url?: string): string[] => {
    const u = url ?? (key ? byKey.get(key)?.url ?? undefined : undefined);
    return u ? [u] : [];
  };
  const passages = sourcePassages.map((p) => p.content);
  const sections: LessonSection[] = [
    { name: "handout", text: draft.handoutMd },
    { name: "activity", text: draft.activityMd },
    { name: "presentation", text: draft.presentationMd },
  ].map((s) => {
    const cites = draft.citations.filter((c) => c.section === s.name);
    return {
      ...s,
      citedUrls: cites.flatMap((c) => urlForKey(c.sourceKey, c.sourceUrl)),
      sourcePassages: passages,
    };
  });
  const report = await verifyLesson(sections);
  mkdirSync(lessonDir, { recursive: true });
  writeFileSync(join(lessonDir, "verification.report.json"), JSON.stringify(report, null, 2));

  console.log(`→ Verification: ${report.passed ? "PASSED" : `${report.issues.length} issue(s)`}`);
  console.log("\nNext: review, then PR with");
  console.log(
    `  npx tsx scripts/curriculum-agents/open-lesson-pr.ts --lesson ${lessonDir} ` +
      `--target <subject>/${courseSlug}/modules/${plan.moduleHint}/${draft.slug} ` +
      `--report ${join(lessonDir, "verification.report.json")}`
  );

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
