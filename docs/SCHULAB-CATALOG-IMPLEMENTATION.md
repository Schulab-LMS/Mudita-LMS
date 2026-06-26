# SchuLab Catalog Expansion — Implementation Reference

**Status:** Implemented in repo (data + schema + seed + partial UI). NEW courses are seeded as `DRAFT` with placeholder lessons (`contentStatus = SEED_NOW`) pending curriculum authoring / Git sync.
**To apply:** run `npx prisma migrate deploy` then `npm run db:seed`.
**Last reconciled against code:** 2026-06-26.

> This document is grounded in the actual repository. Every claim cites a file path. Where a capability is not yet built, it is marked **TODO**.

---

## 1. Executive Summary

The catalog expansion adds three things on top of the existing `Course → Module → Lesson` model:

1. **A vetted reference-source registry** — 19 real, reputable, digital-first external sources (ScratchJr, Scratch, Code.org, NASA Space Place, ESA Kids, PhET, …). Sources are platform-global rows credited on courses, bundles and pathways via three ordered join tables. Source data: `prisma/catalog/reference-sources.data.ts`; model: `prisma/schema.prisma` (`ReferenceSource`, lines 565–586).
2. **A full master course list of 115 catalog course entries** across the 6 age bands — **81 NEW** courses (created with placeholder modules/lessons, `status = DRAFT`, `contentStatus = SEED_NOW`), **9** mapped-existing courses awaiting curriculum review (`NEEDS_REVIEW`), and **25** imported-existing courses (`IMPORTED_EXISTING`, enriched in place, never duplicated). Data: `prisma/catalog/courses-*.data.ts`.
3. **11 themed bundles and 6 age-based learning pathways**, each ending in a capstone/final project and each crediting its reference sources. Data: `prisma/catalog/bundles.data.ts`, `prisma/catalog/pathways.data.ts`.

Everything is wired by a single idempotent seeder, `prisma/seed-catalog.ts` (`seedCatalog()`), called from `prisma/seed.ts` after base courses exist. The schema change ships as migration `prisma/migrations/20260626160000_reference_sources_and_content_status/migration.sql` (the `ReferenceSource` catalog + 3 join tables + `ContentStatus`/`SourceStatus` enums + `Course.contentStatus`/`adminNotes`). The bundle/pathway models and the 6-band `AgeGroup` enum landed in the earlier migration `20260626120000_add_bundles_pathways_6band_ages`; bundle-completion certificates in `20260626140000_certificate_bundle`.

> **Count note:** `seed-catalog.ts`'s header comment says "93-course master list"; the data files as currently committed contain **115** course entries (`grep -rh '^    slug:' prisma/catalog/courses-*.data.ts | wc -l` → 115). The seeder iterates the actual arrays, so 115 is authoritative; the comment is stale.

**Source-status mix (19 sources):** 14 `ACTIVE`, 2 `ENRICHMENT` (Nat Geo Kids, Smithsonian SSEC), 2 `OPTIONAL` (micro:bit, Outschool), 1 `HISTORICAL` (Google CS First).

**Course content-status mix (115):** 81 `SEED_NOW`, 25 `IMPORTED_EXISTING`, 9 `NEEDS_REVIEW`.

---

## 2. Final Reference Source List (19)

Verbatim from `prisma/catalog/reference-sources.data.ts`. `key` is the stable seed handle used to attach a source without knowing its generated id.

| # | key | Name | Provider | Official URL | Status | Usage in SchuLab |
|---|-----|------|----------|--------------|--------|------------------|
| 1 | `scratchjr` | ScratchJr | ScratchJr (DevTech Research Group, MIT Media Lab & others) | https://www.scratchjr.org/ | ACTIVE | Block-based first-coding for ages 5–7: interactive stories, animation, sequencing and simple games. |
| 2 | `scratch` | Scratch | Scratch Foundation / MIT Media Lab | https://scratch.mit.edu/ | ACTIVE | Core block-based coding for ages 8+: animation, games, interactive stories and creative coding projects. |
| 3 | `code-org` | Code.org | Code.org | https://code.org/ | ACTIVE | K–12 CS scope and sequence: coding fundamentals, AI literacy, digital citizenship and web/programming concepts. |
| 4 | `tynker` | Tynker | Tynker | https://www.tynker.com/ | ACTIVE | Beginner-to-intermediate creative and game-based coding, plus an introduction to AI/ML for kids. |
| 5 | `create-learn` | Create & Learn | Create & Learn | https://www.create-learn.us/ | ACTIVE | Online-class model for AI, Python and virtual robotics; project-based, fully digital delivery. |
| 6 | `makecode` | Microsoft MakeCode | Microsoft | https://www.microsoft.com/en-us/makecode | ACTIVE | Simulator-first block→JavaScript→Python progression and MakeCode Arcade game building. No hardware required. |
| 7 | `app-inventor` | MIT App Inventor | MIT | https://appinventor.mit.edu/ | ACTIVE | Mobile app prototyping and AI-related app projects for older students. |
| 8 | `khan-computing` | Khan Academy Computing | Khan Academy | https://www.khanacademy.org/computing | ACTIVE | JavaScript, HTML/CSS, web development and programming foundations for teens. |
| 9 | `nasa-space-place` | NASA Space Place | NASA | https://spaceplace.nasa.gov/ | ACTIVE | Primary space-science source: solar system, astronomy, Earth-from-space and NASA digital STEM activities. *(notes: existing platform space courses are mapped to this source and marked IMPORTED_EXISTING.)* |
| 10 | `esa-kids` | ESA Kids / ESA Space for Kids | European Space Agency (ESA) | https://www.esa.int/kids/en/home | ACTIVE | European space missions, satellites, Earth observation and astronomy for children. |
| 11 | `phet` | PhET Interactive Simulations | University of Colorado Boulder | https://phet.colorado.edu/ | ACTIVE | Interactive science and math simulations for digital experiments (forces, energy, waves, chemistry). |
| 12 | `ck12` | CK-12 Foundation | CK-12 Foundation | https://www.ck12.org/ | ACTIVE | Digital science/math FlexBooks and adaptive practice for STEM enrichment. |
| 13 | `raspberry-pi` | Raspberry Pi Foundation Projects | Raspberry Pi Foundation | https://projects.raspberrypi.org/ | ACTIVE | Project-based Scratch, Python and HTML/CSS making. Used digital-first; no hardware requirement. |
| 14 | `code-club` | Code Club Projects | Raspberry Pi Foundation | https://codeclub.org/ | ACTIVE | Creative youth coding projects across Scratch, Python and HTML/CSS. |
| 15 | `natgeo-kids` | National Geographic Kids | National Geographic | https://kids.nationalgeographic.com/ | ENRICHMENT | Enrichment only: Earth science, environment and space curiosity articles, quizzes and images. |
| 16 | `smithsonian-ssec` | Smithsonian Science Education Center | Smithsonian Institution | https://ssec.si.edu/ | ENRICHMENT | Enrichment only: inquiry-based science activities and science-project design models. |
| 17 | `microbit` | micro:bit / MakeCode micro:bit | Micro:bit Educational Foundation | https://microbit.org/ | OPTIONAL | Simulator-first block→JavaScript/Python coding via makecode.microbit.org — used entirely in-browser, no hardware required. *(notes: hardware optional only for offline workshops/camps.)* |
| 18 | `outschool` | Outschool | Outschool | https://outschool.com/ | OPTIONAL | Inspiration only for marketplace/course discovery, age filters and flexible browsing. NOT a curriculum source. |
| 19 | `google-cs-first` | Google CS First / Experience CS | Google | https://csfirst.withgoogle.com/ | HISTORICAL | Historical inspiration only — not treated as an active core source. |

> All URLs/providers are verbatim from the owner's vetted list. No fabricated sources. Hardware-centric sources (micro:bit, Raspberry Pi) are used simulator-first / project-first, never as a hardware requirement (see file header comment).

---

## 3. Recommended Information Architecture

The catalog has four first-class entities and a public browse surface with three tabs.

