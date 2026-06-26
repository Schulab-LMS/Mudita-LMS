// Shared, self-contained types for the SchuLab catalog seed data.
//
// Data files intentionally use string-literal unions (not the generated Prisma
// enum *values*) so each `*.data.ts` is a pure data module with no runtime
// imports. seed-catalog.ts casts these strings onto the Prisma enums at write
// time (they are 1:1 string-compatible).

export type AgeBand =
  | "AGES_3_5"
  | "AGES_5_7"
  | "AGES_8_10"
  | "AGES_11_13"
  | "AGES_14_16"
  | "AGES_17_18";

export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type Plan = "FREE" | "LEARNER" | "PRO" | "LIFETIME";

export type ContentStatusKey =
  | "SEED_NOW"
  | "NEEDS_REVIEW"
  | "OPTIONAL_ENRICHMENT"
  | "IMPORTED_EXISTING";

export type SourceStatusKey = "ACTIVE" | "HISTORICAL" | "OPTIONAL" | "ENRICHMENT";

/** Stable handle used to attach a source without knowing its generated id. */
export type SourceKey = string;

export interface CatalogReferenceSource {
  key: SourceKey;
  name: string;
  url: string;
  provider: string;
  sourceType: string;
  relatedTopics: string[];
  recommendedAgeRange?: string;
  usageInSchulab: string;
  status: SourceStatusKey;
  notes?: string;
}

export interface CatalogLesson {
  title: string;
  duration?: number; // seconds; defaults applied in seed-catalog
  isFree?: boolean;
}

export interface CatalogModule {
  title: string;
  lessons: CatalogLesson[];
}

export interface CatalogCourse {
  slug: string;
  title: string;
  ageGroup: AgeBand;
  level: Level;
  /** One of: CODING, AI, SCIENCE, ROBOTICS, DATA, ARTS, ENGINEERING,
   *  ENTREPRENEURSHIP, TECHNOLOGY. (Free string; kept to this set for filters.) */
  category: string;
  description: string;
  parentSummary: string;
  studentSummary: string;
  skills: string[];
  tools: string[];
  finalProjectTitle: string;
  finalProjectDescription: string;
  /** ReferenceSource.key values credited on this course. */
  referenceKeys: SourceKey[];
  isFree?: boolean;
  requiredPlan?: Plan | null;
  price?: number;
  status?: "PUBLISHED" | "DRAFT";
  contentStatus?: ContentStatusKey;
  adminNotes?: string;
  prereqSlug?: string | null;
  /** Linear "next recommended course" pointer (slug). */
  nextSlug?: string | null;
  /** When true, maps to an already-seeded course: seed-catalog only enriches
   *  catalog metadata + reference links and never recreates modules/lessons. */
  existing?: boolean;
  modules?: CatalogModule[];
}

export interface CatalogBundle {
  slug: string;
  title: string;
  description: string;
  themeCategory: string;
  ageGroup: AgeBand;
  level: Level;
  requiredPlan?: Plan | null;
  isFree?: boolean;
  finalProjectTitle: string;
  finalProjectDescription: string;
  learningObjectives: string[];
  recommendedDurationWeeks: number;
  referenceKeys: SourceKey[];
  adminNotes?: string;
  /** Ordered course slugs; isRequired defaults true. */
  courses: { slug: string; isRequired?: boolean }[];
}

export interface CatalogPathwayStage {
  bundleSlug?: string;
  courseSlug?: string;
  title?: string;
}

export interface CatalogPathway {
  slug: string;
  title: string;
  description: string;
  ageGroup: AgeBand;
  order: number;
  referenceKeys: SourceKey[];
  adminNotes?: string;
  stages: CatalogPathwayStage[];
}
