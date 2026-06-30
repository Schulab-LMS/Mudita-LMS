# Example — NASA Space Place (ages 8–10)

**Command:** "Use the SchuLab curriculum generator skill to create a complete
lesson folder for 'NASA Space Explorer: Introduction to Space Science' for ages
8–10 using NASA Space Place."

## Process
1. **Bind to catalog (read-only):** course `nasa-space-explorer-intro` exists
   (`AGES_8_10`, `SCIENCE`) → Lumo variant = **Lumo Creator**, video 3–5 min.
   *(If it didn't exist, stop — never invent a course.)*
2. **Inventory / gap-check:** confirm the concept isn't already a complete lesson
   in the platform or the STEM-Curricula repo (no duplication). If it exists →
   keep it; pick a real gap instead.
3. **Source:** NASA Space Place is a **Core curriculum** source (public domain).
   `WebFetch https://spaceplace.nasa.gov/<topic>/en/`; quote key facts.
4. **Source map → author → assemble folder.**

## Key generated files (excerpts)

`sources.json`
```json
{ "sources": [{
  "sourceName": "NASA Space Place", "provider": "NASA",
  "officialUrl": "https://spaceplace.nasa.gov/moon-phases/en/",
  "sourceType": "Core curriculum source", "usedFor": "Moon phases explanation",
  "relatedConcepts": ["reflected sunlight", "Moon orbit", "phases", "~29.5 day cycle"],
  "licenseNotes": "NASA educational use (public domain)",
  "lastVerifiedDate": "2026-06-30", "confidence": "high" }] }
```

`lesson.json` (excerpt)
```json
{ "courseSlug": "nasa-space-explorer-intro", "lessonTitle": "Why does the Moon change shape?",
  "ageGroup": "AGES_8_10", "characterVersion": "Lumo Creator",
  "learningObjectives": ["Explain that the Moon reflects sunlight",
    "Explain that phases come from our changing view as the Moon orbits Earth"],
  "publishingStatus": "needs_review" }
```

`lesson.md` opens in Lumo Creator's voice: *"Hey explorers! Moon Detective
Mission — is the Moon really changing shape? Let's crack the case."* — explanation
rewritten in SchuLab's own words (never copied), grounded in the NASA facts.

`quiz.json` — 5 MCQs answerable from the handout (e.g. "What lights up the Moon?"
→ "Sunlight bouncing off the Moon", `sourceReference: nasa-space-place`).

`review-checklist.json` → `readyForHumanReview: true`, `approvedForPublishing: false`.

## Verify + PR (deterministic tooling)
`materialize-lesson.ts --in <envelope.json>` writes the repo folder + runs the
Task-7 verification (coverage · over-copy · URL liveness); then
`open-lesson-pr.ts … --execute` opens the human-review PR. (Real run of this
exact lesson **passed** verification with no API key.)