```
                         ┌────────────────────┐
                         │  ReferenceSource    │  (19 global rows, by `key`)
                         └─────────┬──────────┘
              ┌────────────────────┼─────────────────────┐
   CourseReferenceSource   BundleReferenceSource   PathwayReferenceSource
   (ordered join)          (ordered join)          (ordered join)
              │                    │                       │
        ┌─────▼─────┐        ┌─────▼─────┐          ┌──────▼────────┐
        │  Course   │◄──────►│  Bundle   │◄────────►│ LearningPathway│
        │ (Module → │ Bundle │ (themed   │ Pathway  │ (age-band      │
        │  Lesson)  │ Course │  group)   │ Stage    │  journey)      │
        └─────┬─────┘        └───────────┘          └──────┬─────────┘
              │ nextCourse (self-relation)                 │
              └────────────────────────────────────────────┘
                    PathwayStage points at EXACTLY ONE of Bundle | Course
```

- **Course** — the atomic learning unit (`Course → Module → Lesson`). Has `ageGroup`, `level`, `category`, `requiredPlan`, `contentStatus`, an optional `nextCourseId` (linear "next recommended" pointer), and many-to-many membership in bundles and pathways.
- **Bundle** — a themed, ordered group of courses (via `BundleCourse`, carrying `order` + `isRequired`) ending in a final project. Subscription-first via `requiredPlan`. Reusable across pathways.
- **LearningPathway** — an age-band journey made of ordered `PathwayStage` rows; each stage references **exactly one** bundle **or** one course (DB `CHECK` constraint, §10). Ends in a capstone course stage.
- **ReferenceSource** — a global registry of vetted external sources, credited (ordered) on courses, bundles and pathways.

Public browse surface: `src/components/course/catalog-tabs.tsx` renders three tabs — **Courses** (`/courses`), **Bundles** (`/bundles`), **Pathways** (`/pathways`). Detail pages live at `/courses/[slug]`, `/bundles/[slug]`, `/pathways/[slug]` under `src/app/[locale]/(public)/`.

A course can belong to **many** bundles and **many** pathway stages simultaneously (e.g. `earth-from-space` appears in both the Digital STEM Explorer and Space Science bundles). Bundles can be reused as stages across multiple pathways.

---

## 4. Final Age-Based Pathways (6)

From `prisma/catalog/pathways.data.ts`. Each pathway maps to one `AgeGroup`, holds ordered stages (each a bundle or course), credits reference sources, and ends in a capstone. All are seeded `status = PUBLISHED`.

### 4.1 Digital Discovery — `digital-discovery` (AGES_3_5)
Pre-coding, storytelling, simple STEM discovery — no real programming.
**Sources:** code-org, scratchjr, nasa-space-place, natgeo-kids, outschool.
**Stages (all courses):** 1 Shapes, Patterns & Logic (`digital-discovery-shapes-patterns-logic`) → 2 Creative Thinking (`creative-thinking-little-explorers`) → 3 Pre-Coding with Sequencing (`pre-coding-sequencing-games`) → 4 My First Digital Story (`my-first-digital-story`) → 5 Digital Art & Imagination (`digital-art-and-imagination`) → 6 Simple STEM Challenges (`simple-stem-challenges-young-learners`).
**Capstone:** the Simple STEM Challenges discovery board. (adminNotes: ages 3–5 pre-coding only; next pathway: Junior Creator.)

### 4.2 Junior Creator — `junior-creator` (AGES_5_7)
ScratchJr visual coding, animation, simple games.
**Sources:** scratchjr, code-org, tynker, nasa-space-place, natgeo-kids.
**Stages:** 1 Coding Starter *(bundle `coding-starter-bundle`)* → 2 Digital Creativity *(bundle `digital-creativity-bundle`)* → 3 Junior Creator Final Project *(course `junior-creator-final-project`)*.
**Capstone:** present an interactive ScratchJr story, animation or simple game.

### 4.3 Creative Coder — `creative-coder` (AGES_8_10)
Blocks → Scratch projects, games, beginner AI awareness, NASA/ESA enrichment.
**Sources:** scratch, code-org, tynker, makecode, raspberry-pi, code-club, nasa-space-place, esa-kids.
**Stages:** 1 Creative Coding & Game Design *(bundle `creative-coding-game-design-bundle`)* → 2 AI Around Us *(course `ai-around-us`)* → 3 Space Science (NASA & ESA) *(bundle `space-science-nasa-esa-explorer-bundle`)* → 4 Creative Coder Final Project *(course `creative-coder-final-project`)*.
**Capstone:** a Scratch animation, game or digital STEM/space project.

### 4.4 STEM Builder — `stem-builder` (AGES_11_13)
Coding logic, AI literacy, game design, web basics, virtual robotics, simulations, space.
**Sources:** code-org, create-learn, tynker, makecode, app-inventor, nasa-space-place, esa-kids, phet, ck12, smithsonian-ssec.
**Stages:** 1 AI Native Kids *(bundle `ai-native-kids-bundle`)* → 2 Virtual Robotics & Simulation *(bundle `virtual-robotics-simulation-bundle`)* → 3 Interactive Science Simulations *(bundle `interactive-science-simulations-bundle`)* → 4 Digital STEM Explorer *(bundle `digital-stem-explorer-bundle`)* → 5 STEM Builder Final Project *(course `stem-builder-final-project`)*.
**Capstone:** a digital STEM project using coding, logic, AI awareness, simulation or space science.

### 4.5 Tech Innovator — `tech-innovator` (AGES_14_16)
Python, JavaScript, web/app dev, AI projects, data basics; portfolio-based.
**Sources:** code-org, khan-computing, app-inventor, makecode, create-learn, tynker, raspberry-pi, code-club, phet, nasa-space-place, esa-kids.
**Stages:** 1 Web & App Builder *(bundle `web-app-builder-bundle`)* → 2 Python Starter for Teens *(course)* → 3 AI Literacy & Responsible AI *(course `ai-literacy-ethics`)* → 4 Data Basics with Python *(course)* → 5 Tech Innovator Portfolio Project *(course)*.
**Capstone:** a portfolio-ready web, app, Python, AI, data or simulation project.

### 4.6 Future Tech Leader — `future-tech-leader` (AGES_17_18)
Real-world digital projects, AI-native creation, entrepreneurship, product/data thinking, portfolio + pitch.
**Sources:** code-org, khan-computing, app-inventor, create-learn, makecode, raspberry-pi, code-club, nasa-space-place, esa-kids, outschool.
**Stages:** 1 Future Tech Leader *(bundle `future-tech-leader-bundle`)* → 2 Data Thinking for Future Leaders *(course)* → 3 App Prototype Development *(course)* → 4 Future Tech Leader Capstone *(course `future-tech-leader-capstone-project`)*.
**Capstone:** a real-world digital product, AI project, app prototype, data or portfolio project. (Final child pathway; next: advanced specialization, competitions, internships, entrepreneurship.)

---

## 5. Final Course Bundles (11)

From `prisma/catalog/bundles.data.ts`. Each bundle is seeded `status = PUBLISHED`, subscription-first (`requiredPlan`), with `learningObjectives` stored as `{ en: [...], ar: [], de: [] }` JSON. Courses are listed **in order**; `isRequired` defaults `true`.

