# Tutor Support Model + Human Review & QA

## Tutor support model

SchuLab is self-learning first. Tutors **support**, they do not deliver lessons live.

**Tutors do:** answer questions (`LessonQuestion`/`LessonAnswer`), review final projects + capstones (`ActivitySubmission` → feedback), host optional Q&A (`Booking`), give feedback, unblock stuck students, validate certificates.

**Tutors do not:** deliver whole lessons live, re-explain every concept, manually grade every small quiz (auto-graded), or repeat video content.

Each lesson ships a **tutor note** (`tutor.md`, `TUTOR_ONLY` fences) covering: lesson intent, likely sticking points, the seeded "common student questions," correct project/capstone expectations, and escalation guidance. A "Need help?" affordance on each lesson routes to tutor Q&A.

## Human review & QA

**Review = PR review on the STEM-Curricula repo.** The Reviewer-prep Agent pre-fills the checklist and attaches the source/URL/coverage report.

**Roles:** Curriculum reviewer · Subject-matter reviewer · Child-safety reviewer · Language reviewer (en/ar/de + RTL) · Media reviewer · Final publisher.

**Checklist (all must pass):**

- [ ] Source exists & URL valid
- [ ] No invented facts / providers
- [ ] Age-appropriate
- [ ] Safe (no unsafe activity)
- [ ] No copied source text
- [ ] Clear learning objective
- [ ] Quiz matches lesson & answer keys correct
- [ ] Final project matches course
- [ ] Tutor note present
- [ ] Parent note present
- [ ] Video script matches lesson
- [ ] Lumo style consistent
- [ ] Localization complete (en/ar/de; RTL for ar)

## Lifecycle states

`Draft → Source collected → AI generated → Under review → Revision needed → Approved → Published → Archived`

Mapped onto existing `ContentStatus` (`SEED_NOW / NEEDS_REVIEW / …`) + `CourseStatus` (`DRAFT / PUBLISHED / ARCHIVED`), with intermediate AI states added via the new `AiContentStatus` enum (`SOURCE_COLLECTED · AI_GENERATED · UNDER_REVIEW · REVISION_NEEDED · APPROVED`). **No lesson reaches `PUBLISHED` without `aiStatus = APPROVED` and a non-empty source citation set.**
