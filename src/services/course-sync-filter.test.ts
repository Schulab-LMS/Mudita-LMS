import { describe, it, expect, vi, beforeEach } from "vitest";

// Regression guard for the curriculum-rename duplication bug.
//
// The curriculum sync soft-archives stale modules/lessons (syncStatus =
// "REMOVED") when folders are renamed in the STEM-Curricula repo — it never
// deletes them. Every course reader must therefore exclude REMOVED rows, the
// same way session.service does for the live classroom. When a reader forgets
// the filter, the superseded copy renders alongside the live one (the admin
// "12 modules · 56 lessons" duplication). These tests assert the catalog and
// course-detail readers carry the `syncStatus: "ACTIVE"` filter at BOTH the
// module and lesson level — module-level hides archived modules, lesson-level
// hides within-module rename leftovers (a REMOVED lesson under an ACTIVE
// module).

const findUnique = vi.fn();
const findMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    course: {
      findUnique: (args: unknown) => findUnique(args),
      findMany: (args: unknown) => findMany(args),
    },
  },
}));

import {
  getCourseBySlug,
  getCourses,
  getFeaturedCourses,
} from "@/services/course.service";

// Modules ride in either `include` (detail) or `select` (lean) form.
type AnyArgs = {
  include?: { modules?: Record<string, unknown> };
  select?: { modules?: Record<string, unknown> };
};
function moduleArg(args: AnyArgs): Record<string, unknown> {
  const mod = args.include?.modules ?? args.select?.modules;
  if (!mod) throw new Error("query did not include modules");
  return mod;
}

const ACTIVE = { syncStatus: "ACTIVE" };

describe("course.service excludes soft-archived (REMOVED) curriculum rows", () => {
  beforeEach(() => {
    findUnique.mockReset();
    findMany.mockReset();
  });

  it("getCourseBySlug filters modules and their lessons to ACTIVE", async () => {
    findUnique.mockResolvedValue({
      id: "c1",
      organizationId: null,
      modules: [],
      _count: { enrollments: 0 },
    });

    await getCourseBySlug("scratch-basics");

    const mod = moduleArg(findUnique.mock.calls[0][0]);
    expect(mod.where).toEqual(ACTIVE);
    expect((mod.include as { lessons: { where: unknown } }).lessons.where).toEqual(ACTIVE);
  });

  it("getCourses filters modules and the lesson _count to ACTIVE", async () => {
    findMany.mockResolvedValue([]);

    await getCourses();

    const mod = moduleArg(findMany.mock.calls[0][0]);
    expect(mod.where).toEqual(ACTIVE);
    const count = (mod.include as {
      _count: { select: { lessons: { where: unknown } } };
    })._count.select.lessons.where;
    expect(count).toEqual(ACTIVE);
  });

  it("getFeaturedCourses filters modules and the lesson _count to ACTIVE", async () => {
    findMany.mockResolvedValue([]);

    await getFeaturedCourses();

    const mod = moduleArg(findMany.mock.calls[0][0]);
    expect(mod.where).toEqual(ACTIVE);
    const count = (mod.include as {
      _count: { select: { lessons: { where: unknown } } };
    })._count.select.lessons.where;
    expect(count).toEqual(ACTIVE);
  });
});