| Bundle (slug) | Age | Plan | Weeks | Sources | Final Project |
|---|---|---|---|---|---|
| Coding Starter (`coding-starter-bundle`) | 5–7 | LEARNER | 6 | scratchjr, scratch, code-org, tynker | My First Interactive Story or Game |
| Creative Coding & Game Design (`creative-coding-game-design-bundle`) | 8–10 | LEARNER | 8 | scratch, tynker, makecode, code-org, raspberry-pi, code-club | Playable Digital Game |
| AI Native Kids (`ai-native-kids-bundle`) | 11–13 | PRO | 6 | code-org, create-learn, tynker, app-inventor | AI-Assisted Creation + Reflection |
| Web & App Builder (`web-app-builder-bundle`) | 14–16 | PRO | 10 | khan-computing, code-org, app-inventor, makecode, raspberry-pi, code-club | Website or App Prototype Demo |
| Digital STEM Explorer (`digital-stem-explorer-bundle`) | 8–10 | LEARNER | 10 | code-org, nasa-space-place, phet, ck12, smithsonian-ssec, makecode, scratch | Digital STEM Challenge Presentation |
| Virtual Robotics & Simulation (`virtual-robotics-simulation-bundle`) | 11–13 | PRO | 8 | create-learn, makecode, code-org, tynker, microbit | Virtual Robotics Simulation Challenge |
| Digital Creativity (`digital-creativity-bundle`) | 5–7 | LEARNER | 7 | scratchjr, scratch, tynker, code-org | Digital Creativity Showcase |
| Future Tech Leader (`future-tech-leader-bundle`) | 17–18 | PRO | 12 | code-org, khan-computing, create-learn, app-inventor, makecode, raspberry-pi, code-club | Portfolio-Ready Product + Pitch |
| Space Science: NASA & ESA Explorer (`space-science-nasa-esa-explorer-bundle`) | 8–10 | LEARNER | 10 | nasa-space-place, esa-kids, natgeo-kids | Space Science Showcase |
| Interactive Science Simulations (`interactive-science-simulations-bundle`) | 11–13 | LEARNER | 8 | phet, ck12, smithsonian-ssec | Simulation-Based Science Report |
| Creative Coding Projects (`creative-coding-projects-bundle`) | 8–10 | LEARNER | 10 | raspberry-pi, code-club, scratch, makecode | Coding Project Showcase |

### 5.1 Courses-in-order, objectives & notes per bundle

- **Coding Starter** — objectives: sequencing, simple loops, digital stories, simple animations, beginner game. Courses: `scratchjr-first-stories` → `sequencing-loops-young-coders` → `scratch-starter-coding-blocks` → `animation-storytelling-scratch` → `my-first-interactive-game` → `coding-starter-final-project`.
- **Creative Coding & Game Design** — objectives: game mechanics, events/conditions, character controls, scoring, multi-level games, present a game. Courses: `scratch-game-design-level-1` → `game-design-level-2` → `character-movement-controls` → `events-conditions-scoring` → `build-a-multi-level-game` → `creative-coding-game-showcase`.
- **AI Native Kids** — objectives: what AI is, AI in daily life, responsible prompts, data/patterns, AI creativity, AI ethics, beginner AI project. Courses: `ai-around-us` → `ai-basics-young-innovators` → `prompt-engineering-for-students` → `ai-art-creative-tools` → `data-patterns-ml-basics` → `responsible-ai-digital-ethics` → `ai-native-kids-final-project`.
- **Web & App Builder** — objectives: web page structure, HTML/CSS, basic JS interaction, app design thinking, mobile app prototype, present demo. Courses: `web-basics-build-your-first-page` → `html-css-build-first-website` → `javascript-basics-interactive-web` → `app-design-thinking-for-kids` → `app-development-basics` → `web-app-builder-final-demo`.
- **Digital STEM Explorer** — objectives: logic & problem solving, patterns, STEM via digital activities, simulations, NASA-inspired STEM, document experiments, present. Courses: `logic-problem-solving` → `digital-stem-experiments` → `math-patterns-and-games` → `science-simulation-explorer` → `nasa-digital-stem-activities` → `earth-from-space` → `space-science-games-challenges` → `engineering-thinking-for-kids` → `space-science-missions` → `digital-experiment-report-project`.
- **Virtual Robotics & Simulation** — *(adminNotes: DIGITAL-FIRST — must NOT require physical robots, LEGO, Arduino or shipped materials; simulator-first only.)* Courses: `junior-robotics-automation` → `robot-movement-direction-logic` → `sensors-decisions-simulation` → `robotics-challenge-maze-solver` → `automation-thinking-students` → `virtual-robotics-final-challenge`.
- **Digital Creativity** — objectives: digital stories, characters/animations, art+coding, sound/interaction, creative expression, final showcase. Courses: `my-first-digital-story` → `digital-storytelling-with-characters` → `scratchjr-animation-adventures` → `animation-storytelling-scratch` → `digital-art-and-imagination` → `music-sound-interaction` → `digital-creativity-final-showcase`.
- **Future Tech Leader** — objectives: real-world Python, AI project structure, data basics, web product, product builder mindset, digital portfolio, capstone. Courses: `python-starter-for-teens` → `python-real-world-projects` → `ai-project-builder` → `data-basics-with-python` → `web-product-development` → `entrepreneurship-product-thinking` → `build-your-digital-portfolio` → `future-tech-leader-capstone-project`.
- **Space Science: NASA & ESA Explorer** — *(adminNotes: no coding prerequisite; existing space courses mapped here as IMPORTED_EXISTING, no duplicates.)* Courses: `nasa-space-explorer-intro` → `esa-space-for-kids-missions` → `solar-system-explorer` → `planets-moons-space-objects` → `earth-from-space` → `sun-earth-connection` → `stars-galaxies-universe` → `space-science-games-challenges` → `space-science-missions` → `space-science-final-project`.
- **Interactive Science Simulations** — objectives: simulate science concepts, forces/motion, energy/electricity, light/sound/waves, basic chemistry, Earth science digitally, experiment report. Courses: `science-simulation-explorer` → `forces-motion-simulations` → `energy-electricity-explorer` → `light-sound-waves-explorer` → `chemistry-basics-simulations` → `earth-science-digital-lab` → `digital-experiment-report-project`.
- **Creative Coding Projects** — objectives: practical coding projects, practice Scratch/Python/HTML-CSS/MakeCode, learn by building, confidence, present. Courses: `scratch-creative-projects` → `build-your-first-coding-game` → `python-starter-projects` → `html-css-project-lab` → `makecode-arcade-game-builder` → `creative-coding-showcase`.

---

## 6. Full Master Course Seed List

All 115 entries from `prisma/catalog/courses-*.data.ts`. **New** = no `existing` flag (created with placeholder lessons). **Mapped/Imported** = `existing: true` (enriched in place, never duplicated). `contentStatus` legend: `SEED_NOW` (skeleton, ready to author), `NEEDS_REVIEW` (seeded, awaiting curriculum review), `IMPORTED_EXISTING` (mapped from pre-existing platform content).

### Ages 3–5 (`courses-ages-3-5.data.ts`) — 11

| Title | slug | Level | Category | Origin | contentStatus |
|---|---|---|---|---|---|
| Digital Discovery: Shapes, Patterns, and Logic | `digital-discovery-shapes-patterns-logic` | BEGINNER | CODING | New (free) | SEED_NOW |
| My First Digital Story | `my-first-digital-story` | BEGINNER | ARTS | New | SEED_NOW |
| Creative Thinking for Little Explorers | `creative-thinking-little-explorers` | BEGINNER | ARTS | New | SEED_NOW |
| Pre-Coding with Sequencing Games | `pre-coding-sequencing-games` | BEGINNER | CODING | New | SEED_NOW |
| Digital Art and Imagination | `digital-art-and-imagination` | BEGINNER | ARTS | New | SEED_NOW |
| Simple STEM Challenges for Young Learners | `simple-stem-challenges-young-learners` | BEGINNER | SCIENCE | New | SEED_NOW |
| Wonder Lab: Science for Tiny Explorers | `wonder-lab-science-tiny-explorers` | BEGINNER | SCIENCE | Existing | IMPORTED_EXISTING |
| Little Coders Unplugged | `little-coders-unplugged` | BEGINNER | CODING | Existing | IMPORTED_EXISTING |
| Tiny Builders (Digital) | `tiny-engineers` | BEGINNER | ENGINEERING | Existing | IMPORTED_EXISTING |
| Space & Sky | `space-and-sky` | BEGINNER | SCIENCE | Existing | IMPORTED_EXISTING |
| Creative Robot Stories | `creative-robot-stories` | BEGINNER | CODING | Existing | IMPORTED_EXISTING |

### Ages 5–7 (`courses-ages-5-7.data.ts`) — 12

