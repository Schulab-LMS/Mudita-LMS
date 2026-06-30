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
| 4 | **Create course outline** | Course Outline | modules + lesson list | `agents/outline.ts` + `run-course.ts` (RAG-gated; emits `course-outline.json` + per-lesson commands) | ✅ |
| 5 | **Build lessons** (explanation, activity, quiz, mini-project) | Lesson Builder + Assessment | handout / activity / presentation / tutor + quiz | `agents/lesson-builder.ts`, `agents/assessment.ts`; project = the lesson's final task/activity | ✅ |
| 6 | **Add entertainment layer** (mission / story / quest) | Entertainment | `mission.md` (mission/challenge/badge) | `agents/entertainment.ts` → `mission.md`; run in the orchestrator after Build | ✅ |
| 7 | **Generate video script** (one per age group) | Video Script | scene-by-scene script | `agents/video-script.ts` (age-banded via `DURATION_BY_BAND`) | ✅ |
| 8 | **Generate character prompts** (Lumo by age/topic) | Character Consistency | `character-prompts.json` (locked Lumo template) | `agents/character.ts` → `character-prompts.json` in the `--video` step | ✅ |
| 9 | **Generate video assets** (images, backgrounds, voiceover, captions) | Media team + tools | rendered video + captions | `media-package.ts` emits `script.md` + `assets-manifest.json`; `ImageGenerator`/`TtsProvider`/`VideoAssembler` adapter boundary + `mux-upload.ts`; **no asset provider wired yet** | ◑ |
| 10 | **Create assessment** (quizzes, practice tasks, rubric, certificate criteria) | Assessment | quiz + `assessment.md` (tasks + rubric + cert criteria) | `agents/assessment.ts` emits all four → `quiz.md` + `assessment.md` | ✅ |
| 11 | **Human review** | 6 reviewer roles | approved PR | PR review + verification gate (`verification.service.ts`) + admin [AI-Content queue](../../src/app/[locale]/(dashboard)/admin/ai-content) | ✅ |
| 12 | **Publish to SchuLab** | System | lessons live in the LMS | merge → `curriculum-sync.service.ts` upserts content (platform owns metadata) | ✅ |
| 13 | **Tutor support setup** (notes + common questions) | Lesson Builder + tutor | `tutor.md` + seeded `LessonQuestion` | tutor notes (`tutorMd`) + `common-questions.json`; `seed-common-questions.ts` seeds them into `LessonQuestion`/`LessonAnswer` at publish | ✅ |
| 14 | **Improve from feedback** | Content-health + Improvement | weak-lesson list → revision PRs | `content-health.service.ts` (completion, quiz pass rate, question volume); the revision-proposing pass reuses the agent loop | ✅ |

## What's fully built vs. what remains

**Fully built (✅): 13 of 14 steps** — Steps 0–8 and 10–14, plus the source-first
gate, verification, PR automation, and the subscription (no-API) path. Proven
end-to-end with a real lesson (NASA Moon-phases).

**The one remaining ◑ is Step 9** — the actual image/TTS/video asset generation.
The boundary is built (`media-package.ts` emits the asset manifest + `script.md`;
`mux-upload.ts` handles upload; `ImageGenerator`/`TtsProvider`/`VideoAssembler`
are the adapter interfaces). It needs a **media-tool choice** to wire a concrete
provider; until then the media team fulfils the manifest.

Every step is owned by the platform for metadata and the curriculum repo for content (see [git-sync ownership](../curriculum/10-git-sync-ownership.md)); every learner-facing step is source-grounded, cited, tagged "AI-assisted, human-reviewed", and gated on human review before publish.
