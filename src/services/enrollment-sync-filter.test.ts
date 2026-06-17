import { describe, it, expect, vi, beforeEach } from "vitest";

// getUserEnrollments feeds the student/parent dashboards. PRs #20/#22 added the
// syncStatus="ACTIVE" filter to the catalog, course-detail, progress, and admin
// reads but missed this one — so dashboard "my courses" lesson counts still
// tallied Git-removed (soft-archived) lessons. Guard that it now filters at the
// module AND lesson level (module-level matters because removing a whole module
// leaves its lessons ACTIVE).

const findMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: { enrollment: { findMany: (args: unknown) => findMany(args) } },
}));

import { getUserEnrollments } from "@/services/enrollment.service";

const ACTIVE = { syncStatus: "ACTIVE" };

describe("getUserEnrollments excludes soft-archived (REMOVED) curriculum", () => {
  beforeEach(() => findMany.mockReset());

  it("filters course modules and their lessons to ACTIVE", async () => {
    findMany.mockResolvedValue([]);

    await getUserEnrollments("user_1");

    const args = findMany.mock.calls[0][0] as {
      include: {
        course: {
          include: {
            modules: { where: unknown; include: { lessons: { where: unknown } } };
          };
        };
      };
    };
    const modules = args.include.course.include.modules;
    expect(modules.where).toEqual(ACTIVE);
    expect(modules.include.lessons.where).toEqual(ACTIVE);
  });
});
