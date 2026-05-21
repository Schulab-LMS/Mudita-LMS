import { parse as parseYaml } from "yaml";
import { db } from "@/lib/db";
import type {
  AgeGroup,
  CourseLevel,
  CourseStatus,
  PlanTier,
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
  type CourseMeta,
  escapeRegExp,
  findCourseRoots,
  firstHeading,
  numericPrefix,
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

async function buildCourse(
  root: string,
  tree: TreeEntry[],
  readText: (path: string) => Promise<string | null>
): Promise<BuiltCourse> {
  const folderName = root.includes("/") ? root.slice(root.lastIndexOf("/") + 1) : root;

  // Optional course manifest.
  const metaRaw =
    (await readText(`${root}/meta.yml`)) ?? (await readText(`${root}/meta.yaml`));
  let meta: CourseMeta = {};
  if (metaRaw) {
    try {
      meta = (parseYaml(metaRaw) as CourseMeta) ?? {};
    } catch (e) {
      console.warn(`[curricula] failed to parse meta.yml for ${root}: ${String(e)}`);
    }
  }

  const readme = await readText(`${root}/README.md`);
  const slug = meta.slug ? slugify(meta.slug) : slugify(folderName);
  const title = meta.title || firstHeading(readme) || folderName;
  const description =
    meta.description ||
    (readme
      ? readme
          .replace(/^\s*#.*$/m, "")
          .replace(/[#>*_`|-]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 400)
      : title);

  // Module folders directly under <root>/modules/.
  const moduleDirs = new Map<string, true>();
  const moduleRe = new RegExp(`^${escapeRegExp(root)}/modules/(module_[^/]+)/`);
  for (const entry of tree) {
    const m = entry.path.match(moduleRe);
    if (m) moduleDirs.set(`${root}/modules/${m[1]}`, true);
  }

  const modules: BuiltModule[] = [];
  for (const modulePath of [...moduleDirs.keys()].sort()) {
    const moduleFolder = modulePath.slice(modulePath.lastIndexOf("/") + 1);
    const moduleOrder = numericPrefix(moduleFolder);
    const overviewMd = await readText(`${modulePath}/overview.md`);
    const moduleTitle = firstHeading(overviewMd) || prettifyFolder(moduleFolder);

    // Unit folders under this module.
    const unitDirs = new Set<string>();
    const unitRe = new RegExp(`^${escapeRegExp(modulePath)}/(unit_[^/]+)/`);
    for (const entry of tree) {
      const m = entry.path.match(unitRe);
      if (m) unitDirs.add(`${modulePath}/${m[1]}`);
    }

    const lessons: BuiltLesson[] = [];
    for (const unitPath of [...unitDirs].sort()) {
      const unitFolder = unitPath.slice(unitPath.lastIndexOf("/") + 1);
      const handout = await readText(`${unitPath}/handout.md`);
      const handoutAr = await readText(`${unitPath}/handout.ar.md`);
      const handoutDe = await readText(`${unitPath}/handout.de.md`);
      const activity = await readText(`${unitPath}/activity.md`);
      const activityAr = await readText(`${unitPath}/activity.ar.md`);
      const activityDe = await readText(`${unitPath}/activity.de.md`);
      const quizMd = await readText(`${unitPath}/quiz.md`);

      const split = handout ? splitTutorContent(handout) : null;
      const ctx = (file: string) => ({
        courseSlug: slug,
        courseRoot: root,
        sourceFilePath: file,
      });

      // Tutor notes = module overview (pedagogy) + this unit's TUTOR_ONLY fences.
      const tutorParts: string[] = [];
      if (overviewMd) {
        tutorParts.push(
          renderCurriculumMarkdown(overviewMd, ctx(`${modulePath}/overview.md`))
        );
      }
      if (split?.tutorMarkdown) {
        tutorParts.push(
          renderCurriculumMarkdown(split.tutorMarkdown, ctx(`${unitPath}/handout.md`))
        );
      }

      lessons.push({
        sourcePath: unitPath,
        order: numericPrefix(unitFolder),
        title: firstHeading(handout) || prettifyFolder(unitFolder),
        content: split
          ? renderCurriculumMarkdown(split.studentMarkdown, ctx(`${unitPath}/handout.md`))
          : null,
        contentAr: handoutAr
          ? renderCurriculumMarkdown(handoutAr, ctx(`${unitPath}/handout.ar.md`))
          : null,
        contentDe: handoutDe
          ? renderCurriculumMarkdown(handoutDe, ctx(`${unitPath}/handout.de.md`))
          : null,
        activity: activity
          ? renderCurriculumMarkdown(activity, ctx(`${unitPath}/activity.md`))
          : null,
        activityAr: activityAr
          ? renderCurriculumMarkdown(activityAr, ctx(`${unitPath}/activity.ar.md`))
          : null,
        activityDe: activityDe
          ? renderCurriculumMarkdown(activityDe, ctx(`${unitPath}/activity.de.md`))
          : null,
        tutorNotes: tutorParts.length ? tutorParts.join("\n") : null,
        quiz: quizMd ? parseQuizMarkdown(quizMd) : null,
      });
    }

    lessons.sort((a, b) => a.order - b.order);
    modules.push({
      sourcePath: modulePath,
      order: moduleOrder,
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

  // Soft-archive modules no longer present in this course.
  await db.module.updateMany({
    where: {
      courseId,
      sourcePath: { notIn: seenModulePaths },
      syncStatus: "ACTIVE",
    },
    data: { syncStatus: "REMOVED" },
  });
}

// Returns true if a write happened (create or content-changing update).
async function persistLesson(moduleId: string, lesson: BuiltLesson): Promise<boolean> {
  const data = {
    title: lesson.title,
    content: lesson.content,
    contentAr: lesson.contentAr,
    contentDe: lesson.contentDe,
    activity: lesson.activity,
    activityAr: lesson.activityAr,
    activityDe: lesson.activityDe,
    tutorNotes: lesson.tutorNotes,
    order: lesson.order,
    type: "TEXT" as const,
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

    for (const root of [...roots].sort()) {
      try {
        const course = await buildCourse(root, tree, readText);
        await persistCourse(course, commitSha, counts);
        seenSlugs.push(course.slug);
      } catch (e) {
        hadError = true;
        console.error(`[curricula] failed to sync course at ${root}:`, e);
      }
    }

    // Soft-archive managed courses that disappeared from the repo.
    const archived = await db.course.updateMany({
      where: { managedByGit: true, slug: { notIn: seenSlugs }, syncStatus: "ACTIVE" },
      data: { syncStatus: "REMOVED", status: "ARCHIVED" },
    });
    counts.coursesArchived = archived.count;

    const status = hadError ? "PARTIAL" : "SUCCESS";
    await db.curriculumSyncRun.update({
      where: { id: run.id },
      data: {
        status,
        commitSha,
        coursesUpserted: counts.coursesUpserted,
        lessonsUpserted: counts.lessonsUpserted,
        coursesArchived: counts.coursesArchived,
        finishedAt: new Date(),
        error: hadError ? "One or more courses failed to sync — see server logs" : null,
      },
    });

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
