import { describe, it, expect } from "vitest";
import {
  checkCoverage,
  checkOverCopy,
  checkUrlLiveness,
  verifyLesson,
  type LessonSection,
  type UrlProbe,
} from "./verification.service";

function section(over: Partial<LessonSection> = {}): LessonSection {
  return {
    name: "handout",
    text: "Original paraphrased explanation about the Moon and its light.",
    citedUrls: ["https://spaceplace.nasa.gov/moon-phases"],
    sourcePassages: ["The Moon does not make its own light."],
    ...over,
  };
}

describe("checkCoverage", () => {
  it("flags a content section with no citation", () => {
    const issues = checkCoverage([section({ citedUrls: [] })]);
    expect(issues).toHaveLength(1);
    expect(issues[0].check).toBe("coverage");
  });
  it("ignores empty sections (no prose to source)", () => {
    expect(checkCoverage([section({ text: "  ", citedUrls: [] })])).toEqual([]);
  });
  it("passes a cited section", () => {
    expect(checkCoverage([section()])).toEqual([]);
  });
  it("treats whitespace-only citations as missing", () => {
    expect(checkCoverage([section({ citedUrls: ["  ", ""] })])).toHaveLength(1);
  });
});

describe("checkOverCopy", () => {
  it("flags near-verbatim reuse of a source passage", () => {
    const copied =
      "moon phases come from the angle of sunlight hitting the moon as it orbits earth";
    const issues = checkOverCopy([
      section({ text: copied, sourcePassages: [copied] }),
    ]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((i) => i.check === "overcopy")).toBe(true);
  });
  it("passes an original paraphrase", () => {
    const issues = checkOverCopy([
      section({
        text: "As our Moon travels around us, different parts of its lit side face us.",
        sourcePassages: [
          "moon phases come from the angle of sunlight hitting the moon as it orbits earth",
        ],
      }),
    ]);
    expect(issues).toEqual([]);
  });
  it("skips sections with no source passages", () => {
    expect(checkOverCopy([section({ sourcePassages: [] })])).toEqual([]);
  });
});

describe("checkUrlLiveness", () => {
  it("flags dead URLs using an injected probe and dedupes", async () => {
    const seen: string[] = [];
    const probe: UrlProbe = async (url) => {
      seen.push(url);
      return !url.includes("dead");
    };
    const { issues, urlCount } = await checkUrlLiveness(
      [
        section({ citedUrls: ["https://ok.example/a", "https://dead.example/x"] }),
        section({ name: "activity", citedUrls: ["https://ok.example/a"] }), // dup
      ],
      probe
    );
    expect(urlCount).toBe(2); // deduped
    expect(seen.sort()).toEqual(["https://dead.example/x", "https://ok.example/a"]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ check: "url", url: "https://dead.example/x" });
  });
  it("no URLs → no issues, count 0", async () => {
    const probe: UrlProbe = async () => true;
    const { issues, urlCount } = await checkUrlLiveness(
      [section({ citedUrls: [] })],
      probe
    );
    expect(urlCount).toBe(0);
    expect(issues).toEqual([]);
  });
});

describe("verifyLesson", () => {
  const liveProbe: UrlProbe = async () => true;

  it("passes a clean lesson", async () => {
    const report = await verifyLesson([section()], { probe: liveProbe });
    expect(report.passed).toBe(true);
    expect(report.issues).toEqual([]);
    expect(report.checked).toEqual({ sections: 1, urls: 1 });
  });

  it("aggregates failures across all three checks", async () => {
    const deadProbe: UrlProbe = async () => false;
    const copied =
      "moon phases come from the angle of sunlight hitting the moon as it orbits earth";
    const report = await verifyLesson(
      [
        section({ name: "uncited", text: "Some claim.", citedUrls: [] }),
        section({ name: "copied", text: copied, sourcePassages: [copied] }),
      ],
      { probe: deadProbe }
    );
    expect(report.passed).toBe(false);
    const checks = new Set(report.issues.map((i) => i.check));
    expect(checks.has("coverage")).toBe(true);
    expect(checks.has("overcopy")).toBe(true);
    // the copied section's URL is dead → url issue too
    expect(checks.has("url")).toBe(true);
  });
});
