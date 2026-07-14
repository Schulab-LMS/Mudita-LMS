import { beforeEach, describe, expect, it, vi } from "vitest";

const findParentChildren = vi.fn();
const getUserEnrollments = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    parentChild: { findMany: (args: unknown) => findParentChildren(args) },
  },
}));

vi.mock("@/services/enrollment.service", () => ({
  getUserEnrollments: (userId: string) => getUserEnrollments(userId),
}));

import { getChildren } from "@/services/user.service";

describe("getChildren", () => {
  beforeEach(() => {
    findParentChildren.mockReset();
    getUserEnrollments.mockReset();
  });

  it("uses the shared enrollment loader for cross-role consistency", async () => {
    findParentChildren.mockResolvedValue([
      {
        parentId: "parent_1",
        childId: "child_1",
        child: { id: "child_1", name: "Aisha" },
      },
    ]);
    getUserEnrollments.mockResolvedValue([
      {
        id: "enrollment_1",
        status: "ACTIVE",
        progress: 50,
        course: { title: "Wonder Lab" },
      },
    ]);

    const children = await getChildren("parent_1");

    expect(getUserEnrollments).toHaveBeenCalledWith("child_1");
    expect(children[0]).toMatchObject({
      id: "child_1",
      enrollments: [{ id: "enrollment_1" }],
    });
  });
});
