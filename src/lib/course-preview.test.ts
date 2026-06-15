import { describe, expect, it } from "vitest";
import {
  analyzeContentMix,
  collectHandsOnProjects,
  isHandsOnProject,
  lessonKind,
  summarizeModule,
  type PreviewModule,
} from "@/lib/course-preview";

function lesson(overrides: Partial<PreviewModule["lessons"][number]> = {}) {
  return {
    id: Math.random().toString(36).slice(2),
    title: "Lesson",
    type: "VIDEO",
    ...overrides,
  };
}

describe("lessonKind", () => {
  it("classifies by base type", () => {
    expect(lessonKind(lesson({ type: "VIDEO" }))).toBe("video");
    expect(lessonKind(lesson({ type: "TEXT" }))).toBe("reading");
    expect(lessonKind(lesson({ type: "INTERACTIVE" }))).toBe("interactive");
    expect(lessonKind(lesson({ type: "PRESENTATION" }))).toBe("presentation");
    expect(lessonKind(lesson({ type: "ASSIGNMENT" }))).toBe("project");
  });

  it("treats an attached quiz as a quiz regardless of base type", () => {
    expect(
      lessonKind(lesson({ type: "VIDEO", quiz: { _count: { questions: 5 } } }))
    ).toBe("quiz");
  });

  it("treats a take-home activity as a project", () => {
    expect(lessonKind(lesson({ type: "VIDEO", activity: "Build a robot" }))).toBe(
      "project"
    );
    // whitespace-only activity is not a project
    expect(lessonKind(lesson({ type: "VIDEO", activity: "   " }))).toBe("video");
  });

  it("infers presentation from synced presentationContent", () => {
    expect(
      lessonKind(lesson({ type: "VIDEO", presentationContent: "# Slide" }))
    ).toBe("presentation");
  });
});

describe("isHandsOnProject", () => {
  it("is true for assignments and lessons with activity text", () => {
    expect(isHandsOnProject(lesson({ type: "ASSIGNMENT" }))).toBe(true);
    expect(isHandsOnProject(lesson({ activity: "Make a circuit" }))).toBe(true);
    expect(isHandsOnProject(lesson({ type: "VIDEO" }))).toBe(false);
  });
});

describe("analyzeContentMix", () => {
  const modules: PreviewModule[] = [
    {
      id: "m1",
      title: "Module 1",
      lessons: [
        lesson({ type: "VIDEO" }),
        lesson({ type: "VIDEO", quiz: { _count: { questions: 3 } } }),
        lesson({ type: "ASSIGNMENT" }),
      ],
    },
    {
      id: "m2",
      title: "Module 2",
      lessons: [
        lesson({ type: "PRESENTATION" }),
        lesson({ type: "TEXT" }),
        lesson({ type: "QUIZ", quiz: { _count: { questions: 7 } } }),
      ],
    },
  ];

  it("counts each kind and sums quiz questions", () => {
    const mix = analyzeContentMix(modules);
    expect(mix.videos).toBe(1);
    expect(mix.quizzes).toBe(2);
    expect(mix.projects).toBe(1);
    expect(mix.presentations).toBe(1);
    expect(mix.readings).toBe(1);
    expect(mix.totalQuestions).toBe(10);
  });

  it("handles an empty course", () => {
    expect(analyzeContentMix([])).toEqual({
      videos: 0,
      readings: 0,
      quizzes: 0,
      interactive: 0,
      presentations: 0,
      projects: 0,
      totalQuestions: 0,
    });
  });

  it("summarizes a single module", () => {
    expect(summarizeModule(modules[0])).toEqual({
      videos: 1,
      quizzes: 1,
      projects: 1,
      presentations: 0,
    });
  });

  it("collects hands-on projects with their module title, capped", () => {
    const projects = collectHandsOnProjects(modules, 1);
    expect(projects).toHaveLength(1);
    expect(projects[0].moduleTitle).toBe("Module 1");
  });
});
