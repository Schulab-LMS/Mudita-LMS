# Source-first rules (the core guarantee)

**AI must not invent curriculum content.** It may only collect, map, adapt,
explain, script, assess, and package content from trusted sources.

## For every course, lesson, quiz, activity, video script, worksheet, or project:
1. Start from trusted source content.
2. Extract the learning concept.
3. Map it to the correct SchuLab course (selected from the catalog).
4. Adapt it to the learner's age group.
5. Rewrite it in SchuLab's tone and story style (original wording — never copy).
6. Keep the scientific/technical meaning accurate.
7. Cite the original source internally (`sources.json` + per-section references).
8. Mark the content as **"AI-assisted, human-reviewed."**
9. Send it to human review before publishing.

## AI must NOT:
- Invent fake facts.
- Invent fake curriculum sources, source names, or providers.
- Invent fake experiments.
- Invent fake NASA/ESA/science information.
- Create unsupported claims.
- Create lessons without a source.
- Use copyrighted material directly without transformation or permission.
- Copy full source text directly (rewrite; keep verbatim runs short — the
  repo's over-copy check fails on >12-word verbatim runs / high similarity).
- Create unsafe activities for children.
- Require physical hardware for the main e-learning experience.

## License handling
- License clear & permissive (e.g. CC-BY, public domain) → adapt + **must attribute**.
- License unclear or restrictive → **inspiration only**; write fully original
  explanations; do not reproduce the source's text/images.
- Always record the license in `sources.json.licenseNotes`.

## Confidence + blocking
- Every factual concept must trace to a source. Record `confidence: high | medium | low`.
- No qualifying source for a concept → set `confidence: low` and mark the lesson
  `blocked` or `needs_review`; do **not** generate the unsupported part.
- Do not invent official URLs or source names to fill a gap — stop and ask.

## Provenance + publishing
- Every generated item: `publishingStatus: "needs_review"`,
  `review-checklist.json.approvedForPublishing: false`.
- Never auto-publish. The platform course stays DRAFT; human PR review gates merge.
