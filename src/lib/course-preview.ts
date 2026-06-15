/**
 * Pure analysis helpers for the public course preview page.
 *
 * After a curriculum sync, lessons carry a `type`, an optional hands-on
 * `activity`, a 1:1 `quiz`, and Reveal.js `presentationContent`. The preview
 * page used to render only flat lesson titles, which made even rich synced
 * courses look "basic". These helpers turn that raw structure into the
 * content-mix counts and the hands-on projects list the preview renders.
 *
 * Kept free of React / DB imports so it can be unit-tested in isolation.
 */

/** Visual category for a lesson, derived from its type + attached content. */
export type LessonKind =
  | "video"
  | "reading"
  | "quiz"
  | "interactive"
  | "presentation"
  | "project";

/** Minimal lesson shape the analysis needs — a subset of the Prisma row. */
export interface PreviewLesson {
  id: string;
  title: string;
  type: string;
  activity?: string | null;
  content?: string | null;
  presentationContent?: string | null;
  duration?: number | null;
  isFree?: boolean;
  quiz?: { _count?: { questions: number } } | null;
}

export interface PreviewModule {
  id: string;
  title: string;
  lessons: PreviewLesson[];
}

export interface ContentMix {
  videos: number;
  readings: number;
  quizzes: number;
  interactive: number;
  presentations: number;
  projects: number;
  totalQuestions: number;
}

export interface HandsOnProject {
  id: string;
  title: string;
  moduleTitle: string;
}

export interface ModuleSummary {
  videos: number;
  quizzes: number;
  projects: number;
  presentations: number;
}

function hasText(value?: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/** True when the lesson ships a take-home/hands-on activity. */
export function isHandsOnProject(lesson: PreviewLesson): boolean {
  return lesson.type === "ASSIGNMENT" || hasText(lesson.activity);
}

/**
 * Classify a lesson into a single visual kind. Order matters: a lesson with a
 * quiz is shown as a quiz even if its base type is VIDEO, and an assignment is
 * shown as a project. Quizzes win first because the question count is the
 * stronger signal of what the learner actually does.
 */
export function lessonKind(lesson: PreviewLesson): LessonKind {
  if (lesson.type === "QUIZ" || lesson.quiz) return "quiz";
  if (lesson.type === "ASSIGNMENT" || hasText(lesson.activity)) return "project";
  if (lesson.type === "PRESENTATION" || hasText(lesson.presentationContent))
    return "presentation";
  if (lesson.type === "INTERACTIVE") return "interactive";
  if (lesson.type === "TEXT") return "reading";
  return "video";
}

/** Aggregate the content mix across every lesson in the course. */
export function analyzeContentMix(modules: PreviewModule[]): ContentMix {
  const mix: ContentMix = {
    videos: 0,
    readings: 0,
    quizzes: 0,
    interactive: 0,
    presentations: 0,
    projects: 0,
    totalQuestions: 0,
  };

  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      switch (lessonKind(lesson)) {
        case "video":
          mix.videos += 1;
          break;
        case "reading":
          mix.readings += 1;
          break;
        case "quiz":
          mix.quizzes += 1;
          mix.totalQuestions += lesson.quiz?._count?.questions ?? 0;
          break;
        case "interactive":
          mix.interactive += 1;
          break;
        case "presentation":
          mix.presentations += 1;
          break;
        case "project":
          mix.projects += 1;
          break;
      }
    }
  }

  return mix;
}

/** Per-module headline counts used for the curriculum accordion chips. */
export function summarizeModule(mod: PreviewModule): ModuleSummary {
  const summary: ModuleSummary = {
    videos: 0,
    quizzes: 0,
    projects: 0,
    presentations: 0,
  };
  for (const lesson of mod.lessons) {
    switch (lessonKind(lesson)) {
      case "quiz":
        summary.quizzes += 1;
        break;
      case "project":
        summary.projects += 1;
        break;
      case "presentation":
        summary.presentations += 1;
        break;
      case "video":
        summary.videos += 1;
        break;
    }
  }
  return summary;
}

/** Flat list of hands-on projects, capped, for the projects showcase. */
export function collectHandsOnProjects(
  modules: PreviewModule[],
  limit = 6
): HandsOnProject[] {
  const projects: HandsOnProject[] = [];
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      if (isHandsOnProject(lesson)) {
        projects.push({
          id: lesson.id,
          title: lesson.title,
          moduleTitle: mod.title,
        });
        if (projects.length >= limit) return projects;
      }
    }
  }
  return projects;
}
