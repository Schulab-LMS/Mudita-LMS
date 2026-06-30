# Example — Scratch (ages 8–10)

**Command:** "Use the SchuLab curriculum generator skill to create a Scratch
lesson for 'Scratch Starter: Coding with Blocks' for ages 8–10."

## Process
1. **Bind to catalog:** select an existing ages-8–10 coding course/bundle. Lumo
   variant = **Lumo Creator** (coding costume: code blocks / laptop).
2. **Source:** Scratch is an **Activity** source. Note licensing — treat
   code-along steps as **inspiration** and write **original** step-by-step
   instructions (do not copy tutorial text).
3. **Gap-check → source map → author → folder.**

## Key points
- `sources.json`: `sourceName: "Scratch"`, `sourceType: "Activity source"`,
  `licenseNotes: "inspiration/transformed — original instructions"`,
  `officialUrl: "https://scratch.mit.edu/"`.
- `lesson.md`: original instructions grounded in Scratch's block concepts
  (motion, loops, events), framed as a *Builder Challenge* mission.
- `activity.md`: "remix the starter and add your own dance" — **fully digital**,
  no hardware.
- `quiz.json`: 5 questions on loops/motion + a project check ("sprite repeats a
  4-step dance"), each `sourceReference: scratch`.
- `video-script.md`: activity-walkthrough, Lumo Creator demonstrating blocks,
  3–5 min.
- `tutor-notes.md`: common bug — "forgot the forever/repeat loop".
- `review-checklist.json`: `noCopyrightCopying` must be verified (similarity
  check) since Scratch tutorial text must not be reproduced.

`publishingStatus: needs_review` — human approves before merge.
