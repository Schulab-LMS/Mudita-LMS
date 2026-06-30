// Serialize an assembled LessonDraft into a STEM-Curricula-compatible lesson
// folder. The serializers (toMetaYaml / toQuizMd / toResourcesMd) are pure and
// unit-tested; writeLessonFolder does the fs writes.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringify as stringifyYaml } from "yaml";

import type { LessonDraft } from "./lesson-types";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * meta.yml — CONTENT + source provenance only. The curriculum repo is the
 * content source; the SchuLab platform (catalog + DB) is the single source of
 * truth for ALL course-level metadata — course name, ageGroup, category,
 * pricing, status, enrollment, structure, bundles. We therefore never emit
 * those here (the sync ignores them anyway). See
 * docs/curriculum/10-git-sync-ownership.md. The lesson's age band still drives
 * how the CONTENT is written — it's just not redeclared as metadata.
 */
export function toMetaYaml(draft: LessonDraft): string {
  const meta: Record<string, unknown> = {
    // Lesson title + objectives describe the content (not the platform course).
    title: draft.title,
    learningObjectives: draft.learningObjectives,
    // Source provenance — the only meta fields curriculum-sync consumes.
    source: pruneSource(draft.source),
    secondarySources: draft.secondarySources.map(pruneSource),
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

/** mission.md — the entertainment layer (Step 6), when present. */
export function toMissionMd(draft: LessonDraft): string {
  const m = draft.mission;
  if (!m) return "";
  return [
    `# 🎯 ${m.title}`,
    "",
    m.storyHook,
    "",
    `**Your challenge:** ${m.challenge}`,
    "",
    `**Badge on completion:** ${m.badgeName}`,
    "",
  ].join("\n");
}

/** assessment.md — practice tasks + project rubric + certificate criteria (Step 10). */
export function toAssessmentMd(draft: LessonDraft): string {
  const parts: string[] = [`# Assessment — ${draft.title}`, ""];
  if (draft.practiceTasks?.length) {
    parts.push("## Practice tasks", "", ...draft.practiceTasks.map((t) => `- ${t}`), "");
  }
  if (draft.projectRubric?.length) {
    parts.push("## Project rubric", "", "| Criterion | Meets | Exceeds |", "|---|---|---|");
    for (const r of draft.projectRubric) parts.push(`| ${r.criterion} | ${r.meets} | ${r.exceeds} |`);
    parts.push("");
  }
  if (draft.certificateCriteria?.length) {
    parts.push("## Certificate criteria", "", ...draft.certificateCriteria.map((c) => `- [ ] ${c}`), "");
  }
  return parts.join("\n");
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
  const write = (name: string, body: string) => {
    const path = join(dir, name);
    writeFileSync(path, body.endsWith("\n") ? body : body + "\n");
    written.push(path);
  };

  for (const name of FILES_REQUIRED) write(name, contents[name]);

  // Optional layers (Steps 6, 10, 13) — only when those agents ran.
  if (draft.mission) write("mission.md", toMissionMd(draft));
  if (draft.practiceTasks?.length || draft.projectRubric?.length || draft.certificateCriteria?.length) {
    write("assessment.md", toAssessmentMd(draft));
  }
  if (draft.commonQuestions?.length) {
    write("common-questions.json", JSON.stringify(draft.commonQuestions, null, 2));
  }
  return written;
}
