// Step 4 — course outline wrapper. For an EXISTING catalog course, retrieves
// approved sources (the RAG gate), proposes a module → lesson outline, writes it
// to <out>/<course>/course-outline.json, and prints the per-lesson run-lesson
// commands. Lesson generation itself stays per-lesson (run-lesson.ts), so each
// lesson is independently reviewed + PR'd.
//
// Needs DATABASE_URL + VOYAGE_API_KEY (RAG) + ANTHROPIC_API_KEY (outline agent),
// OR run the equivalent on the Claude subscription via the /curriculum-lesson
// skill. Loads the canonical catalog (read-only) without keys.
//
// Usage:
//   npx tsx --env-file=.env scripts/curriculum-agents/run-course.ts \
//     --course <course-slug> [--out <dir>] [--k 12]

import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { retrieve, type RetrievedChunk } from "@/services/rag.service";
import { loadCatalog, findCourse, ageRangeForBand } from "./lib/catalog";
import { runOutline } from "./agents/outline";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

async function main() {
  const courseSlug = arg("--course");
  const outDir = resolve(arg("--out") ?? "curriculum-out");
  const k = Number(arg("--k") ?? 12);
  if (!courseSlug) fail("Usage: --course <slug> [--out <dir>] [--k N]");

  // 1. Canonical binding — the course must exist in the catalog.
  const catalog = loadCatalog();
  const course = findCourse(catalog, courseSlug);
  if (!course) {
    fail(`Course "${courseSlug}" is not in the catalog. Outline only targets existing courses.`);
  }
  const ageRange = ageRangeForBand(course.ageGroup);
  console.log(`→ Course: ${course.title} (${course.ageGroup})`);

  // 2. RAG gate — no qualifying approved source ⇒ no outline.
  console.log("→ Retrieving approved-source passages…");
  const chunks: RetrievedChunk[] = await retrieve(`${course.title}. ${course.category}`, { k });
  if (chunks.length === 0) {
    fail("No qualifying approved-source passage retrieved — cannot outline without sources.");
  }
  console.log(`→ ${chunks.length} passage(s) from: ${[...new Set(chunks.map((c) => c.sourceKey))].join(", ")}`);

  // 3. Outline agent.
  console.log("→ Course Outline…");
  const outline = await runOutline({
    courseTitle: course.title,
    ageRange,
    sourcePassages: chunks.map((c) => ({ sourceKey: c.sourceKey, url: c.url, content: c.content })),
  });

  const courseDir = join(outDir, courseSlug);
  mkdirSync(courseDir, { recursive: true });
  writeFileSync(join(courseDir, "course-outline.json"), JSON.stringify(outline, null, 2) + "\n");

  const lessonCount = outline.modules.reduce((n, m) => n + m.lessons.length, 0);
  console.log(`→ Outline: ${outline.modules.length} modules, ${lessonCount} lessons → ${courseDir}/course-outline.json`);
  console.log("\nGenerate each lesson (review + PR individually):");
  for (const mod of outline.modules) {
    for (const lesson of mod.lessons) {
      console.log(
        `  npx tsx --env-file=.env scripts/curriculum-agents/run-lesson.ts --course ${courseSlug} --title ${JSON.stringify(lesson.title)}`
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
