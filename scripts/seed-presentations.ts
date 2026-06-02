// Sample-presentation seeder. Idempotent: re-running tops up missing rows
// without duplicating courses, lessons, quizzes, or bookings.
//
// Creates three dedicated test courses (Beginner / Intermediate / Advanced),
// each with one PRESENTATION lesson exercising:
//   - Reveal.js markdown with horizontal + vertical slides
//   - Fragments, code blocks (highlight), math (advanced), speaker notes
//   - presentationConfig (theme/transition/plugins)
//   - tutorNotes column (tutor-only guidance)
//   - Attached Quiz with mixed question types
//
// Plus: enrols Aisha (student1) in all three so the student dashboard has
// progress to render, and creates one upcoming Booking + ClassroomSession on
// the Intermediate lesson so the LiveKit classroom flow has an entry point.
//
// Usage: `tsx scripts/seed-presentations.ts`
// Requires: DATABASE_URL in env; main `prisma/seed.ts` must have been run
// first (we rely on admin@schulab.com, aisha@example.com, marcus@example.com).

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// ── Slide decks ──────────────────────────────────────────────────────────

const BEGINNER_MARKDOWN = `# Shapes & Colors
### A Sample Presentation — Beginner

Welcome, tiny explorer! 🟦🔺🟢

Note: Tutor — greet the class, then click forward. Pause on the next slide for the "shapes around you" call-and-response.

---

## Shapes Around You

Look around the room. Can you find…

- A **square** <!-- .element: class="fragment" -->
- A **circle** <!-- .element: class="fragment" -->
- A **triangle** <!-- .element: class="fragment" -->

Note: Reveal each bullet by pressing space. Let students shout out examples between reveals.

---

## Colors of the Rainbow

Red, orange, yellow, green, blue, indigo, violet.

![Rainbow stripes](https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Rainbow.svg/600px-Rainbow.svg.png)

Note: This is a public-domain SVG from Wikimedia. If the image fails to load that's a sign the network egress is being blocked.

---

## Your Turn!

Point to something **red**.

Now something **blue**.

Now something **round**.

Note: Stand-up activity. 30 seconds. Then move on to the quiz.

---

## What's Next?

In the next lesson we'll **build** with shapes.

See you soon! 👋

Note: End on a wave. The companion quiz lesson is auto-unlocked once this deck is marked complete.
`;

const INTERMEDIATE_MARKDOWN = `# Intro to Web Development
### A Sample Presentation — Intermediate

We'll cover **HTML**, **CSS**, and a sprinkle of **JavaScript**.

Note: 25-minute target. Each section is a vertical-slide column — press down-arrow to drill in, right-arrow to skip the column.

---

## The Three Pillars

- **HTML** — structure
- **CSS** — style
- **JavaScript** — behaviour

Think of a webpage as a person:
HTML is the skeleton, CSS is the clothes, JS is the personality. <!-- .element: class="fragment" -->

--

### HTML in 30 seconds

\`\`\`html
<!doctype html>
<html lang="en">
  <body>
    <h1>Hello, world!</h1>
    <p>My first page.</p>
  </body>
</html>
\`\`\`

Note: Open the inspector on any page and show the live tree.

--

### Tags you'll meet often

| Tag | Purpose |
|---|---|
| \`<h1>\`–\`<h6>\` | Headings |
| \`<p>\` | Paragraph |
| \`<a>\` | Link |
| \`<img>\` | Image |
| \`<ul>\` / \`<li>\` | List |

---

## CSS — Making it Pretty

\`\`\`css
h1 {
  color: tomato;
  font-family: system-ui, sans-serif;
  text-align: center;
}
\`\`\`

--

### The Box Model

Every element is a box:

- **content** → what you write
- **padding** → breathing room inside
- **border** → the edge
- **margin** → space between boxes <!-- .element: class="fragment highlight-red" -->

Note: Live-demo by opening DevTools and toggling padding on a real element.

---

## JavaScript — Making it Move

\`\`\`js
const btn = document.querySelector("#hello");
btn.addEventListener("click", () => {
  alert("Hi from JavaScript!");
});
\`\`\`

This single snippet covers three big ideas: **selectors**, **events**, and **callbacks**.

Note: Don't drown them in jargon — show, then name.

---

## Downloadable Resources

- 📘 [HTML cheatsheet (PDF)](https://developer.mozilla.org/en-US/docs/Web/HTML/Cheatsheet)
- 🎨 [CSS reference (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference)
- 🧠 [JavaScript guide (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

Note: These are external; for the live deployment swap them for the platform's own /api/curriculum/media/ links.

---

## Recap

1. HTML structures content
2. CSS styles content
3. JS reacts to users

You'll build your **first webpage** in the next lesson.

Note: Cue the companion quiz. 5 questions, 80% to pass.
`;

