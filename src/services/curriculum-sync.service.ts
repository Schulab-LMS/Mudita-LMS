import { parse as parseYaml } from "yaml";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type {
  AgeGroup,
  CourseLevel,
  CourseStatus,
  LessonType,
  PlanTier,
  PresentationFormat,
  SyncTrigger,
} from "@/generated/prisma/client";
import {
  getBlobText,
  getLatestCommitSha,
  getTree,
  isCurriculaConfigured,
  type TreeEntry,
} from "@/lib/github-curricula";
import { renderCurriculumMarkdown, splitTutorContent } from "@/lib/markdown";
import { parseQuizMarkdown, type ParsedQuiz } from "@/lib/curriculum-quiz-parser";
import {
  parsePresentationMarkdown,
  rewritePresentationMediaUrls,
  rewriteResourceUrl,
  type PresentationConfig,
} from "@/lib/presentation";
import { sendCurriculumSyncAlert } from "@/lib/email";
import {
  type CourseMeta,
  type LessonResource,
  escapeRegExp,
  findCourseRoots,
  firstHeading,
  numericPrefix,
  parseResources,
  prettifyCourseFolder,
  prettifyFolder,
  resolveAgeGroup,
  resolveLevel,
  resolvePlan,
  resolveStatus,
  slugify,
} from "@/lib/curriculum-structure";

// Synthetic creator id for Git-managed courses. `Course.createdById` is a free
// string column (no FK), so a sentinel is safe and makes provenance obvious.
const SYSTEM_AUTHOR = "system:curriculum-sync";
const DEFAULT_LESSON_SECONDS = 3600; // each unit = a 60-minute session

// ── Repo → structured model ─────────────────────────────────────────────

interface BuiltLesson {
  sourcePath: string; // unit folder path within the repo
  order: number;
  title: string;
  content: string | null;
  contentAr: string | null;
  contentDe: string | null;
  activity: string | null;
  activityAr: string | null;
  activityDe: string | null;
  tutorNotes: string | null;
  // Reveal.js slide deck. Stored as raw markdown (NOT rendered to HTML) so
  // the client-side Reveal markdown plugin can parse slide delimiters.
  // presentation* is non-null when presentation.md exists in the unit; the
  // localised variants are non-null when presentation.<locale>.md exists.
  // When the english variant is present we promote lesson.type to PRESENTATION.
  presentation: string | null;
  presentationAr: string | null;
  presentationDe: string | null;
  presentationConfig: PresentationConfig | null;
  // Downloadable resources / reference links parsed from resources.md, with
  // repo-relative URLs rewritten to the media proxy. Empty array when absent.
  resources: LessonResource[];
  quiz: ParsedQuiz | null;
}

interface BuiltModule {
  sourcePath: string; // module folder path within the repo
  order: number;
  title: string;
  lessons: BuiltLesson[];
}

interface BuiltCourse {
  slug: string;
  sourcePath: string; // course root folder within the repo
  title: string;
  titleAr: string | null;
  titleDe: string | null;
  description: string;
  ageGroup: AgeGroup;
  level: CourseLevel;
  category: string;
  requiredPlan: PlanTier | null;
  tags: string[];
  status: CourseStatus;
  modules: BuiltModule[];
}

const baseName = (p: string) => (p.includes("/") ? p.slice(p.lastIndexOf("/") + 1) : p);

// How many lessons/modules to build at once. Building is read-only and every
// file is its own GitHub REST round-trip, so the sync is network-latency-bound;
// a small worker pool turns hundreds of serial requests into a few parallel
// batches. Each lesson itself fans out ~10 file reads, so peak in-flight
// requests is roughly this × 10 — kept modest to stay clear of GitHub's
// secondary rate limits.
const READ_CONCURRENCY = 4;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