| Title | slug | Level | Category | Origin | contentStatus |
|---|---|---|---|---|---|
| ScratchJr Animation Adventures | `scratchjr-animation-adventures` | BEGINNER | ARTS | New | SEED_NOW |
| Sequencing and Loops for Young Coders | `sequencing-loops-young-coders` | BEGINNER | CODING | New | SEED_NOW |
| My First Interactive Game | `my-first-interactive-game` | BEGINNER | CODING | New | SEED_NOW |
| Digital Storytelling with Characters | `digital-storytelling-with-characters` | BEGINNER | ARTS | New | SEED_NOW |
| Junior Creator Final Project | `junior-creator-final-project` | BEGINNER | CODING | New | SEED_NOW |
| ScratchJr: First Stories | `scratchjr-first-stories` | BEGINNER | CODING | Existing (mapped) | NEEDS_REVIEW |
| Coding Adventures with Blocks | `coding-adventures-blocks` | BEGINNER | CODING | Existing | IMPORTED_EXISTING |
| Science Detectives | `science-detectives` | BEGINNER | SCIENCE | Existing | IMPORTED_EXISTING |
| Digital Inventor Studio | `inventor-studio` | BEGINNER | ENGINEERING | Existing | IMPORTED_EXISTING |
| AI Around Us | `ai-around-us` | BEGINNER | AI | Existing | IMPORTED_EXISTING |
| Smart & Safe Online | `smart-safe-online` | BEGINNER | TECHNOLOGY | Existing | IMPORTED_EXISTING |
| Digital Creativity Studio | `digital-creativity-studio` | BEGINNER | ARTS | Existing (mapped) | NEEDS_REVIEW |

### Ages 8–10 (`courses-ages-8-10.data.ts`) — 25

| Title | slug | Level | Category | Origin | contentStatus |
|---|---|---|---|---|---|
| Scratch Starter: Coding with Blocks | `scratch-starter-coding-blocks` | BEGINNER | CODING | New | SEED_NOW |
| Scratch Game Design Level 1 | `scratch-game-design-level-1` | INTERMEDIATE | CODING | New | SEED_NOW |
| Problem Solving with Code | `problem-solving-with-code` | BEGINNER | CODING | New | SEED_NOW |
| Creative Coding Challenges | `creative-coding-challenges` | BEGINNER | CODING | New | SEED_NOW |
| Creative Coder Final Project | `creative-coder-final-project` | INTERMEDIATE | CODING | New | SEED_NOW |
| Character Movement and Controls | `character-movement-controls` | BEGINNER | CODING | New | SEED_NOW |
| Events, Conditions, and Scoring | `events-conditions-scoring` | BEGINNER | CODING | New | SEED_NOW |
| Build a Multi-Level Game | `build-a-multi-level-game` | INTERMEDIATE | CODING | New | SEED_NOW |
| Creative Coding Game Showcase | `creative-coding-game-showcase` | INTERMEDIATE | CODING | New | SEED_NOW |
| Scratch Creative Projects | `scratch-creative-projects` | BEGINNER | CODING | New | SEED_NOW |
| Build Your First Coding Game | `build-your-first-coding-game` | BEGINNER | CODING | New | SEED_NOW |
| Creative Coding Showcase | `creative-coding-showcase` | INTERMEDIATE | CODING | New | SEED_NOW |
| Coding Starter Final Project | `coding-starter-final-project` | INTERMEDIATE | CODING | New | SEED_NOW |
| Music, Sound, and Interaction | `music-sound-interaction` | BEGINNER | ARTS | New | SEED_NOW |
| Digital Creativity Final Showcase | `digital-creativity-final-showcase` | INTERMEDIATE | ARTS | New | SEED_NOW |
| Math Patterns and Games | `math-patterns-and-games` | BEGINNER | MATH | New | SEED_NOW |
| Engineering Thinking for Kids | `engineering-thinking-for-kids` | BEGINNER | ENGINEERING | New | SEED_NOW |
| Digital Experiment Report Project | `digital-experiment-report-project` | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Scratch Game Studio | `scratch-game-studio` | INTERMEDIATE | CODING | Existing | IMPORTED_EXISTING |
| Animation & Storytelling with Scratch | `animation-storytelling-scratch` | BEGINNER | ARTS | Existing (mapped) | NEEDS_REVIEW |
| Media Smart Kids | `media-smart-kids` | BEGINNER | TECHNOLOGY | Existing | IMPORTED_EXISTING |
| Virtual Robotics & Simulation | `junior-robotics-automation` | BEGINNER | ROBOTICS | Existing | IMPORTED_EXISTING |
| Digital STEM Experiments | `digital-stem-experiments` | BEGINNER | SCIENCE | Existing (mapped) | NEEDS_REVIEW |
| Block Robotics Simulator | `block-robotics-sim` | BEGINNER | ROBOTICS | Existing (mapped) | NEEDS_REVIEW |
| Logic & Problem Solving | `logic-problem-solving` | BEGINNER | CODING | Existing (mapped) | NEEDS_REVIEW |

### Ages 11–13 (`courses-ages-11-13.data.ts`) — 20

| Title | slug | Level | Category | Origin | contentStatus |
|---|---|---|---|---|---|
| Coding Logic with Scratch and Blocks | `coding-logic-scratch-blocks` | INTERMEDIATE | CODING | New | SEED_NOW |
| Game Design Level 2 | `game-design-level-2` | INTERMEDIATE | CODING | New | SEED_NOW |
| AI Basics for Young Innovators | `ai-basics-young-innovators` | INTERMEDIATE | AI | New | SEED_NOW |
| Web Basics: Build Your First Page | `web-basics-build-your-first-page` | INTERMEDIATE | CODING | New | SEED_NOW |
| App Design Thinking for Kids | `app-design-thinking-for-kids` | INTERMEDIATE | CODING | New | SEED_NOW |
| STEM Builder Final Project | `stem-builder-final-project` | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| AI Art and Creative Tools | `ai-art-creative-tools` | INTERMEDIATE | AI | New | SEED_NOW |
| Data, Patterns, and Machine Learning Basics | `data-patterns-ml-basics` | INTERMEDIATE | AI | New | SEED_NOW |
| Responsible AI and Digital Ethics | `responsible-ai-digital-ethics` | INTERMEDIATE | AI | New | SEED_NOW |
| AI Native Kids Final Project | `ai-native-kids-final-project` | INTERMEDIATE | AI | New | SEED_NOW |
| Robot Movement and Direction Logic | `robot-movement-direction-logic` | INTERMEDIATE | ROBOTICS | New | SEED_NOW |
| Sensors and Decisions in Simulation | `sensors-decisions-simulation` | INTERMEDIATE | ROBOTICS | New | SEED_NOW |
| Robotics Challenge: Maze Solver | `robotics-challenge-maze-solver` | INTERMEDIATE | ROBOTICS | New | SEED_NOW |
| Automation Thinking for Students | `automation-thinking-students` | INTERMEDIATE | ROBOTICS | New | SEED_NOW |
| Virtual Robotics Final Challenge | `virtual-robotics-final-challenge` | INTERMEDIATE | ROBOTICS | New | SEED_NOW |
| Python Starter Projects | `python-starter-projects` | INTERMEDIATE | CODING | New | SEED_NOW |
| HTML and CSS Project Lab | `html-css-project-lab` | INTERMEDIATE | CODING | New | SEED_NOW |
| MakeCode Arcade Game Builder | `makecode-arcade-game-builder` | INTERMEDIATE | CODING | New | SEED_NOW |
| Data Detectives | `data-detectives` | INTERMEDIATE | DATA | Existing | IMPORTED_EXISTING |
| Prompt Engineering for Students | `prompt-engineering-for-students` | INTERMEDIATE | AI | Existing (mapped) | NEEDS_REVIEW |

### Science / Space (`courses-science.data.ts`) — 22

