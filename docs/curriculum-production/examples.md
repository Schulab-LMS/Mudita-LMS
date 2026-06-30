# Worked Examples — One Lesson, End to End

Each example traces a single lesson through the agent pipeline. The target lesson must already exist as an empty shell in the catalog (inventory marks it `gap`); the pipeline never invents a new course.

## 1 — From NASA Space Place

**Target:** Space Science track ([`courses-science.data.ts`](../../prisma/catalog/courses-science.data.ts)), band 8–10, lesson "Why does the Moon change shape?"

1. **Source Collector** retrieves the Moon-phases explainer from `spaceplace.nasa.gov` (status `ACTIVE`, science, public-domain NASA content) → KB chunks with `sourceId`, `url`, `license: public-domain`.
2. **Mapper** → course `space-…`, module "Our Moon," lesson slug `03-moon-phases`; objective: "Explain that Moon phases come from sunlight + the Moon's orbit."
3. **Age Adapter** (8–10): energetic explanation, "phase" introduced plainly, build-a-model activity.
4. **Lesson Builder** (RAG-grounded) writes `handout.md`: Lumo Explorer (space costume) mission hook → grounded explanation (each paragraph cites the NASA chunk) → worked example (8 phases) → activity "model the phases with a ball + lamp" → practice → reflection. `meta.yml` source = NASA Space Place URL + public-domain license.
5. **Entertainment** → "Moon Detective Mission: crack the case of the changing Moon," badge on completion.
6. **Assessment** → `quiz.yaml`: 5 questions answerable from the handout (e.g. "What lights up the Moon?" → the Sun), answer keys + explanations.
7. **Video Script** → 3–5 min intro+concept script, Lumo Explorer, quiz popup at the half phase.
8. **Reviewer-prep** validates the NASA URL is live, every claim maps to a chunk, no copied sentences → packet.
9. **Publish** PR reviewed (subject + safety + language) → merge → synced; "AI-assisted, human-reviewed" tag retained.

## 2 — From Scratch

**Target:** Coding bundle, band 8–10, lesson "Make your sprite dance" (build-a-game-world theme).

1. **Source Collector** pulls an official Scratch starter project + tutorial from `scratch.mit.edu` (status `ACTIVE`, activity; note Scratch licensing — treat code-along steps as inspiration, write original instructions).
2. **Mapper** → coding course, module "Motion & Loops," lesson `02-sprite-dance`; objective: "Use loop + motion blocks to animate a sprite."
3. **Age Adapter** (8–10): game-like, mission framing, screenshots of blocks.
4. **Lesson Builder** writes original step-by-step instructions (no copied tutorial text) grounded in the Scratch block concepts; `activity.md` = "remix the starter and add your own dance"; `meta.yml` cites the Scratch URL with license note = inspiration/transformed.
5. **Entertainment** → "Builder Challenge: choreograph the world's first sprite dance crew."
6. **Assessment** → 5 questions on loops/motion + a project check ("sprite repeats a 4-step dance").
7. **Video Script** → activity-walkthrough video, Lumo Creator (coding costume) demonstrating blocks.
8. **Reviewer-prep** runs a similarity check to ensure instructions are original, not copied → packet.
9. **Publish** as above; tutor note flags the common bug (forgetting the forever/repeat loop).

## 3 — From PhET

**Target:** Science (simulation) bundle, band 11–13, lesson "Build a circuit that lights a bulb."

1. **Source Collector** records the PhET "Circuit Construction Kit" sim (`phet.colorado.edu`, status `OPTIONAL`/simulation, CC-BY) → KB chunks of the sim's learning goals + an embeddable sim link.
2. **Mapper** → science course, module "Electricity," lesson `04-simple-circuits`; objective: "Show that a closed loop with a battery lights a bulb; predict the effect of breaks."
3. **Age Adapter** (11–13): problem-solving tone, prediction-before-experiment.
4. **Lesson Builder** writes a grounded explanation + a **simulation-driven activity**: embed/link the PhET sim (resource type `link`), guided tasks ("predict, then test: what happens if you remove a wire?"); `meta.yml` cites PhET with CC-BY attribution.
5. **Entertainment** → "Science Detective: find why the bulb won't light."
6. **Assessment** → 6–8 questions grounded in observed sim behavior + a reflection ("explain open vs closed circuit").
7. **Video Script** → concept + sim-walkthrough, Lumo Explorer (science costume), pausing for the prediction step.
8. **Reviewer-prep** verifies the PhET link is live + CC-BY attribution present → packet.
9. **Publish**; tutor note: how to help students who confuse series vs parallel.
