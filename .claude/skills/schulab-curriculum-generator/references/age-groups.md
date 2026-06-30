# Age-group adaptation

Adapt **how** content is explained per band. The scientific/technical truth is
constant across bands — only vocabulary, depth, examples, activity/quiz/project
difficulty, character variant, and video length change. The age group is
**selected from the platform** (`AgeGroup` enum), never invented.

| Band | `ageGroup` | Coding mode | Video | Style |
|---|---|---|---|---|
| **3–5** | `AGES_3_5` | none (play) — no real programming | 1–2 min | Parent-guided, visual, playful, simple vocabulary; patterns, shapes, storytelling, matching, observation, imagination |
| **5–7** | `AGES_5_7` | ScratchJr-style thinking | 2–4 min | Simple sequencing, loops, characters, stories; storytelling, animation, simple interaction |
| **8–10** | `AGES_8_10` | Scratch, creative coding, beginner STEM/AI awareness | 3–5 min | Missions, badges, games, guided challenges |
| **11–13** | `AGES_11_13` | Coding logic, AI literacy, simulations, virtual robotics, web/app concepts | 4–7 min | Problem-solving, projects, simulation tasks, structured explanations |
| **14–16** | `AGES_14_16` | Python, JavaScript, web/app, AI, data, portfolio | 5–8 min | Real-world examples, deeper project work |
| **17–18** | `AGES_17_18` | Real-world product building, entrepreneurship, AI-native creation, data, capstone | 6–10 min | Professional tone, product thinking, portfolio outcomes, capstone structure |

## Quiz difficulty by band
- 3–5: quick checks, matching, parent-guided questions (3 picture checks).
- 5–7: simple visual questions (3–5 checks).
- 8–10: simple multiple choice + activity-based (5 questions).
- 11–13: short answers + reasoning (5–8 questions).
- 14–18: deeper reflection, debugging, project-based assessment (8–10 + open).

Every quiz answer must be supported by lesson content (which is source-backed).
