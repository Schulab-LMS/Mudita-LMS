# Lesson folder + schemas

A complete lesson folder contains these files (templates in
`templates/lesson-folder-template/`):

```
lesson.json          quiz.json            metadata.json
lesson.md            activity.md          sources.json
project.md           video-script.md      review-checklist.json
character-prompts.md tutor-notes.md       parent-notes.md
```

> **Metadata ownership.** Course/bundle/pathway/age group/level/category in
> `lesson.json` are **selected from the existing SchuLab catalog** for routing +
> reviewer context — never invented, never authoritative. The platform DB is the
> source of truth. When importing to the curriculum repo, these are NOT written
> into `meta.yml` (which carries content + source provenance only).

## lesson.json
```json
{
  "courseTitle": "",
  "courseSlug": "",
  "lessonTitle": "",
  "lessonSlug": "",
  "ageGroup": "",
  "level": "",
  "bundle": "",
  "pathway": "",
  "category": "",
  "learningObjectives": [],
  "skillsGained": [],
  "toolsUsed": [],
  "sourceReferences": [],
  "estimatedDurationMinutes": 0,
  "videoDurationMinutes": 0,
  "characterVersion": "",
  "finalTask": "",
  "certificateEligible": true,
  "publishingStatus": "needs_review"
}
```

## sources.json
```json
{
  "sources": [
    {
      "sourceName": "",
      "provider": "",
      "officialUrl": "",
      "sourceType": "",
      "usedFor": "",
      "relatedConcepts": [],
      "licenseNotes": "",
      "lastVerifiedDate": "",
      "confidence": "high | medium | low"
    }
  ]
}
```
Rules: every factual concept must have a source; missing source → `confidence: low`
+ content `blocked`/`needs_review`; never invent official URLs or source names.

## quiz.json
```json
{
  "quizTitle": "",
  "ageGroup": "",
  "questions": [
    {
      "type": "multiple_choice | true_false | short_answer | matching",
      "question": "",
      "options": [],
      "correctAnswer": "",
      "explanation": "",
      "sourceReference": ""
    }
  ],
  "passingScore": 70
}
```
Every answer must be supported by lesson content. Match quiz difficulty to the
age band (see age-groups.md).

## review-checklist.json
```json
{
  "sourceBacked": false,
  "sourceUrlsValid": false,
  "noInventedFacts": false,
  "ageAppropriate": false,
  "safeForChildren": false,
  "noCopyrightCopying": false,
  "quizAnswersCorrect": false,
  "videoMatchesLesson": false,
  "characterConsistent": false,
  "parentNoteIncluded": false,
  "tutorNoteIncluded": false,
  "readyForHumanReview": true,
  "approvedForPublishing": false
}
```
`approvedForPublishing` is always `false` by default; `readyForHumanReview` may
be `true` after generation. Human review is required before publishing.

## metadata.json
Carries content-level provenance for import: lesson title/slug, source
references + URLs, `aiAssisted: true`, `lastVerifiedDate`, `publishingStatus`.
(Platform metadata is referenced in lesson.json, not duplicated here.)

## Repo import mapping
`lesson.md`→`handout.md` · `activity.md`→`activity.md` · `quiz.json`→`quiz.md` ·
`video-script.md`→`video/script.md` · `sources.json`→`meta.yml` `source` /
`secondarySources` · `tutor-notes.md`→`tutor.md`. Run
`scripts/curriculum-agents/materialize-lesson.ts` to write + Task-7 verify.
