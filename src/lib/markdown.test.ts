import { describe, it, expect } from "vitest";
import { splitTutorContent, renderCurriculumMarkdown } from "./markdown";

describe("splitTutorContent", () => {
  it("removes TUTOR_ONLY fences from student content and collects them", () => {
    const md = `Intro for everyone.

<!-- TUTOR_ONLY -->
Ask the student to predict the outcome first.
<!-- /TUTOR_ONLY -->

More student content.`;
    const { studentMarkdown, tutorMarkdown } = splitTutorContent(md);
    expect(studentMarkdown).toContain("Intro for everyone.");
    expect(studentMarkdown).toContain("More student content.");
    expect(studentMarkdown).not.toMatch(/predict the outcome/);
    expect(tutorMarkdown).toMatch(/predict the outcome/);
  });

  it("returns empty tutor content when there are no fences", () => {
    const { tutorMarkdown } = splitTutorContent("Just student content.");
    expect(tutorMarkdown).toBe("");
  });
});

describe("renderCurriculumMarkdown image rewriting", () => {
  const ctx = {
    courseSlug: "space-science-children-8-12",
    courseRoot: "space-science-children-8-12",
    sourceFilePath:
      "space-science-children-8-12/modules/module_01_earth/unit_01_shape/handout.md",
  };

  it("rewrites a relative image path to the authenticated media proxy", () => {
    const md = `![Earth](../../../_media/images/module_01_earth/unit_01_shape/earth.jpg)`;
    const html = renderCurriculumMarkdown(md, ctx);
    expect(html).toContain(
      "/api/curriculum/media/space-science-children-8-12/_media/images/module_01_earth/unit_01_shape/earth.jpg"
    );
    expect(html).not.toContain("../../../");
  });

  it("leaves absolute URLs untouched", () => {
    const md = `![NASA](https://example.com/earth.jpg)`;
    const html = renderCurriculumMarkdown(md, ctx);
    expect(html).toContain("https://example.com/earth.jpg");
  });

  it("renders GFM tables", () => {
    const md = `| A | B |\n|---|---|\n| 1 | 2 |`;
    const html = renderCurriculumMarkdown(md, ctx);
    expect(html).toMatch(/<table>/);
    expect(html).toMatch(/<td>1<\/td>/);
  });
});