const ADVANCED_MARKDOWN = `# Intro to Machine Learning
### A Sample Presentation — Advanced

From linear regression to gradient descent, in 30 minutes.

Note: Pre-req — students should be comfortable with algebra and basic Python. If not, route them to the prerequisite course before continuing.

---

## What is Machine Learning?

> A program that **improves with experience** at some task, as measured by some performance metric.
> — Tom Mitchell, 1997

Three ingredients: <!-- .element: class="fragment" -->
1. **Task** (\`T\`) — what you want to do <!-- .element: class="fragment" -->
2. **Experience** (\`E\`) — data <!-- .element: class="fragment" -->
3. **Performance** (\`P\`) — how you score it <!-- .element: class="fragment" -->

---

## The Three Flavours

|  | Input | Output | Example |
|---|---|---|---|
| **Supervised** | features + labels | prediction | spam detection |
| **Unsupervised** | features only | structure | customer segments |
| **Reinforcement** | state + reward | policy | game-playing agents |

Note: Today we'll stay in the supervised lane.

---

## Linear Regression

Predict \`y\` from \`x\`:

$$ \\hat{y} = wx + b $$

We want to find \`w\` and \`b\` that make \`\\hat{y}\` close to the real \`y\`.

--

### The Loss Function

Mean squared error:

$$ \\mathcal{L}(w, b) = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - (wx_i + b))^2 $$

Lower is better. Our job is to **minimise** this over the training set.

Note: Pause and ask: why squared, not absolute? (Differentiability + heavier penalty on outliers.)

--

### Gradient Descent

Walk downhill on the loss surface:

$$ w \\leftarrow w - \\eta \\frac{\\partial \\mathcal{L}}{\\partial w} $$
$$ b \\leftarrow b - \\eta \\frac{\\partial \\mathcal{L}}{\\partial b} $$

\`\\eta\` is the **learning rate**. Too big → divergence. Too small → glacial.

---

## In Python

\`\`\`python
import numpy as np

def train(x, y, lr=0.01, epochs=1000):
    w, b = 0.0, 0.0
    n = len(x)
    for _ in range(epochs):
        y_hat = w * x + b
        error = y_hat - y
        w -= lr * (2/n) * np.dot(error, x)
        b -= lr * (2/n) * error.sum()
    return w, b
\`\`\`

Twelve lines. That's a working learner.

Note: Walk through the gradient derivation on the whiteboard if time permits.

---

## What Can Go Wrong?

- **Underfitting** — model too simple <!-- .element: class="fragment" -->
- **Overfitting** — model memorises noise <!-- .element: class="fragment" -->
- **Bad data** — garbage in, garbage out <!-- .element: class="fragment" -->
- **Distribution shift** — production ≠ training <!-- .element: class="fragment" -->

Note: Each of these is its own lesson later in the course.

---

## Ethics — Briefly

ML models inherit biases from their training data.

> *"A model is a mirror of the data it was trained on. If the mirror is cracked, so is the reflection."*

Discuss in pairs: a real-world example where this matters. <!-- .element: class="fragment" -->

Note: 3-minute pair discussion. Sample answers: hiring algorithms, facial recognition, credit scoring.

---

## Recap & Next Steps

You've seen:

- The ML problem framing (T, E, P)
- Linear regression
- Loss functions and gradient descent
- Failure modes

Next lesson: **logistic regression** — same machinery, different output.

Note: Cue the companion quiz. 6 questions, 80% to pass.
`;

// ── Frontmatter (parsed into Lesson.presentationConfig) ──────────────────