| Title | slug | Age | Level | Category | Origin | contentStatus |
|---|---|---|---|---|---|---|
| NASA Space Explorer: Introduction to Space Science | `nasa-space-explorer-intro` | 8–10 | BEGINNER | SCIENCE | New | SEED_NOW |
| Solar System Explorer | `solar-system-explorer` | 8–10 | BEGINNER | SCIENCE | New | SEED_NOW |
| Earth from Space | `earth-from-space` | 8–10 | BEGINNER | SCIENCE | New | SEED_NOW |
| Space Science Games and Challenges | `space-science-games-challenges` | 8–10 | BEGINNER | SCIENCE | New | SEED_NOW |
| ESA Space for Kids: Space Missions and Exploration | `esa-space-for-kids-missions` | 8–10 | BEGINNER | SCIENCE | New | SEED_NOW |
| Planets, Moons, and Space Objects | `planets-moons-space-objects` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| The Sun and Earth Connection | `sun-earth-connection` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Space Weather and Seasons | `space-weather-and-seasons` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Mars Rover Mission Explorer | `mars-rover-mission-explorer` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Space Communications and Signals | `space-communications-signals` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Eclipses and Sky Events | `eclipses-and-sky-events` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Stars, Galaxies, and the Universe | `stars-galaxies-universe` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Meteor Showers, Asteroids, and Comets | `meteors-asteroids-comets` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| NASA Digital STEM Activities | `nasa-digital-stem-activities` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Space Science Final Project | `space-science-final-project` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Science Simulation Explorer | `science-simulation-explorer` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Forces and Motion with Simulations | `forces-motion-simulations` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Energy and Electricity Explorer | `energy-electricity-explorer` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Light, Sound, and Waves Explorer | `light-sound-waves-explorer` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Chemistry Basics with Simulations | `chemistry-basics-simulations` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Earth Science Digital Lab | `earth-science-digital-lab` | 11–13 | INTERMEDIATE | SCIENCE | New | SEED_NOW |
| Space Science & Simulations | `space-science-missions` | 11–13 | INTERMEDIATE | SCIENCE | Existing | IMPORTED_EXISTING |

### Teens (`courses-teens.data.ts`) — 25

| Title | slug | Age | Level | Category | Origin | contentStatus |
|---|---|---|---|---|---|---|
| Python Starter for Teens | `python-starter-for-teens` | 14–16 | INTERMEDIATE | CODING | New | SEED_NOW |
| JavaScript Basics for Interactive Web | `javascript-basics-interactive-web` | 14–16 | INTERMEDIATE | CODING | New | SEED_NOW |
| HTML and CSS: Build Your First Website | `html-css-build-first-website` | 14–16 | INTERMEDIATE | CODING | New | SEED_NOW |
| Data Basics with Python | `data-basics-with-python` | 14–16 | INTERMEDIATE | DATA | New | SEED_NOW |
| Tech Innovator Portfolio Project | `tech-innovator-portfolio-project` | 14–16 | INTERMEDIATE | CODING | New | SEED_NOW |
| Web & App Builder Final Demo | `web-app-builder-final-demo` | 14–16 | INTERMEDIATE | CODING | New | SEED_NOW |
| Python for Real-World Projects | `python-real-world-projects` | 17–18 | ADVANCED | CODING | New | SEED_NOW |
| AI Project Builder | `ai-project-builder` | 17–18 | ADVANCED | AI | New | SEED_NOW |
| Web Product Development | `web-product-development` | 17–18 | ADVANCED | CODING | New | SEED_NOW |
| App Prototype Development | `app-prototype-development` | 17–18 | ADVANCED | CODING | New | SEED_NOW |
| Data Thinking for Future Leaders | `data-thinking-future-leaders` | 17–18 | ADVANCED | DATA | New | SEED_NOW |
| Build Your Digital Portfolio | `build-your-digital-portfolio` | 17–18 | ADVANCED | CODING | New | SEED_NOW |
| Future Tech Leader Capstone Project | `future-tech-leader-capstone-project` | 17–18 | ADVANCED | CODING | New | SEED_NOW |
| Web Builders Bootcamp | `web-builders-bootcamp` | 14–16 | INTERMEDIATE | CODING | Existing | IMPORTED_EXISTING |
| Python Logic Lab | `python-logic-lab` | 14–16 | INTERMEDIATE | CODING | Existing | IMPORTED_EXISTING |
| AI Literacy & Ethics | `ai-literacy-ethics` | 14–16 | INTERMEDIATE | AI | Existing | IMPORTED_EXISTING |
| Cyber Basics for Teens | `cyber-basics-teens` | 14–16 | INTERMEDIATE | TECHNOLOGY | Existing | IMPORTED_EXISTING |
| Design, Build, Test | `design-build-test` | 14–16 | INTERMEDIATE | ENGINEERING | Existing | IMPORTED_EXISTING |
| App Development Basics | `app-development-basics` | 14–16 | INTERMEDIATE | CODING | Existing (mapped) | NEEDS_REVIEW |
| AI Foundations for Future Leaders | `ai-foundations-future-leaders` | 17–18 | ADVANCED | AI | Existing | IMPORTED_EXISTING |
| Full-Stack Thinking | `full-stack-thinking` | 17–18 | ADVANCED | CODING | Existing | IMPORTED_EXISTING |
| Data Decisions & Society | `data-decisions-society` | 17–18 | ADVANCED | DATA | Existing | IMPORTED_EXISTING |
| Startup Lab | `startup-lab` | 17–18 | ADVANCED | ENTREPRENEURSHIP | Existing | IMPORTED_EXISTING |
| Career Launch | `career-launch` | 17–18 | ADVANCED | TECHNOLOGY | Existing | IMPORTED_EXISTING |
| Entrepreneurship & Product Thinking | `entrepreneurship-product-thinking` | 17–18 | ADVANCED | ENTREPRENEURSHIP | Existing (mapped) | NEEDS_REVIEW |

**Totals:** 81 NEW (`SEED_NOW`) · 9 mapped-existing (`NEEDS_REVIEW`) · 25 imported-existing (`IMPORTED_EXISTING`) = **115**.

---

## 7. Detailed Course Seed Data

### 7.1 Per-course fields captured (`CatalogCourse`, `prisma/catalog/types.ts`)

| Field | Type | Notes |
|---|---|---|
| `slug` | string | unique catalog handle |
| `title` | string | |
| `ageGroup` | `AgeBand` | one of the 6 bands |
| `level` | `Level` | BEGINNER / INTERMEDIATE / ADVANCED |
| `category` | string | CODING, AI, SCIENCE, ROBOTICS, DATA, ARTS, ENGINEERING, ENTREPRENEURSHIP, TECHNOLOGY, MATH |
| `description` | string | catalog blurb |
| `parentSummary` | string | audience-specific (parent) — emphasizes digital-only, no kits/hardware |
| `studentSummary` | string | audience-specific (student), playful voice |
| `skills` | string[] | what the learner gains |
| `tools` | string[] | software used (Scratch, Python, NASA Space Place…) |
| `finalProjectTitle` / `finalProjectDescription` | string | standalone capstone shown when not inside a bundle |
| `referenceKeys` | SourceKey[] | ordered `ReferenceSource.key` list credited on the course |
| `isFree` | boolean? | new courses only |
| `requiredPlan` | Plan? | subscription gate (new courses only) |
| `price` | number? | one-time price (default 0) |
| `status` | "PUBLISHED" \| "DRAFT" | new courses default DRAFT |
| `contentStatus` | `ContentStatusKey` | workflow marker |
| `adminNotes` | string? | free-form mapping/review note |
| `prereqSlug` | string? | informational prerequisite |
| `nextSlug` | string? | linear "next recommended course" pointer |
| `existing` | boolean? | when true → map-only: enrich metadata + source links, never recreate modules/lessons |
| `modules` | CatalogModule[]? | placeholder modules/lessons for NEW courses (each lesson: `title`, optional `duration` secs, `isFree`) |

### 7.2 Representative full examples

**(a) Young — `digital-discovery-shapes-patterns-logic` (AGES_3_5, NEW, free)** — `courses-ages-3-5.data.ts`
- category CODING; level BEGINNER; `isFree: true`; `contentStatus: SEED_NOW`; `status: DRAFT`; `nextSlug: pre-coding-sequencing-games`.
- skills: Shape recognition, Pattern matching, Cause and effect, Sorting, Early logic. tools: ScratchJr, Drawing canvas.
- referenceKeys: `code-org`, `scratchjr`.
- finalProject: "My Pattern Parade" — arrange colorful shapes into a repeating pattern parade.
- modules: *Spotting Shapes and Colors* (Hello Shapes! [free], Color Hunt: Tap What Matches [free], Big or Small? Sorting Fun) · *Patterns and Tiny Choices* (Finish the Pattern, What Comes Next?, My First Logic Puzzle).

