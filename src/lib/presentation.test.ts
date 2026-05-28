import { describe, it, expect } from "vitest";
import {
  parsePresentationMarkdown,
  rewritePresentationMediaUrls,
} from "./presentation";

describe("parsePresentationMarkdown", () => {
  it("returns markdown unchanged when no frontmatter is present", () => {
    const raw = "# Slide 1\n\n---\n\n# Slide 2\n";
    const { config, markdown } = parsePresentationMarkdown(raw);
    expect(config).toBeNull();
    expect(markdown).toBe(raw);
  });

  it("extracts a YAML frontmatter block and strips it from the markdown", () => {
    const raw = `---
theme: sky
transition: convex
plugins: [highlight, notes]
slideNumber: true
---
# Slide 1
content goes here
`;
    const { config, markdown } = parsePresentationMarkdown(raw);
    expect(config).toEqual({
      theme: "sky",
      transition: "convex",
      plugins: ["highlight", "notes"],
      slideNumber: true,
    });
    expect(markdown.startsWith("# Slide 1")).toBe(true);
  });

  it("tolerates CRLF line endings", () => {
    const raw = "---\r\ntheme: black\r\n---\r\n# Slide 1\r\n";
    const { config, markdown } = parsePresentationMarkdown(raw);
    expect(config).toEqual({ theme: "black" });
    expect(markdown).toBe("# Slide 1\r\n");
  });

  it("returns null config when the frontmatter is invalid YAML", () => {
    const raw = "---\nthis is: : bad\n yaml\n---\n# Slide\n";
    const { config, markdown } = parsePresentationMarkdown(raw);
    expect(config).toBeNull();
    expect(markdown).toBe("# Slide\n");
  });

  it("does not treat a slide separator as frontmatter", () => {
    // A deck that starts with a horizontal rule (no leading ---\n\n pair at
    // the very start counts) should not be misread as frontmatter.
    const raw = "# Slide 1\n\n---\n\n# Slide 2\n";
    const { config } = parsePresentationMarkdown(raw);
    expect(config).toBeNull();
  });
});

describe("rewritePresentationMediaUrls", () => {
  const ctx = {
    courseSlug: "intro-to-ai",
    courseRoot: "intro-to-ai",
    sourceFilePath: "intro-to-ai/modules/module_01/unit_02/presentation.md",
  };

  it("rewrites a relative image path to the authenticated media proxy", () => {
    const md = "![diagram](./assets/diagram.png)";
    const out = rewritePresentationMediaUrls(md, ctx);
    expect(out).toBe(
      "![diagram](/api/curriculum/media/intro-to-ai/modules/module_01/unit_02/assets/diagram.png)"
    );
  });

  it("rewrites parent-relative paths up to the course root", () => {
    const md = "![shared](../shared/img.png)";
    const out = rewritePresentationMediaUrls(md, ctx);
    expect(out).toBe(
      "![shared](/api/curriculum/media/intro-to-ai/modules/module_01/shared/img.png)"
    );
  });

  it("leaves absolute URLs untouched", () => {
    const md = "![cdn](https://cdn.example.com/x.png) and ![data](data:image/png;base64,AAA)";
    const out = rewritePresentationMediaUrls(md, ctx);
    expect(out).toBe(md);
  });

  it("leaves root-relative paths untouched", () => {
    const md = "![logo](/brand/logo.svg)";
    const out = rewritePresentationMediaUrls(md, ctx);
    expect(out).toBe(md);
  });

  it("leaves the original path in place when it escapes the course root", () => {
    // Four `..` pop all four baseDir segments; the next segment becomes a
    // sibling of the course root, which we deliberately do not rewrite.
    const md = "![out](../../../../sibling-course/img.png)";
    const out = rewritePresentationMediaUrls(md, ctx);
    expect(out).toBe(md);
  });

  it("rewrites multiple images independently", () => {
    const md = "![a](./a.png)\n\n![b](./b.png)";
    const out = rewritePresentationMediaUrls(md, ctx);
    expect(out).toContain("/api/curriculum/media/intro-to-ai/modules/module_01/unit_02/a.png");
    expect(out).toContain("/api/curriculum/media/intro-to-ai/modules/module_01/unit_02/b.png");
  });
});