const BEGINNER_CONFIG = {
  theme: "black",
  transition: "fade",
  controls: true,
  progress: true,
  slideNumber: "c/t",
  plugins: ["markdown", "notes"],
};

const INTERMEDIATE_CONFIG = {
  theme: "black",
  transition: "slide",
  controls: true,
  progress: true,
  slideNumber: "c/t",
  plugins: ["markdown", "highlight", "notes"],
};

const ADVANCED_CONFIG = {
  theme: "black",
  transition: "convex",
  controls: true,
  progress: true,
  slideNumber: "c/t",
  plugins: ["markdown", "highlight", "notes", "math"],
};

// ── Tutor notes (lesson.tutorNotes — never served to students) ───────────

const BEGINNER_TUTOR_NOTES = `## Tutor brief — Shapes & Colors

**Audience:** Ages 6–8. Energy is everything. Stand up at slide 4.

**Pacing:** ~10 minutes. If a class is small, expand the "your turn" activity.

**Common pitfalls:**
- Students conflate "circle" with "ball" — accept it for now, correct gently on the third repeat.
- The rainbow image needs internet access. If offline, draw it on the whiteboard.

**Wrap-up:** Re-state the three shapes before launching the quiz.
`;

const INTERMEDIATE_TUTOR_NOTES = `## Tutor brief — Intro to Web Development

**Audience:** Ages 9–12. Comfortable on a laptop; never touched code.

**Pacing:** 25 minutes for the deck, 10 for the quiz, 15 for the hands-on follow-up.

**Live demos:**
- Open browser DevTools on the slide-4 CSS example.
- Show the JS \`alert\` snippet running in the console.

**Common pitfalls:**
- Students copy code with the wrong quotes ("smart quotes" from word processors). Pre-empt this.
- "Save and refresh" is not obvious — say it explicitly.

**Stretch activity for fast finishers:** swap \`tomato\` for a hex colour and explain why both work.
`;

const ADVANCED_TUTOR_NOTES = `## Tutor brief — Intro to Machine Learning

**Audience:** Ages 16–18. Algebra-comfortable, some Python.

**Pacing:** 30 minutes for the deck, 10 for the quiz. Reserve the second hour for the Colab walkthrough.

**Whiteboard moments:**
- Derive \\partial L / \\partial w by hand on slide "Gradient Descent" — students retain the chain rule far better when they see it written.
- Sketch a 1D loss surface and the descent path.

**Discussion prompt (slide 9 — Ethics):**
- COMPAS recidivism scoring
- Amazon's defunct recruiting algorithm
- Healthcare cost prediction biases (Obermeyer et al., 2019)

**Common pitfalls:**
- Students confuse the learning rate with the number of epochs.
- The "Python in 12 lines" snippet uses \`np.dot\` — verify they import numpy.
`;

// ── Helpers ──────────────────────────────────────────────────────────────

interface PresentationCourseSpec {
  slug: string;
  title: string;
  description: string;
  ageGroup: "AGES_3_5" | "AGES_6_8" | "AGES_9_12" | "AGES_13_15" | "AGES_16_18";
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category: string;
  moduleTitle: string;
  lessonTitle: string;
  duration: number;
  presentationContent: string;
  presentationConfig: Record<string, unknown>;
  tutorNotes: string;
  quizTitle: string;
  passingScore: number;
  questions: Array<{
    text: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    points: number;
    explanation?: string;
    answers: Array<{ text: string; isCorrect: boolean }>;
  }>;
}

