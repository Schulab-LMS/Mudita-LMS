# Human review & QA

No SchuLab lesson publishes without human review. The generator produces the
content as `needs_review`; reviewers approve before merge.

## Review roles
1. Curriculum reviewer
2. Subject-matter reviewer
3. Child-safety reviewer
4. Language reviewer (en / ar / de; RTL for Arabic)
5. Media reviewer (video script + character prompts)
6. Final publisher

## Checklist (all must pass — `review-checklist.json`)
- [ ] **sourceBacked** — every concept traces to an approved source
- [ ] **sourceUrlsValid** — every cited URL is live
- [ ] **noInventedFacts** — no fabricated facts/sources/providers/experiments
- [ ] **ageAppropriate** — matches the age band
- [ ] **safeForChildren** — no unsafe activity; no required hardware
- [ ] **noCopyrightCopying** — no verbatim source text; transformed + attributed
- [ ] **quizAnswersCorrect** — answer keys correct, answerable from the lesson
- [ ] **videoMatchesLesson** — script reflects the lesson content
- [ ] **characterConsistent** — Lumo on-model for the variant + topic
- [ ] **parentNoteIncluded**
- [ ] **tutorNoteIncluded**

`readyForHumanReview` → `true` after generation. `approvedForPublishing` → set
`true` ONLY by a human reviewer. On approval, the lesson is imported/merged and
`curriculum-sync` publishes it (platform owns metadata; the course flips to
PUBLISHED on the platform, not from the repo).
