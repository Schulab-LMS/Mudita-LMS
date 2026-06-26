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
  parseHandoutResources,
  resourcesFromMeta,
  resolveResources,
  resourceTypeFromUrl,
  titleFromUrl,
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
    expect(resolveAgeGroup("AGES_14_16", "whatever")).toBe("AGES_14_16");
  });
  it("derives the bucket from an age range by midpoint", () => {
    // 8–12 → midpoint 10 → AGES_8_10 (band caps at 10)
    expect(resolveAgeGroup(undefined, "space-science-children-8-12")).toBe("AGES_8_10");
    expect(resolveAgeGroup("3-5", "x")).toBe("AGES_3_5");
    expect(resolveAgeGroup("5-7", "x")).toBe("AGES_5_7");
    expect(resolveAgeGroup("11-13", "x")).toBe("AGES_11_13");
    expect(resolveAgeGroup("17-18", "x")).toBe("AGES_17_18");
  });
  it("falls back to AGES_8_10 when nothing parses", () => {
    expect(resolveAgeGroup(undefined, "biology")).toBe("AGES_8_10");
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

  it("extracts bare URLs from markdown table rows, deriving titles from the URL", () => {
    const md = [
      "## Source Pages",
      "",
      "| Source | Original Page |",
      "|---|---|",
      "| `spaceplace_nasa_gov_spaceweather` | https://spaceplace.nasa.gov/spaceweather/en/ |",
      "| `spaceplace_nasa_gov_all-about-earth` | https://spaceplace.nasa.gov/all-about-earth/en/ |",
    ].join("\n");
    expect(parseResources(md)).toEqual([
      { title: "Spaceweather", url: "https://spaceplace.nasa.gov/spaceweather/en/", type: "link" },
      {
        title: "All About Earth",
        url: "https://spaceplace.nasa.gov/all-about-earth/en/",
        type: "link",
      },
    ]);
  });

  it("ignores table header and separator rows", () => {
    const md = ["| Source | Original Page |", "|---|---|", "| :--- | ---: |"].join("\n");
    expect(parseResources(md)).toEqual([]);
  });

  it("keeps a human label from a table cell when it isn't a machine slug", () => {
    const md = "| NASA Earth Observatory | https://earthobservatory.nasa.gov/ |";
    expect(parseResources(md)).toEqual([
      { title: "NASA Earth Observatory", url: "https://earthobservatory.nasa.gov/", type: "link" },
    ]);
  });

  it("uses the link text when a table cell carries a markdown link", () => {
    const md = "| Worksheet | [Download PDF](./worksheet.pdf) |";
    expect(parseResources(md)).toEqual([
      { title: "Download PDF", url: "./worksheet.pdf", type: "pdf" },
    ]);
  });

  it("ignores inline links in prose so an attribution footer never becomes a resource", () => {
    // Mirrors the real resources.md footer — a link repeated on every lesson that
    // must not surface as a per-lesson resource (it would duplicate platform-wide).
    const md = [
      "| `spaceplace_nasa_gov_aurora` | https://spaceplace.nasa.gov/aurora/en/ |",
      "",
      "---",
      "",
      "*Content sourced from [NASA Space Place](https://spaceplace.nasa.gov) under NASA's policy.*",
    ].join("\n");
    expect(parseResources(md)).toEqual([
      { title: "Aurora", url: "https://spaceplace.nasa.gov/aurora/en/", type: "link" },
    ]);
  });

  it("de-dupes a URL shared between two tables in the same file", () => {
    const md = [
      "## Source Pages",
      "| `s` | https://spaceplace.nasa.gov/ion-balloons/en/ |",
      "## Activity Source",
      "| `a` | https://spaceplace.nasa.gov/ion-balloons/en/ |",
    ].join("\n");
    expect(parseResources(md)).toEqual([
      { title: "Ion Balloons", url: "https://spaceplace.nasa.gov/ion-balloons/en/", type: "link" },
    ]);
  });

  it("parses the real curriculum resources.md shape end-to-end", () => {
    const md = [
      "﻿# Resources: Space Weather and Earth's Magnetic Shield",
      "",
      "## Source Pages",
      "",
      "The handout content for this unit was assembled from the following NASA pages.",
      "",
      "| Source | Original Page |",
      "|---|---|",
      "| `spaceplace_nasa_gov_spaceweather` | https://spaceplace.nasa.gov/spaceweather/en/ |",
      "| `spaceplace_nasa_gov_pigeons` | https://spaceplace.nasa.gov/pigeons/en/ |",
      "",
      "## Activity Source",
      "",
      "| Activity | Original Page |",
      "|---|---|",
      "| `spaceplace_nasa_gov_ion-balloons` | https://spaceplace.nasa.gov/ion-balloons/en/ |",
      "",
      "---",
      "",
      "*Content sourced from [NASA Space Place](https://spaceplace.nasa.gov).*",
    ].join("\n");
    expect(parseResources(md)).toEqual([
      { title: "Spaceweather", url: "https://spaceplace.nasa.gov/spaceweather/en/", type: "link" },
      { title: "Pigeons", url: "https://spaceplace.nasa.gov/pigeons/en/", type: "link" },
      { title: "Ion Balloons", url: "https://spaceplace.nasa.gov/ion-balloons/en/", type: "link" },
    ]);
  });
});

