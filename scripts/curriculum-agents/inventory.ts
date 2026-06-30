// Curriculum inventory + reconciliation (Task 0b).
//
// Runs BEFORE any AI generation. It enumerates what curriculum already exists
// for the catalog — catalog data files, live DB rows, and (where present) the
// Git-synced lessons — then classifies every lesson as:
//
//   keep      — good existing content; NEVER regenerate
//   improve   — exists but weak (thin / missing localization / no quiz / no source)
//   gap       — genuinely missing (empty placeholder shell or not seeded yet)
//   duplicate — structural clash to consolidate (not re-create)
//
// The generator orchestrator (Task 3) consumes the emitted report and only ever
// drafts `improve` / `gap` lessons. Deterministic, structural checks live here;
// the semantic "two lessons teach the same concept" check is the Inventory
// Agent's LLM job on top of this report.
//
// Usage:  npx tsx scripts/curriculum-agents/inventory.ts [--out path] [--course slug]
// DB is optional: without DATABASE_URL it does a catalog-only pass.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { COURSES_AGES_3_5 } from "../../prisma/catalog/courses-ages-3-5.data";
import { COURSES_AGES_5_7 } from "../../prisma/catalog/courses-ages-5-7.data";
import { COURSES_AGES_8_10 } from "../../prisma/catalog/courses-ages-8-10.data";
import { COURSES_AGES_11_13 } from "../../prisma/catalog/courses-ages-11-13.data";
import { COURSES_SCIENCE } from "../../prisma/catalog/courses-science.data";
import { COURSES_TEENS } from "../../prisma/catalog/courses-teens.data";
import { COURSES_CURRICULUM } from "../../prisma/catalog/courses-curriculum.data";
import { BUNDLES } from "../../prisma/catalog/bundles.data";
import type { CatalogCourse } from "../../prisma/catalog/types";

const ALL_CATALOG_COURSES: CatalogCourse[] = [
  ...COURSES_AGES_3_5,
  ...COURSES_AGES_5_7,
  ...COURSES_AGES_8_10,
  ...COURSES_AGES_11_13,
  ...COURSES_SCIENCE,
  ...COURSES_TEENS,
  ...COURSES_CURRICULUM,
];

// ── Verdict types ─────────────────────────────────────────────────────────

// `unknown` is only used when DB signals are unavailable (catalog-only pass) so
// the report never falsely claims content is missing.
type Verdict = "keep" | "improve" | "gap" | "duplicate" | "unknown";

interface LessonVerdict {
  title: string;
  module: string;
  verdict: Verdict;
  reasons: string[];
}

interface CourseVerdict {
  slug: string;
  title: string;
  ageGroup: string;
  inCatalog: boolean;
  inDb: boolean;
  dbStatus?: string;
  contentStatus?: string;
  managedByGit?: boolean;
  bundles: string[];
  verdict: Verdict;
  reasons: string[];
  lessons: LessonVerdict[];
}

// ── Heuristics ────────────────────────────────────────────────────────────

// A handout shorter than this (chars, tags stripped) reads as a stub.
const THIN_CONTENT_CHARS = 400;