// Read an optional YAML manifest (meta.yml / meta.yaml) from a folder.
async function readMeta(
  dir: string,
  readText: (path: string) => Promise<string | null>
): Promise<CourseMeta> {
  const metaRaw = (await readText(`${dir}/meta.yml`)) ?? (await readText(`${dir}/meta.yaml`));
  if (!metaRaw) return {};
  try {
    return (parseYaml(metaRaw) as CourseMeta) ?? {};
  } catch (e) {
    console.warn(`[curricula] failed to parse meta.yml for ${dir}: ${String(e)}`);
    return {};
  }
}

function deriveDescription(meta: CourseMeta, readme: string | null, fallback: string): string {
  return (
    meta.description ||
    (readme
      ? readme
          .replace(/^\s*#.*$/m, "")
          .replace(/[#>*_`|-]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 400)
      : fallback)
  );
}

// Build one lesson from a content folder holding handout/activity/quiz/presentation
// files. Shared by both layouts: in "nested" the folder is a `unit_NN_*` dir; in
// "flat" it is the `module-NN_*` dir itself. `moduleOverview` (nested only) is
// prepended to the lesson's tutor notes.
async function buildLesson(opts: {
  dir: string;
  order: number;
  slug: string;
  courseRoot: string;
  moduleOverview: { markdown: string; path: string } | null;
  readText: (path: string) => Promise<string | null>;
}): Promise<BuiltLesson> {
  const { dir, order, slug, courseRoot, moduleOverview, readText } = opts;
  const folder = baseName(dir);

  // These reads are independent — fetch them together rather than serially.
  const [
    handout,
    handoutAr,
    handoutDe,
    activity,
    activityAr,
    activityDe,
    quizMd,
    presentationMd,
    presentationArMd,
    presentationDeMd,
    resourcesMd,
  ] = await Promise.all([
    readText(`${dir}/handout.md`),
    readText(`${dir}/handout.ar.md`),
    readText(`${dir}/handout.de.md`),
    readText(`${dir}/activity.md`),
    readText(`${dir}/activity.ar.md`),
    readText(`${dir}/activity.de.md`),
    readText(`${dir}/quiz.md`),
    readText(`${dir}/presentation.md`),
    readText(`${dir}/presentation.ar.md`),
    readText(`${dir}/presentation.de.md`),
    readText(`${dir}/resources.md`),
  ]);

  const split = handout ? splitTutorContent(handout) : null;
  const ctx = (file: string) => ({
    courseSlug: slug,
    courseRoot,
    sourceFilePath: file,
  });

  // Reveal.js decks: pull frontmatter off the English variant only (it's
  // the canonical config), keep raw markdown for all locales, and rewrite
  // relative image paths to the authenticated media proxy.
  let presentation: string | null = null;
  let presentationAr: string | null = null;
  let presentationDe: string | null = null;
  let presentationConfig: PresentationConfig | null = null;
  if (presentationMd) {
    const parsed = parsePresentationMarkdown(presentationMd);
    presentationConfig = parsed.config;
    presentation = rewritePresentationMediaUrls(parsed.markdown, ctx(`${dir}/presentation.md`));
  }
  if (presentationArMd) {
    const parsed = parsePresentationMarkdown(presentationArMd);
    presentationAr = rewritePresentationMediaUrls(parsed.markdown, ctx(`${dir}/presentation.ar.md`));
  }
  if (presentationDeMd) {
    const parsed = parsePresentationMarkdown(presentationDeMd);
    presentationDe = rewritePresentationMediaUrls(parsed.markdown, ctx(`${dir}/presentation.de.md`));
  }

  // Resources: parse the markdown link list, then rewrite repo-relative file
  // links to the authenticated media proxy (absolute links pass through).
  // Links escaping the course root are dropped by rewriteResourceUrl.
  const resources: LessonResource[] = parseResources(resourcesMd)
    .map((r) => {
      const url = rewriteResourceUrl(r.url, ctx(`${dir}/resources.md`));
      return url ? { ...r, url } : null;
    })
    .filter((r): r is LessonResource => r !== null);

  // Tutor notes = module overview (pedagogy, nested only) + this unit's TUTOR_ONLY fences.
  const tutorParts: string[] = [];
  if (moduleOverview) {
    tutorParts.push(renderCurriculumMarkdown(moduleOverview.markdown, ctx(moduleOverview.path)));
  }
  if (split?.tutorMarkdown) {
    tutorParts.push(renderCurriculumMarkdown(split.tutorMarkdown, ctx(`${dir}/handout.md`)));
  }

  return {
    sourcePath: dir,
    order,
    title: firstHeading(handout) || prettifyFolder(folder),
    content: split
      ? renderCurriculumMarkdown(split.studentMarkdown, ctx(`${dir}/handout.md`))
      : null,
    contentAr: handoutAr ? renderCurriculumMarkdown(handoutAr, ctx(`${dir}/handout.ar.md`)) : null,
    contentDe: handoutDe ? renderCurriculumMarkdown(handoutDe, ctx(`${dir}/handout.de.md`)) : null,
    activity: activity ? renderCurriculumMarkdown(activity, ctx(`${dir}/activity.md`)) : null,
    activityAr: activityAr ? renderCurriculumMarkdown(activityAr, ctx(`${dir}/activity.ar.md`)) : null,
    activityDe: activityDe ? renderCurriculumMarkdown(activityDe, ctx(`${dir}/activity.de.md`)) : null,
    tutorNotes: tutorParts.length ? tutorParts.join("\n") : null,
    presentation,
    presentationAr,
    presentationDe,
    presentationConfig,
    resources,
    quiz: quizMd ? parseQuizMarkdown(quizMd) : null,
  };
}

// Nested layout: <root>/modules/module_NN_*/unit_NN_*/ (course → module → unit).
async function buildNestedCourse(
  root: string,
  tree: TreeEntry[],
  readText: (path: string) => Promise<string | null>
): Promise<BuiltCourse> {
  const folderName = baseName(root);
  const meta = await readMeta(root, readText);
  const readme = await readText(`${root}/README.md`);
  const slug = meta.slug ? slugify(meta.slug) : slugify(folderName);
  const title = meta.title || firstHeading(readme) || folderName;
  const description = deriveDescription(meta, readme, title);

  // Module folders directly under <root>/modules/.
  const moduleDirs = new Map<string, true>();
  const moduleRe = new RegExp(`^${escapeRegExp(root)}/modules/(module_[^/]+)/`);
  for (const entry of tree) {
    const m = entry.path.match(moduleRe);
    if (m) moduleDirs.set(`${root}/modules/${m[1]}`, true);
  }

  const modules: BuiltModule[] = [];
  for (const modulePath of [...moduleDirs.keys()].sort()) {
    const moduleFolder = baseName(modulePath);
    const overviewMd = await readText(`${modulePath}/overview.md`);
    const moduleTitle = firstHeading(overviewMd) || prettifyFolder(moduleFolder);
    const overview = overviewMd ? { markdown: overviewMd, path: `${modulePath}/overview.md` } : null;

    // Unit folders under this module.
    const unitDirs = new Set<string>();
    const unitRe = new RegExp(`^${escapeRegExp(modulePath)}/(unit_[^/]+)/`);
    for (const entry of tree) {
      const m = entry.path.match(unitRe);
      if (m) unitDirs.add(`${modulePath}/${m[1]}`);
    }

    const lessons = await mapWithConcurrency(
      [...unitDirs].sort(),
      READ_CONCURRENCY,
      (unitPath) =>
        buildLesson({
          dir: unitPath,
          order: numericPrefix(baseName(unitPath)),
          slug,
          courseRoot: root,
          moduleOverview: overview,
          readText,
        })
    );

    lessons.sort((a, b) => a.order - b.order);
    modules.push({
      sourcePath: modulePath,
      order: numericPrefix(moduleFolder),
      title: moduleTitle,
      lessons,
    });
  }

  modules.sort((a, b) => a.order - b.order);

  return {
    slug,
    sourcePath: root,
    title,
    titleAr: meta.titleAr || null,
    titleDe: meta.titleDe || null,
    description,
    ageGroup: resolveAgeGroup(meta.ageGroup, folderName),
    level: resolveLevel(meta.level),
    category: meta.category || "STEM",
    requiredPlan: resolvePlan(meta.requiredPlan),
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    status: resolveStatus(meta.status),
    modules,
  };
}

// Flat layout: <root>/module-NN-*/ (course → module, where each hyphenated module
// folder is a single lesson with its own handout/presentation/quiz). The course
// root is an age-band "stage" folder; an optional <root>/meta.yml supplies the
// title/status (without it the course imports as DRAFT, hidden until published).
async function buildFlatCourse(
  root: string,
  tree: TreeEntry[],
  readText: (path: string) => Promise<string | null>
): Promise<BuiltCourse> {
  const folderName = baseName(root);
  const meta = await readMeta(root, readText);
  const readme = await readText(`${root}/README.md`);
  const slug = meta.slug ? slugify(meta.slug) : slugify(folderName);
  const title = meta.title || firstHeading(readme) || prettifyCourseFolder(folderName);
  const description = deriveDescription(meta, readme, title);

  // Module folders directly under <root>, hyphenated (module-NN-*).
  const moduleDirs = new Set<string>();
  const moduleRe = new RegExp(`^${escapeRegExp(root)}/(module-\\d+[^/]*)/`);
  for (const entry of tree) {
    const m = entry.path.match(moduleRe);
    if (m) moduleDirs.add(`${root}/${m[1]}`);
  }

  const modules = await mapWithConcurrency(
    [...moduleDirs].sort(),
    READ_CONCURRENCY,
    async (modulePath): Promise<BuiltModule> => {
      const moduleFolder = baseName(modulePath);
      const moduleMeta = await readMeta(modulePath, readText);
      // Each flat module folder maps to exactly one lesson.
      const lesson = await buildLesson({
        dir: modulePath,
        order: 1,
        slug,
        courseRoot: root,
        moduleOverview: null,
        readText,
      });
      return {
        sourcePath: modulePath,
        order: numericPrefix(moduleFolder),
        title: moduleMeta.title || lesson.title || prettifyFolder(moduleFolder),
        lessons: [lesson],
      };
    }
  );

  modules.sort((a, b) => a.order - b.order);

  return {
    slug,
    sourcePath: root,
    title,
    titleAr: meta.titleAr || null,
    titleDe: meta.titleDe || null,
    description,
    ageGroup: resolveAgeGroup(meta.ageGroup, folderName),
    level: resolveLevel(meta.level),
    category: meta.category || "STEM",
    requiredPlan: resolvePlan(meta.requiredPlan),
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    status: resolveStatus(meta.status),
    modules,
  };
}

// Deep layout: <root>/module-NN-*/lesson-NN-*/ (course → module → lesson, with
// hyphenated module folders each holding several lesson folders). Like nested,
// but with no `modules/` wrapper and hyphenated `module-`/`lesson-` folders; the
// course root is an age-band "stage" folder (no meta.yml ⇒ imports as DRAFT).
async function buildDeepCourse(
  root: string,
  tree: TreeEntry[],
  readText: (path: string) => Promise<string | null>
): Promise<BuiltCourse> {
  const folderName = baseName(root);
  const meta = await readMeta(root, readText);
  const readme = await readText(`${root}/README.md`);
  const slug = meta.slug ? slugify(meta.slug) : slugify(folderName);
  const title = meta.title || firstHeading(readme) || prettifyCourseFolder(folderName);
  const description = deriveDescription(meta, readme, title);

  // Module folders directly under <root>, hyphenated (module-NN-*).
  const moduleDirs = new Set<string>();
  const moduleRe = new RegExp(`^${escapeRegExp(root)}/(module-\\d+[^/]*)/`);
  for (const entry of tree) {
    const m = entry.path.match(moduleRe);
    if (m) moduleDirs.add(`${root}/${m[1]}`);
  }

  const modules: BuiltModule[] = [];
  for (const modulePath of [...moduleDirs].sort()) {
    const moduleFolder = baseName(modulePath);
    const moduleMeta = await readMeta(modulePath, readText);
    const overviewMd = await readText(`${modulePath}/overview.md`);
    const moduleTitle =
      moduleMeta.title || firstHeading(overviewMd) || prettifyFolder(moduleFolder);
    const overview = overviewMd ? { markdown: overviewMd, path: `${modulePath}/overview.md` } : null;

    // Lesson folders under this module, hyphenated (lesson-NN-*).
    const lessonDirs = new Set<string>();
    const lessonRe = new RegExp(`^${escapeRegExp(modulePath)}/(lesson-[^/]+)/`);
    for (const entry of tree) {
      const m = entry.path.match(lessonRe);
      if (m) lessonDirs.add(`${modulePath}/${m[1]}`);
    }

    const lessons = await mapWithConcurrency(
      [...lessonDirs].sort(),
      READ_CONCURRENCY,
      (lessonPath) =>
        buildLesson({
          dir: lessonPath,
          order: numericPrefix(baseName(lessonPath)),
          slug,
          courseRoot: root,
          moduleOverview: overview,
          readText,
        })
    );

    lessons.sort((a, b) => a.order - b.order);
    modules.push({
      sourcePath: modulePath,
      order: numericPrefix(moduleFolder),
      title: moduleTitle,
      lessons,
    });
  }

  modules.sort((a, b) => a.order - b.order);

  return {
    slug,
    sourcePath: root,
    title,
    titleAr: meta.titleAr || null,
    titleDe: meta.titleDe || null,
    description,
    ageGroup: resolveAgeGroup(meta.ageGroup, folderName),
    level: resolveLevel(meta.level),
    category: meta.category || "STEM",
    requiredPlan: resolvePlan(meta.requiredPlan),
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    status: resolveStatus(meta.status),
    modules,
  };
}

// ── Persistence (idempotent, change-detecting, soft-archive) ─────────────

interface SyncCounts {
  coursesUpserted: number;
  lessonsUpserted: number;
  coursesArchived: number;
}

async function persistCourse(
  course: BuiltCourse,
  commitSha: string,
  counts: SyncCounts
): Promise<void> {
  const courseData = {
    title: course.title,
    titleAr: course.titleAr,
    titleDe: course.titleDe,
    description: course.description,
    ageGroup: course.ageGroup,
    level: course.level,
    category: course.category,
    requiredPlan: course.requiredPlan,
    tags: course.tags,
    status: course.status,
    managedByGit: true,
    sourcePath: course.sourcePath,
    sourceCommitSha: commitSha,
    syncStatus: "ACTIVE" as const,
  };

  const existing = await db.course.findUnique({ where: { slug: course.slug } });
  let courseId: string;
  if (existing) {
    courseId = existing.id;
    await db.course.update({ where: { id: courseId }, data: courseData });
  } else {
    const created = await db.course.create({
      data: { ...courseData, slug: course.slug, createdById: SYSTEM_AUTHOR },
    });
    courseId = created.id;
    counts.coursesUpserted += 1;
  }

  const seenModulePaths: string[] = [];
  for (const mod of course.modules) {
    seenModulePaths.push(mod.sourcePath);
    const moduleRow = await db.module.upsert({
      where: { courseId_sourcePath: { courseId, sourcePath: mod.sourcePath } },
      create: {
        courseId,
        title: mod.title,
        order: mod.order,
        sourcePath: mod.sourcePath,
        syncStatus: "ACTIVE",
      },
      update: { title: mod.title, order: mod.order, syncStatus: "ACTIVE" },
    });

    const seenLessonPaths: string[] = [];
    for (const lesson of mod.lessons) {
      seenLessonPaths.push(lesson.sourcePath);
      const changed = await persistLesson(moduleRow.id, lesson);
      if (changed) counts.lessonsUpserted += 1;
    }

    // Soft-archive lessons no longer present in this module.
    await db.lesson.updateMany({
      where: {
        moduleId: moduleRow.id,
        sourcePath: { notIn: seenLessonPaths },
        syncStatus: "ACTIVE",
      },
      data: { syncStatus: "REMOVED" },
    });
  }

  // Soft-archive modules no longer present in this course, and cascade the
  // archive to their lessons. The per-module lesson sweep above only runs for
  // modules still present in the repo, so a module that disappears entirely
  // (e.g. a layout/path refactor) would otherwise leave its lessons ACTIVE and
  // orphaned under a REMOVED module — surfacing as duplicates in unfiltered
  // (admin) views.
  const removedModules = await db.module.findMany({
    where: {
      courseId,
      sourcePath: { notIn: seenModulePaths },
      syncStatus: "ACTIVE",
    },
    select: { id: true },
  });
  if (removedModules.length > 0) {
    const removedModuleIds = removedModules.map((m) => m.id);
    await db.module.updateMany({
      where: { id: { in: removedModuleIds } },
      data: { syncStatus: "REMOVED" },
    });
    await db.lesson.updateMany({
      where: { moduleId: { in: removedModuleIds }, syncStatus: "ACTIVE" },
      data: { syncStatus: "REMOVED" },
    });
  }
}

// True when two JSON-serialisable values are deep-equal. Used to compare the
// presentation config block against what's already stored.
function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

// Returns true if a write happened (create or content-changing update).
async function persistLesson(moduleId: string, lesson: BuiltLesson): Promise<boolean> {
  const hasPresentation = lesson.presentation !== null;
  const lessonType: LessonType = hasPresentation ? "PRESENTATION" : "TEXT";
  const presentationFormat: PresentationFormat | null = hasPresentation
    ? "MARKDOWN"
    : null;
  const data = {
    title: lesson.title,
    content: lesson.content,
    contentAr: lesson.contentAr,
    contentDe: lesson.contentDe,
    activity: lesson.activity,
    activityAr: lesson.activityAr,
    activityDe: lesson.activityDe,
    tutorNotes: lesson.tutorNotes,
    presentationFormat,
    presentationContent: lesson.presentation,
    presentationContentAr: lesson.presentationAr,
    presentationContentDe: lesson.presentationDe,
    // PresentationConfig's `[extra: string]: unknown` index signature is too
    // wide for Prisma's recursive InputJsonValue; the value is JSON-safe by
    // construction (parsed from YAML) so the cast is sound.
    presentationConfig: (lesson.presentationConfig ??
      undefined) as Prisma.InputJsonValue | undefined,
    // Stored as a JSON array; cleared to DB NULL when the lesson has no
    // resources so removing the list in source actually wipes the column.
    resources: lesson.resources.length
      ? (lesson.resources as unknown as Prisma.InputJsonValue)
      : Prisma.DbNull,
    order: lesson.order,
    type: lessonType,
    duration: DEFAULT_LESSON_SECONDS,
    syncStatus: "ACTIVE" as const,
  };

  const existing = await db.lesson.findUnique({
    where: { moduleId_sourcePath: { moduleId, sourcePath: lesson.sourcePath } },
    select: {
      id: true,
      title: true,
      content: true,
      contentAr: true,
      contentDe: true,
      activity: true,
      activityAr: true,
      activityDe: true,
      tutorNotes: true,
      presentationFormat: true,
      presentationContent: true,
      presentationContentAr: true,
      presentationContentDe: true,
      presentationConfig: true,
      resources: true,
      type: true,
      order: true,
      syncStatus: true,
    },
  });

  let lessonId: string;
  let wrote = false;

  if (!existing) {
    const created = await db.lesson.create({
      data: { ...data, moduleId, sourcePath: lesson.sourcePath },
    });
    lessonId = created.id;
    wrote = true;
  } else {
    lessonId = existing.id;
    const unchanged =
      existing.title === data.title &&
      existing.content === data.content &&
      existing.contentAr === data.contentAr &&
      existing.contentDe === data.contentDe &&
      existing.activity === data.activity &&
      existing.activityAr === data.activityAr &&
      existing.activityDe === data.activityDe &&
      existing.tutorNotes === data.tutorNotes &&
      existing.presentationFormat === data.presentationFormat &&
      existing.presentationContent === data.presentationContent &&
      existing.presentationContentAr === data.presentationContentAr &&
      existing.presentationContentDe === data.presentationContentDe &&
      jsonEqual(existing.presentationConfig, lesson.presentationConfig) &&
      jsonEqual(existing.resources, lesson.resources.length ? lesson.resources : null) &&
      existing.type === data.type &&
      existing.order === data.order &&
      existing.syncStatus === "ACTIVE";
    if (!unchanged) {
      await db.lesson.update({ where: { id: lessonId }, data });
      wrote = true;
    }
  }

  // Quiz is compared independently — a quiz.md edit must sync even when the
  // handout (lesson content) is untouched.
  await persistQuiz(lessonId, lesson.quiz);
  return wrote;
}

// True when the stored quiz already matches the parsed source exactly.
function quizUnchanged(
  existing: {
    title: string;
    questions: {
      text: string;
      type: string;
      explanation: string | null;
      answers: { text: string; isCorrect: boolean }[];
    }[];
  },
  parsed: ParsedQuiz
): boolean {
  if (existing.title !== parsed.title) return false;
  if (existing.questions.length !== parsed.questions.length) return false;
  for (let i = 0; i < parsed.questions.length; i++) {
    const e = existing.questions[i];
    const p = parsed.questions[i];
    if (e.text !== p.text || e.type !== p.type) return false;
    if ((e.explanation ?? null) !== (p.explanation ?? null)) return false;
    if (e.answers.length !== p.options.length) return false;
    for (let j = 0; j < p.options.length; j++) {
      if (e.answers[j].text !== p.options[j].text) return false;
      if (e.answers[j].isCorrect !== p.options[j].isCorrect) return false;
    }
  }
  return true;
}

async function persistQuiz(lessonId: string, quiz: ParsedQuiz | null): Promise<void> {
  if (!quiz || quiz.questions.length === 0) {
    // Remove a quiz that no longer exists in the source.
    await db.quiz.deleteMany({ where: { lessonId } });
    return;
  }

  // Rebuild only when the parsed quiz differs from what's stored — this lets a
  // quiz-only edit sync without churning IDs on every unchanged quiz.
  const existing = await db.quiz.findUnique({
    where: { lessonId },
    select: {
      title: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          text: true,
          type: true,
          explanation: true,
          answers: {
            orderBy: { order: "asc" },
            select: { text: true, isCorrect: true },
          },
        },
      },
    },
  });

  if (existing && quizUnchanged(existing, quiz)) return;

  await db.$transaction(async (tx) => {
    const quizRow = await tx.quiz.upsert({
      where: { lessonId },
      create: { lessonId, title: quiz.title },
      update: { title: quiz.title },
    });
    // Replace questions wholesale (QuizAttempt references the quiz, not
    // questions, so this is safe and keeps attempts intact).
    await tx.question.deleteMany({ where: { quizId: quizRow.id } });
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      await tx.question.create({
        data: {
          quizId: quizRow.id,
          text: q.text,
          type: q.type,
          order: i,
          explanation: q.explanation,
          answers: {
            create: q.options.map((opt, j) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              order: j,
            })),
          },
        },
      });
    }
  });
}