describe("titleFromUrl", () => {
  it("derives a title from the last meaningful path segment, dropping locale tails", () => {
    expect(titleFromUrl("https://spaceplace.nasa.gov/all-about-earth/en/")).toBe("All About Earth");
    expect(titleFromUrl("https://spaceplace.nasa.gov/spaceweather/en/")).toBe("Spaceweather");
    expect(titleFromUrl("https://example.com/a/b/cool_thing.pdf")).toBe("Cool Thing");
  });

  it("falls back to the host's main label for a bare domain", () => {
    expect(titleFromUrl("https://spaceplace.nasa.gov/")).toBe("Nasa");
    expect(titleFromUrl("https://spaceplace.nasa.gov")).toBe("Nasa");
  });
});

describe("resourcesFromMeta", () => {
  it("builds resources from source + secondarySources, titled by course/item", () => {
    const meta = {
      source: {
        provider: "Scratch Foundation / Harvard ScratchEd",
        course: "Creative Computing Curriculum",
        url: "https://creativecomputing.gse.harvard.edu/",
        license: "CC BY-SA 4.0",
      },
      secondarySources: [
        { provider: "Scratch", item: "Scratch editor & starter projects", url: "https://scratch.mit.edu/" },
        { provider: "Code.org", item: "CS Fundamentals — Course C / D", url: "https://code.org/curriculum/csf" },
      ],
    };
    expect(resourcesFromMeta(meta)).toEqual([
      {
        title: "Creative Computing Curriculum",
        url: "https://creativecomputing.gse.harvard.edu/",
        type: "link",
      },
      { title: "Scratch editor & starter projects", url: "https://scratch.mit.edu/", type: "link" },
      { title: "CS Fundamentals — Course C / D", url: "https://code.org/curriculum/csf", type: "link" },
    ]);
  });

  it("falls back to provider then URL for the title, and de-dupes URLs", () => {
    const meta = {
      source: { provider: "Raspberry Pi Foundation", url: "https://projects.raspberrypi.org/" },
      secondarySources: [
        { url: "https://projects.raspberrypi.org/" }, // duplicate of primary
        { provider: "Microsoft MakeCode", url: "https://makecode.microbit.org/" },
      ],
    };
    expect(resourcesFromMeta(meta)).toEqual([
      { title: "Raspberry Pi Foundation", url: "https://projects.raspberrypi.org/", type: "link" },
      { title: "Microsoft MakeCode", url: "https://makecode.microbit.org/", type: "link" },
    ]);
  });

  it("returns [] for missing meta or sources without a URL", () => {
    expect(resourcesFromMeta(null)).toEqual([]);
    expect(resourcesFromMeta({})).toEqual([]);
    expect(resourcesFromMeta({ source: { provider: "X" } })).toEqual([]);
  });
});

describe("parseHandoutResources", () => {
  it("extracts '- Label: url' bullets only inside a Resources section", () => {
    const md = [
      "# Earth's Shape and Structure",
      "",
      "Prose mentioning https://example.com/not-a-resource must be ignored.",
      "",
      '## NASA Resources (To Explore Together or at Home)',
      "",
      "- All About Earth: https://spaceplace.nasa.gov/all-about-earth/en/",
      '- Earth images from space: https://images.nasa.gov/ (search "earth")',
      "- Aurora (what causes it): https://spaceplace.nasa.gov/aurora/en/",
    ].join("\n");
    expect(parseHandoutResources(md)).toEqual([
      { title: "All About Earth", url: "https://spaceplace.nasa.gov/all-about-earth/en/", type: "link" },
      { title: "Earth images from space", url: "https://images.nasa.gov/", type: "link" },
      { title: "Aurora (what causes it)", url: "https://spaceplace.nasa.gov/aurora/en/", type: "link" },
    ]);
  });

  it("stops at the next same-or-higher-level heading", () => {
    const md = [
      "## Further Reading",
      "- A: https://a.example/",
      "## Next Section",
      "- B: https://b.example/",
    ].join("\n");
    expect(parseHandoutResources(md)).toEqual([
      { title: "A", url: "https://a.example/", type: "link" },
    ]);
  });

  it("supports markdown-link and bare-URL bullets; returns [] without a section", () => {
    const md = ["## Sources", "- [Scratch](https://scratch.mit.edu/)", "- https://code.org/"].join("\n");
    expect(parseHandoutResources(md)).toEqual([
      { title: "Scratch", url: "https://scratch.mit.edu/", type: "link" },
      { title: "Code", url: "https://code.org/", type: "link" },
    ]);
    expect(parseHandoutResources("# Lesson\n\nNo resources section here.")).toEqual([]);
  });
});

describe("resolveResources", () => {
  it("prefers resources.md, then meta.yml sources, then the handout section", () => {
    const md = "| s | https://a.example/ |";
    const meta = { source: { course: "Course X", url: "https://b.example/" } };
    const handout = "## Resources\n- C: https://c.example/";

    const a = resolveResources({ resourcesMd: md, meta, handout });
    expect(a.origin).toBe("resources");
    expect(a.resources.map((r) => r.url)).toEqual(["https://a.example/"]);

    const b = resolveResources({ resourcesMd: null, meta, handout });
    expect(b.origin).toBe("meta");
    expect(b.resources).toEqual([{ title: "Course X", url: "https://b.example/", type: "link" }]);

    const c = resolveResources({ resourcesMd: null, meta: null, handout });
    expect(c.origin).toBe("handout");
    expect(c.resources).toEqual([{ title: "C", url: "https://c.example/", type: "link" }]);
  });

  it("falls through empty inputs to the next available source", () => {
    const r = resolveResources({
      resourcesMd: "# Resources\n\n(none yet)",
      meta: { source: { provider: "P" } }, // no URL → no meta resources
      handout: "## Sources\n- Home: https://home.example/",
    });
    expect(r.origin).toBe("handout");
    expect(r.resources).toEqual([{ title: "Home", url: "https://home.example/", type: "link" }]);
  });
});
