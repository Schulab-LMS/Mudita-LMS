// Canonical-list loader. Agents may only SELECT from these lists — never invent
// a course, slug, age band, source, or character. Loaded from the catalog data
// files (the seed source of truth), DB-free, so it's deterministic + testable.

import type { AgeBand } from "../../../prisma/catalog/types";
import { COURSES_AGES_3_5 } from "../../../prisma/catalog/courses-ages-3-5.data";
import { COURSES_AGES_5_7 } from "../../../prisma/catalog/courses-ages-5-7.data";
import { COURSES_AGES_8_10 } from "../../../prisma/catalog/courses-ages-8-10.data";
import { COURSES_AGES_11_13 } from "../../../prisma/catalog/courses-ages-11-13.data";
import { COURSES_SCIENCE } from "../../../prisma/catalog/courses-science.data";
import { COURSES_TEENS } from "../../../prisma/catalog/courses-teens.data";
import { COURSES_CURRICULUM } from "../../../prisma/catalog/courses-curriculum.data";
import { BUNDLES } from "../../../prisma/catalog/bundles.data";
import { PATHWAYS } from "../../../prisma/catalog/pathways.data";
import { REFERENCE_SOURCES } from "../../../prisma/catalog/reference-sources.data";

// Lumo character variants by age band (docs/curriculum-production/character-system.md).
const LUMO_VARIANTS: Record<AgeBand, string> = {
  AGES_3_5: "Lumo Mini",
  AGES_5_7: "Lumo Junior",
  AGES_8_10: "Lumo Creator",
  AGES_11_13: "Lumo Explorer",
  AGES_14_16: "Lumo Innovator",
  AGES_17_18: "Lumo Mentor",
};

// Human-readable age range per band, for meta.yml `ageRange`.
const AGE_RANGE: Record<AgeBand, string> = {
  AGES_3_5: "3–5",
  AGES_5_7: "5–7",
  AGES_8_10: "8–10",
  AGES_11_13: "11–13",
  AGES_14_16: "14–16",
  AGES_17_18: "17–18",
};

export interface CatalogCourseRef {
  slug: string;
  title: string;
  ageGroup: AgeBand;
  category: string;
}

export interface CatalogSourceRef {
  key: string;
  name: string;
  url: string;
  provider: string;
  sourceType: string;
  status: string;
}

export interface Catalog {
  courses: CatalogCourseRef[];
  courseSlugs: Set<string>;
  bundleSlugs: Set<string>;
  pathwaySlugs: Set<string>;
  ageGroups: AgeBand[];
  sources: CatalogSourceRef[];
  sourceKeys: Set<string>;
  lumoVariants: Record<AgeBand, string>;
}

const ALL_COURSES = [
  ...COURSES_AGES_3_5,
  ...COURSES_AGES_5_7,
  ...COURSES_AGES_8_10,
  ...COURSES_AGES_11_13,
  ...COURSES_SCIENCE,
  ...COURSES_TEENS,
  ...COURSES_CURRICULUM,
];

export function loadCatalog(): Catalog {
  const courses: CatalogCourseRef[] = ALL_COURSES.map((c) => ({
    slug: c.slug,
    title: c.title,
    ageGroup: c.ageGroup,
    category: c.category,
  }));
  const sources: CatalogSourceRef[] = REFERENCE_SOURCES.map((s) => ({
    key: s.key,
    name: s.name,
    url: s.url,
    provider: s.provider,
    sourceType: s.sourceType,
    status: s.status,
  }));

  return {
    courses,
    courseSlugs: new Set(courses.map((c) => c.slug)),
    bundleSlugs: new Set(BUNDLES.map((b) => b.slug)),
    pathwaySlugs: new Set(PATHWAYS.map((p) => p.slug)),
    ageGroups: Object.keys(LUMO_VARIANTS) as AgeBand[],
    sources,
    sourceKeys: new Set(sources.map((s) => s.key)),
    lumoVariants: LUMO_VARIANTS,
  };
}

export function findCourse(catalog: Catalog, slug: string): CatalogCourseRef | undefined {
  return catalog.courses.find((c) => c.slug === slug);
}

export function lumoForBand(band: AgeBand): string {
  return LUMO_VARIANTS[band];
}

export function ageRangeForBand(band: AgeBand): string {
  return AGE_RANGE[band];
}

/** Only sources usable to GROUND curriculum (ACTIVE/OPTIONAL); never invent one. */
export function curriculumSources(catalog: Catalog): CatalogSourceRef[] {
  return catalog.sources.filter((s) => s.status === "ACTIVE" || s.status === "OPTIONAL");
}
