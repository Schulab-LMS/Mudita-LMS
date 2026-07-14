import { describe, expect, it } from "vitest";
import { usersToCsv } from "./user-export";

describe("usersToCsv", () => {
  it("exports user rows and safely escapes commas and quotes", () => {
    const csv = usersToCsv([
      {
        name: 'Mohammed, Aisha "Ace"',
        email: "aisha@example.com",
        role: "STUDENT",
        isActive: true,
        enrollmentCount: 2,
        createdAt: "2026-04-02T00:00:00.000Z",
      },
    ]);

    expect(csv).toContain(
      '"Mohammed, Aisha ""Ace""",aisha@example.com,STUDENT,Active,2,2026-04-02T00:00:00.000Z'
    );
  });
});
