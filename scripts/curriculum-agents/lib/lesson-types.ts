// The assembled lesson shape the orchestrator builds and the writer serializes.
// Mirrors the STEM-Curricula repo's lesson conventions (meta.yml + handout.md +
// activity.md + presentation.md + tutor.md + quiz.md + resources.md) so the
// output syncs cleanly via curriculum-sync.

import type { AgeBand } from "../../../prisma/catalog/types";

export type { AgeBand };

/** One source reference, matching meta.yml `source` / `secondarySources` items. */
export interface MetaSource {
  provider: string;
  course?: string;
  unit?: string;
  item?: string;
  url: string;
  license?: string;
}

export interface QuizQuestion {
  prompt: string;
  /** Answer options in display order. */
  options: string[];
  /** 0-based index of the correct option. */
  answerIndex: number;
  explanation?: string;
}

export interface LessonResource {
  title: string;
  url: string;
  type: string; // pdf | doc | sheet | slides | image | video | link | …
}

/** One generated section → the approved source passage that grounds it. */
export interface SectionCitation {
  section: string; // handout | activity | presentation | quiz
  sourceKey?: string; // ReferenceSource.key
  sourceUrl?: string;
  confidence?: number;
}

/** The complete, assembled lesson ready to write to a folder + open as a PR. */
export interface LessonDraft {
  slug: string;
  title: string;
  ageGroup: AgeBand;
  ageRange: string; // "8–10"
  category: string;
  courseSlug: string;
  /** Lumo variant for this age band (e.g. "Lumo Creator"). */
  characterVariant: string;

  source: MetaSource;
  secondarySources: MetaSource[];
  learningObjectives: string[];

  handoutMd: string;
  activityMd: string;
  presentationMd: string;
  tutorMd: string;
  parentNote: string;
  safetyNote?: string;

  quizId: string;
  quiz: QuizQuestion[];
  resources: LessonResource[];

  citations: SectionCitation[];

  // ── Optional layers (Steps 6, 10, 13) — present when those agents run. ──
  /** Entertainment layer (Step 6): mission/quest framing for the lesson. */
  mission?: LessonMission;
  /** Extended assessment (Step 10) beyond the quiz. */
  practiceTasks?: string[];
  projectRubric?: RubricCriterion[];
  certificateCriteria?: string[];
  /** Tutor support (Step 13): seeded as LessonQuestion at publish. */
  commonQuestions?: CommonQuestion[];
}

export interface LessonMission {
  title: string;
  storyHook: string;
  challenge: string;
  badgeName: string;
}

export interface RubricCriterion {
  criterion: string;
  meets: string;
  exceeds: string;
}

export interface CommonQuestion {
  question: string;
  answer: string;
}
