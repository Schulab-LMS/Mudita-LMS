import { describe, it, expect } from "vitest";
import {
  slugify,
  resolveAgeGroup,
  resolveStatus,
  findCourseRoots,
  numericPrefix,
  prettifyFolder,
  prettifyCourseFolder,
  parseResources,
  resourceTypeFromUrl,
  hasMediaSegment,
  subjectRoot,
} from "./curriculum-structure";
import type { TreeEntry } from "./github-curricula";

describe("hasMediaSegment", () => {
  it("is true when an asset sits beneath a _media directory", () => {
    expect(hasMediaSegment("space-science/_media/source_images/a/img.png")).toBe(true);
    expect(hasMediaSegment("course/modules/m1/u1/_media/x.jpg")).toBe(true);
  });
  it("is false without a _media segment, or when _media is the leaf", () => {
    expect(hasMediaSegment("space-science/age-groups/c/modules/m1/u1/overview.md")).toBe(false);
    expect(hasMediaSegment("space-science/_media")).toBe(false);
    expect(hasMediaSegment("")).toBe(false);
  });
});

describe("subjectRoot", () => {
  it("returns the first path segment", () => {
    expect(subjectRoot("space-science/_media/x.png")).toBe("space-science");
    expect(subjectRoot("space-science/age-groups/11-13-middle-explorers-s2")).toBe("space-science");
    expect(subjectRoot("solo")).toBe("solo");
  });
});

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
  it("detects nested course roots from unit file paths and ignores empty subject folders", () => {
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
    expect(roots).toEqual([{ path: "space-science-children-8-12", layout: "nested" }]);
  });

  it("detects flat course roots where each hyphenated module folder is one lesson", () => {
    const tree: TreeEntry[] = [
      { path: "programming/README.md", type: "blob", sha: "a" },
      {
        path: "programming/age-groups/11-13-programming-fundamentals/module-01-algorithms/handout.md",
        type: "blob",
        sha: "b",
      },
      {
        path: "programming/age-groups/11-13-programming-fundamentals/module-01-algorithms/presentation.md",
        type: "blob",
        sha: "c",
      },
      {
        path: "programming/age-groups/11-13-programming-fundamentals/module-01-algorithms/meta.yml",
        type: "blob",
        sha: "d",
      },
      {
        path: "programming/age-groups/11-13-programming-fundamentals/module-02-python-basics/handout.md",
        type: "blob",
        sha: "e",
      },
    ];
    const roots = findCourseRoots(tree);
    expect(roots).toEqual([
      { path: "programming/age-groups/11-13-programming-fundamentals", layout: "flat" },
    ]);
  });

  it("detects deep course roots where modules hold multiple lesson folders", () => {
    const tree: TreeEntry[] = [
      {
        path: "programming/age-groups/5-7-computational-thinking/module-01-sequencing/overview.md",
        type: "blob",
        sha: "a",
      },
      {
        path: "programming/age-groups/5-7-computational-thinking/module-01-sequencing/meta.yml",
        type: "blob",
        sha: "b",
      },
      {
        path: "programming/age-groups/5-7-computational-thinking/module-01-sequencing/lesson-01-first-sequences/handout.md",
        type: "blob",
        sha: "c",
      },
      {
        path: "programming/age-groups/5-7-computational-thinking/module-01-sequencing/lesson-01-first-sequences/presentation.md",
        type: "blob",
        sha: "d",
      },
      {
        path: "programming/age-groups/5-7-computational-thinking/module-01-sequencing/lesson-02-maze-sequencing/handout.md",
        type: "blob",
        sha: "e",
      },
    ];
    const roots = findCourseRoots(tree);
    expect(roots).toEqual([
      { path: "programming/age-groups/5-7-computational-thinking", layout: "deep" },
    ]);
  });

  it("does not misclassify a deep course (lesson files in lesson-NN folders) as flat", () => {
    const tree: TreeEntry[] = [
      {
        path: "programming/age-groups/8-10-block-programming/module-01-scratch-basics/lesson-01-getting-started/handout.md",
        type: "blob",
        sha: "a",
      },
    ];
    const roots = findCourseRoots(tree);
    expect(roots).toEqual([
      { path: "programming/age-groups/8-10-block-programming", layout: "deep" },
    ]);
  });

  it("keeps nested and flat layouts disjoint in a mixed repo", () => {
    const tree: TreeEntry[] = [
      {
        path: "space-science-children-8-12/modules/module_01_earth/unit_01_shape/handout.md",
        type: "blob",
        sha: "a",
      },
      {
        path: "programming/age-groups/5-7-computational-thinking/module-01-sequencing/handout.md",
        type: "blob",
        sha: "b",
      },
    ];
    const roots = findCourseRoots(tree).sort((x, y) => x.path.localeCompare(y.path));
    expect(roots).toEqual([
      { path: "programming/age-groups/5-7-computational-thinking", layout: "flat" },
      { path: "space-science-children-8-12", layout: "nested" },
    ]);
  });

  it("does not treat a bare module folder (only meta.yml, no lesson files) as flat", () => {
    const tree: TreeEntry[] = [
      { path: "programming/age-groups/empty-stage/module-01-x/meta.yml", type: "blob", sha: "a" },
    ];
    expect(findCourseRoots(tree)).toEqual([]);
  });
});

