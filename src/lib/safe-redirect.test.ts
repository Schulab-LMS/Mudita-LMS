import { describe, it, expect } from "vitest";
import { isSafeInternalPath } from "./safe-redirect";

describe("isSafeInternalPath", () => {
  it("accepts ordinary absolute paths", () => {
    expect(isSafeInternalPath("/student")).toBe(true);
    expect(isSafeInternalPath("/courses/intro?tab=content")).toBe(true);
    expect(isSafeInternalPath("/")).toBe(true);
  });

  it("rejects protocol-relative paths (open-redirect vector)", () => {
    expect(isSafeInternalPath("//evil.com")).toBe(false);
    expect(isSafeInternalPath("//evil.com/path")).toBe(false);
  });

  it("rejects /\\-prefixed paths (alt protocol-relative)", () => {
    expect(isSafeInternalPath("/\\evil.com")).toBe(false);
  });

  it("rejects absolute URLs", () => {
    expect(isSafeInternalPath("https://evil.com")).toBe(false);
    expect(isSafeInternalPath("javascript:alert(1)")).toBe(false);
  });

  it("rejects relative paths", () => {
    expect(isSafeInternalPath("student")).toBe(false);
    expect(isSafeInternalPath("./student")).toBe(false);
    expect(isSafeInternalPath("../admin")).toBe(false);
  });

  it("rejects paths with control characters (header smuggling)", () => {
    expect(isSafeInternalPath("/ok\r\nSet-Cookie: x")).toBe(false);
    expect(isSafeInternalPath("/bad\x00null")).toBe(false);
  });

  it("rejects non-strings and empty", () => {
    expect(isSafeInternalPath(undefined)).toBe(false);
    expect(isSafeInternalPath(null)).toBe(false);
    expect(isSafeInternalPath(123)).toBe(false);
    expect(isSafeInternalPath("")).toBe(false);
  });
});
