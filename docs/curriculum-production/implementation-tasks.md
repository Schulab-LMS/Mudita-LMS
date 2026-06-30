# Developer Implementation Tasks, Admin Workflow & Roadmap

## Developer tasks

Ordered, each independently shippable. Reuses existing services/actions wherever possible.

- **Task 0 — Docs.** This `docs/curriculum-production/` folder.
- **Task 0b — Curriculum inventory + reconciliation (run before any generation).** [`scripts/curriculum-agents/inventory.ts`](../../scripts/curriculum-agents/inventory.ts) — for a course (or the whole catalog) join catalog data, live `Lesson`/`Course`/`Quiz` rows, and the Git curriculum repo; detect empty shells, placeholder vs. real lessons, duplicates across bundles (via `BundleCourse`), and multiple versions of the same concept. Score each against a quality rubric and emit `reconciliation.report.json` (`keep / improve / gap / duplicate` + chosen best version). The orchestrator (Task 3) consumes this and only generates `improve`/`gap` items — never `keep`. Surfaced in the admin queue (Task 5).
- **Task 1 — Schema additions (migration).** Add `AiContentStatus` enum + the `Lesson`/`Course` fields and `SourceChunk` (pgvector) + optional `LessonSourceCitation`. Use `npx prisma migrate dev` (never `db push` for shipped schema). Files: [`prisma/schema.prisma`](../../prisma/schema.prisma), new migration.
- **Task 2 — Source KB + RAG service.** Enable `pgvector`; build `src/services/source-kb.service.ts` (ingest approved `ReferenceSource` → fetch → chunk → embed → store) and `src/services/rag.service.ts` (retrieval-gated query with citation metadata). Add an Anthropic SDK client wrapper in `src/lib/ai.ts` (lazy-init like `stripe.ts`/`mux.ts`).
- **Task 3 — Agent orchestration.** `scripts/curriculum-agents/` — one module per agent ([agents.md](agents.md)) with strict JSON-schema output, chained by a `run-lesson.ts` orchestrator that takes an **existing** course+lesson target and emits a lesson folder. The orchestrator loads the canonical catalog and passes it to every agent as the allowed vocabulary; it **pre-checks** that the target lesson shell exists and is empty (skips/aborts otherwise) so it never duplicates or invents content. Models limited to Opus 4.8 / Sonnet 4.6.
- **Task 4 — PR automation.** Orchestrator writes the lesson folder to a branch in the STEM-Curricula repo and opens a PR (via `gh`/GitHub API) with the review packet + checklist + source report.
- **Task 5 — Admin review queue.** Extend the admin dashboard: an "AI Content" queue showing `aiStatus`, provenance, source/URL report, and links to the PR; reuse [`admin.actions.ts`](../../src/actions/admin.actions.ts) + `course-content.actions.ts` patterns. Wire `aiStatus` transitions.
- **Task 6 — Media pipeline hooks.** Script that turns `video/script.md` → asset prompts → (image/TTS/video tools) → uploads via existing `createDirectUploadTicket()`/`confirmDirectUpload()`/`attachVideoAssetToLesson()` in [`video.actions.ts`](../../src/actions/video.actions.ts).
- **Task 7 — Verification checks.** URL-liveness + claim→source coverage + similarity check as part of Reviewer-prep; block PR on failure (CI check on the curriculum repo).
- **Task 8 — Feedback loop.** Aggregate `Enrollment.progress`, `QuizAttempt` pass rates, `LessonQuestion` volume, `HelpSearchLog` into an analytics view; an Improvement pass proposes revisions as follow-up PRs.

## Admin workflow

1. **Plan** — Curriculum lead selects a course (catalog data files) and target lessons; sets goal/theme/Lumo variant.
2. **Generate** — Trigger the agent orchestrator (script now; an admin "Generate" button later) → opens a PR with the full lesson package, `aiStatus = AI_GENERATED`.
3. **Review** — Admin "AI Content" queue lists pending items with provenance + auto-checks; six reviewer roles act on the PR; status moves `UNDER_REVIEW → REVISION_NEEDED / APPROVED`.
4. **Publish** — Merge PR → `curriculum-sync` upserts content; media team attaches `VideoAsset`; course `status` flips to `PUBLISHED` when ready.
5. **Tutor setup** — Tutor notes + common questions seeded; tutors briefed.
6. **Monitor & improve** — Dashboard analytics surface weak lessons; Improvement pass drafts revision PRs.

All admin mutations already write `AuditLog`; AI generation/review events should too.

## Roadmap

- **Phase 0 — Inventory & reconciliation (first).** Task 0b across the whole catalog. No content generated.
- **Phase 1 — Foundation.** Tasks 0, 1, 2. Retrieval-gated generation becomes possible.
- **Phase 2 — Lesson production MVP.** Tasks 3 + 4. One full text lesson as a PR; validate on the NASA example.
- **Phase 3 — Review & publish loop.** Tasks 5 + 7. First human-reviewed lesson live via sync.
- **Phase 4 — Edutainment + media.** Entertainment / Video Script / Character agents + Task 6 + Lumo prompt library.
- **Phase 5 — Scale + feedback.** Age-band fan-out, Task 8, ar/de localization at scale.
