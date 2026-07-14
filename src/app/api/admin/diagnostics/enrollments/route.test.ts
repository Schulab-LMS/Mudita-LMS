import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  userFindUnique: vi.fn(),
  enrollmentFindMany: vi.fn(),
  queryRaw: vi.fn(),
  pgQuery: vi.fn(),
  pgEnd: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: mocks.userFindUnique },
    enrollment: { findMany: mocks.enrollmentFindMany },
    $queryRaw: mocks.queryRaw,
  },
}));
vi.mock("pg", () => ({
  Pool: vi.fn(() => ({
    query: mocks.pgQuery,
    end: mocks.pgEnd,
  })),
}));

import { GET } from "./route";

describe("admin enrollment diagnostics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests without querying data", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await GET(
      new Request("https://example.test/api/admin/diagnostics/enrollments?email=aisha@example.com")
    );

    expect(response.status).toBe(401);
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("rejects authenticated non-admin users", async () => {
    mocks.auth.mockResolvedValue({
      user: { id: "student_1", role: "STUDENT" },
    });

    const response = await GET(
      new Request("https://example.test/api/admin/diagnostics/enrollments?email=aisha@example.com")
    );

    expect(response.status).toBe(403);
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
  });

  it("compares nested, direct, relational, and raw enrollment rows", async () => {
    const row = {
      id: "enrollment_1",
      userId: "student_1",
      courseId: "course_1",
      status: "ACTIVE",
      progress: 50,
      enrolledAt: new Date("2026-04-02T00:00:00.000Z"),
    };
    mocks.auth.mockResolvedValue({
      user: { id: "admin_1", role: "ADMIN" },
    });
    mocks.userFindUnique.mockResolvedValue({
      id: "student_1",
      email: "aisha@example.com",
      _count: { enrollments: 1 },
      enrollments: [row],
    });
    mocks.enrollmentFindMany.mockResolvedValue([row]);
    mocks.queryRaw
      .mockResolvedValueOnce([row])
      .mockResolvedValueOnce([
        {
          ...row,
          userEmail: "aisha@example.com",
          userName: "Aisha Mohammed",
          courseTitle: "Wonder Lab",
        },
      ]);
    mocks.pgQuery.mockResolvedValue({ rows: [row] });
    mocks.pgEnd.mockResolvedValue(undefined);

    const response = await GET(
      new Request("https://example.test/api/admin/diagnostics/enrollments?email=AISHA@example.com")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.consistent).toBe(true);
    expect(body.counts).toEqual({
      relationCount: 1,
      nestedRows: 1,
      directRows: 1,
      relationalRows: 1,
      rawRows: 1,
      nodePgRows: 1,
    });
    expect(mocks.enrollmentFindMany).toHaveBeenCalledTimes(2);
    expect(mocks.queryRaw).toHaveBeenCalledTimes(2);
    expect(body.rows.allRawOwners).toHaveLength(1);
    expect(body.rows.nodePg).toHaveLength(1);
    expect(mocks.pgEnd).toHaveBeenCalledOnce();
  });
});
