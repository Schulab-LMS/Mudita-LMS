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

Each source is a `ReferenceSource` row classified by `SourceStatus`. Only `ACTIVE`/`OPTIONAL` sources are retrievable for **curriculum** generation; `ENRICHMENT`/`HISTORICAL` are retrievable only for enrichment/inspiration prompts.

| Classification (`SourceStatus`) | Meaning | Use |
|---|---|---|
| `ACTIVE` | Current core source | Direct curriculum/activity reference |
| `OPTIONAL` | Simulator-first / advanced | Activity + simulation reference |
| `ENRICHMENT` | Articles, curiosity | Enrichment only |
| `HISTORICAL` | Kept for inspiration | Inspiration only (e.g. an inactive provider) |

Approved sources are seeded in [`reference-sources.data.ts`](../../prisma/catalog/reference-sources.data.ts). Examples: ScratchJr, Scratch, Code.org, Tynker, Create & Learn, MakeCode / MakeCode Arcade, MIT App Inventor, Khan Academy Computing, Raspberry Pi Projects, Code Club (coding/AI); NASA Space Place, NASA Kids' Club, ESA Kids, PhET, CK-12, NatGeo Kids, Smithsonian Science Education Center (science/STEM). Inactive providers (e.g. Google CS First) are `HISTORICAL` — inspiration only.

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
