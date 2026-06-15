import type {
  AgeGroup,
  CourseLevel,
  CourseStatus,
  PlanTier,
} from "@/generated/prisma/client";
import type { TreeEntry } from "@/lib/github-curricula";

// Pure (db-free) helpers that map the curriculum repo's folder/file structure
// onto platform fields. Kept separate from the sync service so they can be
// unit-tested without importing the Prisma client.

export interface CourseMeta {
  slug?: string;
  title?: string;
  titleAr?: string;
  titleDe?: string;
  description?: string;
  ageGroup?: string;
  level?: string;
  category?: string;
  requiredPlan?: string;
  tags?: string[];
  status?: string;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function firstHeading(markdown: string | null): string | null {
  if (!markdown) return null;
  const m = markdown.match(/^\s*#\s+(.+?)\s*$/m);
  return m ? m[1].replace(/[*_`]/g, "").trim() : null;
}

const AGE_BUCKETS: { max: number; group: AgeGroup }[] = [
  { max: 5, group: "AGES_3_5" },
  { max: 8, group: "AGES_6_8" },
  { max: 12, group: "AGES_9_12" },
  { max: 15, group: "AGES_13_15" },
  { max: 18, group: "AGES_16_18" },
];

const VALID_AGE_GROUPS = new Set<string>([
  "AGES_3_5",
  "AGES_6_8",
  "AGES_9_12",
  "AGES_13_15",
  "AGES_16_18",
]);

// Map an explicit enum value, or derive from an age range like "8-12" by its
// midpoint. Falls back to AGES_9_12 when nothing parses.
export function resolveAgeGroup(raw: string | undefined, folder: string): AgeGroup {
  if (raw && VALID_AGE_GROUPS.has(raw)) return raw as AgeGroup;
  const source = raw || folder;
  const nums = source.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length > 0) {
    const mid = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
    for (const bucket of AGE_BUCKETS) {
      if (mid <= bucket.max) return bucket.group;
    }
    return "AGES_16_18";
  }
  return "AGES_9_12";
}

export function resolveLevel(raw: string | undefined): CourseLevel {
  const v = (raw || "").toUpperCase();
  if (v === "BEGINNER" || v === "INTERMEDIATE" || v === "ADVANCED") return v;
  return "BEGINNER";
}

// Decision: courses without an explicit PUBLISHED status default to DRAFT so
// not-yet-fence-tagged content stays hidden from students.
export function resolveStatus(raw: string | undefined): CourseStatus {
  const v = (raw || "").toUpperCase();
  if (v === "PUBLISHED" || v === "ARCHIVED" || v === "DRAFT") return v;
  return "DRAFT";
}

export function resolvePlan(raw: string | undefined): PlanTier | null {
  const v = (raw || "").toUpperCase();
  if (v === "FREE" || v === "LEARNER" || v === "PRO" || v === "LIFETIME") return v;
  return null;
}

// The folder convention a syncable course follows. Two coexist in the repo:
//   "nested" — <root>/modules/module_NN_*/unit_NN_*/<files>  (course → module → unit;
//              e.g. space-science-children-8-12)
//   "flat"   — <root>/module-NN-*/<files>                    (course → module, where
//              each hyphenated module folder IS one lesson; e.g. the programming
//              curriculum's age-band stages)
export type CourseLayout = "nested" | "flat";

export interface CourseRoot {
  /** Course-root folder path within the repo. */
  path: string;
  layout: CourseLayout;
}

// Nested: a unit folder under <root>/modules/module_NN_*/. Keyed on the path
// before `/modules/`.
const NESTED_ROOT_RE = /^(.+?)\/modules\/module_[^/]+\//;
// Flat: a lesson file sitting DIRECTLY inside a hyphenated `module-NN` folder
// (no `modules/` wrapper, no `unit_` level). Keyed on the path before the module
// folder. The `module-` (hyphen) token is what keeps this disjoint from nested,
// whose modules use `module_` (underscore).
const FLAT_LESSON_RE =
  /^(.+?)\/module-\d+[^/]*\/(?:handout|presentation|activity|quiz)(?:\.[a-z]{2})?\.md$/i;

// Discover every course root in the tree, tagged with its layout. Empty subject
// placeholder folders (just a .gitkeep) match neither pattern and are ignored.
// A path that qualifies as nested is never also treated as flat.
export function findCourseRoots(tree: TreeEntry[]): CourseRoot[] {
  const nested = new Set<string>();
  const flat = new Set<string>();

  for (const entry of tree) {
    if (entry.type !== "blob") continue;
    const n = entry.path.match(NESTED_ROOT_RE);
    if (n) {
      nested.add(n[1]);
      continue;
    }
    const f = entry.path.match(FLAT_LESSON_RE);
    if (f) flat.add(f[1]);
  }

  const roots: CourseRoot[] = [];
  for (const path of nested) roots.push({ path, layout: "nested" });
  for (const path of flat) {
    if (!nested.has(path)) roots.push({ path, layout: "flat" });
  }
  return roots;
}

// Reads the order from a `module_NN_*` / `unit_NN_*` (underscore) or
// `module-NN-*` (hyphen) folder name — the first separator-prefixed number.
export function numericPrefix(folder: string): number {
  const m = folder.match(/[_-](\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export function prettifyFolder(folder: string): string {
  return folder
    .replace(/^(module|unit)[_-]\d+[_-]?/i, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Human course title from a flat-layout stage folder, dropping a leading
// age-range token: "11-13-programming-fundamentals" → "Programming Fundamentals",
// "5-7-computational-thinking" → "Computational Thinking".
export function prettifyCourseFolder(folder: string): string {
  return prettifyFolder(folder.replace(/^\d+[-_]\d+[-_]?/, ""));
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
