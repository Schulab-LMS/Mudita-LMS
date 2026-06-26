import { describe, it, expect, vi, beforeEach } from "vitest";

// The platform DB is the single source of truth for course metadata + catalog
// organisation; the Git sync owns CONTENT only. These tests pin that contract
// at the persistence boundary so a future refactor can't quietly let the sync
// start writing course names / age groups / levels / status again.

vi.mock("@/lib/db", () => ({
  db: {
    course: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
    module: { findMany: vi.fn(), updateMany: vi.fn() },
    lesson: { updateMany: vi.fn() },
  },
}));

import { db } from "@/lib/db";
import { persistCourse } from "./curriculum-sync.service";

type CourseArg = Parameters<typeof persistCourse>[0];

// A repo-built course carrying a full (and deliberately wrong) set of metadata.
// The platform must ignore every descriptive field for a course that exists.
const builtCourse = {
  slug: "space-science-missions",
  sourcePath: "space-science/age-groups/8-10-young-learners-s1",
  title: "REPO TITLE — must never overwrite the platform name",
  titleAr: "عنوان من المستودع",
  titleDe: "Repo-Titel",
  description: "Repo-derived description",
  ageGroup: "AGES_3_5",
  level: "ADVANCED",
  category: "Space Science",
  requiredPlan: "PRO",
  tags: ["repo-tag"],
  status: "PUBLISHED",
  modules: [],
} as unknown as CourseArg;

// Platform-owned fields the sync must never appear to write on update.
const PLATFORM_METADATA_KEYS = [
  "title", "titleAr", "titleDe", "description", "descriptionAr", "descriptionDe",
  "ageGroup", "level", "category", "tags", "requiredPlan", "status",
  "skills", "tools", "price", "isFree", "currency", "thumbnail",
];

// The only fields the sync owns.
const PROVENANCE_KEYS = ["managedByGit", "sourcePath", "sourceCommitSha", "syncStatus"];

describe("persistCourse — platform owns course metadata", () => {
  beforeEach(() => {
    vi.mocked(db.course.findUnique).mockReset();
    vi.mocked(db.course.update).mockReset();
    vi.mocked(db.course.create).mockReset();
    vi.mocked(db.module.findMany).mockReset().mockResolvedValue([] as never);
    vi.mocked(db.module.updateMany).mockReset();
  });

  it("writes ONLY sync provenance (never metadata) for an existing course", async () => {
    vi.mocked(db.course.findUnique).mockResolvedValue({ id: "course_1" } as never);

    const counts = { coursesUpserted: 0, lessonsUpserted: 0, coursesArchived: 0 };
    await persistCourse(builtCourse, "commitsha123", counts);

    expect(db.course.create).not.toHaveBeenCalled();
    expect(db.course.update).toHaveBeenCalledTimes(1);

    const { data } = vi.mocked(db.course.update).mock.calls[0][0] as {
      data: Record<string, unknown>;
    };

    // Exactly the provenance fields — nothing else may be written.
    expect(new Set(Object.keys(data))).toEqual(new Set(PROVENANCE_KEYS));
    for (const key of PLATFORM_METADATA_KEYS) {
      expect(data).not.toHaveProperty(key);
    }
    expect(data).toMatchObject({
      managedByGit: true,
      sourcePath: builtCourse.sourcePath,
      sourceCommitSha: "commitsha123",
      syncStatus: "ACTIVE",
    });
    // Existing course is not counted as newly imported.
    expect(counts.coursesUpserted).toBe(0);
  });

  it("bootstraps a NEW course as a hidden DRAFT shell and never publishes/gates from the repo", async () => {
    vi.mocked(db.course.findUnique).mockResolvedValue(null);
    vi.mocked(db.course.create).mockResolvedValue({ id: "course_new" } as never);

    const counts = { coursesUpserted: 0, lessonsUpserted: 0, coursesArchived: 0 };
    await persistCourse(builtCourse, "commitsha123", counts);

    expect(db.course.update).not.toHaveBeenCalled();
    expect(db.course.create).toHaveBeenCalledTimes(1);

    const { data } = vi.mocked(db.course.create).mock.calls[0][0] as {
      data: Record<string, unknown>;
    };

    // Hidden on creation regardless of the repo's declared status…
    expect(data.status).toBe("DRAFT");
    // …and access gating is never seeded from the repo (stays a platform call).
    expect(data).not.toHaveProperty("requiredPlan");
    expect(data).toMatchObject({
      slug: builtCourse.slug,
      managedByGit: true,
      syncStatus: "ACTIVE",
      sourceCommitSha: "commitsha123",
    });
    expect(counts.coursesUpserted).toBe(1);
  });
});
