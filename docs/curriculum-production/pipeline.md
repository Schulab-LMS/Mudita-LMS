# The SchuLab Content Production Pipeline (canonical 14 steps)

This is the authoritative definition of the production pipeline. Every step names
its **owner** (which agent / human / system performs it), its **output
artifact**, and its **implementation** in this codebase with a status:

- ✅ **built** — coded, tested, and runnable (on the subscription via the
  [`/curriculum-lesson`](../../.claude/skills/curriculum-lesson/SKILL.md) skill, or
  via the API scripts).
- ◑ **partial** — works but a piece is manual or not yet a discrete agent.
- ○ **pending** — defined; needs a provider choice or build.

> **Step 0 — Inventory & reconcile (required pre-step).** Before Step 1, the
> Curriculum Inventory ([`inventory.ts`](../../scripts/curriculum-agents/inventory.ts))
> produces a `keep / improve / gap / duplicate` map. Production targets only
> `gap`/`improve`; existing good lessons are kept, never regenerated. ✅ built.

| # | Step | Owner | Output | Implementation | Status |
|---|---|---|---|---|---|
| 1 | **Select course** | Curriculum lead | a target course from the master list | `prisma/catalog/*.data.ts` (canonical) + the inventory gap map | ✅ |
| 2 | **Collect trusted sources** | Source Collector | approved-source content → KB | `source-kb.service.ts` (ingest/embed) + the 21-source [trusted library](source-first-and-rag.md); subscription path uses `WebFetch` on approved URLs | ✅ |
| 3 | **Create source map** | Curriculum Mapper | source → lesson mapping | `agents/mapper.ts` + RAG retrieval ground the mapping | ✅ |
| 4 | **Create course outline** | Curriculum Mapper | modules + lesson list | single-lesson planning built (`mapper.ts`); a course-level multi-lesson outline wrapper is a thin add | ◑ |
| 5 | **Build lessons** (explanation, activity, quiz, mini-project) | Lesson Builder + Assessment | handout / activity / presentation / tutor + quiz | `agents/lesson-builder.ts`, `agents/assessment.ts`; project = the lesson's final task/activity | ✅ |
| 6 | **Add entertainment layer** (mission / story / quest) | Entertainment | mission-framed lesson, badge | currently applied **inside** the Lesson Builder's Lumo mission framing; not yet a discrete agent | ◑ |
| 7 | **Generate video script** (one per age group) | Video Script | scene-by-scene script | `agents/video-script.ts` (age-banded via `DURATION_BY_BAND`) | ✅ |
| 8 | **Generate character prompts** (Lumo by age/topic) | Character Consistency | Lumo image/video prompts | the Video Script agent emits Lumo `visualPrompt`/`thumbnailPrompt` for the band; a dedicated character-prompt-library agent is not yet separate | ◑ |
| 9 | **Generate video assets** (images, backgrounds, voiceover, captions) | Media team + tools | rendered video + captions | `media-package.ts` emits `script.md` + `assets-manifest.json`; `ImageGenerator`/`TtsProvider`/`VideoAssembler` adapter boundary + `mux-upload.ts`; no asset provider wired yet | ◑ |
| 10 | **Create assessment** (quizzes, practice tasks, rubric, certificate criteria) | Assessment | quiz + rubric + cert criteria | quiz built (`assessment.ts`); practice tasks / project rubric / certificate criteria not yet emitted by the agent | ◑ |
| 11 | **Human review** | 6 reviewer roles | approved PR | PR review + verification gate (`verification.service.ts`) + admin [AI-Content queue](../../src/app/[locale]/(dashboard)/admin/ai-content) | ✅ |
| 12 | **Publish to SchuLab** | System | lessons live in the LMS | merge → `curriculum-sync.service.ts` upserts content (platform owns metadata) | ✅ |
| 13 | **Tutor support setup** (notes + common questions) | Lesson Builder + tutor | `tutor.md` + seeded `LessonQuestion` | tutor notes built (`tutorMd`); auto-seeding common questions into `LessonQuestion` is manual | ◑ |
| 14 | **Improve from feedback** | Content-health + Improvement | weak-lesson list → revision PRs | `content-health.service.ts` (completion, quiz pass rate, question volume); the revision-proposing pass reuses the agent loop | ✅ |

## What's fully built vs. what closes the partials

**Fully built (✅):** Steps 0, 1, 2, 3, 5, 7, 11, 12, 14 — plus the source-first gate, verification, PR automation, and the subscription (no-API) path. Proven end-to-end with a real lesson (NASA Moon-phases).

**To close the ◑ partials (each small, mostly dependency-free):**
- **Step 4** — add a `run-course.ts` wrapper that maps a course → an ordered module/lesson outline, then loops `run-lesson` over the `gap` lessons.
- **Step 6** — promote the entertainment framing into a discrete `agents/entertainment.ts` (mission/quest/badge), so it's tunable independently of the handout.
- **Step 8** — add `agents/character.ts` that emits the locked Lumo prompt-template (variant × topic) the media tools consume.
- **Step 9** — wire a concrete `ImageGenerator` / `TtsProvider` / `VideoAssembler` once the media tools are chosen.
- **Step 10** — extend the Assessment agent's schema to also emit practice tasks, a project rubric, and certificate criteria.
- **Step 13** — auto-seed the tutor's "common student questions" into `LessonQuestion` at publish.

Every step is owned by the platform for metadata and the curriculum repo for content (see [git-sync ownership](../curriculum/10-git-sync-ownership.md)); every learner-facing step is source-grounded, cited, tagged "AI-assisted, human-reviewed", and gated on human review before publish.
