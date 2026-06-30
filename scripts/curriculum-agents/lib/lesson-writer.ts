// Serialize an assembled LessonDraft into a STEM-Curricula-compatible lesson
// folder. The serializers (toMetaYaml / toQuizMd / toResourcesMd) are pure and
// unit-tested; writeLessonFolder does the fs writes.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringify as stringifyYaml } from "yaml";

import type { LessonDraft } from "./lesson-types";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * meta.yml — matches the repo schema. status is DRAFT so curriculum-sync (which
 * publishes PUBLISHED only) never goes live before a human reviewer flips it.
 */
export function toMetaYaml(draft: LessonDraft): string {
  const meta: Record<string, unknown> = {
    slug: draft.slug,
    title: draft.title,
    ageGroup: draft.ageGroup,
    ageRange: draft.ageRange,
    category: draft.category,
    status: "DRAFT",
    source: pruneSource(draft.source),
    secondarySources: draft.secondarySources.map(pruneSource),
    learningObjectives: draft.learningObjectives,
    // Provenance marker — every AI lesson is tagged for the reviewer.
    aiAssisted: true,
  };
  if (draft.secondarySources.length === 0) delete meta.secondarySources;
  return stringifyYaml(meta);
}

function pruneSource(s: {
  provider: string;
  course?: string;
  unit?: string;
  item?: string;
  url: string;
  license?: string;
}): Record<string, string> {
  const out: Record<string, string> = { provider: s.provider, url: s.url };
  if (s.course) out.course = s.course;
  if (s.unit) out.unit = s.unit;
  if (s.item) out.item = s.item;
  if (s.license) out.license = s.license;
  return out;
}

/** quiz.md — mirrors the repo's question/answer convention + quiz widget. */
export function toQuizMd(draft: LessonDraft): string {
  const lines: string[] = [
    `# Quiz — ${draft.title}`,
    `**${draft.quiz.length} questions | Ages ${draft.ageRange} — pick the best answer**`,
    "",
    "<!-- QUIZ_COMPONENT -->",
    `<!-- WIDGET:quiz id="${draft.quizId}" -->`,
    "",
  ];
  draft.quiz.forEach((q, i) => {
    lines.push(`**Question ${i + 1}**`, q.prompt, "");
    q.options.forEach((opt, oi) => lines.push(`- ${OPTION_LETTERS[oi] ?? oi}) ${opt}`));
    lines.push("", `**Answer: ${OPTION_LETTERS[q.answerIndex] ?? q.answerIndex}**`);
    if (q.explanation) lines.push(`*${q.explanation}*`);
    lines.push("", "---", "");
  });
  return lines.join("\n");
}

/** resources.md — source-attribution table, like the repo's NASA examples. */
export function toResourcesMd(draft: LessonDraft): string {
  const all = [draft.source, ...draft.secondarySources];
  const rows = all
    .map((s) => `| ${s.provider}${s.license ? ` (${s.license})` : ""} | ${s.url} |`)
    .join("\n");
  return [
    `# Resources: ${draft.title}`,
    "",
    "## Source Pages",
    "",
    "| Source | Original Page |",
    "|---|---|",
    rows,
    "",
    "---",
    "",
    "*AI-assisted, human-reviewed. Content adapted from the sources above under each provider's stated license.*",
    "",
  ].join("\n");
}

const FILES_REQUIRED = [
  "meta.yml",
  "handout.md",
  "activity.md",
  "presentation.md",
  "tutor.md",
  "quiz.md",
  "resources.md",
] as const;

/** Write the full lesson folder under `outDir/<slug>/`. Returns written paths. */
export function writeLessonFolder(draft: LessonDraft, outDir: string): string[] {
  const dir = join(outDir, draft.slug);
  mkdirSync(dir, { recursive: true });

  const contents: Record<(typeof FILES_REQUIRED)[number], string> = {
    "meta.yml": toMetaYaml(draft),
    "handout.md": draft.handoutMd,
    "activity.md": draft.activityMd,
    "presentation.md": draft.presentationMd,
    "tutor.md": draft.tutorMd,
    "quiz.md": toQuizMd(draft),
    "resources.md": toResourcesMd(draft),
  };

  const written: string[] = [];
  for (const name of FILES_REQUIRED) {
    const path = join(dir, name);
    writeFileSync(path, contents[name].endsWith("\n") ? contents[name] : contents[name] + "\n");
    written.push(path);
  }
  return written;
}
