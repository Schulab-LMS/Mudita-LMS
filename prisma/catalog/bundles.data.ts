import type { CatalogBundle } from "./types";

// The SchuLab course bundles: 11 published + a 5-bundle DRAFT Space Science
// track (one per age band). Course slugs MUST resolve to entries in the
// courses-*.data.ts files (existing slugs are reused, new ones are seeded).
// Reference keys MUST exist in reference-sources.data.ts. Bundles are
// subscription-first (requiredPlan) and every bundle ends in a final project.
export const BUNDLES: CatalogBundle[] = [
  {
    slug: "coding-starter-bundle",
    title: "Coding Starter Bundle",
    description:
      "A gentle first step into coding with friendly block-based tools — sequencing, loops and events through play.",
    themeCategory: "CODING",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    requiredPlan: "LEARNER",
    finalProjectTitle: "My First Interactive Story or Game",
    finalProjectDescription:
      "Create and present a simple interactive story or beginner game with characters, sequencing and a simple loop.",
    learningObjectives: [
      "Understand sequencing",
      "Use simple loops",
      "Create digital stories",
      "Create simple animations",
      "Build a beginner interactive game",
    ],
    recommendedDurationWeeks: 6,
    referenceKeys: ["scratchjr", "scratch", "code-org", "tynker"],
    courses: [
      // Foundational computational-thinking curriculum (Git-managed) — the
      // spine of the bundle; flows into the Junior Creator pathway via it.
      { slug: "5-7-computational-thinking" },
      { slug: "scratchjr-first-stories" },
      { slug: "sequencing-loops-young-coders" },
      { slug: "scratch-starter-coding-blocks" },
      { slug: "my-first-interactive-game" },
      { slug: "coding-starter-final-project" },
    ],
  },
  {
    slug: "creative-coding-game-design-bundle",
    title: "Creative Coding & Game Design Bundle",
    description:
      "Build playable games and animated stories in Scratch and MakeCode Arcade while sharpening logic and problem solving.",
    themeCategory: "CODING",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    requiredPlan: "LEARNER",
    finalProjectTitle: "Playable Digital Game",
    finalProjectDescription:
      "Build and present a playable multi-level digital game with character controls, events and a scoring system.",
    learningObjectives: [
      "Understand game mechanics",
      "Use events and conditions",
      "Create character controls",
      "Build scoring systems",
      "Design multi-level games",
      "Present a playable game",
    ],
    recommendedDurationWeeks: 8,
    referenceKeys: ["scratch", "tynker", "makecode", "code-org", "raspberry-pi", "code-club"],
    courses: [
      // Foundational block-programming curriculum (Git-managed); flows into the
      // Creative Coder pathway via this bundle.
      { slug: "8-10-block-programming" },
      { slug: "scratch-game-design-level-1" },
      { slug: "game-design-level-2" },
      { slug: "character-movement-controls" },
      { slug: "events-conditions-scoring" },
      { slug: "build-a-multi-level-game" },
      { slug: "creative-coding-game-showcase" },
    ],
  },
  {
    slug: "ai-native-kids-bundle",
    title: "AI Native Kids Bundle",
    description:
      "Understand how AI works, use it safely and creatively, explore data and patterns, and discuss AI ethics.",
    themeCategory: "AI",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    requiredPlan: "PRO",
    finalProjectTitle: "AI-Assisted Creation + Reflection",
    finalProjectDescription:
      "Create and present a simple AI-assisted creative or problem-solving project and reflect on how you guided the AI.",
    learningObjectives: [
      "Understand what AI is",
      "Identify AI in daily life",
      "Use prompts responsibly",
      "Understand data and patterns",
      "Explore AI creativity",
      "Discuss AI ethics",
      "Build a beginner AI-themed project",
    ],
    recommendedDurationWeeks: 6,
    referenceKeys: ["code-org", "create-learn", "tynker", "app-inventor"],
    courses: [
      { slug: "ai-around-us" },
      { slug: "ai-basics-young-innovators" },
      { slug: "prompt-engineering-for-students" },
      { slug: "ai-art-creative-tools" },
      { slug: "data-patterns-ml-basics" },
      { slug: "responsible-ai-digital-ethics" },
      { slug: "ai-native-kids-final-project" },
    ],
  },
  {
    slug: "web-app-builder-bundle",
    title: "Web & App Builder Bundle",
    description:
      "Build responsive web pages and your first app prototypes with HTML, CSS, JavaScript and MIT App Inventor.",
    themeCategory: "CODING",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    requiredPlan: "PRO",
    finalProjectTitle: "Website or App Prototype Demo",
    finalProjectDescription:
      "Build and present a simple working website or app prototype you can share online.",
    learningObjectives: [
      "Understand web page structure",
      "Use HTML and CSS",
      "Add basic JavaScript interaction",
      "Understand app design thinking",
      "Build a mobile app prototype",
      "Present a web/app demo",
    ],
    recommendedDurationWeeks: 10,
    referenceKeys: ["khan-computing", "code-org", "app-inventor", "makecode", "raspberry-pi", "code-club"],
    courses: [
      { slug: "web-basics-build-your-first-page" },
      { slug: "html-css-build-first-website" },
      { slug: "javascript-basics-interactive-web" },
      { slug: "app-design-thinking-for-kids" },
      { slug: "app-development-basics" },
      { slug: "web-app-builder-final-demo" },
    ],
  },
  {
    slug: "digital-stem-explorer-bundle",
    title: "Digital STEM Explorer Bundle",
    description:
      "Practice logic and problem solving, run science simulations and NASA-inspired digital STEM activities, and document what you discover.",
    themeCategory: "SCIENCE",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    requiredPlan: "LEARNER",
    finalProjectTitle: "Digital STEM Challenge Presentation",
    finalProjectDescription:
      "Create a digital STEM report, NASA-inspired space mission concept, science simulation explanation, or STEM challenge presentation.",
    learningObjectives: [
      "Practice logic and problem solving",
      "Understand patterns",
      "Explore STEM through digital activities",
      "Use simulations",
      "Explore NASA-inspired STEM topics",
      "Document experiments",
      "Present a STEM challenge project",
    ],
    recommendedDurationWeeks: 10,
    referenceKeys: ["code-org", "nasa-space-place", "phet", "ck12", "smithsonian-ssec", "makecode", "scratch"],
    courses: [
      { slug: "logic-problem-solving" },
      { slug: "digital-stem-experiments" },
      { slug: "math-patterns-and-games" },
      { slug: "nasa-digital-stem-activities" },
      { slug: "earth-from-space" },
      { slug: "space-science-games-challenges" },
      { slug: "engineering-thinking-for-kids" },
      { slug: "space-science-missions" },
      { slug: "digital-experiment-report-project" },
    ],
  },
  {
    slug: "virtual-robotics-simulation-bundle",
    title: "Virtual Robotics & Simulation Bundle",
    description:
      "Program robots entirely in the browser — no hardware required — and solve simulated movement, sensor and automation challenges.",
    themeCategory: "ROBOTICS",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    requiredPlan: "PRO",
    finalProjectTitle: "Virtual Robotics Simulation Challenge",
    finalProjectDescription:
      "Complete and present a virtual robotics simulation challenge using movement, sensor and decision logic.",
    learningObjectives: [
      "Understand robotics concepts without hardware",
      "Use movement and direction logic",
      "Understand sensors conceptually",
      "Apply decision-making logic",
      "Solve simulation challenges",
      "Build a final virtual robotics challenge",
    ],
    recommendedDurationWeeks: 8,
    referenceKeys: ["create-learn", "makecode", "code-org", "tynker", "microbit"],
    adminNotes:
      "DIGITAL-FIRST: must NOT require physical robots, LEGO, Arduino or shipped materials. Simulator-first only.",
    courses: [
      { slug: "junior-robotics-automation" },
      { slug: "robot-movement-direction-logic" },
      { slug: "sensors-decisions-simulation" },
      { slug: "robotics-challenge-maze-solver" },
      { slug: "automation-thinking-students" },
      { slug: "virtual-robotics-final-challenge" },
    ],
  },
  {
    slug: "digital-creativity-bundle",
    title: "Digital Creativity Bundle",
    description:
      "Make digital art, animation, stories and sound — express ideas with creative browser-based tools and a little code.",
    themeCategory: "ARTS",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    requiredPlan: "LEARNER",
    finalProjectTitle: "Digital Creativity Showcase",
    finalProjectDescription:
      "Create and present a digital story, animation, or interactive creative project that combines art, sound and code.",
    learningObjectives: [
      "Create digital stories",
      "Use characters and animations",
      "Combine art and coding",
      "Add sound and interaction",
      "Express ideas creatively",
      "Present a final digital showcase",
    ],
    recommendedDurationWeeks: 7,
    referenceKeys: ["scratchjr", "scratch", "tynker", "code-org"],
    courses: [
      { slug: "my-first-digital-story" },
      { slug: "digital-storytelling-with-characters" },
      { slug: "scratchjr-animation-adventures" },
      { slug: "animation-storytelling-scratch" },
      { slug: "digital-art-and-imagination" },
      { slug: "music-sound-interaction" },
      { slug: "digital-creativity-final-showcase" },
    ],
  },
  {
    slug: "future-tech-leader-bundle",
    title: "Future Tech Leader Bundle",
    description:
      "Apply Python, AI and data to real problems, build a web product, think like a founder and ship a portfolio capstone.",
    themeCategory: "AI",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    requiredPlan: "PRO",
    finalProjectTitle: "Portfolio-Ready Product + Pitch",
    finalProjectDescription:
      "Build and present a portfolio-ready digital product, AI project or web/app solution, and pitch it like a founder.",
    learningObjectives: [
      "Build real-world Python projects",
      "Understand AI project structure",
      "Use data basics",
      "Build a web product",
      "Think like a product builder",
      "Create a digital portfolio",
      "Present a capstone project",
    ],
    recommendedDurationWeeks: 12,
    referenceKeys: ["code-org", "khan-computing", "create-learn", "app-inventor", "makecode", "raspberry-pi", "code-club"],
    courses: [
      { slug: "python-starter-for-teens" },
      { slug: "python-real-world-projects" },
      { slug: "ai-project-builder" },
      { slug: "data-basics-with-python" },
      { slug: "web-product-development" },
      { slug: "entrepreneurship-product-thinking" },
      { slug: "build-your-digital-portfolio" },
    ],
  },
  {
    slug: "space-science-nasa-esa-explorer-bundle",
    title: "Space Science: NASA & ESA Explorer Bundle",
    description:
      "Explore the solar system, planets, the Sun–Earth connection, missions and the universe with real NASA and ESA digital activities. No coding required.",
    themeCategory: "SCIENCE",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    requiredPlan: "LEARNER",
    finalProjectTitle: "Space Science Showcase",
    finalProjectDescription:
      "Create and present a space mission, planet report, Mars rover challenge, eclipse explanation, or solar system digital showcase.",
    learningObjectives: [
      "Understand basic space science concepts",
      "Explore the solar system",
      "Learn about planets, moons, asteroids, comets and meteors",
      "Understand the relationship between the Sun and Earth",
      "Explore Earth science from a space perspective",
      "Learn about space missions, rovers, satellites and space communication",
      "Practice observation, questioning, research and scientific explanation",
      "Complete a final space science project",
    ],
    recommendedDurationWeeks: 10,
    referenceKeys: ["nasa-space-place", "esa-kids", "natgeo-kids"],
    adminNotes: "No coding prerequisite. Existing space courses are mapped here as IMPORTED_EXISTING (no duplicates).",
    courses: [
      // Broad children's space-science curriculum (Git-managed) as the intro;
      // flows into the Creative Coder pathway via this bundle.
      { slug: "space-science-children-8-12" },
      { slug: "nasa-space-explorer-intro" },
      { slug: "esa-space-for-kids-missions" },
      { slug: "solar-system-explorer" },
      { slug: "planets-moons-space-objects" },
      { slug: "earth-from-space" },
      { slug: "sun-earth-connection" },
      { slug: "stars-galaxies-universe" },
      { slug: "space-science-games-challenges" },
      { slug: "space-science-missions" },
      { slug: "space-science-final-project" },
    ],
  },
  {
    slug: "interactive-science-simulations-bundle",
    title: "Interactive Science Simulations Bundle",
    description:
      "Explore forces, energy, light, sound, chemistry and Earth science through hands-on PhET simulations and CK-12 content.",
    themeCategory: "SCIENCE",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    requiredPlan: "LEARNER",
    finalProjectTitle: "Simulation-Based Science Report",
    finalProjectDescription:
      "Create and present a simulation-based science report investigating a question with data from online simulations.",
    learningObjectives: [
      "Explore science concepts using simulations",
      "Understand forces and motion",
      "Explore energy and electricity",
      "Learn about light, sound and waves",
      "Understand basic chemistry concepts",
      "Explore Earth science digitally",
      "Create a digital experiment report",
    ],
    recommendedDurationWeeks: 8,
    referenceKeys: ["phet", "ck12", "smithsonian-ssec"],
    courses: [
      { slug: "science-simulation-explorer" },
      { slug: "forces-motion-simulations" },
      { slug: "energy-electricity-explorer" },
      { slug: "light-sound-waves-explorer" },
      { slug: "chemistry-basics-simulations" },
      { slug: "earth-science-digital-lab" },
    ],
  },
  {
    slug: "creative-coding-projects-bundle",
    title: "Creative Coding Projects Bundle",
    description:
      "Learn by building real projects across Scratch, Python, HTML/CSS and MakeCode — games, animations and websites.",
    themeCategory: "CODING",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    requiredPlan: "LEARNER",
    finalProjectTitle: "Coding Project Showcase",
    finalProjectDescription:
      "Create and present a coding project showcase featuring your best games, animations and websites.",
    learningObjectives: [
      "Build practical coding projects",
      "Practice Scratch, Python, HTML/CSS and MakeCode",
      "Learn by creating games, animations and websites",
      "Build confidence through project-based learning",
      "Present completed projects",
    ],
    recommendedDurationWeeks: 10,
    referenceKeys: ["raspberry-pi", "code-club", "scratch", "makecode"],
    courses: [
      { slug: "scratch-creative-projects" },
      { slug: "build-your-first-coding-game" },
      { slug: "python-starter-projects" },
      { slug: "html-css-project-lab" },
      { slug: "makecode-arcade-game-builder" },
      { slug: "creative-coding-showcase" },
    ],
  },

  // ===========================================================================
  // SPACE SCIENCE TRACK — one bundle per age band (status: DRAFT / hidden).
  // Hosts the Git-managed space-science age-band series. Kept DRAFT because the
  // underlying courses are DRAFT; publish the courses, then flip these to
  // PUBLISHED (here or in admin). DRAFT bundles are excluded from public bundle
  // listings, so their unpublished courses never surface.
  // ===========================================================================
  {
    slug: "space-explorers-5-7-bundle",
    title: "Space Explorers — Ages 5–7",
    description:
      "An early-years introduction to space: the Sun, Moon, stars and planets through stories and playful, agency-backed activities.",
    themeCategory: "SCIENCE",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    requiredPlan: "LEARNER",
    status: "DRAFT",
    finalProjectTitle: "My Sky Journal",
    finalProjectDescription:
      "Learners present a simple journal of what they have discovered in the sky.",
    learningObjectives: [
      "Recognise the Sun, Moon, stars and planets",
      "Observe and describe the sky",
      "Build early scientific curiosity",
    ],
    recommendedDurationWeeks: 6,
    referenceKeys: ["nasa-space-place", "esa-kids"],
    adminNotes: "Git-managed space-science series (ages 5–7). DRAFT until the course is published.",
    courses: [{ slug: "5-7-early-explorers-s1" }],
  },
  {
    slug: "space-explorers-8-10-bundle",
    title: "Space Explorers — Ages 8–10",
    description:
      "A two-series foundation in space science for ages 8–10: the solar system, the Sun–Earth–Moon system, missions and exploration.",
    themeCategory: "SCIENCE",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    requiredPlan: "LEARNER",
    status: "DRAFT",
    finalProjectTitle: "Solar System & Mission Showcase",
    finalProjectDescription:
      "Learners present a solar-system model and a researched space mission.",
    learningObjectives: [
      "Explore the solar system",
      "Understand the Sun–Earth–Moon system",
      "Learn how space missions work",
      "Practise observation and research",
    ],
    recommendedDurationWeeks: 10,
    referenceKeys: ["nasa-space-place", "esa-kids"],
    adminNotes: "Git-managed space-science series 1 & 2 (ages 8–10). DRAFT until the courses are published.",
    courses: [
      { slug: "8-10-young-learners-s1" },
      { slug: "8-10-young-learners-s2" },
    ],
  },
  {
    slug: "space-explorers-11-13-bundle",
    title: "Space Explorers — Ages 11–13",
    description:
      "A two-series deep dive for ages 11–13: planets and moons, the Sun–Earth connection, space weather, missions, communications and sky events.",
    themeCategory: "SCIENCE",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    requiredPlan: "LEARNER",
    status: "DRAFT",
    finalProjectTitle: "Space Weather & Mission Brief",
    finalProjectDescription:
      "Students present a space-weather report and explain how a mission sends data to Earth.",
    learningObjectives: [
      "Investigate planets, moons and the Sun–Earth connection",
      "Understand space weather",
      "Explore missions, communications and sky events",
      "Interpret real data",
    ],
    recommendedDurationWeeks: 10,
    referenceKeys: ["nasa-space-place", "esa-kids"],
    adminNotes: "Git-managed space-science series 1 & 2 (ages 11–13). DRAFT until the courses are published.",
    courses: [
      { slug: "11-13-middle-explorers-s1" },
      { slug: "11-13-middle-explorers-s2" },
    ],
  },
  {
    slug: "space-explorers-14-16-bundle",
    title: "Space Explorers — Ages 14–16",
    description:
      "A two-series programme for ages 14–16: stars and galaxies, orbital mechanics, mission design, data analysis and the search for life.",
    themeCategory: "SCIENCE",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    requiredPlan: "LEARNER",
    status: "DRAFT",
    finalProjectTitle: "Mission Design Proposal",
    finalProjectDescription:
      "Students design and justify a space-mission proposal grounded in real science.",
    learningObjectives: [
      "Study stars, galaxies and orbital mechanics",
      "Apply scientific reasoning to exploration",
      "Design a mission and analyse data",
      "Investigate the search for life",
    ],
    recommendedDurationWeeks: 12,
    referenceKeys: ["nasa-space-place", "esa-kids"],
    adminNotes: "Git-managed space-science series 1 & 2 (ages 14–16). DRAFT until the courses are published.",
    courses: [
      { slug: "14-16-future-innovators-s1" },
      { slug: "14-16-future-innovators-s2" },
    ],
  },
  {
    slug: "space-explorers-17-18-bundle",
    title: "Space Explorers — Ages 17–18",
    description:
      "Advanced space science for ages 17–18: cosmology, advanced mission science and a research-style capstone.",
    themeCategory: "SCIENCE",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    requiredPlan: "LEARNER",
    status: "DRAFT",
    finalProjectTitle: "Research Capstone",
    finalProjectDescription:
      "Students produce a research-style capstone on a space-science topic of their choosing.",
    learningObjectives: [
      "Engage with cosmology and advanced mission science",
      "Conduct independent research",
      "Communicate findings in a research format",
    ],
    recommendedDurationWeeks: 12,
    referenceKeys: ["nasa-space-place", "esa-kids"],
    adminNotes: "Git-managed space-science series (ages 17–18). DRAFT until the course is published.",
    courses: [{ slug: "17-18-senior-scientists-s1" }],
  },
];
