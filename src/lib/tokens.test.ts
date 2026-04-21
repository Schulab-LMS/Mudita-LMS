import { describe, it, expect } from "vitest";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "./tokens";

describe("generateVerificationToken", () => {
  it("produces a 64-char hex string (32 random bytes)", () => {
    const t = generateVerificationToken();
    expect(t).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produces different values on each call", () => {
    const a = generateVerificationToken();
    const b = generateVerificationToken();
    expect(a).not.toBe(b);
  });
});

describe("hashVerificationToken", () => {
  it("is deterministic for the same input", () => {
    const t = "test-token-value";
    expect(hashVerificationToken(t)).toBe(hashVerificationToken(t));
  });

  it("produces a 64-char hex SHA-256 digest", () => {
    expect(hashVerificationToken("x")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("diverges for different inputs", () => {
    expect(hashVerificationToken("a")).not.toBe(hashVerificationToken("b"));
  });

  it("does not echo the plaintext token", () => {
    const t = "hello-world";
    expect(hashVerificationToken(t)).not.toContain(t);
  });
});