// ── Public entry point ──────────────────────────────────────────────────

export interface SyncResult {
  runId: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED" | "SKIPPED";
  commitSha: string | null;
  coursesUpserted: number;
  lessonsUpserted: number;
  coursesArchived: number;
  error?: string;
}

export async function runCurriculumSync(opts: {
  trigger: SyncTrigger;
  force?: boolean;
}): Promise<SyncResult> {
  if (!isCurriculaConfigured()) {
    return {
      runId: "",
      status: "FAILED",
      commitSha: null,
      coursesUpserted: 0,
      lessonsUpserted: 0,
      coursesArchived: 0,
      error: "Curriculum repo is not configured (CURRICULA_REPO / CURRICULA_GITHUB_TOKEN)",
    };
  }

  const run = await db.curriculumSyncRun.create({
    data: { trigger: opts.trigger, status: "RUNNING" },
  });
  const counts: SyncCounts = { coursesUpserted: 0, lessonsUpserted: 0, coursesArchived: 0 };

  try {
    const commitSha = await getLatestCommitSha();

    // Job-level short-circuit: nothing new since the last successful sync.
    if (!opts.force) {
      const lastSuccess = await db.curriculumSyncRun.findFirst({
        where: { status: "SUCCESS", commitSha },
        orderBy: { startedAt: "desc" },
      });
      if (lastSuccess) {
        await db.curriculumSyncRun.update({
          where: { id: run.id },
          data: { status: "SUCCESS", commitSha, finishedAt: new Date() },
        });
        return {
          runId: run.id,
          status: "SKIPPED",
          commitSha,
          coursesUpserted: 0,
          lessonsUpserted: 0,
          coursesArchived: 0,
        };
      }
    }

    const tree = await getTree(commitSha);
    const blobShaByPath = new Map<string, string>();
    for (const entry of tree) {
      if (entry.type === "blob") blobShaByPath.set(entry.path, entry.sha);
    }
    const readText = async (path: string): Promise<string | null> => {
      const sha = blobShaByPath.get(path);
      return sha ? getBlobText(sha) : null;
    };

    const roots = findCourseRoots(tree);
    const seenSlugs: string[] = [];
    let hadError = false;

    for (const root of [...roots].sort((a, b) => a.path.localeCompare(b.path))) {
      try {
        const course =
          root.layout === "flat"
            ? await buildFlatCourse(root.path, tree, readText)
            : root.layout === "deep"
              ? await buildDeepCourse(root.path, tree, readText)
              : await buildNestedCourse(root.path, tree, readText);
        await persistCourse(course, commitSha, counts);
        seenSlugs.push(course.slug);
      } catch (e) {
        hadError = true;
        console.error(`[curricula] failed to sync course at ${root.path}:`, e);
      }
    }

    // Soft-archive managed courses that disappeared from the repo.
    const archived = await db.course.updateMany({
      where: { managedByGit: true, slug: { notIn: seenSlugs }, syncStatus: "ACTIVE" },
      data: { syncStatus: "REMOVED", status: "ARCHIVED" },
    });
    counts.coursesArchived = archived.count;

    const status = hadError ? "PARTIAL" : "SUCCESS";
    const partialError = "One or more courses failed to sync — see server logs";
    await db.curriculumSyncRun.update({
      where: { id: run.id },
      data: {
        status,
        commitSha,
        coursesUpserted: counts.coursesUpserted,
        lessonsUpserted: counts.lessonsUpserted,
        coursesArchived: counts.coursesArchived,
        finishedAt: new Date(),
        error: hadError ? partialError : null,
      },
    });

    // Alert admins on a partial sync (best-effort; never blocks the result).
    if (hadError) {
      sendCurriculumSyncAlert({
        status,
        error: partialError,
        commitSha,
        trigger: opts.trigger,
      }).catch(() => null);
    }

    return {
      runId: run.id,
      status,
      commitSha,
      coursesUpserted: counts.coursesUpserted,
      lessonsUpserted: counts.lessonsUpserted,
      coursesArchived: counts.coursesArchived,
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await db.curriculumSyncRun.update({
      where: { id: run.id },
      data: { status: "FAILED", error, finishedAt: new Date() },
    });
    sendCurriculumSyncAlert({
      status: "FAILED",
      error,
      commitSha: null,
      trigger: opts.trigger,
    }).catch(() => null);
    return {
      runId: run.id,
      status: "FAILED",
      commitSha: null,
      coursesUpserted: counts.coursesUpserted,
      lessonsUpserted: counts.lessonsUpserted,
      coursesArchived: counts.coursesArchived,
      error,
    };
  }
}

export async function getLastSyncRun() {
  return db.curriculumSyncRun.findFirst({ orderBy: { startedAt: "desc" } });
}
