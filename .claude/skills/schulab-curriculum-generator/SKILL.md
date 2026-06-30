---
name: schulab-curriculum-generator
description: Generate source-backed, self-learning STEAM curriculum lesson folders for the SchuLab e-learning platform. Use when the user asks to create SchuLab course content, lesson folders, quizzes, activities, video scripts, tutor notes, parent notes, or curriculum materials from trusted sources such as NASA Space Place, Scratch, Code.org, PhET, ESA Kids, Khan Academy Computing, MIT App Inventor, Microsoft MakeCode, Raspberry Pi Foundation Projects, or Code Club Projects.
---

# SchuLab Curriculum Generator

Generate complete, source-backed, self-learning STEAM lesson folders for SchuLab
(ages 3–18). **AI must not invent curriculum content** — only collect, map,
adapt, explain, script, assess, and package content from trusted sources.

This skill runs on the Claude subscription (no API key). It authors the content;
the repo's deterministic tooling materializes, verifies, and PRs it:
`scripts/curriculum-agents/materialize-lesson.ts` (write + Task-7 verify) and
`scripts/curriculum-agents/open-lesson-pr.ts` (PR into STEM-Curricula). Nothing
auto-publishes — every item is `needs_review` and a human approves before merge.

## Read these first (progressive disclosure)
- [references/source-rules.md](references/source-rules.md) — the source-first process + hard prohibitions.
- [references/trusted-sources.md](references/trusted-sources.md) — the approved 21-source library + 6-category taxonomy + special rules.
- [references/age-groups.md](references/age-groups.md) — age-band adaptation + video durations.
- [references/character-system.md](references/character-system.md) — the Lumo character system.
- [references/lesson-schema.md](references/lesson-schema.md) — the lesson folder files + JSON schemas (lesson/sources/quiz/metadata/review).
- [references/review-checklist.md](references/review-checklist.md) — the 6-role human review.

## Single source of truth (critical)
The **SchuLab platform** (catalog + DB) owns all metadata — course names, age
groups, level, bundles, pathways, categories, pricing, structure. This skill
**selects** course/bundle/pathway/age group from the existing catalog; it NEVER
invents or redefines them. The curriculum repo carries **content only**. So:
`lesson.json` references platform metadata for the reviewer/importer's context,
but the file synced into the repo (`meta.yml`) carries content + source
provenance only. If a needed course/bundle/pathway doesn't exist in the catalog,
stop and ask — don't fabricate one.

## Core process (every generation)
1. Identify the SchuLab **course, bundle, pathway, age group, and lesson topic** — selected from the existing catalog (never invented).
2. Check the **approved trusted source list** ([trusted-sources.md](references/trusted-sources.md)). If the topic has no approved source, **stop / mark blocked**.
3. Use **only** the provided trusted source content or source URLs. `WebFetch` the approved URL to ground on real content; quote key facts.
4. Create a **source map** (`sources.json`) BEFORE writing lesson content — which source supports which concept.
5. Generate the lesson **only from source-supported concepts**. No claim without a source.
6. **Adapt the explanation to the age group** ([age-groups.md](references/age-groups.md)) — simplify the explanation, never the underlying truth.
7. Add the **edutainment layer**: a mission / story / challenge / quest, with the right Lumo character and a badge ([character-system.md](references/character-system.md)).
8. Generate the **complete lesson folder** (see Output below).
9. Add **source metadata** (`sources.json`) and the **review checklist** (`review-checklist.json`).
10. Mark every generated item **`needs_review`** (`publishingStatus: "needs_review"`, `approvedForPublishing: false`).
11. **Never auto-publish.**
12. **Never invent** facts, experiments, source names, or curriculum providers; never copy full source text verbatim (rewrite in SchuLab's voice).
13. If source evidence is missing, **stop and ask for sources, or mark the lesson blocked** (see Validation).

## Output — the complete lesson folder
Generate these files (templates in [templates/lesson-folder-template/](templates/lesson-folder-template/)):
`lesson.json` · `lesson.md` · `quiz.json` · `activity.md` · `project.md` ·
`video-script.md` · `character-prompts.md` · `tutor-notes.md` · `parent-notes.md` ·
`metadata.json` · `sources.json` · `review-checklist.json`.

Every lesson must include: course title/slug, lesson title/slug, age group, level,
bundle, pathway, learning objectives, source references + URLs, lesson
explanation, story hook, mission/challenge, activity, practice task, quiz, final
task, project connection, video script, character prompt, parent note, tutor
note, review checklist, and `publishingStatus: needs_review`.

> **Importing to the repo:** the repo sync format is `meta.yml` (content +
> provenance only) + `handout.md` + `activity.md` + `presentation.md` + `tutor.md`
> + `quiz.md` + `resources.md`. Map `lesson.md`→handout, `quiz.json`→quiz.md,
> `activity.md`→activity, `sources.json`→meta.yml `source`/`secondarySources`,
> and run `materialize-lesson.ts` to write + verify. Platform metadata in
> `lesson.json` is NOT written into the repo.

## Modes
1. **Generate complete lesson folder** — in: course, lesson topic, age group, trusted source. out: all files above.
2. **Generate course outline** — in: course, age group, bundle, pathway, sources. out: modules, lessons, objectives, final project, source map. (Mirrors `run-course.ts`.)
3. **Generate video script only** — in: lesson content, age group, character version. out: `video-script.md` + `character-prompts.md`.
4. **Generate quiz & assessment only** — in: lesson content, age group. out: `quiz.json` + project rubric + completion criteria.
5. **Validate lesson folder** — in: an existing folder. out: missing fields, source issues, age-suitability issues, publishing readiness, review checklist.
6. **Map source content** — in: a source URL / imported content. out: suggested SchuLab course/bundle/pathway (from the catalog), lesson ideas, age suitability, reuse notes.

## Validation — BLOCK and explain if any of these:
no trusted source provided · source URL missing · course title missing · age
group missing · lesson objective missing · quiz answers missing · video script
missing · parent note missing · tutor note missing · metadata incomplete · the
lesson **requires physical hardware** · content has unsupported facts · content
copies full source text · the activity is unsafe for children.

When blocked, output: **reason blocked · missing information · suggested fix ·
required source or input.** Set `publishingStatus: "blocked"`.

## Style
Clear · practical · parent- and student-friendly · age-appropriate · fun but
accurate · structured · implementation-ready. Avoid: long academic explanations
for children, generic curriculum language, unsupported claims, fake source
names/URLs, hardware-required activities, copying source text, publishing without
review.

## Worked examples
[examples/nasa-space-place-example.md](examples/nasa-space-place-example.md) ·
[examples/scratch-example.md](examples/scratch-example.md) ·
[examples/phet-example.md](examples/phet-example.md).
