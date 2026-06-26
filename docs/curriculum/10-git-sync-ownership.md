# Git Sync — Metadata vs. Content Ownership

How the platform database and the **STEM-Curricula** Git repo divide
responsibility, and the rules the sync (`src/services/curriculum-sync.service.ts`)
follows so the two never fight.

## The single rule

> **The platform owns *what a course is*. The repo owns *what a lesson says*.**

| Concern | Source of truth | Notes |
|---|---|---|
| Course name (`title`, `titleAr`, `titleDe`) | **Platform DB** | Sync never writes on update |
| Description, `parentSummary`, `studentSummary` | **Platform DB** | |
| Age group, level, category, tags, skills, tools | **Platform DB** | |
| Visibility / status (`DRAFT`/`PUBLISHED`/`ARCHIVED`) | **Platform DB** | Sync never publishes or archives a course |
| Access gating (`requiredPlan`, `isFree`, `price`) | **Platform DB** | |
| Bundle assignment (`BundleCourse`) | **Platform DB** | |
| Learning-pathway placement (`PathwayStage`) | **Platform DB** | |
| Reference sources, `nextCourse`, final project | **Platform DB** | |
| **Lessons** (handout `content`, `activity`, `tutorNotes`) | **Git repo** | |
| **Presentations** (`presentationContent*`, config) | **Git repo** | |
| **Quizzes** (`Quiz`/`Question`/`Answer`) | **Git repo** | |
| **Resources / handouts / supporting files** | **Git repo** | |
| Module / lesson grouping & order | **Git repo** | Derived from the folder tree |

Seeded by `prisma/seed-catalog.ts` (the curated 93-course catalog, 11 bundles,
6 pathways); content filled in by the Git sync.

## How a repo course root links to a platform course

Linkage is **by `slug`**. For each course root the sync derives a slug from
`meta.yml`'s `slug:` (falling back to the folder name) and looks up the platform
course with that slug.

- **Match found** → the sync writes *content only* (modules/lessons/quizzes/
  resources) plus bookkeeping (`managedByGit`, `sourcePath`, `sourceCommitSha`,
  `syncStatus`). It touches **no** metadata field. An admin's catalog settings
  always survive the next sync.
- **No match** → the sync bootstraps a **hidden `DRAFT`** shell so the content
  isn't lost. Descriptive fields are seeded from the repo *once* as a starting
  point; the platform owns them from then on and no later sync overwrites them.
  The shell is `DRAFT` (hidden) and ungated until an admin curates it.

> **Action required to retire the duplicate/parallel courses:** point each repo
> course root's `meta.yml` `slug:` at the matching **catalog** slug (e.g.
> `space-science-missions`) instead of an age-band slug
> (`8-10-young-learners-s1`). Once the slugs line up, the sync flows content into
> the curated catalog course (adopting it: `managedByGit = true`) instead of
> creating a separate one. Until then both coexist — the catalog course (rich
> metadata, no content) and the bootstrapped shell (content, placeholder
> metadata).

## Content removed from the repo

When a whole course root disappears, the sync sets the course's
`syncStatus = REMOVED` (a *content-health* flag) and soft-archives its
modules/lessons. It does **not** change `status` — public catalog reads
(`getCourses`, `getFeaturedCourses`) exclude `syncStatus = REMOVED`, so the
course drops out of the catalog without the sync ever touching the
platform-owned published state. If the content returns, the next sync flips it
back to `ACTIVE`.

## Admin UI

- **Course settings** (name, age group, level, category, status, plan gating,
  thumbnail, bundle & pathway membership) — **editable** for Git-managed courses;
  the platform owns them.
- **Lesson content** (modules, lessons, quizzes, questions) — **read-only** for
  Git-managed courses; guarded by `assertCourseEditable`
  (`src/lib/curriculum-guard.ts`). Edit it in Git.
