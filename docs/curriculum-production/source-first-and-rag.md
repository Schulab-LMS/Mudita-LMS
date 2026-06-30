# Source-First Workflow + RAG Gating

## The source-first flow

```
[Approved ReferenceSource set]
      │  (Source Collector — approved domains ONLY)
      ▼
[Extract concept] → [Map to SchuLab course/lesson] → [Adapt to age band]
      │
      ▼
[Rewrite in SchuLab voice + Lumo story style]   ← keep scientific meaning exact
      │
      ▼
[Cite source internally: sourceId + url + license]
      │
      ▼
[Tag "AI-assisted, human-reviewed"]  →  [PR to STEM-Curricula repo]
      │
      ▼
[Human review (6 roles, checklist)]  →  merge  →  curriculum-sync publishes
```

## Absolute prohibitions

Enforced by the RAG gate + reviewer checklist + automated checks:

- No invented facts, sources, experiments, or agency data (NASA/ESA/etc.).
- No unsupported claims; no lesson without a source.
- No direct copying of full source text; no copyrighted material reused without transformation/permission.
- No unsafe activities for children.

## The Trusted Source Library

Approved sources only — seeded in [`reference-sources.data.ts`](../../prisma/catalog/reference-sources.data.ts). No fabricated sources/providers/URLs, ever. Each source carries a **6-category classification** (`sourceType`) and a **retrieval status** (`SourceStatus`) that drives the RAG gate.

| Category (`sourceType`) | Meaning | `status` | Grounds curriculum? |
|---|---|---|---|
| **Core curriculum source** | Direct scope/sequence | `ACTIVE` | ✅ yes |
| **Activity source** | Projects / activities | `ACTIVE` | ✅ yes |
| **Simulation source** | Interactive sims (simulator-first) | `OPTIONAL` | ✅ yes |
| **Enrichment source** | Curiosity / extension only | `ENRICHMENT` | ❌ enrichment prompts only |
| **Marketplace/discovery inspiration** | Commercial platform — model/idea only | `ENRICHMENT` | ❌ inspiration only, never grounding |
| **Historical reference only** | Inactive provider | `HISTORICAL` | ❌ inspiration only |

Curriculum generation retrieves **only `ACTIVE` + `OPTIONAL`** chunks (rag.service `CURRICULUM_STATUSES`) — i.e. Core curriculum, Activity, and Simulation sources. Enrichment, Marketplace, and Historical sources are never used to ground a lesson.

**The library:**
- *Core curriculum:* Code.org, Khan Academy Computing, CK-12, NASA Space Place, ESA Kids.
- *Activity:* ScratchJr, Scratch, MakeCode, MakeCode Arcade, MIT App Inventor, Raspberry Pi Projects, Code Club, NASA Kids' Club, Smithsonian Science Education Center.
- *Simulation:* PhET, micro:bit.
- *Enrichment:* National Geographic Kids.
- *Marketplace/discovery inspiration:* Tynker, Create & Learn, Outschool (commercial — never copied or used to ground lessons).
- *Historical:* Google CS First (phased out — inspiration only).

## License handling (wired to `MetaSourceRef.license` + `SourceStatus`)

- License clear & permissive (e.g. CC-BY) → may adapt + **must attribute**.
- License unclear or restrictive → use as **inspiration only**; write fully original explanations; mark source `ENRICHMENT`/`HISTORICAL`.
- Source inactive → `HISTORICAL`, inspiration only.

## RAG / source-grounded generation

**Knowledge base.** Each approved `ReferenceSource` is fetched (respecting robots/ToS), chunked, embedded, and stored as `SourceChunk` with metadata `{sourceId, url, provider, sourceType, ageRange, license, status}`.

**Generation contract.** For every learner-facing section the Lesson/Assessment/Video agents:

1. Issue a retrieval query for the concept + age band.
2. Receive top-k passages with `sourceId`/`url`/`license`.
3. Generate grounded in those passages, emitting per section:
   `{sourceId, sourceUrl, extractedNotes, generatedSection, confidence, reviewStatus, lastVerified}`.

**Gate rules:**

- **No qualifying passage retrieved ⇒ do not generate** that section; emit a `needs_source` flag for a human.
- A claim not supported by a retrieved passage ⇒ **removed** (or downgraded to an "open question" for the tutor).
- Topic too advanced for the band ⇒ simplify the *explanation*, never the underlying truth.
- Confidence below threshold or license unclear ⇒ `reviewStatus = needs_human_review`.

**Verification (RAG-gated tier).** Reviewer-prep runs: (a) source-URL liveness check, (b) claim→passage coverage check (every paragraph references at least one retrieved `sourceId`), (c) a similarity check vs source text to catch over-copying. Failures block the PR.
