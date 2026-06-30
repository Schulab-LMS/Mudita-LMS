# SchuLab AI-Assisted Curriculum Production

This is the shared source of truth for how SchuLab produces curriculum with AI assistance. It is written for three audiences: the **curriculum team**, the **media team**, and **developers**.

## The one hard rule

**AI never invents curriculum.** It collects, maps, adapts, scripts, and packages content from trusted sources only — then a human reviews it before it publishes. No source ⇒ no content.

## Three non-negotiable guarantees (enforced technically, not just by prompt)

1. **No hallucination / no invented content.** Generation is RAG-gated against an approved-source knowledge base; every section carries a `sourceId`; the reviewer-prep step fails the PR on any uncited claim or dead source URL.
2. **Inventory-first, no duplication.** A [Curriculum Inventory step](#the-pipeline) always runs first. Where content already exists, we **keep the better existing version rather than regenerate it.** The generator only drafts lessons marked `gap` (missing) or `improve` (weak), never `keep`, and never invents a new course/slug.
3. **Strong cross-course consistency.** All course names, structures, age groups, sources, character variants, and lifecycle states are drawn only from existing platform data ([`prisma/catalog/*.data.ts`](../../prisma/catalog/), the `AgeGroup`/`CourseLevel` enums, `ReferenceSource` records, the Lumo character system). Agents may not introduce off-catalog names or ad-hoc structures.

## Models

**Claude Opus 4.8 and Claude Sonnet 4.6 only.** Opus 4.8 for drafting/mapping/scripts; Sonnet 4.6 for lighter classification, URL/similarity checks, and high-volume passes. No other model is used.

## Two ways to run the pipeline

1. **Subscription / Claude Code (no API keys)** — Claude Code authors the lesson on your Claude subscription, then reuses the deterministic pipeline (materialize + Task-7 verify + PR). Run via the [`/curriculum-lesson`](../../.claude/skills/curriculum-lesson/SKILL.md) skill → `scripts/curriculum-agents/materialize-lesson.ts`. Human-in-the-loop, zero per-token API cost. Recommended for review-gated, modest-volume production. (Note: the Anthropic **Agent SDK / API key** path may **not** use subscription credentials — that's why the no-API path is a Claude Code *skill*, not the SDK.)
2. **Anthropic API (unattended scale)** — `scripts/curriculum-agents/run-lesson.ts` drives the agents headlessly via `ANTHROPIC_API_KEY` + `VOYAGE_API_KEY` (RAG). Use for large unattended batches; ~cents per lesson.

Both emit the same lesson-folder format and both gate on the same source-first rules, verification, and human PR review.

## How it fits the platform we already have

We are adding an AI *production layer* on top of an existing *content pipeline*, not building from scratch. SchuLab already authors curriculum as markdown + `meta.yml` in a separate `STEM-Curricula` Git repo; [`curriculum-sync.service.ts`](../../src/services/curriculum-sync.service.ts) ingests it into the DB. **AI-generated content lands as a PR into that repo** — human review = PR review, merge triggers the existing sync. We reuse the whole publish pipeline and get version history + diffs for free.

| What the process needs | What already exists |
|---|---|
| Trusted source library w/ classifications | `ReferenceSource` + `SourceStatus` (`ACTIVE/HISTORICAL/OPTIONAL/ENRICHMENT`), seeded in [`reference-sources.data.ts`](../../prisma/catalog/reference-sources.data.ts) |
| Per-lesson source + license citation | `MetaSourceRef` (`provider/url/license`) + `secondarySources` in [`curriculum-structure.ts`](../../src/lib/curriculum-structure.ts) |
| Six age groups | `AgeGroup` enum: `AGES_3_5 / AGES_5_7 / AGES_8_10 / AGES_11_13 / AGES_14_16 / AGES_17_18` |
| Course → Module → Lesson, projects, certificates | Full hierarchy in [`schema.prisma`](../../prisma/schema.prisma); `finalProjectTitle/Description`, `Certificate`, bundle capstone via `ActivitySubmission` |
| Self-learning lesson parts | `Lesson.content / activity / tutorNotes / presentationContent` (Reveal.js) / `resources` / quiz — all localized en/ar/de |
| Review / lifecycle states | `ContentStatus`, `CourseStatus` (`DRAFT/PUBLISHED/ARCHIVED`), `adminNotes` |
| Tutor-support-only model | `tutorNotes*`, `LessonQuestion/LessonAnswer`, `ActivitySubmission`, `Booking` |
| Video | `VideoAsset` (Mux) + attach flow in [`video.actions.ts`](../../src/actions/video.actions.ts) |

Greenfield (does not exist yet): any AI/LLM integration, embeddings/vector store, RAG, generation tooling.

## The pipeline

```
0. Inventory & reconcile  → keep / improve / gap / duplicate   (NEVER regenerate `keep`)
1. Select course          → curriculum lead picks a target, reviews the report
2. Collect sources        → approved ReferenceSource set only → vector KB
3. Source map             → source → course/module/lesson
4. Outline                → modules + lessons grounded in real sources
5. Build lessons          → explanation/activity/practice/quiz/project (RAG-grounded)
6. Entertainment layer    → mission / story / quest (no fact changes)
7. Video scripts          → one per age band
8. Character prompts       → Lumo, correct age variant + topic costume
9. Video assets           → media team + tools
10. Assessment            → quiz / rubric / certificate criteria
11. Human review          → 6 roles, checklist, as PR review
12. Publish               → merge → curriculum-sync upserts to live LMS
13. Tutor setup           → tutor notes + common questions
14. Improve from feedback → analytics → revision PRs
```

## Documents in this folder

- [agents.md](agents.md) — the 11 AI agents, their I/O contracts and hard rules
- [source-first-and-rag.md](source-first-and-rag.md) — source-first workflow, the source library, RAG gating rules
- [templates.md](templates.md) — lesson + course structure templates, content metadata fields
- [age-adaptation.md](age-adaptation.md) — the six age-band adaptation rules
- [character-system.md](character-system.md) — the Lumo character system for video
- [tutor-and-review.md](tutor-and-review.md) — tutor support model + human review/QA process
- [tech-stack.md](tech-stack.md) — recommended AI technology stack
- [implementation-tasks.md](implementation-tasks.md) — developer tasks, admin workflow, roadmap
- [examples.md](examples.md) — three worked examples (NASA, Scratch, PhET)

## Roadmap at a glance

- **Phase 0 — Inventory & reconciliation (first).** Build the `keep/improve/gap/duplicate` map across the whole catalog. No content generated.
- **Phase 1 — Foundation.** Provenance schema, pgvector source KB + RAG service, Anthropic client. Retrieval-gated generation becomes possible.
- **Phase 2 — Lesson production MVP.** Source Collector → Mapper → Lesson Builder → Assessment → Reviewer-prep → Publisher produce one full text lesson as a PR.
- **Phase 3 — Review & publish loop.** Admin AI-content queue + automated verification checks; first reviewed lesson live.
- **Phase 4 — Edutainment + media.** Entertainment / Video Script / Character agents + media pipeline; first Lumo-fronted video.
- **Phase 5 — Scale + feedback.** Age-band fan-out, analytics-driven improvement, ar/de localization at scale.
