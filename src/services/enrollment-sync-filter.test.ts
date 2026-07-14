import { describe, it, expect, vi, beforeEach } from "vitest";

// getUserEnrollments feeds the student/parent dashboards. PRs #20/#22 added the
// syncStatus="ACTIVE" filter to the catalog, course-detail, progress, and admin
// reads but missed this one — so dashboard "my courses" lesson counts still
// tallied Git-removed (soft-archived) lessons. Guard that it now filters at the
// module AND lesson level (module-level matters because removing a whole module
// leaves its lessons ACTIVE).

const findMany = vi.fn();
const findCourse = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    enrollment: { findMany: (args: unknown) => findMany(args) },
    course: { findUnique: (args: unknown) => findCourse(args) },
  },
}));

import { getUserEnrollments } from "@/services/enrollment.service";

const ACTIVE = { syncStatus: "ACTIVE" };

describe("getUserEnrollments excludes soft-archived (REMOVED) curriculum", () => {
  beforeEach(() => {
    findMany.mockReset();
    findCourse.mockReset();
  });

  it("filters course modules and their lessons to ACTIVE", async () => {
    findMany.mockResolvedValue([
      {
        id: "enrollment_1",
        userId: "user_1",
        courseId: "course_1",
        status: "ACTIVE",
        progress: 25,
        enrolledAt: new Date("2026-04-02"),
        completedAt: null,
      },
    ]);
    findCourse.mockResolvedValue({ id: "course_1", modules: [] });

    await getUserEnrollments("user_1");

    const args = findCourse.mock.calls[0][0] as {
      include: {
        modules: {
          where: unknown;
          include: { lessons: { where: unknown } };
        };
      };
    };
    const modules = args.include.modules;
    expect(modules.where).toEqual(ACTIVE);
    expect(modules.include.lessons.where).toEqual(ACTIVE);
  });

  it("preserves the enrollment when curriculum hydration fails", async () => {
    findMany.mockResolvedValue([
      {
        id: "enrollment_1",
        userId: "user_1",
        courseId: "legacy_course",
        status: "ACTIVE",
        progress: 50,
        enrolledAt: new Date("2026-04-02"),
        completedAt: null,
      },
    ]);
    findCourse
      .mockRejectedValueOnce(new Error("legacy curriculum decode failed"))
      .mockResolvedValueOnce({
        id: "legacy_course",
        title: "Legacy course",
        slug: "legacy-course",
      });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await getUserEnrollments("user_1");

    expect(result).toHaveLength(1);
    expect(result[0].course).toMatchObject({
      id: "legacy_course",
      title: "Legacy course",
      modules: [],
    });
    expect(findCourse).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});
