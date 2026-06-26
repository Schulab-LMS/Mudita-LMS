import type { CatalogCourse } from "./types";

// ── Git-managed curriculum courses ──────────────────────────────────────────
//
// One catalog entry per CONTENT-BEARING course root in the STEM-Curricula repo.
// These are the platform-owned METADATA shells for curricula whose lessons are
// authored in Git; the curriculum sync attaches the actual modules/lessons by
// matching `slug` to the repo course-root slug (see curriculum-sync.service.ts
// + docs/curriculum/10-git-sync-ownership.md).
//
// Anti-duplication: each `slug` here is IDENTICAL to the repo course-root slug,
// so the sync fills THIS course instead of bootstrapping a second one — one
// curriculum maps to exactly one platform course. `modules` is intentionally
// omitted so the seeder creates no placeholder lessons (content comes from Git).
//
// Status mirrors the repo's own readiness marker as a one-time default: the five
// programming stages + the children's space-science course are PUBLISHED (their
// content is complete); the eight space-science age-band series are DRAFT
// (hidden) until an admin publishes them. Status is platform-owned from here on
// — the sync never changes it.

export const COURSES_CURRICULUM: CatalogCourse[] = [
  // ===========================================================================
  // PROGRAMMING — five age-band stages (category CODING)
  // ===========================================================================
  {
    slug: "5-7-computational-thinking",
    title: "Computational Thinking",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "CODING",
    description:
      "A gentle first step into computational thinking for ages 5–7 — sequencing, patterns, and step-by-step problem solving through playful, screen-light activities.",
    parentSummary:
      "Your child builds the thinking skills behind coding — putting steps in order, spotting patterns, and breaking problems into small pieces — through short, playful activities. No prior experience and no special hardware required.",
    studentSummary:
      "Learn to think like a coder! Put things in the right order, find patterns, and solve puzzles step by step.",
    skills: ["sequencing", "pattern recognition", "problem solving", "logical thinking"],
    tools: ["ScratchJr", "unplugged activities"],
    finalProjectTitle: "My First Algorithm",
    finalProjectDescription:
      "Learners design and act out a simple step-by-step algorithm of their own.",
    referenceKeys: [],
    status: "PUBLISHED",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: programming/age-groups/5-7-computational-thinking.",
  },
  {
    slug: "8-10-block-programming",
    title: "Block Programming",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Build real programs with Scratch blocks — events, loops, conditionals, and variables — while making your own animations and games.",
    parentSummary:
      "Your child writes real programs using Scratch's colourful blocks, learning the same core ideas (events, loops, conditions, variables) that underpin text programming — by building animations and games they care about.",
    studentSummary:
      "Make animations and games in Scratch while learning how events, loops, and variables really work.",
    skills: ["block coding", "events & loops", "conditionals", "variables", "game design"],
    tools: ["Scratch"],
    finalProjectTitle: "My Scratch Game",
    finalProjectDescription:
      "Learners design and build an original Scratch game using events, loops, conditionals, and variables.",
    referenceKeys: [],
    status: "PUBLISHED",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: programming/age-groups/8-10-block-programming.",
  },
  {
    slug: "11-13-programming-fundamentals",
    title: "Programming Fundamentals",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "A complete grounding in programming — algorithms, Python basics, functions, conditionals and loops, an intro to web development, and physical computing with the micro:bit.",
    parentSummary:
      "Your child moves from blocks to real text programming, covering algorithms, Python, functions, control flow, the basics of building web pages, and hands-on physical computing with the micro:bit. A broad, project-based foundation for everything that follows.",
    studentSummary:
      "Learn to code for real: algorithms, Python, functions, loops, your first web pages, and micro:bit projects.",
    skills: [
      "algorithms",
      "Python",
      "functions",
      "conditionals & loops",
      "HTML & CSS",
      "physical computing",
    ],
    tools: ["Python", "micro:bit", "HTML", "CSS"],
    finalProjectTitle: "micro:bit Project",
    finalProjectDescription:
      "Students plan, build, and present a micro:bit project that combines inputs, outputs, and Python logic.",
    referenceKeys: [],
    status: "PUBLISHED",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: programming/age-groups/11-13-programming-fundamentals.",
  },
  {
    slug: "14-16-software-development",
    title: "Software Development",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Move from coding to software development — structured programming, problem decomposition, debugging, and building larger, multi-part projects.",
    parentSummary:
      "Your teen progresses from writing snippets to developing software: decomposing problems, structuring code, debugging methodically, and delivering larger projects from a specification.",
    studentSummary:
      "Go beyond snippets — design, build, and debug real, multi-part software projects.",
    skills: ["software design", "problem decomposition", "programming", "debugging"],
    tools: ["Python"],
    finalProjectTitle: "Software Project",
    finalProjectDescription:
      "Students design and build a multi-part software project from a written specification.",
    referenceKeys: [],
    status: "PUBLISHED",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: programming/age-groups/14-16-software-development.",
  },
  {
    slug: "17-18-advanced-computer-science",
    title: "Advanced Computer Science",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "CODING",
    description:
      "Advanced computer-science concepts and capstone project work to prepare for higher study — data structures, algorithms, and applied development.",
    parentSummary:
      "Your student tackles advanced computer-science concepts — data structures, algorithms, and applied development — culminating in a capstone project suitable for portfolios and higher-study applications.",
    studentSummary:
      "Master advanced CS — data structures, algorithms, and applied development — and ship a capstone project.",
    skills: ["data structures", "algorithms", "applied development", "computational thinking"],
    tools: ["Python"],
    finalProjectTitle: "Capstone Project",
    finalProjectDescription:
      "Students deliver a capstone software project demonstrating advanced computer-science concepts.",
    referenceKeys: [],
    status: "PUBLISHED",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: programming/age-groups/17-18-advanced-computer-science.",
  },

  // ===========================================================================
  // SPACE SCIENCE — children's course (category SCIENCE)
  // ===========================================================================
  {
    slug: "space-science-children-8-12",
    title: "Space Science for Children",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "A hands-on space science journey for children aged 8–12 — the solar system, space missions, and how scientists explore the universe.",
    parentSummary:
      "Your child explores space science through curated, agency-backed activities — touring the solar system, learning how missions work, and building genuine curiosity about the universe. No hardware required.",
    studentSummary:
      "Tour the solar system, discover real space missions, and learn how we explore the universe.",
    skills: ["space science", "solar system", "scientific curiosity", "observation"],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "My Space Mission",
    finalProjectDescription:
      "Children design and present their own space-mission concept.",
    referenceKeys: [],
    status: "PUBLISHED",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: space-science-children-8-12.",
  },

  // ===========================================================================
  // SPACE SCIENCE — age-band series (category SCIENCE)
  // DRAFT (hidden) until an admin publishes; mirrors the repo's DRAFT marker.
  // ===========================================================================
  {
    slug: "5-7-early-explorers-s1",
    title: "Space Science: Early Explorers",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "An early-years introduction to space for ages 5–7 — the Sun, Moon, stars, and planets through stories and playful activities.",
    parentSummary:
      "Your child takes their very first look at space — the Sun, Moon, stars, and planets — through stories, songs, and simple activities designed for early learners.",
    studentSummary:
      "Meet the Sun, Moon, stars, and planets, and discover what makes space so amazing.",
    skills: ["early space science", "observation", "scientific curiosity"],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "My Sky Journal",
    finalProjectDescription:
      "Learners create a simple journal of the things they have discovered in the sky.",
    referenceKeys: [],
    status: "DRAFT",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: space-science/age-groups/5-7-early-explorers-s1.",
  },
  {
    slug: "8-10-young-learners-s1",
    title: "Space Science: Young Learners I",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "Series 1 of space science for ages 8–10 — the solar system, the Sun–Earth–Moon system, and how we observe space.",
    parentSummary:
      "Your child builds a real foundation in space science — the solar system, the Sun–Earth–Moon relationship, and how scientists observe space — through curated, agency-backed activities.",
    studentSummary:
      "Explore the solar system and learn how the Sun, Earth, and Moon work together.",
    skills: ["solar system", "Sun–Earth–Moon system", "observation", "space science"],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Solar System Showcase",
    finalProjectDescription:
      "Learners build and present a model or poster of the solar system.",
    referenceKeys: [],
    status: "DRAFT",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: space-science/age-groups/8-10-young-learners-s1.",
    nextSlug: "8-10-young-learners-s2",
  },
  {
    slug: "8-10-young-learners-s2",
    title: "Space Science: Young Learners II",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "Series 2 of space science for ages 8–10 — building on Series 1 with space missions, exploration, and Earth from space.",
    parentSummary:
      "Continuing from Series 1, your child explores space missions, exploration, and our view of Earth from space — deepening their space-science foundation through curated activities.",
    studentSummary:
      "Go further into space — real missions, exploration, and seeing Earth from space.",
    skills: ["space missions", "exploration", "Earth observation", "space science"],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Mission Explorer",
    finalProjectDescription:
      "Learners research a real space mission and present what it discovered.",
    referenceKeys: [],
    status: "DRAFT",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: space-science/age-groups/8-10-young-learners-s2.",
  },
  {
    slug: "11-13-middle-explorers-s1",
    title: "Space Science: Middle Explorers I",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Series 1 of space science for ages 11–13 — planets and moons, the Sun–Earth connection, and space weather.",
    parentSummary:
      "Your child investigates space science in more depth — planets and moons, the Sun–Earth connection, and space weather — using real data and agency-backed activities.",
    studentSummary:
      "Investigate planets, moons, the Sun–Earth connection, and space weather.",
    skills: ["planetary science", "Sun–Earth connection", "space weather", "data interpretation"],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Space Weather Report",
    finalProjectDescription:
      "Students prepare and present a short space-weather report using real data.",
    referenceKeys: [],
    status: "DRAFT",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: space-science/age-groups/11-13-middle-explorers-s1.",
    nextSlug: "11-13-middle-explorers-s2",
  },
  {
    slug: "11-13-middle-explorers-s2",
    title: "Space Science: Middle Explorers II",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Series 2 of space science for ages 11–13 — building on Series 1 with missions, communications, and sky events.",
    parentSummary:
      "Continuing from Series 1, your child explores space missions, how spacecraft communicate, and sky events such as eclipses — deepening their understanding through real data.",
    studentSummary:
      "Dive into space missions, spacecraft communications, and sky events like eclipses.",
    skills: ["space missions", "communications", "sky events", "data interpretation"],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Mission Communications Brief",
    finalProjectDescription:
      "Students explain how a chosen mission sends data back to Earth and present their findings.",
    referenceKeys: [],
    status: "DRAFT",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: space-science/age-groups/11-13-middle-explorers-s2.",
  },
  {
    slug: "14-16-future-innovators-s1",
    title: "Space Science: Future Innovators I",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Series 1 of space science for ages 14–16 — stars and galaxies, orbital mechanics, and the science behind space exploration.",
    parentSummary:
      "Your teen studies space science at a deeper level — stars and galaxies, the basics of orbital mechanics, and the science that makes exploration possible — through real data and simulations.",
    studentSummary:
      "Study stars, galaxies, orbits, and the real science behind exploring space.",
    skills: ["astrophysics basics", "orbital mechanics", "scientific reasoning", "data analysis"],
    tools: ["NASA resources", "ESA resources"],
    finalProjectTitle: "Exploration Case Study",
    finalProjectDescription:
      "Students produce a case study of a space-exploration challenge and the science behind it.",
    referenceKeys: [],
    status: "DRAFT",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: space-science/age-groups/14-16-future-innovators-s1.",
    nextSlug: "14-16-future-innovators-s2",
  },
  {
    slug: "14-16-future-innovators-s2",
    title: "Space Science: Future Innovators II",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Series 2 of space science for ages 14–16 — building on Series 1 with mission design, data analysis, and the search for life.",
    parentSummary:
      "Continuing from Series 1, your teen explores mission design, deeper data analysis, and big questions such as the search for life — applying scientific reasoning to real problems.",
    studentSummary:
      "Design missions, analyse real data, and explore big questions like the search for life.",
    skills: ["mission design", "data analysis", "scientific reasoning", "research"],
    tools: ["NASA resources", "ESA resources"],
    finalProjectTitle: "Mission Design Proposal",
    finalProjectDescription:
      "Students design and justify a space-mission proposal grounded in real science.",
    referenceKeys: [],
    status: "DRAFT",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: space-science/age-groups/14-16-future-innovators-s2.",
  },
  {
    slug: "17-18-senior-scientists-s1",
    title: "Space Science: Senior Scientists",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "SCIENCE",
    description:
      "Advanced space science for ages 17–18 — cosmology, advanced mission science, and a research-style capstone.",
    parentSummary:
      "Your student engages with advanced space science — cosmology and advanced mission science — and completes a research-style capstone suitable for portfolios and higher-study applications.",
    studentSummary:
      "Tackle advanced space science — cosmology and mission science — and produce a research-style capstone.",
    skills: ["cosmology", "advanced mission science", "research", "scientific writing"],
    tools: ["NASA resources", "ESA resources"],
    finalProjectTitle: "Research Capstone",
    finalProjectDescription:
      "Students produce a research-style capstone on a space-science topic of their choosing.",
    referenceKeys: [],
    status: "DRAFT",
    requiredPlan: "LEARNER",
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Content synced from STEM-Curricula: space-science/age-groups/17-18-senior-scientists-s1.",
  },
];
