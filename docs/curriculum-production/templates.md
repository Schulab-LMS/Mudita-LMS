# Lesson, Course & Metadata Templates

## Lesson folder layout (in the STEM-Curricula repo)

One lesson = one folder under a module, synced via [`curriculum-sync.service.ts`](../../src/services/curriculum-sync.service.ts) (`@@unique([moduleId, sourcePath])`).

```
<module>/<NN-lesson-slug>/
  meta.yml            # title(+ar/de), objective, source refs (MetaSourceRef), difficulty, ageBand
  handout.md (+.ar.md/.de.md)        → Lesson.content
  activity.md (+.ar.md/.de.md)       → Lesson.activity
  presentation.md (+.ar.md/.de.md)   → Lesson.presentationContent (Reveal.js) + presentationConfig
  tutor.md (+.ar.md/.de.md)          → Lesson.tutorNotes (TUTOR_ONLY fences supported)
  quiz.yaml                          → Quiz / Question / Answer
  resources.md                       → Lesson.resources (JSON)
  video/script.md + assets/          → media pipeline (not synced; produces VideoAsset)
```

Reuse `parsePresentationMarkdown` / `rewritePresentationMediaUrls` from [`src/lib/presentation.ts`](../../src/lib/presentation.ts) and the `meta.yml` helpers in [`src/lib/curriculum-structure.ts`](../../src/lib/curriculum-structure.ts) so output is sync-compatible.

## Required lesson content blocks

- Lesson title · age band · course · bundle · pathway
- Reference sources (`meta.yml`: primary `source` + `secondarySources`, each with `url` + `license`)
- Learning objective(s)
- Story hook / mission intro (Lumo)
- Concept explanation (grounded, cited)
- Worked example
- Interactive activity (try-it-yourself)
- Practice task
- Mini quiz (3–5 young / 5–10 older)
- Reflection question
- Mission/challenge framing
- Final task (links to course/bundle project)
- Parent note · Tutor note · Safety note (if needed)
- Source attribution metadata + "AI-assisted, human-reviewed" tag

## Course structure template

Maps to `Course` / `Module` and the catalog data files (`CatalogCourse` in [`prisma/catalog/types.ts`](../../prisma/catalog/types.ts)).

**Course:** title (+ar/de) · slug · age range (`AgeGroup`) · level (`CourseLevel`) · bundle(s) (`BundleCourse`) · pathway (`PathwayStage`) · reference sources (`CourseReferenceSource`) · course goal · story theme · Lumo variant · module count · lesson count · final project (`finalProjectTitle/Description` + localized) · certificate criteria · prerequisites (`CoursePrerequisite`) · `requiredPlan` · tutor support scope · `contentStatus` · `status`.

**Module:** title (+ar/de) · order · learning goal · source references · lessons · module challenge · module quiz.

## Content metadata fields

**Already present (reuse):** `Course/Module/Lesson.sourcePath`, `sourceCommitSha`, `managedByGit`, `syncStatus`; `ContentStatus`; `CourseStatus`; `adminNotes`; `ReferenceSource` + `SourceStatus` + join tables; lesson `MetaSourceRef` (`provider/url/license`) + `secondarySources`; `VideoAsset` (`status/hasCaptions/languages/duration`); `CurriculumSyncRun`; `AuditLog`.

**To add (minimal new schema — see [implementation-tasks.md](implementation-tasks.md) Task 1):**

- `AiContentStatus` enum: `SOURCE_COLLECTED · AI_GENERATED · UNDER_REVIEW · REVISION_NEEDED · APPROVED`.
- On `Lesson` (and optionally `Course`): `aiStatus`, `aiModel`, `aiReviewedById`, `lastVerifiedAt`, `tutorSupportRequired`, `parentGuidanceRequired`.
- Per-section provenance (in `meta.yml`, optionally mirrored to a `LessonSourceCitation` table): `{sourceId, sourceUrl, confidence, reviewStatus, lastVerified}`.
- `SourceChunk` table for RAG: `{id, sourceId, content, embedding vector, url, license, ageRange, status}` (pgvector).

**The canonical per-content-item field set:** Content ID · Course ID · Module ID · Lesson ID · Bundle ID · Pathway ID · age group · level · topic · source references · source URLs · source status · AI model/tool · human reviewer · review status · last verified date · license notes · content type · character version · video status · quiz status · certificate status · tutor support required · parent guidance required.