**(b) Space/NASA — `nasa-space-explorer-intro` (AGES_8_10, NEW)** — `courses-science.data.ts`
- category SCIENCE; level BEGINNER; `requiredPlan: LEARNER`; `contentStatus: SEED_NOW`; `status: DRAFT`.
- skills: space science basics, scientific curiosity, observation skills, reading space facts, digital exploration. tools: NASA Space Place, ESA Kids.
- referenceKeys: `nasa-space-place`, `esa-kids`.
- finalProject: "My Space Explorer Notebook" — digital notebook of favourite NASA Space Place / ESA Kids facts.
- modules: *What Is Space?* (Looking Up: Why We Study Space [free], Exploring NASA Space Place [free], Discovering ESA Kids [free]) · *Becoming a Space Explorer* (Space Tools and How Scientists See, Fun Space Facts and Games, Putting Together My Space Notebook).

**(c) Teen — `python-starter-for-teens` (AGES_14_16, NEW)** — `courses-teens.data.ts`
- category CODING; level INTERMEDIATE; `requiredPlan: PRO`; `contentStatus: SEED_NOW`; `status: DRAFT`.
- skills: Variables and data types, Conditionals and loops, Functions and parameters, Debugging and error handling, Computational thinking. tools: Python, Khan Academy.
- referenceKeys: `create-learn`, `khan-computing`.
- finalProject: "Mini Python Toolkit" — calculator, quiz, number-guessing game published to portfolio.
- modules: *Python Foundations* (Your First Python Program [free], Variables and Data Types [free], Conditionals and Decisions [free]) · *Loops and Functions* (Loops and Repetition, Writing Your Own Functions, Debugging Like a Pro).

**(d) Imported-existing — `space-and-sky` (AGES_3_5)** — `courses-ages-3-5.data.ts`
- `existing: true`; `contentStatus: IMPORTED_EXISTING`; no `status`/`isFree`/`requiredPlan` (so the live course is never silently changed). referenceKeys: `nasa-space-place`, `esa-kids`. adminNotes: "Imported existing space course; NASA Space Place + ESA Kids enrichment."

---

## 8. Detailed Bundle Seed Data

### 8.1 Bundle output format (`CatalogBundle`, `prisma/catalog/types.ts`)
`slug`, `title`, `description`, `themeCategory`, `ageGroup`, `level`, `requiredPlan?`, `isFree?`, `finalProjectTitle`, `finalProjectDescription`, `learningObjectives: string[]` (seeded as `{ en, ar:[], de:[] }` JSON), `recommendedDurationWeeks`, `referenceKeys: SourceKey[]`, `adminNotes?`, `courses: { slug, isRequired? }[]` (ordered; `isRequired` defaults true). Bundles seed `status = PUBLISHED`.

### 8.2 Full example — `coding-starter-bundle`
```ts
{
  slug: "coding-starter-bundle",
  title: "Coding Starter Bundle",
  description: "A gentle first step into coding with friendly block-based tools — sequencing, loops and events through play.",
  themeCategory: "CODING",
  ageGroup: "AGES_5_7",
  level: "BEGINNER",
  requiredPlan: "LEARNER",
  finalProjectTitle: "My First Interactive Story or Game",
  finalProjectDescription: "Create and present a simple interactive story or beginner game with characters, sequencing and a simple loop.",
  learningObjectives: ["Understand sequencing","Use simple loops","Create digital stories","Create simple animations","Build a beginner interactive game"],
  recommendedDurationWeeks: 6,
  referenceKeys: ["scratchjr","scratch","code-org","tynker"],
  courses: [
    { slug: "scratchjr-first-stories" },
    { slug: "sequencing-loops-young-coders" },
    { slug: "scratch-starter-coding-blocks" },
    { slug: "animation-storytelling-scratch" },
    { slug: "my-first-interactive-game" },
    { slug: "coding-starter-final-project" },
  ],
}
```

---

## 9. Detailed Pathway Seed Data

### 9.1 Pathway output format (`CatalogPathway`, `prisma/catalog/types.ts`)
`slug`, `title`, `description`, `ageGroup`, `order`, `referenceKeys: SourceKey[]`, `adminNotes?`, `stages: CatalogPathwayStage[]`. Each stage carries **exactly one** of `bundleSlug` or `courseSlug` (plus an optional display `title`). Pathways seed `status = PUBLISHED`.

### 9.2 Full example — `creative-coder`
```ts
{
  slug: "creative-coder",
  title: "Creative Coder",
  description: "Move from blocks to Scratch projects, animations, games and problem solving, with beginner AI awareness and NASA/ESA space-science enrichment (ages 8–10).",
  ageGroup: "AGES_8_10",
  order: 0,
  referenceKeys: ["scratch","code-org","tynker","makecode","raspberry-pi","code-club","nasa-space-place","esa-kids"],
  adminNotes: "Capstone: build a Scratch animation, game or digital STEM/space project. Next pathway: STEM Builder.",
  stages: [
    { bundleSlug: "creative-coding-game-design-bundle", title: "Stage 1: Creative Coding & Game Design" },
    { courseSlug: "ai-around-us",                       title: "Stage 2: AI Around Us" },
    { bundleSlug: "space-science-nasa-esa-explorer-bundle", title: "Stage 3: Space Science (NASA & ESA)" },
    { courseSlug: "creative-coder-final-project",       title: "Stage 4: Creative Coder Final Project" },
  ],
}
```

---

## 10. Database / Content Model (as implemented)

All models in `prisma/schema.prisma`. cuid() ids. Migration: `20260626160000_reference_sources_and_content_status` (sources + content-status); bundles/pathways/6-band ages: `20260626120000_add_bundles_pathways_6band_ages`; bundle certificates: `20260626140000_certificate_bundle`.

### 10.1 Enums
- **`AgeGroup`** (schema 197): `AGES_3_5 | AGES_5_7 | AGES_8_10 | AGES_11_13 | AGES_14_16 | AGES_17_18`.
- **`ContentStatus`** (209): `SEED_NOW` (skeleton, ready to author) · `NEEDS_REVIEW` (seeded, awaiting curriculum review) · `OPTIONAL_ENRICHMENT` · `IMPORTED_EXISTING` (mapped from pre-existing content).
- **`SourceStatus`** (217): `ACTIVE | HISTORICAL | OPTIONAL | ENRICHMENT`.

### 10.2 Course (new/changed fields)

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `ageGroup` | AgeGroup | yes | 6-band age | `AGES_8_10` |
| `skills` | String[] | default [] | learner gains | `["Variables…"]` |
| `tools` | String[] | default [] | software used | `["Python"]` |
| `parentSummary`/`studentSummary` | Text? | no | audience blurbs | — |
| `finalProjectTitle`/`finalProjectDescription` | Text? | no | standalone capstone | "Mini Python Toolkit" |
| `requiredPlan` | PlanTier? | no | subscription gate (nullable by design) | `PRO` |
| `contentStatus` | ContentStatus | yes (default SEED_NOW) | readiness marker; `@@index` | `SEED_NOW` |
| `adminNotes` | Text? | no | mapping/review note | "Maps to master course…" |
| `nextCourseId` | String? | no | self-relation `CourseProgression` → next recommended | — |
| `bundleLinks` | BundleCourse[] | — | bundle membership | — |
| `pathwayStages` | PathwayStage[] | — | pathway-stage membership | — |
| `referenceSources` | CourseReferenceSource[] | — | credited sources (ordered) | — |

(Localized `*Ar`/`*De` variants exist for title/description/summaries/finalProject. Git-sync provenance fields `managedByGit`/`sourcePath`/`sourceCommitSha`/`syncStatus` are unchanged.)

