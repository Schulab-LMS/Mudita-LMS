import { describe, expect, it } from "vitest";
import {
  filterAdminUsers,
  type AdminUserTableRow,
} from "./user-filter";

const users: AdminUserTableRow[] = [
  {
    id: "aisha",
    name: "Aisha Mohammed",
    email: "aisha@example.com",
    role: "STUDENT",
    isActive: true,
    createdAt: "2026-04-02T00:00:00.000Z",
    enrollmentCount: 2,
    hasComp: false,
    isSelf: false,
  },
  {
    id: "marcus",
    name: "Dr. Marcus Lee",
    email: "marcus@example.com",
    role: "TUTOR",
    isActive: true,
    createdAt: "2026-04-02T00:00:00.000Z",
    enrollmentCount: 0,
    hasComp: false,
    isSelf: false,
  },
  {
    id: "disabled",
    name: "Disabled Student",
    email: "disabled@example.com",
    role: "STUDENT",
    isActive: false,
    createdAt: "2026-04-02T00:00:00.000Z",
    enrollmentCount: 0,
    hasComp: false,
    isSelf: false,
  },
];

describe("filterAdminUsers", () => {
  it("searches names and emails case-insensitively", () => {
    expect(
      filterAdminUsers(users, { query: " AISHA@EXAMPLE ", role: "", status: "" })
    ).toEqual([users[0]]);
    expect(
      filterAdminUsers(users, { query: "marcus lee", role: "", status: "" })
    ).toEqual([users[1]]);
  });

  it("filters by role and status", () => {
    expect(
      filterAdminUsers(users, {
        query: "",
        role: "STUDENT",
        status: "inactive",
      })
    ).toEqual([users[2]]);
  });

  it("combines query, role, and status filters", () => {
    expect(
      filterAdminUsers(users, {
        query: "student",
        role: "STUDENT",
        status: "active",
      })
    ).toEqual([]);
  });
});