async function upsertPresentationCourse(
  spec: PresentationCourseSpec,
  createdById: string
) {
  const course = await db.course.upsert({
    where: { slug: spec.slug },
    update: {},
    create: {
      title: spec.title,
      slug: spec.slug,
      description: spec.description,
      // The catalog enum literals are widened on the model, so we cast.
      ageGroup: spec.ageGroup,
      level: spec.level,
      category: spec.category as never,
      status: "PUBLISHED",
      isFree: true,
      createdById,
    },
  });

  let courseModule = await db.module.findFirst({
    where: { courseId: course.id, order: 1 },
  });
  if (!courseModule) {
    courseModule = await db.module.create({
      data: { courseId: course.id, title: spec.moduleTitle, order: 1 },
    });
  }

  let lesson = await db.lesson.findFirst({
    where: { moduleId: courseModule.id, order: 1 },
  });
  if (!lesson) {
    lesson = await db.lesson.create({
      data: {
        moduleId: courseModule.id,
        title: spec.lessonTitle,
        order: 1,
        isFree: true,
        duration: spec.duration,
        type: "PRESENTATION",
        presentationFormat: "MARKDOWN",
        presentationContent: spec.presentationContent,
        presentationConfig: spec.presentationConfig as never,
        tutorNotes: spec.tutorNotes,
        content: `<p>Open the slide deck to begin.</p>`,
      },
    });
  } else {
    lesson = await db.lesson.update({
      where: { id: lesson.id },
      data: {
        title: spec.lessonTitle,
        type: "PRESENTATION",
        presentationFormat: "MARKDOWN",
        presentationContent: spec.presentationContent,
        presentationConfig: spec.presentationConfig as never,
        tutorNotes: spec.tutorNotes,
      },
    });
  }

  let quiz = await db.quiz.findUnique({ where: { lessonId: lesson.id } });
  if (!quiz) {
    quiz = await db.quiz.create({
      data: {
        lessonId: lesson.id,
        title: spec.quizTitle,
        passingScore: spec.passingScore,
      },
    });
    for (let i = 0; i < spec.questions.length; i++) {
      const q = spec.questions[i];
      const question = await db.question.create({
        data: {
          quizId: quiz.id,
          text: q.text,
          type: q.type,
          points: q.points,
          order: i + 1,
          explanation: q.explanation,
        },
      });
      for (let j = 0; j < q.answers.length; j++) {
        const a = q.answers[j];
        await db.answer.create({
          data: {
            questionId: question.id,
            text: a.text,
            isCorrect: a.isCorrect,
            order: j + 1,
          },
        });
      }
    }
  }

  return { course, module: courseModule, lesson, quiz };
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding sample presentations…");

  const admin = await db.user.findUnique({
    where: { email: "admin@schulab.com" },
  });
  if (!admin) {
    throw new Error(
      "admin@schulab.com not found — run `npm run db:seed` first"
    );
  }

  const aisha = await db.user.findUnique({
    where: { email: "aisha@example.com" },
  });
  if (!aisha) {
    throw new Error(
      "aisha@example.com not found — run `npm run db:seed` first"
    );
  }

  const tutorUser = await db.user.findUnique({
    where: { email: "marcus@example.com" },
  });
  const tutorProfile = tutorUser
    ? await db.tutorProfile.findUnique({ where: { userId: tutorUser.id } })
    : null;

  // Beginner ───────────────────────────────────────────────────────────────
  const beginner = await upsertPresentationCourse(
    {
      slug: "sample-presentation-beginner-shapes-colors",
      title: "Sample Presentation — Beginner: Shapes & Colors",
      description:
        "A short Reveal.js deck for ages 6–8 — fragments, an embedded image, speaker notes, and a 3-question quiz.",
      ageGroup: "AGES_6_8",
      level: "BEGINNER",
      category: "SCIENCE",
      moduleTitle: "Slide Deck",
      lessonTitle: "Shapes & Colors — Slide Deck",
      duration: 600,
      presentationContent: BEGINNER_MARKDOWN,
      presentationConfig: BEGINNER_CONFIG,
      tutorNotes: BEGINNER_TUTOR_NOTES,
      quizTitle: "Shapes & Colors — Check Your Understanding",
      passingScore: 66,
      questions: [
        {
          text: "Which of these is a shape?",
          type: "MULTIPLE_CHOICE",
          points: 1,
          explanation: "A triangle has three straight sides.",
          answers: [
            { text: "Triangle", isCorrect: true },
            { text: "Banana", isCorrect: false },
            { text: "Sneeze", isCorrect: false },
            { text: "Wednesday", isCorrect: false },
          ],
        },
        {
          text: "Red, blue, and yellow are colours.",
          type: "TRUE_FALSE",
          points: 1,
          answers: [
            { text: "True", isCorrect: true },
            { text: "False", isCorrect: false },
          ],
        },
        {
          text: "Name something in your room that is round.",
          type: "SHORT_ANSWER",
          points: 1,
          explanation:
            "Any round object is accepted (ball, clock, plate, doorknob…).",
          answers: [{ text: "any round object", isCorrect: true }],
        },
      ],
    },
    admin.id
  );
  console.log(`  ✓ Beginner: ${beginner.course.slug}`);

  // Intermediate ───────────────────────────────────────────────────────────
  const intermediate = await upsertPresentationCourse(
    {
      slug: "sample-presentation-intermediate-web-dev",
      title: "Sample Presentation — Intermediate: Intro to Web Development",
      description:
        "A Reveal.js deck for ages 9–12 — vertical slides, code blocks (highlight), a table, downloadable resources, and a 5-question quiz.",
      ageGroup: "AGES_9_12",
      level: "INTERMEDIATE",
      category: "CODING",
      moduleTitle: "Slide Deck",
      lessonTitle: "Intro to Web Development — Slide Deck",
      duration: 1500,
      presentationContent: INTERMEDIATE_MARKDOWN,
      presentationConfig: INTERMEDIATE_CONFIG,
      tutorNotes: INTERMEDIATE_TUTOR_NOTES,
      quizTitle: "Web Development — Check Your Understanding",
      passingScore: 80,
      questions: [
        {
          text: "Which language describes the structure of a webpage?",
          type: "MULTIPLE_CHOICE",
          points: 1,
          explanation: "HTML — HyperText Markup Language.",
          answers: [
            { text: "HTML", isCorrect: true },
            { text: "CSS", isCorrect: false },
            { text: "JavaScript", isCorrect: false },
            { text: "Python", isCorrect: false },
          ],
        },
        {
          text: "Which language controls how the page looks?",
          type: "MULTIPLE_CHOICE",
          points: 1,
          answers: [
            { text: "HTML", isCorrect: false },
            { text: "CSS", isCorrect: true },
            { text: "SQL", isCorrect: false },
            { text: "Bash", isCorrect: false },
          ],
        },
        {
          text: "JavaScript runs in your browser.",
          type: "TRUE_FALSE",
          points: 1,
          answers: [
            { text: "True", isCorrect: true },
            { text: "False", isCorrect: false },
          ],
        },
        {
          text: "Which CSS property creates space INSIDE an element's border?",
          type: "MULTIPLE_CHOICE",
          points: 2,
          explanation: "Padding is inside the border; margin is outside.",
          answers: [
            { text: "margin", isCorrect: false },
            { text: "padding", isCorrect: true },
            { text: "border-radius", isCorrect: false },
            { text: "outline", isCorrect: false },
          ],
        },
        {
          text: "Name the HTML tag for a clickable link.",
          type: "SHORT_ANSWER",
          points: 1,
          explanation: "<a> — the anchor tag.",
          answers: [
            { text: "a", isCorrect: true },
            { text: "<a>", isCorrect: true },
            { text: "anchor", isCorrect: true },
          ],
        },
      ],
    },
    admin.id
  );
  console.log(`  ✓ Intermediate: ${intermediate.course.slug}`);

  // Advanced ───────────────────────────────────────────────────────────────
  const advanced = await upsertPresentationCourse(
    {
      slug: "sample-presentation-advanced-machine-learning",
      title: "Sample Presentation — Advanced: Intro to Machine Learning",
      description:
        "A Reveal.js deck for ages 16–18 — vertical slides, math (KaTeX), Python code, fragments, and a 6-question quiz.",
      ageGroup: "AGES_16_18",
      level: "ADVANCED",
      category: "AI",
      moduleTitle: "Slide Deck",
      lessonTitle: "Intro to Machine Learning — Slide Deck",
      duration: 1800,
      presentationContent: ADVANCED_MARKDOWN,
      presentationConfig: ADVANCED_CONFIG,
      tutorNotes: ADVANCED_TUTOR_NOTES,
      quizTitle: "Machine Learning — Check Your Understanding",
      passingScore: 80,
      questions: [
        {
          text: "Which type of learning uses labelled training data?",
          type: "MULTIPLE_CHOICE",
          points: 1,
          answers: [
            { text: "Supervised", isCorrect: true },
            { text: "Unsupervised", isCorrect: false },
            { text: "Reinforcement", isCorrect: false },
            { text: "Quantum", isCorrect: false },
          ],
        },
        {
          text: "Mean squared error is always non-negative.",
          type: "TRUE_FALSE",
          points: 1,
          explanation: "Each term is squared before summing, so MSE ≥ 0.",
          answers: [
            { text: "True", isCorrect: true },
            { text: "False", isCorrect: false },
          ],
        },
        {
          text: "What happens if the learning rate is too large?",
          type: "MULTIPLE_CHOICE",
          points: 2,
          explanation:
            "Large steps overshoot the minimum and the loss can diverge.",
          answers: [
            { text: "The model converges faster with no downside", isCorrect: false },
            { text: "The loss can diverge or oscillate", isCorrect: true },
            { text: "Training data is rotated", isCorrect: false },
            { text: "Nothing — learning rate is cosmetic", isCorrect: false },
          ],
        },
        {
          text: "A model that memorises noise in the training set is said to be…",
          type: "MULTIPLE_CHOICE",
          points: 2,
          answers: [
            { text: "Underfitting", isCorrect: false },
            { text: "Overfitting", isCorrect: true },
            { text: "Regularised", isCorrect: false },
            { text: "Bayesian", isCorrect: false },
          ],
        },
        {
          text: "Gradient descent updates parameters by subtracting the gradient times the learning rate.",
          type: "TRUE_FALSE",
          points: 1,
          answers: [
            { text: "True", isCorrect: true },
            { text: "False", isCorrect: false },
          ],
        },
        {
          text: "In one sentence, why might an ML model produce biased predictions?",
          type: "SHORT_ANSWER",
          points: 2,
          explanation:
            "Models learn the patterns present in their training data; biased data yields biased predictions.",
          answers: [
            { text: "biased training data", isCorrect: true },
          ],
        },
      ],
    },
    admin.id
  );
  console.log(`  ✓ Advanced: ${advanced.course.slug}`);

  // Enrol Aisha so the student dashboard has something to render ──────────
  for (const c of [beginner.course, intermediate.course, advanced.course]) {
    await db.enrollment.upsert({
      where: { userId_courseId: { userId: aisha.id, courseId: c.id } },
      update: {},
      create: { userId: aisha.id, courseId: c.id, status: "ACTIVE", progress: 0 },
    });
  }
  console.log("  ✓ Enrolled Aisha in all three sample-presentation courses");

  // Live-classroom entry point on the Intermediate lesson ─────────────────
  if (tutorProfile) {
    const lessonId = intermediate.lesson.id;
    const existing = await db.booking.findFirst({
      where: {
        studentId: aisha.id,
        tutorId: tutorProfile.id,
        lessonId,
      },
    });
    if (!existing) {
      const startTime = new Date(Date.now() + 60 * 60 * 1000); // +1h
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      const booking = await db.booking.create({
        data: {
          studentId: aisha.id,
          tutorId: tutorProfile.id,
          subject: "Intro to Web Development (sample presentation)",
          startTime,
          endTime,
          status: "CONFIRMED",
          price: 0,
          notes: "Live-classroom smoke booking for sample presentation deck.",
          lessonId,
        },
      });
      // Pre-create the ClassroomSession so the LiveKit join flow has a row
      // to attach to; livekitRoom must be unique and stable across reconnects.
      await db.classroomSession.create({
        data: {
          bookingId: booking.id,
          livekitRoom: `sample-presentation-${booking.id}`,
          status: "PENDING",
        },
      });
      console.log(
        `  ✓ Booking + ClassroomSession created on Intermediate lesson (bookingId=${booking.id})`
      );
    } else {
      console.log(
        `  ✓ Booking already exists on Intermediate lesson (bookingId=${existing.id})`
      );
    }
  } else {
    console.log(
      "  ⚠️  No tutor profile for marcus@example.com — skipped Booking creation"
    );
  }

  console.log("\nDone. Sample presentation courses:");
  console.log(`  /en/courses/${beginner.course.slug}`);
  console.log(`  /en/courses/${intermediate.course.slug}`);
  console.log(`  /en/courses/${advanced.course.slug}`);

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
