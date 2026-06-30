import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";
import {
  toMetaYaml,
  toQuizMd,
  toResourcesMd,
  toMissionMd,
  toAssessmentMd,
} from "../../scripts/curriculum-agents/lib/lesson-writer";
import type { LessonDraft } from "../../scripts/curriculum-agents/lib/lesson-types";

function draft(over: Partial<LessonDraft> = {}): LessonDraft {
  return {
    slug: "03-moon-phases",
    title: "Why does the Moon change shape?",
    ageGroup: "AGES_8_10",
    ageRange: "8–10",
    category: "SCIENCE",
    courseSlug: "space-explorers-8-10",
    characterVariant: "Lumo Creator",
    source: {
      provider: "NASA Space Place",
      url: "https://spaceplace.nasa.gov/moon-phases/en/",
      license: "public-domain",
    },
    secondarySources: [
      { provider: "NASA Science", url: "https://science.nasa.gov/moon/" },
    ],
    learningObjectives: [
      "Explain that Moon phases come from sunlight and the Moon's orbit.",
    ],
    handoutMd: "# Moon phases\nThe Moon does not make its own light.",
    activityMd: "Model the phases with a ball and a lamp.",
    presentationMd: "---\ntheme: black\n---\n# Moon phases",
    tutorMd: "Common sticking point: phases vs eclipses.",
    parentNote: "Try this with a torch at home.",
    quizId: "moon-phases-quiz",
    quiz: [
      {
        prompt: "What lights up the Moon?",
        options: ["The Sun", "The Moon itself", "Street lights"],
        answerIndex: 0,
        explanation: "Sunlight reflects off the Moon.",
      },
    ],
    resources: [],
    citations: [
      { section: "handout", sourceKey: "nasa-space-place", confidence: 0.9 },
    ],
    ...over,
  };
}

describe("toMetaYaml", () => {
  it("emits content + provenance only", () => {
    const parsed = parseYaml(toMetaYaml(draft())) as Record<string, unknown>;
    expect(parsed.title).toBe("Why does the Moon change shape?");
    expect(parsed.aiAssisted).toBe(true);
    expect((parsed.source as { license: string }).license).toBe("public-domain");
    expect(Array.isArray(parsed.secondarySources)).toBe(true);
    expect(Array.isArray(parsed.learningObjectives)).toBe(true);
  });

  it("NEVER emits platform-owned metadata (platform is the source of truth)", () => {
    const parsed = parseYaml(toMetaYaml(draft())) as Record<string, unknown>;
    // age group, category, status, pricing, structure live in the platform DB,
    // not the curriculum repo — the repo provides content only.
    expect(parsed.ageGroup).toBeUndefined();
    expect(parsed.ageRange).toBeUndefined();
    expect(parsed.category).toBeUndefined();
    expect(parsed.status).toBeUndefined();
    expect(parsed.requiredPlan).toBeUndefined();
    expect(parsed.price).toBeUndefined();
  });

  it("omits secondarySources when there are none", () => {
    const parsed = parseYaml(toMetaYaml(draft({ secondarySources: [] }))) as Record<
      string,
      unknown
    >;
    expect(parsed.secondarySources).toBeUndefined();
  });
});

describe("toQuizMd", () => {
  it("renders questions, lettered options, and the answer key", () => {
    const md = toQuizMd(draft());
    expect(md).toContain("**Question 1**");
    expect(md).toContain("- A) The Sun");
    expect(md).toContain("**Answer: A**");
    expect(md).toContain('WIDGET:quiz id="moon-phases-quiz"');
  });
});

describe("toResourcesMd", () => {
  it("renders a source-attribution table with provider + license + url", () => {
    const md = toResourcesMd(draft());
    expect(md).toContain("NASA Space Place (public-domain)");
    expect(md).toContain("https://spaceplace.nasa.gov/moon-phases/en/");
    expect(md).toContain("https://science.nasa.gov/moon/");
  });
});

describe("toMissionMd (Step 6)", () => {
  it("renders the mission title, hook, challenge, and badge", () => {
    const md = toMissionMd(
      draft({
        mission: {
          title: "Moon Detective Mission",
          storyHook: "A mystery in the night sky!",
          challenge: "Crack the case of the changing Moon.",
          badgeName: "Moon Detective",
        },
      })
    );
    expect(md).toContain("# 🎯 Moon Detective Mission");
    expect(md).toContain("**Your challenge:** Crack the case");
    expect(md).toContain("**Badge on completion:** Moon Detective");
  });
  it("is empty when there is no mission", () => {
    expect(toMissionMd(draft())).toBe("");
  });
});

describe("toAssessmentMd (Step 10)", () => {
  it("renders practice tasks, rubric, and certificate criteria", () => {
    const md = toAssessmentMd(
      draft({
        practiceTasks: ["Draw the phases."],
        projectRubric: [{ criterion: "Phase model", meets: "4 phases", exceeds: "8 phases labelled" }],
        certificateCriteria: ["Complete the activity."],
      })
    );
    expect(md).toContain("## Practice tasks");
    expect(md).toContain("- Draw the phases.");
    expect(md).toContain("| Phase model | 4 phases | 8 phases labelled |");
    expect(md).toContain("## Certificate criteria");
    expect(md).toContain("- [ ] Complete the activity.");
  });
});
