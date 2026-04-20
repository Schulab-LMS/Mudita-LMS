import { describe, it, expect } from "vitest";
import { formatPrice, getInitials, slugify } from "./utils";

describe("slugify", () => {
  it("lowercases and dasherises", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips punctuation but keeps word characters", () => {
    expect(slugify("What's New?!")).toBe("whats-new");
  });

  it("collapses whitespace and underscores to a single dash", () => {
    expect(slugify("foo   bar__baz")).toBe("foo-bar-baz");
  });

  it("trims leading/trailing dashes", () => {
    expect(slugify("  --hi--  ")).toBe("hi");
  });
});

describe("getInitials", () => {
  it("returns up to two uppercase initials", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
  });

  it("caps at two characters even for long names", () => {
    expect(getInitials("Mary Anne Evans")).toBe("MA");
  });

  it("handles a single-word name", () => {
    expect(getInitials("plato")).toBe("P");
  });
});

describe("formatPrice", () => {
  it("formats USD by default with symbol", () => {
    expect(formatPrice(12.5)).toBe("$12.50");
  });

  it("formats other currencies via Intl", () => {
    const eur = formatPrice(10, "EUR");
    expect(eur).toMatch(/10/);
    expect(eur).toMatch(/€|EUR/);
  });
});