### 10.3 Bundle

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `slug` | String | unique | handle | `coding-starter-bundle` |
| `themeCategory` | String | yes | theme | `CODING` |
| `ageGroup` | AgeGroup | yes | band | `AGES_5_7` |
| `level` | CourseLevel | default BEGINNER | | `BEGINNER` |
| `status` | CourseStatus | default DRAFT (seeded PUBLISHED) | | `PUBLISHED` |
| `requiredPlan` | PlanTier? | no | subscription gate | `LEARNER` |
| `finalProjectTitle`/`finalProjectDescription` | Text? | no | capstone | — |
| `learningObjectives` | Json? | no | `{ en:[], ar:[], de:[] }` (i18n parity) | — |
| `recommendedDurationWeeks` | Int? | no | | 6 |
| `adminNotes` | Text? | no | | "DIGITAL-FIRST…" |
| `courses` | BundleCourse[] | — | ordered membership | — |
| `referenceSources` | BundleReferenceSource[] | — | credited sources | — |
| `certificates` | Certificate[] | — | bundle-completion certs | — |

### 10.4 BundleCourse (ordered join)
`bundleId`, `courseId`, `order` Int, `isRequired` Boolean default true. `@@unique([bundleId, courseId])`, `@@index([bundleId, order])`. Carries per-link attributes an implicit m2m can't; reordering rewrites `order`.

### 10.5 LearningPathway
`slug` unique, `title`, `description`, `ageGroup`, `status` (default DRAFT; seeded PUBLISHED), `order` Int default 0, `adminNotes` Text?, `stages` PathwayStage[], `referenceSources` PathwayReferenceSource[].

### 10.6 PathwayStage (XOR bundle|course)
`pathwayId`, `order` Int, `title?`, `bundleId?`, `courseId?`. `@@unique([pathwayId, order])`. Points at **exactly one** of bundle or course — enforced by a hand-written DB `CHECK` constraint in migration `20260626120000`:
```sql
CHECK ((("bundleId" IS NOT NULL)::int + ("courseId" IS NOT NULL)::int) = 1);
```
(`addPathwayStageSchema` mirrors this XOR at the app layer.)

### 10.7 ReferenceSource + 3 join tables
- **`ReferenceSource`**: `key` (unique seed handle), `name`, `url`, `provider`, `sourceType`, `relatedTopics` String[], `recommendedAgeRange?`, `usageInSchulab` Text, `status` SourceStatus (default ACTIVE), `notes?`. Indexed on `key`, `status`. Global + reusable.
- **`CourseReferenceSource`**: `courseId`, `sourceId`, `order` Int default 0. `@@unique([courseId, sourceId])` (no dup credit), `@@index([courseId, order])` (badge order), `@@index([sourceId])`.
- **`BundleReferenceSource`** / **`PathwayReferenceSource`**: identical shape against `bundleId` / `pathwayId`. All FKs `onDelete: Cascade`.

### 10.8 Certificate (bundle support)
`userId`, `courseId?`, `bundleId?`, `code` unique, `issuedAt`, `pdfUrl?`. `@@unique([userId, bundleId])` backstops the bundle-cert dedup race; harmless on the course path (NULL `bundleId` treated as distinct). A cert is issued per course **and** per completed bundle.

### 10.9 How the requested capabilities are supported
- **Multi-bundle / multi-pathway membership** — `BundleCourse` and `PathwayStage` are explicit join rows, so one course can sit in many bundles and many pathway stages (e.g. `earth-from-space` in two bundles; `digital-experiment-report-project` in Digital STEM Explorer + Interactive Science Simulations).
- **Ordering** — `BundleCourse.order`, `PathwayStage.order` (+ `@@unique([pathwayId, order])`), and `*ReferenceSource.order` all give deterministic, reorderable sequence.
- **Next-recommended pointer** — `Course.nextCourseId` self-relation (`CourseProgression`), seeded in `seed-catalog.ts` step 3 from each course's `nextSlug`; rendered on the course detail page (`course.nextCourse`, see §11).
- **Source badges** — `*ReferenceSource` joins drive the `ReferenceSourceBadges` component (`src/components/course/reference-source-badges.tsx`), ordered by `order`.
- **NASA no-duplicate mapping** — existing space courses carry `existing: true` + `IMPORTED_EXISTING`; the seeder only enriches metadata + (re)builds source links and never recreates modules/lessons for them (`seed-catalog.ts` lines 103–113, 132). See §13.

---

## 11. UI / UX — Implemented vs Remaining

### Implemented
- **Catalog tabs** — Courses / Bundles / Pathways (`src/components/course/catalog-tabs.tsx`).
- **Source badges on course, bundle & pathway detail** — `ReferenceSourceBadges` rendered on `/courses/[slug]`, `/bundles/[slug]` and `/pathways/[slug]`. `getCourseBySlug`/`getBundleBySlug`/`getPathwayBySlug` include `referenceSources` ordered by `order`. Clickable chips, `target="_blank" rel="noopener noreferrer nofollow"`, status pills for HISTORICAL/OPTIONAL/ENRICHMENT (ACTIVE shows no pill). Server-component friendly.
- **"In this bundle" / "Part of this pathway" badges on course detail** — `getCourseBySlug` includes `bundleLinks` + `pathwayStages`; the course page renders linked badges ("In bundle: …" → `/bundles/{slug}`, "Part of pathway: …" → `/pathways/{slug}`) for PUBLISHED parents, de-duped by slug (`src/app/[locale]/(public)/courses/[slug]/page.tsx`).
- **Catalog filters: Source / Duration / Certificate** — `/courses` page parses `sourceKey`, `maxDuration` (minutes bucket → seconds in the query), `certificate=true`; loads active reference sources for the Source dropdown and tracks an active-filter count (`src/app/[locale]/(public)/courses/page.tsx`; UI in `src/components/course/course-filters.tsx`; query in `getCourses`).
- **Dashboard pathway / bundle recommendations** — `src/services/recommendation.service.ts` resolves the learner's age band and surfaces the recommended pathway, next bundle and next course. Student dashboard shows a "Recommended for you" section; parent dashboard shows per-child recommendations (`src/app/[locale]/(dashboard)/student/page.tsx`, `…/parent/page.tsx`).
- **Next-recommended course** — course detail also renders `course.nextCourse` as a "next course" card with thumbnail/category fallback.
- **Bundle certificates surfaced** — student certificates page distinguishes Bundle vs Course (`src/app/[locale]/(dashboard)/student/certificates/page.tsx`).

### Remaining (TODO)
- **Reference Sources admin CRUD** — sources and their links are seed-driven only; no `admin/reference-sources` screen yet (see §12).
- **Localized course copy** — new courses are seeded with English `description`/summaries; `*Ar`/`*De` columns exist but are not yet populated for the 81 new courses.

---

## 12. Admin Panel Requirements

Existing admin screens under `src/app/[locale]/(dashboard)/admin/`:

| Requested capability | Existing screen | Status |
|---|---|---|
| Create/edit/manage courses, modules, lessons, content-status | `admin/courses` (+ `[courseId]`, modules/lessons sub-routes) | Present |
| Create/edit bundles, order courses, set plan/objectives | `admin/bundles` | Present |
| Create/edit pathways, order stages (bundle/course) | `admin/pathways` | Present |
| Preview-as-role (student/parent/tutor) | preview wiring across `admin/courses/[courseId]`, lesson form, dashboard/admin/tutor layouts | Present |
| Certificates management | `admin/certificates` | Present |
| Curriculum / Git sync | `admin/curriculum` | Present |
| Other: users, roles, tutors, badges, competitions, products, pages, help, settings, audit | respective `admin/*` | Present |

### Gap — **Reference Sources admin CRUD is NOT built (TODO, recommended)**
There is no `admin/reference-sources` (or equivalent) screen. Today the 19 sources and all course/bundle/pathway source links are **seed-driven only** (`reference-sources.data.ts` + `seed-catalog.ts`). Recommended: add an `admin/reference-sources` screen to list/create/edit `ReferenceSource` rows (name, url, provider, sourceType, relatedTopics, recommendedAgeRange, usageInSchulab, status, notes) and to attach/detach + reorder sources on courses/bundles/pathways (writing the ordered join rows). Until then, source edits require a data-file change + re-seed.

---

## 13. NASA Space Place Migration / Mapping Plan

