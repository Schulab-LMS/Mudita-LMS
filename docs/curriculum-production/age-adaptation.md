# Age-Group Adaptation Rules

The same concept can be reused across bands, but explanation depth, vocabulary, examples, activity/quiz/project difficulty, character variant, and video length change. **Scientific/technical truth is constant across bands** — only the explanation is simplified, never the underlying fact.

| Band | Coding mode | Explanation | Activity | Quiz | Project | Video tone | Video length |
|---|---|---|---|---|---|---|---|
| 3–5 | none (play) | parent-guided, visual | tap/drag, offline play | 3 picture checks | guided craft | gentle, slow | 1–2 min |
| 5–7 | ScratchJr-style | simple story words | drag-and-drop | 3–5 checks | small create | playful | 2–4 min |
| 8–10 | creative coding | clear + examples | build game/animation | 5 questions | mini build | energetic | 3–5 min |
| 11–13 | projects + sims | problem-solving | simulations, AI literacy | 5–8 questions | applied project | curious | 4–7 min |
| 14–16 | Python/web/app | deeper, technical | code/data/AI builds | 8–10 questions | portfolio piece | mature | 5–8 min |
| 17–18 | product/capstone | rigorous, real-world | full prototype | 8–10 + open | capstone + entrepreneurship | professional | 6–10 min |

The Age Adaptation Agent emits, per band: `explanationStyle`, `vocabLevel`, `example`, `activityType`, `quizDifficulty`, `projectComplexity`, `videoTone`. The age band must be one of the canonical `AgeGroup` enum values — agents never invent a new band.
