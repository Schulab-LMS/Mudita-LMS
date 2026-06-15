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

// The folder convention a syncable course follows. Three coexist in the repo:
//   "nested" — <root>/modules/module_NN_*/unit_NN_*/<files>  (course → module → unit;
//              e.g. space-science-children-8-12)
//   "flat"   — <root>/module-NN-*/<files>                    (course → module, where
//              each hyphenated module folder IS one lesson; e.g. the programming
//              curriculum's 11-18 age-band stages)
//   "deep"   — <root>/module-NN-*/lesson-NN-*/<files>        (course → module → lesson;
//              hyphenated module folders each holding multiple lesson folders;
//              e.g. the programming curriculum's 5-7 and 8-10 age-band stages)
export type CourseLayout = "nested" | "flat" | "deep";

export interface CourseRoot {
  /** Course-root folder path within the repo. */
  path: string;
  layout: CourseLayout;
}

// Nested: a unit folder under <root>/modules/module_NN_*/. Keyed on the path
// before `/modules/`.
const NESTED_ROOT_RE = /^(.+?)\/modules\/module_[^/]+\//;
// Deep: a lesson file inside a `lesson-NN` folder nested under a hyphenated
// `module-NN` folder (no `modules/` wrapper, hyphenated `lesson-` level). Keyed
// on the path before the module folder. Checked before flat — its extra
// `lesson-NN` level is what distinguishes the two.
const DEEP_LESSON_RE =
  /^(.+?)\/module-\d+[^/]*\/lesson-[^/]+\/(?:handout|presentation|activity|quiz)(?:\.[a-z]{2})?\.md$/i;
// Flat: a lesson file sitting DIRECTLY inside a hyphenated `module-NN` folder
// (no `modules/` wrapper, no `lesson-`/`unit_` level). Keyed on the path before
// the module folder. The `module-` (hyphen) token is what keeps this disjoint
// from nested, whose modules use `module_` (underscore).
const FLAT_LESSON_RE =
  /^(.+?)\/module-\d+[^/]*\/(?:handout|presentation|activity|quiz)(?:\.[a-z]{2})?\.md$/i;

// Discover every course root in the tree, tagged with its layout. Empty subject
// placeholder folders (just a .gitkeep) match no pattern and are ignored. A path
// is assigned at most one layout, in precedence order nested > deep > flat.
export function findCourseRoots(tree: TreeEntry[]): CourseRoot[] {
  const nested = new Set<string>();
  const deep = new Set<string>();
  const flat = new Set<string>();

  for (const entry of tree) {
    if (entry.type !== "blob") continue;
    const n = entry.path.match(NESTED_ROOT_RE);
    if (n) {
      nested.add(n[1]);
      continue;
    }
    const d = entry.path.match(DEEP_LESSON_RE);
    if (d) {
      deep.add(d[1]);
      continue;
    }
    const f = entry.path.match(FLAT_LESSON_RE);
    if (f) flat.add(f[1]);
  }

  const roots: CourseRoot[] = [];
  for (const path of nested) roots.push({ path, layout: "nested" });
  for (const path of deep) {
    if (!nested.has(path)) roots.push({ path, layout: "deep" });
  }
  for (const path of flat) {
    if (!nested.has(path) && !deep.has(path)) roots.push({ path, layout: "flat" });
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
    .replace(/^(module|unit|lesson)[_-]\d+[_-]?/i, "")
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

// ── Lesson resources (resources.md) ──────────────────────────────────────

// One downloadable file or reference link attached to a lesson. `type` drives
// the icon shown in the Resources tab; `url` may be an absolute link or a
// repo-relative path (rewritten to the media proxy at sync time).
export interface LessonResource {
  title: string;
  url: string;
  type:
    | "pdf"
    | "doc"
    | "sheet"
    | "slides"
    | "image"
    | "video"
    | "archive"
    | "audio"
    | "code"
    | "link"
    | "file";
}

const EXT_TYPE: Record<string, LessonResource["type"]> = {
  pdf: "pdf",
  doc: "doc",
  docx: "doc",
  odt: "doc",
  rtf: "doc",
  txt: "doc",
  md: "doc",
  xls: "sheet",
  xlsx: "sheet",
  csv: "sheet",
  ods: "sheet",
  ppt: "slides",
  pptx: "slides",
  odp: "slides",
  key: "slides",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  svg: "image",
  webp: "image",
  mp4: "video",
  webm: "video",
  mov: "video",
  mp3: "audio",
  wav: "audio",
  m4a: "audio",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  py: "code",
  js: "code",
  ts: "code",
  ipynb: "code",
  sb3: "code",
  ino: "code",
};

// Classify a resource by its URL — extension first, then a few well-known video
// hosts, falling back to a generic external link or repo file.
export function resourceTypeFromUrl(url: string): LessonResource["type"] {
  const clean = url.split(/[?#]/)[0];
  const ext = clean.includes(".") ? clean.slice(clean.lastIndexOf(".") + 1).toLowerCase() : "";
  if (ext && EXT_TYPE[ext]) return EXT_TYPE[ext];
  if (/(?:youtube\.com|youtu\.be|vimeo\.com|wistia\.com)/i.test(url)) return "video";
  const isAbsolute = /^([a-z]+:)?\/\//i.test(url) || url.startsWith("mailto:");
  return isAbsolute ? "link" : "file";
}

const RESOURCE_LINK_RE = /^\s*[-*+]\s+\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;

// Parse a resources.md file into a list of resources. Each bullet of the form
// `- [Title](url)` becomes one entry; lines that aren't markdown links are
// ignored so authors can add headings/prose around the list. Pure & db-free so
// it can be unit-tested without the sync pipeline.
export function parseResources(markdown: string | null): LessonResource[] {
  if (!markdown) return [];
  const out: LessonResource[] = [];
  const seen = new Set<string>();
  for (const line of markdown.split(/\r?\n/)) {
    const m = line.match(RESOURCE_LINK_RE);
    if (!m) continue;
    const title = m[1].replace(/[*_`]/g, "").trim();
    const url = m[2].trim();
    if (!title || !url || seen.has(url)) continue;
    seen.add(url);
    out.push({ title, url, type: resourceTypeFromUrl(url) });
  }
  return out;
}