**Principle:** existing platform space courses are **mapped, never duplicated.** They are flagged `existing: true` + `contentStatus: IMPORTED_EXISTING`; the seeder enriches their catalog metadata and (re)builds their reference-source links but leaves their modules/lessons untouched (`seed-catalog.ts` lines 103–113 and the `if (!c.existing && c.modules?.length)` guard at line 132). `NASA Space Place`'s own source row carries the note: *"Existing platform space courses are mapped to this source and marked IMPORTED_EXISTING."*

**Existing space courses mapped (no duplication):**
- `space-and-sky` (AGES_3_5) — sources `nasa-space-place`, `esa-kids`; adminNotes record the NASA/ESA enrichment.
- `space-science-missions` → "Space Science & Simulations" (AGES_11_13) — sources `nasa-space-place`, `esa-kids`. Reused **in two bundles** (Digital STEM Explorer and Space Science: NASA & ESA Explorer) without a second course row.

**New space courses added** (all `SEED_NOW`, `courses-science.data.ts`): `nasa-space-explorer-intro`, `esa-space-for-kids-missions`, `solar-system-explorer`, `earth-from-space`, `space-science-games-challenges` (8–10); `planets-moons-space-objects`, `sun-earth-connection`, `space-weather-and-seasons`, `mars-rover-mission-explorer`, `space-communications-signals`, `eclipses-and-sky-events`, `stars-galaxies-universe`, `meteors-asteroids-comets`, `nasa-digital-stem-activities`, `space-science-final-project` (11–13).

**Bundles/pathways the space content joins:**
- **Space Science: NASA & ESA Explorer Bundle** (8–10, LEARNER, sources nasa-space-place/esa-kids/natgeo-kids) — 10 courses incl. both imported-existing space courses; adminNotes confirm "Existing space courses mapped here as IMPORTED_EXISTING (no duplicates)."
- **Digital STEM Explorer Bundle** (8–10) — includes `earth-from-space`, `nasa-digital-stem-activities`, `space-science-games-challenges`, and `space-science-missions`.
- **Creative Coder pathway** (Stage 3) and **STEM Builder pathway** (Stage 4) consume the space/STEM bundles; younger pathways credit `nasa-space-place` as enrichment.

No NASA/ESA course is created twice; reuse is achieved via `BundleCourse`/`PathwayStage` join rows pointing at the single course row.

---

## 14. Developer Implementation Tasks

### Backend / DB
- [DONE] `ReferenceSource` + `CourseReferenceSource` / `BundleReferenceSource` / `PathwayReferenceSource` models + `ContentStatus` / `SourceStatus` enums + `Course.contentStatus`/`adminNotes` — migration `20260626160000`.
- [DONE] `Bundle`, `BundleCourse`, `LearningPathway`, `PathwayStage` (+ XOR CHECK), 6-band `AgeGroup`, `Course.nextCourseId` self-relation — migration `20260626120000`.
- [DONE] `Certificate.bundleId` + `@@unique([userId, bundleId])` — migration `20260626140000`.
- [DONE] `getCourseBySlug`/`getBundleBySlug`/`getPathwayBySlug` include `referenceSources` (ordered); `getCourseBySlug` also includes `bundleLinks` + `pathwayStages`; `getCourses` supports `sourceKey`/`maxDuration`/`certificate` filters (`src/services/course.service.ts`, `bundle.service.ts`, `pathway.service.ts`).
- [DONE] `src/services/recommendation.service.ts` (age-band pathway/bundle/next-course recommendations).
- [TODO] Server actions for reference-source CRUD + attach/detach/reorder on catalog items.

### Data seeding
- [DONE] `prisma/catalog/*` data modules (types, 19 sources, 115 courses across 6 files, 11 bundles, 6 pathways).
- [DONE] `prisma/seed-catalog.ts` (`seedCatalog`) — upsert sources; create-new/enrich-existing courses; next-course pointers; rebuild course/bundle/pathway source links; upsert bundles + rebuild `BundleCourse`; upsert pathways + rebuild `PathwayStage`. Idempotent. Called from `prisma/seed.ts`.
- [NOTE] Stale comment "93-course master list" — actual count 115. Optional cleanup.

### Frontend
- [DONE] Catalog tabs; `/bundles`, `/pathways` index + detail; source badges on course/bundle/pathway detail; in-bundle / part-of-pathway badges on course detail; `/courses` Source/Duration/Certificate filters; next-recommended card on course detail; student + parent dashboard pathway/bundle recommendations; bundle vs course on student certificates.
- [TODO] Populate `*Ar`/`*De` localized copy for the 81 new courses (currently English only).

### Admin
- [DONE] `admin/courses`, `admin/bundles`, `admin/pathways`, `admin/certificates`, `admin/curriculum`, preview-as-role.
- [TODO] `admin/reference-sources` CRUD + source attach/reorder UI (§12 gap).

### QA
- [TODO] Run §15 checklist after `migrate deploy` + `db:seed` on a staging DB.

---

## 15. QA Checklist

- [ ] `npx prisma migrate deploy` applies cleanly (incl. PathwayStage XOR CHECK).
- [ ] `npm run db:seed` runs idempotently; re-running produces no duplicate courses/bundles/pathways/source links.
- [ ] Seed log reports 19 sources, NEW courses created, existing enriched, 11 bundles, 6 pathways; no "unknown reference key" / "course slug not found" / "bundle not found" warnings.
- [ ] All 19 sources exist with correct `status`; ENRICHMENT/OPTIONAL/HISTORICAL render the right pill on bundle/pathway pages; ACTIVE shows no pill.
- [ ] 115 courses present: 81 `SEED_NOW` DRAFT with placeholder modules/lessons; 9 `NEEDS_REVIEW`; 25 `IMPORTED_EXISTING` with content untouched.
- [ ] No NASA/ESA space course is duplicated; `space-science-missions` reused across both bundles via join rows; imported space courses keep prior modules/lessons.
- [ ] Each bundle's `BundleCourse` rows resolve, in declared order; each pathway's stages resolve to exactly one bundle/course, in order; every pathway ends in its capstone course.
- [ ] `nextCourseId` pointers set where `nextSlug` declared (e.g. `digital-discovery-shapes-patterns-logic` → `pre-coding-sequencing-games`).
- [ ] `/courses` Source/Duration/Certificate filters return correct subsets; active-filter count accurate.
- [ ] Course, bundle & pathway detail pages render source badges with working external links.
- [ ] Course detail renders in-bundle / part-of-pathway membership badges (PUBLISHED parents only); student + parent dashboards show pathway/bundle recommendations.
- [ ] Subscription gating: bundle/course `requiredPlan` enforced per `src/lib/subscription-access.ts`; minors gated by `src/lib/compliance.ts` on paid content.

---

## 16. Priority Implementation Roadmap (6 phases)

| Phase | Scope | Status |
|---|---|---|
| **P1 — Schema & enums** | `AgeGroup` 6-band, `ContentStatus`/`SourceStatus`, `Course.contentStatus`/`adminNotes`/`nextCourseId`, Bundle/BundleCourse/LearningPathway/PathwayStage (+XOR), ReferenceSource + 3 joins, Certificate.bundleId | **DONE** (migrations `…120000`, `…140000`, `…160000`) |
| **P2 — Catalog data** | 19 sources, 115 courses (6 files), 11 bundles, 6 pathways, types | **DONE** (`prisma/catalog/*`) |
| **P3 — Seeder** | idempotent `seedCatalog` (sources, courses create/enrich, next pointers, all source links, bundles, pathways) | **DONE** (`prisma/seed-catalog.ts`) |
| **P4 — Public UI** | catalog tabs, bundle/pathway index+detail, source badges (course/bundle/pathway), in-bundle/part-of-pathway badges on course detail, catalog filters (source/duration/certificate), next-course card | **DONE** |
| **P5 — Admin** | courses/bundles/pathways/certificates/curriculum screens, preview-as-role | **DONE** except **Reference Sources CRUD = TODO** |
| **P6 — Recommendations & polish** | student + parent dashboard pathway/bundle recommendations, course-detail source + membership badges, `referenceSources` in `getCourseBySlug` | **DONE** (localized AR/DE course copy = **TODO**) |

**Deploy path:** `npx prisma migrate deploy` → `npm run db:seed` (runs base seed then `seedCatalog`). Safe to re-run.
