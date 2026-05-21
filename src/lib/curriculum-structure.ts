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

// Find course-root folders: any directory containing a `modules/` subtree with
// unit files. Keyed by the path before `/modules/`.
export function findCourseRoots(tree: TreeEntry[]): Set<string> {
  const roots = new Set<string>();
  const re = /^(.+?)\/modules\/module_[^/]+\//;
  for (const entry of tree) {
    if (entry.type !== "blob") continue;
    const m = entry.path.match(re);
    if (m) roots.add(m[1]);
  }
  return roots;
}

export function numericPrefix(folder: string): number {
  const m = folder.match(/_(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export function prettifyFolder(folder: string): string {
  return folder
    .replace(/^(module|unit)_\d+_?/i, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