describe("numericPrefix", () => {
  it("reads the order from module_/unit_ (underscore) folder names", () => {
    expect(numericPrefix("module_01_earth")).toBe(1);
    expect(numericPrefix("unit_03_seasons")).toBe(3);
    expect(numericPrefix("nounit")).toBe(0);
  });
  it("reads the order from module-NN (hyphen) folder names too", () => {
    expect(numericPrefix("module-01-algorithms")).toBe(1);
    expect(numericPrefix("module-06-physical-computing-python")).toBe(6);
  });
});

describe("prettifyFolder", () => {
  it("strips both underscore and hyphen module/unit prefixes", () => {
    expect(prettifyFolder("module_01_earth")).toBe("Earth");
    expect(prettifyFolder("module-01-algorithms")).toBe("Algorithms");
    expect(prettifyFolder("unit_02_moon_phases")).toBe("Moon Phases");
  });
});

describe("prettifyCourseFolder", () => {
  it("drops a leading age-range token and title-cases the rest", () => {
    expect(prettifyCourseFolder("11-13-programming-fundamentals")).toBe(
      "Programming Fundamentals"
    );
    expect(prettifyCourseFolder("5-7-computational-thinking")).toBe("Computational Thinking");
    expect(prettifyCourseFolder("17-18-advanced-computer-science")).toBe(
      "Advanced Computer Science"
    );
  });
});

describe("resourceTypeFromUrl", () => {
  it("classifies by file extension", () => {
    expect(resourceTypeFromUrl("./worksheet.pdf")).toBe("pdf");
    expect(resourceTypeFromUrl("notes.docx")).toBe("doc");
    expect(resourceTypeFromUrl("data.xlsx")).toBe("sheet");
    expect(resourceTypeFromUrl("deck.pptx")).toBe("slides");
    expect(resourceTypeFromUrl("diagram.png")).toBe("image");
    expect(resourceTypeFromUrl("starter.sb3")).toBe("code");
    expect(resourceTypeFromUrl("bundle.zip")).toBe("archive");
  });

  it("ignores query strings and hashes when reading the extension", () => {
    expect(resourceTypeFromUrl("https://x.com/a.pdf?token=1#page=2")).toBe("pdf");
  });

  it("detects well-known video hosts", () => {
    expect(resourceTypeFromUrl("https://youtu.be/abc123")).toBe("video");
    expect(resourceTypeFromUrl("https://vimeo.com/12345")).toBe("video");
  });

  it("falls back to link for absolute URLs and file for relative paths", () => {
    expect(resourceTypeFromUrl("https://scratch.mit.edu/projects/1")).toBe("link");
    expect(resourceTypeFromUrl("./some-folder/thing")).toBe("file");
  });
});

describe("parseResources", () => {
  it("returns an empty list for null or link-free markdown", () => {
    expect(parseResources(null)).toEqual([]);
    expect(parseResources("# Resources\n\nNothing here yet.")).toEqual([]);
  });

  it("extracts markdown link bullets and classifies each", () => {
    const md = [
      "# Resources",
      "",
      "- [Worksheet](./worksheet.pdf)",
      "- [Scratch starter](https://scratch.mit.edu/projects/123)",
      "* [Intro video](https://youtu.be/abc)",
    ].join("\n");
    expect(parseResources(md)).toEqual([
      { title: "Worksheet", url: "./worksheet.pdf", type: "pdf" },
      { title: "Scratch starter", url: "https://scratch.mit.edu/projects/123", type: "link" },
      { title: "Intro video", url: "https://youtu.be/abc", type: "video" },
    ]);
  });

  it("strips inline markdown from titles and drops duplicate URLs", () => {
    const md = [
      "- [**Bold** worksheet](./w.pdf)",
      "- [Same file again](./w.pdf)",
    ].join("\n");
    expect(parseResources(md)).toEqual([
      { title: "Bold worksheet", url: "./w.pdf", type: "pdf" },
    ]);
  });
});
