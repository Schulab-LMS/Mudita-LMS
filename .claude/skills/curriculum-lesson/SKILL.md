---
name: curriculum-lesson
description: Produce one source-grounded SchuLab lesson WITHOUT the Anthropic API — Claude Code authors the content on the Claude subscription, then reuses the built pipeline (materialize + Task-7 verify + PR). Use when asked to write/generate a curriculum lesson, add a lesson to a course, or run the curriculum pipeline on the subscription instead of API keys.
---

# Produce a curriculum lesson (no-API / subscription path)

This skill runs the source-first curriculum pipeline using **Claude Code on the
Claude subscription** — no `ANTHROPIC_API_KEY`, no Voyage. Claude Code *is* the
agent: it reads approved sources, authors the lesson, and hands the result to
the deterministic infrastructure already built under `scripts/curriculum-agents/`.

The automated API pipeline (`run-lesson.ts`) still exists for unattended scale.
This skill is the human-in-the-loop equivalent — ideal because every lesson is
review-gated anyway.

## Inputs to confirm first
- **Course slug** — must exist in `prisma/catalog/*.data.ts` (canonical binding).
- **Lesson title.**
- **Approved source URL(s)** — only from the trusted library (`ReferenceSource`
  in `prisma/catalog/reference-sources.data.ts`). No source ⇒ do not generate.

## Steps

1. **Canonical bind.** Grep the catalog for the course slug; read its `ageGroup`
   + `category`. The age band fixes the Lumo variant and the age-adaptation rules
   (see `docs/curriculum-production/age-adaptation.md` and `character-system.md`).
   Lumo by band: 3–5 Mini · 5–7 Junior · 8–10 Creator · 11–13 Explorer ·
   14–16 Innovator · 17–18 Mentor.

2. **Gap-check (no duplication).** Confirm the course doesn't already have a
   good lesson on this concept — check the live DB (`db.lesson` via a quick tsx
   query) or the `STEM-Curricula` repo. If it exists with real content, stop:
   keep the better existing version, don't regenerate.

3. **Source-first.** `WebFetch` each approved source URL. Extract the factual
   content and the key sentences. These are your ONLY grounding. Capture them as
   `sourcePassages` (used by the over-copy + coverage checks).

4. **Author the lesson** (this is the generation, done by Claude Code):
   - Follow the agent rules in `docs/curriculum-production/agents.md`: rewrite in
     SchuLab's own words (NEVER copy source sentences verbatim — the over-copy
     check enforces ≤12-word verbatim runs), keep the science exact, simplify the
     *explanation* for the band but not the truth, speak in the Lumo variant's
     voice, frame as a mission.
   - Produce: `learningObjectives`, `handoutMd`, `activityMd`, `presentationMd`
     (Reveal.js, `---` between slides), `tutorMd` (with `TUTOR_ONLY` fences),
     `parentNote`, `safetyNote` (if needed), and a `quiz` answerable purely from
     the handout. Add a `citations` entry per section → the source it grounds in.

5. **Materialize + verify** (reuses the built pipeline, no API). Write an
   authoring script that builds a `LessonDraft` (see
   `scripts/curriculum-agents/lib/lesson-types.ts`) + `sourcePassages` and emits
   an envelope JSON, then:
   ```bash
   npx tsx scripts/curriculum-agents/materialize-lesson.ts \
     --in <envelope.json> --out curriculum-out
   ```
   This writes the lesson folder (meta.yml DRAFT + handout/activity/presentation/
   tutor/quiz/resources) and runs the Task-7 verification (coverage + over-copy +
   URL liveness). **If verification reports issues, fix the content and re-run**
   until it passes.

6. **Open the PR** into `STEM-Curricula` for human review (Task 4):
   ```bash
   npx tsx scripts/curriculum-agents/open-lesson-pr.ts \
     --lesson curriculum-out/<slug> \
     --target <subject>/<course-slug>/modules/<module>/<slug> \
     --report curriculum-out/<slug>/verification.report.json --execute
   ```
   Default is dry-run; add `--execute` to push the branch + open the PR. Six
   reviewer roles run the checklist; on merge, curriculum-sync publishes it.

## Hard rules (same as the API pipeline)
- Models, when the API path is used, are Opus 4.8 / Sonnet 4.6 only. On the
  subscription path, Claude Code is the model.
- No invented facts/sources; every section cited; no verbatim copying.
- **Platform is the single source of truth for metadata.** The lesson meta.yml
  carries CONTENT + source provenance only (title, learningObjectives, source,
  secondarySources). NEVER put course name, ageGroup, category, status, pricing,
  enrollment, or course structure in the repo — those live in the SchuLab
  catalog/DB. The age band still drives how the content is written; it just
  isn't redeclared as metadata. See docs/curriculum/10-git-sync-ownership.md.
  Nothing auto-publishes: the platform course stays DRAFT and human PR review
  gates merge.
- Bind to the canonical catalog (read-only) — never invent or redefine a course,
  slug, age group, or source.

## Worked example
"Why does the Moon change shape?" for `nasa-space-explorer-intro` (AGES_8_10,
Lumo Creator), grounded in NASA Space Place — authored, materialized, and
verified (PASSED) with no API key.
