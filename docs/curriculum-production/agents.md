# AI Agent Roles & Responsibilities

Each agent is a discrete LLM task with a strict input/output contract (JSON schema enforced via tool-use). Agents are chained by the orchestration script ([implementation-tasks.md](implementation-tasks.md), Task 3). **Every agent that emits learner-facing content must receive retrieved source passages as input and must echo the `sourceId`s it used.**

| # | Agent | Consumes | Produces | Hard rules |
|---|---|---|---|---|
| 0 | **Curriculum Inventory** | Catalog data + live `Lesson`/`Course` rows + Git curriculum repo | Reconciliation report: per lesson/concept → `keep / improve / gap / duplicate` + chosen best version + quality scores | Runs before any generation. Never regenerate content that exists well; pick the better existing version; flag duplicates for consolidation, not re-creation. |
| 1 | **Source Collector** | Approved `ReferenceSource` URLs | Source records `{title, url, provider, topic, ageSuitability, relatedCourse, summary, reuseNotes, licenseNotes}` + ingested KB chunks | Approved domains only; capture license; never fabricate a source. Only runs for `improve`/`gap` items. |
| 2 | **Curriculum Mapper** | Source records + catalog | `source-map.yml` `{course, bundle, pathway, lessonTitle, objective, sourceId, sourceUrl, ageRange, difficulty}` | Map to existing catalog slugs; flag gaps where no source supports a planned lesson; never invent a course. |
| 3 | **Age Adaptation** | Mapped concept | Per-age-band `{explanationStyle, vocabLevel, example, activityType, quizDifficulty, projectComplexity, videoTone}` | Simplify explanation only — never alter scientific truth. |
| 4 | **Lesson Builder** | Mapped concept + retrieved passages + age profile | Full lesson (see [templates.md](templates.md)) | No claim without a supporting passage; cite `sourceId` per section; no direct copying. |
| 5 | **Entertainment Layer** | Built lesson | Mission/story/quest framing, badges, level | Must reinforce the objective; never distract or change facts. |
| 6 | **Assessment** | Built lesson only | Quizzes, checks, rubric, completion + certificate criteria | Questions answerable purely from the lesson; mark answer keys. |
| 7 | **Video Script** | Built + entertained lesson, age profile | Scene-by-scene script (see [character-system.md](character-system.md) + tech) | Duration matches age band; quiz popups map to assessment. |
| 8 | **Character Consistency** | Topic + age band | Lumo variant identity + image/video prompt templates | Preserve core face/color/logo DNA across variants. |
| 9 | **Reviewer-prep** | All artifacts | Review packet + checklist pre-fill + source/URL validation report | Block if any source URL is dead or any claim is uncited. |
| 10 | **Publisher** | Approved artifacts | Lesson folder (markdown + `meta.yml`) + PR | Conform exactly to `curriculum-structure.ts` file conventions. |

## Model assignment (Opus 4.8 + Sonnet 4.6 only)

- **Claude Opus 4.8** — Source Collector, Mapper, Lesson Builder, Video Script (reasoning + long context).
- **Opus 4.8 or Sonnet 4.6** — Age Adaptation, Entertainment, Character Consistency.
- **Claude Sonnet 4.6** — classification, URL-liveness, similarity flags (high-volume passes).

All via the official Anthropic SDK with structured tool-use output.

## Canonical-list binding (anti-duplication / consistency)

Every agent receives the relevant canonical lists as input and must **select from them**, not invent:

- course/bundle/pathway slugs → [`prisma/catalog/*.data.ts`](../../prisma/catalog/)
- age bands → `AgeGroup` enum
- sources → approved `ReferenceSource` records
- character variants → the Lumo system ([character-system.md](character-system.md))

An agent may not invent a new course, slug, age band, source, or structure. The Mapper targets only existing, empty lesson shells; if a planned concept has no home in the catalog, it raises a gap for a human to resolve — it does not fabricate a course.
