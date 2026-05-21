import { describe, it, expect } from "vitest";
import {
  slugify,
  resolveAgeGroup,
  resolveStatus,
  findCourseRoots,
  numericPrefix,
} from "./curriculum-structure";
import type { TreeEntry } from "./github-curricula";

describe("slugify", () => {
  it("kebab-cases and strips unsafe characters", () => {
    expect(slugify("Space Science (Ages 8–12)")).toBe("space-science-ages-812");
    expect(slugify("space_science_children_8_12")).toBe("space-science-children-8-12");
  });
});

describe("resolveAgeGroup", () => {
  it("uses an explicit enum value verbatim", () => {
    expect(resolveAgeGroup("AGES_13_15", "whatever")).toBe("AGES_13_15");
  });
  it("derives the bucket from an age range by midpoint", () => {
    // 8–12 → midpoint 10 → AGES_9_12
    expect(resolveAgeGroup(undefined, "space-science-children-8-12")).toBe("AGES_9_12");
    expect(resolveAgeGroup("3-5", "x")).toBe("AGES_3_5");
    expect(resolveAgeGroup("16-18", "x")).toBe("AGES_16_18");
  });
  it("falls back to AGES_9_12 when nothing parses", () => {
    expect(resolveAgeGroup(undefined, "biology")).toBe("AGES_9_12");
  });
});

describe("resolveStatus", () => {
  it("defaults to DRAFT so untagged courses stay hidden", () => {
    expect(resolveStatus(undefined)).toBe("DRAFT");
    expect(resolveStatus("published")).toBe("PUBLISHED");
  });
});

describe("findCourseRoots", () => {
  it("detects course roots from unit file paths and ignores empty subject folders", () => {
    const tree: TreeEntry[] = [
      { path: "biology/.gitkeep", type: "blob", sha: "a" },
      {
        path: "space-science-children-8-12/modules/module_01_earth/unit_01_shape/handout.md",
        type: "blob",
        sha: "b",
      },
      {
        path: "space-science-children-8-12/modules/module_01_earth/overview.md",
        type: "blob",
        sha: "c",
      },
      { path: "space-science-children-8-12/README.md", type: "blob", sha: "d" },
    ];
    const roots = findCourseRoots(tree);
    expect([...roots]).toEqual(["space-science-children-8-12"]);
  });
});

describe("numericPrefix", () => {
  it("reads the order from module_/unit_ folder names", () => {
    expect(numericPrefix("module_01_earth")).toBe(1);
    expect(numericPrefix("unit_03_seasons")).toBe(3);
    expect(numericPrefix("nounit")).toBe(0);
  });
});
