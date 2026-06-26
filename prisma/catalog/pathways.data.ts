import type { CatalogPathway } from "./types";

// The 6 age-based learning pathways. Each stage references EXACTLY ONE of a
// bundle slug (BUNDLES) or a course slug (courses-*.data.ts). Reference keys
// MUST exist in reference-sources.data.ts. Every pathway ends in a capstone.
export const PATHWAYS: CatalogPathway[] = [
  {
    slug: "digital-discovery",
    title: "Digital Discovery",
    description:
      "A playful first journey into early STEAM thinking, digital creativity and coding logic for our youngest learners (ages 3–5). Pre-coding, storytelling and simple STEM discovery — no real programming.",
    ageGroup: "AGES_3_5",
    order: 0,
    referenceKeys: ["code-org", "scratchjr", "nasa-space-place", "natgeo-kids", "outschool"],
    adminNotes: "Ages 3–5: pre-coding only. Next pathway: Junior Creator.",
    stages: [
      { courseSlug: "digital-discovery-shapes-patterns-logic", title: "Stage 1: Shapes, Patterns & Logic" },
      { courseSlug: "creative-thinking-little-explorers", title: "Stage 2: Creative Thinking" },
      { courseSlug: "pre-coding-sequencing-games", title: "Stage 3: Pre-Coding with Sequencing" },
      { courseSlug: "my-first-digital-story", title: "Stage 4: My First Digital Story" },
      { courseSlug: "digital-art-and-imagination", title: "Stage 5: Digital Art & Imagination" },
      { courseSlug: "simple-stem-challenges-young-learners", title: "Stage 6: Simple STEM Challenges" },
    ],
  },
  {
    slug: "junior-creator",
    title: "Junior Creator",
    description:
      "Tell stories and create with ScratchJr (ages 5–7): visual coding, animations, characters, sequencing, loops, simple games and creative digital projects.",
    ageGroup: "AGES_5_7",
    order: 0,
    referenceKeys: ["scratchjr", "code-org", "tynker", "nasa-space-place", "natgeo-kids"],
    adminNotes: "Capstone: present an interactive ScratchJr story, animation or simple game. Next pathway: Creative Coder.",
    stages: [
      { bundleSlug: "coding-starter-bundle", title: "Stage 1: Coding Starter" },
      { bundleSlug: "digital-creativity-bundle", title: "Stage 2: Digital Creativity" },
      { courseSlug: "junior-creator-final-project", title: "Stage 3: Junior Creator Final Project" },
    ],
  },
  {
    slug: "creative-coder",
    title: "Creative Coder",
    description:
      "Move from blocks to Scratch projects, animations, games and problem solving, with beginner AI awareness and NASA/ESA space-science enrichment (ages 8–10).",
    ageGroup: "AGES_8_10",
    order: 0,
    referenceKeys: ["scratch", "code-org", "tynker", "makecode", "raspberry-pi", "code-club", "nasa-space-place", "esa-kids"],
    adminNotes: "Capstone: build a Scratch animation, game or digital STEM/space project. Next pathway: STEM Builder.",
    stages: [
      { bundleSlug: "creative-coding-game-design-bundle", title: "Stage 1: Creative Coding & Game Design" },
      { courseSlug: "ai-around-us", title: "Stage 2: AI Around Us" },
      { bundleSlug: "space-science-nasa-esa-explorer-bundle", title: "Stage 3: Space Science (NASA & ESA)" },
      { courseSlug: "creative-coder-final-project", title: "Stage 4: Creative Coder Final Project" },
    ],
  },
  {
    slug: "stem-builder",
    title: "STEM Builder",
    description:
      "Stronger coding logic, AI literacy, game design, web basics, virtual robotics, science simulations and space science (ages 11–13) — structured, project-based digital STEM.",
    ageGroup: "AGES_11_13",
    order: 0,
    referenceKeys: ["code-org", "create-learn", "tynker", "makecode", "app-inventor", "nasa-space-place", "esa-kids", "phet", "ck12", "smithsonian-ssec"],
    adminNotes: "Capstone: a digital STEM project using coding, logic, AI awareness, simulation or space science. Next pathway: Tech Innovator.",
    stages: [
      // Git-managed programming curriculum as the coding foundation (no general
      // 11–13 CODING bundle exists, so it is a direct course stage here).
      { courseSlug: "11-13-programming-fundamentals", title: "Stage 1: Programming Fundamentals" },
      { bundleSlug: "ai-native-kids-bundle", title: "Stage 2: AI Native Kids" },
      { bundleSlug: "virtual-robotics-simulation-bundle", title: "Stage 3: Virtual Robotics & Simulation" },
      { bundleSlug: "interactive-science-simulations-bundle", title: "Stage 4: Interactive Science Simulations" },
      { bundleSlug: "digital-stem-explorer-bundle", title: "Stage 5: Digital STEM Explorer" },
      { courseSlug: "stem-builder-final-project", title: "Stage 6: STEM Builder Final Project" },
    ],
  },
  {
    slug: "tech-innovator",
    title: "Tech Innovator",
    description:
      "Develop Python, JavaScript, web and app development, AI projects and data basics with portfolio-based learning (ages 14–16).",
    ageGroup: "AGES_14_16",
    order: 0,
    referenceKeys: ["code-org", "khan-computing", "app-inventor", "makecode", "create-learn", "tynker", "raspberry-pi", "code-club", "phet", "nasa-space-place", "esa-kids"],
    adminNotes: "Capstone: a portfolio-ready web, app, Python, AI, data or simulation project. Next pathway: Future Tech Leader.",
    stages: [
      // Git-managed broad programming curriculum as the foundation (direct
      // course stage — distinct from the web/app-specific bundle below).
      { courseSlug: "14-16-software-development", title: "Stage 1: Software Development" },
      { bundleSlug: "web-app-builder-bundle", title: "Stage 2: Web & App Builder" },
      { courseSlug: "python-starter-for-teens", title: "Stage 3: Python Starter for Teens" },
      { courseSlug: "ai-literacy-ethics", title: "Stage 4: AI Literacy & Responsible AI" },
      { courseSlug: "data-basics-with-python", title: "Stage 5: Data Basics with Python" },
      { courseSlug: "tech-innovator-portfolio-project", title: "Stage 6: Tech Innovator Portfolio Project" },
    ],
  },
  {
    slug: "future-tech-leader",
    title: "Future Tech Leader",
    description:
      "Prepare for real-world digital projects, AI-native creation, entrepreneurship, product and data thinking, portfolio building and presentation (ages 17–18).",
    ageGroup: "AGES_17_18",
    order: 0,
    referenceKeys: ["code-org", "khan-computing", "app-inventor", "create-learn", "makecode", "raspberry-pi", "code-club", "nasa-space-place", "esa-kids", "outschool"],
    adminNotes:
      "Final child pathway. Capstone: a real-world digital product, AI project, app prototype, data or portfolio project. Next: advanced specialization, competitions, internships or entrepreneurship.",
    stages: [
      // Git-managed advanced CS curriculum as the foundation (direct course
      // stage — broader than the AI-focused bundle below).
      { courseSlug: "17-18-advanced-computer-science", title: "Stage 1: Advanced Computer Science" },
      { bundleSlug: "future-tech-leader-bundle", title: "Stage 2: Future Tech Leader" },
      { courseSlug: "data-thinking-future-leaders", title: "Stage 3: Data Thinking for Future Leaders" },
      { courseSlug: "app-prototype-development", title: "Stage 4: App Prototype Development" },
      { courseSlug: "future-tech-leader-capstone-project", title: "Stage 5: Future Tech Leader Capstone" },
    ],
  },
];