function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function textLen(...vals: (string | null | undefined)[]): number {
  return vals
    .filter(Boolean)
    .join(" ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim().length;
}

// ── DB access (optional) ──────────────────────────────────────────────────

interface DbLesson {
  title: string;
  moduleTitle: string;
  type: string;
  content: string | null;
  contentAr: string | null;
  contentDe: string | null;
  presentationContent: string | null;
  activity: string | null;
  videoAssetId: string | null;
  videoUrl: string | null;
  hasQuiz: boolean;
  sourcePath: string | null;
}

interface DbCourse {
  slug: string;
  title: string;
  ageGroup: string;
  status: string;
  contentStatus: string | null;
  managedByGit: boolean;
  bundles: string[];
  lessons: DbLesson[];
}

async function loadDbCourses(filterSlug?: string): Promise<DbCourse[] | null> {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠  DATABASE_URL not set — running catalog-only pass (no DB signals).");
    return null;
  }
  try {
    const { PrismaClient } = await import("../../src/generated/prisma/client");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const db = new PrismaClient({ adapter });

    const rows = await db.course.findMany({
      where: filterSlug ? { slug: filterSlug } : undefined,
      select: {
        slug: true,
        title: true,
        ageGroup: true,
        status: true,
        contentStatus: true,
        managedByGit: true,
        bundleLinks: { select: { bundle: { select: { slug: true } } } },
        modules: {
          orderBy: { order: "asc" },
          select: {
            title: true,
            lessons: {
              orderBy: { order: "asc" },
              select: {
                title: true,
                type: true,
                content: true,
                contentAr: true,
                contentDe: true,
                presentationContent: true,
                activity: true,
                videoAssetId: true,
                videoUrl: true,
                sourcePath: true,
                quiz: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    await db.$disconnect();

    return rows.map((c) => ({
      slug: c.slug,
      title: c.title,
      ageGroup: String(c.ageGroup),
      status: String(c.status),
      contentStatus: c.contentStatus ? String(c.contentStatus) : null,
      managedByGit: c.managedByGit,
      bundles: c.bundleLinks.map((b) => b.bundle.slug),
      lessons: c.modules.flatMap((m) =>
        m.lessons.map((l) => ({
          title: l.title,
          moduleTitle: m.title,
          type: String(l.type),
          content: l.content,
          contentAr: l.contentAr,
          contentDe: l.contentDe,
          presentationContent: l.presentationContent,
          activity: l.activity,
          videoAssetId: l.videoAssetId,
          videoUrl: l.videoUrl,
          hasQuiz: Boolean(l.quiz),
          sourcePath: l.sourcePath,
        })),
      ),
    }));
  } catch (err) {
    console.warn(`⚠  DB query failed (${(err as Error).message}) — catalog-only pass.`);
    return null;
  }
}

// ── Classification ────────────────────────────────────────────────────────

function classifyLesson(l: DbLesson): LessonVerdict {
  const reasons: string[] = [];
  const bodyLen = textLen(l.content, l.presentationContent);
  const hasPrimaryBody = bodyLen > 0 || Boolean(l.videoAssetId) || Boolean(l.videoUrl);

  // Empty placeholder shell — seeded title with nothing attached.
  if (!hasPrimaryBody && !l.hasQuiz && !l.activity) {
    return { title: l.title, module: l.moduleTitle, verdict: "gap", reasons: ["empty placeholder shell"] };
  }

  // Has something but weak — flag every shortfall for the source/build step.
  if (bodyLen > 0 && bodyLen < THIN_CONTENT_CHARS) reasons.push(`thin body (${bodyLen} chars)`);
  if (hasPrimaryBody && !l.hasQuiz && l.type !== "PRESENTATION") reasons.push("no quiz");
  if (hasPrimaryBody && !(l.contentAr && l.contentDe)) reasons.push("missing ar/de localization");
  // A content-bearing lesson with no sourcePath has weak provenance — the source
  // step should attach a citation before it can be considered `keep`.
  if (hasPrimaryBody && !l.sourcePath) reasons.push("no source/provenance");

  if (reasons.length > 0) {
    return { title: l.title, module: l.moduleTitle, verdict: "improve", reasons };
  }
  return { title: l.title, module: l.moduleTitle, verdict: "keep", reasons: ["complete + cited"] };
}

// ── Duplicate detection (structural) ──────────────────────────────────────

interface Duplicates {
  courseTitleClashes: { normalized: string; slugs: string[] }[];
  lessonTitleClashes: { course: string; normalized: string; titles: string[] }[];
  sharedAcrossBundles: { slug: string; bundles: string[] }[];
}

function detectDuplicates(courses: CourseVerdict[]): Duplicates {
  // Courses whose titles normalize identically (true duplicates, not shared).
  const byTitle = new Map<string, string[]>();
  for (const c of courses) {
    const key = normalizeTitle(c.title);
    byTitle.set(key, [...(byTitle.get(key) ?? []), c.slug]);
  }
  const courseTitleClashes = Array.from(byTitle.entries())
    .filter(([, slugs]) => slugs.length > 1)
    .map(([normalized, slugs]) => ({ normalized, slugs }));

  // Shared-across-bundles is the INTENDED design (BundleCourse) — informational.
  const sharedAcrossBundles = courses
    .filter((c) => c.bundles.length > 1)
    .map((c) => ({ slug: c.slug, bundles: c.bundles }));

  return { courseTitleClashes, lessonTitleClashes: [], sharedAcrossBundles };
}

// ── Main ──────────────────────────────────────────────────────────────────

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

// Catalog-declared bundle membership (course slug → bundle slugs). Lets the
// cross-bundle duplication check work even when DB signals are unavailable.
function catalogBundleMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const b of BUNDLES) {
    for (const c of b.courses) {
      map.set(c.slug, [...(map.get(c.slug) ?? []), b.slug]);
    }
  }
  return map;
}

async function main() {
  const filterSlug = arg("--course");
  const outPath = resolve(arg("--out") ?? "reconciliation.report.json");

  const dbCourses = await loadDbCourses(filterSlug);
  const dbBySlug = new Map((dbCourses ?? []).map((c) => [c.slug, c]));
  const bundleMap = catalogBundleMap();

  const catalog = filterSlug
    ? ALL_CATALOG_COURSES.filter((c) => c.slug === filterSlug)
    : ALL_CATALOG_COURSES;

  const courseVerdicts: CourseVerdict[] = [];

  for (const cat of catalog) {
    const db = dbBySlug.get(cat.slug);
    const lessons: LessonVerdict[] = [];
    const reasons: string[] = [];

    if (!db) {
      // With DB signals: catalog-defined but unseeded → gap. Without DB signals
      // (catalog-only pass): we can't tell — mark `unknown`, never `gap`.
      reasons.push(dbCourses ? "in catalog, not seeded in DB" : "DB unavailable — content state unknown");
      courseVerdicts.push({
        slug: cat.slug,
        title: cat.title,
        ageGroup: cat.ageGroup,
        inCatalog: true,
        inDb: false,
        contentStatus: cat.contentStatus,
        bundles: bundleMap.get(cat.slug) ?? [],
        verdict: dbCourses ? "gap" : "unknown",
        reasons,
        lessons,
      });
      continue;
    }

    for (const raw of db.lessons) {
      lessons.push(classifyLesson(raw));
    }

    const counts = tally(lessons.map((l) => l.verdict));
    // Course verdict = worst-of its lessons, but a course with all-keep lessons
    // (and any lessons at all) is keep.
    let verdict: Verdict = "keep";
    if (lessons.length === 0) {
      verdict = "gap";
      reasons.push("no lessons in DB");
    } else if (counts.gap > 0) {
      verdict = "improve";
      reasons.push(`${counts.gap} empty lesson(s)`);
    } else if (counts.improve > 0) {
      verdict = "improve";
      reasons.push(`${counts.improve} weak lesson(s)`);
    } else {
      reasons.push("all lessons complete");
    }

    courseVerdicts.push({
      slug: cat.slug,
      title: cat.title,
      ageGroup: cat.ageGroup,
      inCatalog: true,
      inDb: true,
      dbStatus: db.status,
      contentStatus: db.contentStatus ?? cat.contentStatus,
      managedByGit: db.managedByGit,
      bundles: db.bundles.length ? db.bundles : (bundleMap.get(cat.slug) ?? []),
      verdict,
      reasons,
      lessons,
    });
  }

  // DB courses not present in the catalog at all (orphans worth a human look).
  const catalogSlugs = new Set(catalog.map((c) => c.slug));
  for (const db of dbCourses ?? []) {
    if (!catalogSlugs.has(db.slug)) {
      courseVerdicts.push({
        slug: db.slug,
        title: db.title,
        ageGroup: db.ageGroup,
        inCatalog: false,
        inDb: true,
        dbStatus: db.status,
        contentStatus: db.contentStatus ?? undefined,
        managedByGit: db.managedByGit,
        bundles: db.bundles,
        verdict: "duplicate",
        reasons: ["in DB but not in catalog data — verify it isn't a stray duplicate"],
        lessons: [],
      });
    }
  }

  const duplicates = detectDuplicates(courseVerdicts);

  const lessonTally = tally(courseVerdicts.flatMap((c) => c.lessons.map((l) => l.verdict)));
  const courseTally = tally(courseVerdicts.map((c) => c.verdict));

  const report = {
    generatedAt: new Date().toISOString(),
    dbAvailable: Boolean(dbCourses),
    filterSlug: filterSlug ?? null,
    summary: {
      catalogCourses: catalog.length,
      courses: courseTally,
      lessons: lessonTally,
      courseTitleClashes: duplicates.courseTitleClashes.length,
      sharedAcrossBundles: duplicates.sharedAcrossBundles.length,
    },
    duplicates,
    courses: courseVerdicts,
  };

  writeFileSync(outPath, JSON.stringify(report, null, 2));

  // Console summary
  console.log("\n── Curriculum reconciliation ─────────────────────────────");
  console.log(`Catalog courses examined : ${catalog.length}`);
  console.log(`DB signals               : ${dbCourses ? "yes" : "NO (catalog-only)"}`);
  const fmt = (t: Record<Verdict, number>) =>
    `${t.keep}/${t.improve}/${t.gap}/${t.duplicate}` + (t.unknown ? ` (unknown: ${t.unknown})` : "");
  console.log(`Courses  keep/improve/gap/dup : ${fmt(courseTally)}`);
  console.log(`Lessons  keep/improve/gap/dup : ${fmt(lessonTally)}`);
  if (duplicates.courseTitleClashes.length) {
    console.log(`\n⚠  ${duplicates.courseTitleClashes.length} course title clash(es) to consolidate:`);
    for (const c of duplicates.courseTitleClashes) console.log(`   "${c.normalized}" → ${c.slugs.join(", ")}`);
  }
  console.log(`\n→ ${outPath}`);
  console.log("Generation targets ONLY `gap` + `improve`. `keep` is never regenerated.\n");
}

function tally(verdicts: Verdict[]): Record<Verdict, number> {
  const out: Record<Verdict, number> = { keep: 0, improve: 0, gap: 0, duplicate: 0, unknown: 0 };
  for (const v of verdicts) out[v]++;
  return out;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
