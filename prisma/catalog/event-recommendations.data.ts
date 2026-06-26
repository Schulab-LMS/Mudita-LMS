// Course/bundle → event preparation mappings (the "review" deliverable).
//
// These are the seeded recommendations the eligibility engine reads to tell a
// student "based on your completed X you are ready for Y". They reference real
// catalog slugs only (bundles.data.ts / courses-*.data.ts) and real event slugs
// (events.data.ts). Pathway-level preparation is expressed via each event's
// `preparationPathSlug`, so this file only covers bundles + key standalone
// courses. seed-catalog.ts resolves slugs → ids and skips any that don't exist.
//
// recommendationType:
//   PREREQUISITE          — should be done before attempting the event
//   RECOMMENDED           — directly prepares the learner for the event
//   ADVANCED_PREPARATION  — a stepping stone toward a harder/older event

export type RecommendationTypeKey = "PREREQUISITE" | "RECOMMENDED" | "ADVANCED_PREPARATION";

export interface EventBundleRec {
  eventSlug: string;
  bundleSlug: string;
  recommendationType: RecommendationTypeKey;
  reason: string;
  minimumCompletionPercentage?: number; // default 100
}

export interface EventCourseRec {
  eventSlug: string;
  courseSlug: string;
  recommendationType: RecommendationTypeKey;
  reason: string;
  minimumCompletionPercentage?: number; // default 100
}

export const EVENT_BUNDLE_RECOMMENDATIONS: EventBundleRec[] = [
  // Early coding / digital creativity → showcases & computational thinking
  {
    eventSlug: "coolest-projects",
    bundleSlug: "coding-starter-bundle",
    recommendationType: "RECOMMENDED",
    reason:
      "You built and presented your own block-coded stories and games — exactly the kind of project you can showcase at Coolest Projects.",
  },
  {
    eventSlug: "bebras-challenge",
    bundleSlug: "coding-starter-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your sequencing and loops practice is great preparation for Bebras computational-thinking puzzles.",
  },
  {
    eventSlug: "coolest-projects",
    bundleSlug: "digital-creativity-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your digital art, animation and sound projects are ready to share at the Coolest Projects showcase.",
  },
  {
    eventSlug: "coolest-projects",
    bundleSlug: "creative-coding-game-design-bundle",
    recommendationType: "RECOMMENDED",
    reason: "You shipped a playable multi-level game — a perfect Coolest Projects entry.",
  },
  {
    eventSlug: "bebras-challenge",
    bundleSlug: "creative-coding-game-design-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your work with events, conditions and scoring builds the logic Bebras rewards.",
  },
  {
    eventSlug: "first-lego-league",
    bundleSlug: "creative-coding-game-design-bundle",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "The coding logic you practised here is a strong foundation for FIRST LEGO League's programming missions.",
  },
  {
    eventSlug: "coolest-projects",
    bundleSlug: "creative-coding-projects-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your portfolio of games, animations and websites is exactly what Coolest Projects celebrates.",
  },
  {
    eventSlug: "bebras-challenge",
    bundleSlug: "creative-coding-projects-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Project-based coding sharpens the problem solving Bebras tests.",
  },

  // Robotics
  {
    eventSlug: "first-lego-league",
    bundleSlug: "virtual-robotics-simulation-bundle",
    recommendationType: "RECOMMENDED",
    reason:
      "You learned robot movement, sensors and decision logic in simulation — the same thinking FIRST LEGO League's Challenge missions need.",
  },
  {
    eventSlug: "world-robot-olympiad",
    bundleSlug: "virtual-robotics-simulation-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your simulated robot-programming and mission-solving skills map directly to WRO's RoboMission category.",
  },
  {
    eventSlug: "robocupjunior",
    bundleSlug: "virtual-robotics-simulation-bundle",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "Automation and decision logic here is a stepping stone toward RoboCupJunior's autonomous-robot leagues.",
  },

  // Space science / data
  {
    eventSlug: "astro-pi-mission-zero",
    bundleSlug: "space-science-nasa-esa-explorer-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your NASA/ESA space-science exploration is the perfect backdrop for writing your first ISS program in Astro Pi Mission Zero.",
  },
  {
    eventSlug: "nasa-space-apps-challenge",
    bundleSlug: "space-science-nasa-esa-explorer-bundle",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "Working with real NASA/ESA activities prepares you to tackle NASA Space Apps challenges with open data.",
  },
  {
    eventSlug: "astro-pi-mission-space-lab",
    bundleSlug: "interactive-science-simulations-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Designing simulation-based experiments and reports is exactly the skill Astro Pi Mission Space Lab asks for.",
  },
  {
    eventSlug: "nasa-space-apps-challenge",
    bundleSlug: "interactive-science-simulations-bundle",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "Your data-driven science investigations prepare you for NASA Space Apps' open-data problems.",
  },
  {
    eventSlug: "nasa-space-apps-challenge",
    bundleSlug: "digital-stem-explorer-bundle",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "NASA-inspired STEM challenges here lead naturally into the real NASA Space Apps hackathon.",
  },
  {
    eventSlug: "bebras-challenge",
    bundleSlug: "digital-stem-explorer-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your logic and problem-solving practice is strong preparation for the Bebras Challenge.",
  },

  // AI / web / data → hackathons & showcases
  {
    eventSlug: "nasa-space-apps-challenge",
    bundleSlug: "ai-native-kids-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your AI literacy and data understanding equip you to build solutions at the NASA Space Apps hackathon.",
  },
  {
    eventSlug: "coolest-projects",
    bundleSlug: "ai-native-kids-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your AI-assisted creative project is a standout Coolest Projects entry.",
  },
  {
    eventSlug: "coolest-projects",
    bundleSlug: "web-app-builder-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your working website or app prototype is ready to present at Coolest Projects.",
  },
  {
    eventSlug: "nasa-space-apps-challenge",
    bundleSlug: "web-app-builder-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Web and app skills let you build and ship a real tool during the NASA Space Apps hackathon.",
  },

  // Capstone bundle → the most advanced events
  {
    eventSlug: "nasa-space-apps-challenge",
    bundleSlug: "future-tech-leader-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Your Python, AI and data project work makes you hackathon-ready for NASA Space Apps.",
  },
  {
    eventSlug: "astro-pi-mission-space-lab",
    bundleSlug: "future-tech-leader-bundle",
    recommendationType: "RECOMMENDED",
    reason: "Real-world Python and data skills are exactly what Astro Pi Mission Space Lab experiments require.",
  },
  {
    eventSlug: "esa-cansat",
    bundleSlug: "future-tech-leader-bundle",
    recommendationType: "ADVANCED_PREPARATION",
    reason:
      "Your programming and product-build experience is a foundation for ESA CanSat — add electronics and sensors to be fully ready.",
  },
  {
    eventSlug: "robocupjunior",
    bundleSlug: "future-tech-leader-bundle",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "Your AI and project skills can extend into RoboCupJunior's autonomous-robot leagues.",
  },
];

export const EVENT_COURSE_RECOMMENDATIONS: EventCourseRec[] = [
  {
    eventSlug: "coolest-projects",
    courseSlug: "scratch-game-studio",
    recommendationType: "RECOMMENDED",
    reason: "You designed a complete Scratch game — enter it at Coolest Projects.",
  },
  {
    eventSlug: "bebras-challenge",
    courseSlug: "scratch-game-studio",
    recommendationType: "RECOMMENDED",
    reason: "Game logic in Scratch builds the computational thinking Bebras tests.",
  },
  {
    eventSlug: "coolest-projects",
    courseSlug: "creative-robot-stories",
    recommendationType: "RECOMMENDED",
    reason: "Your creative coded story is a lovely first Coolest Projects showcase entry.",
  },
  {
    eventSlug: "first-lego-league",
    courseSlug: "junior-robotics-automation",
    recommendationType: "RECOMMENDED",
    reason: "Your robotics and automation logic prepares you for FIRST LEGO League's robot missions.",
  },
  {
    eventSlug: "world-robot-olympiad",
    courseSlug: "junior-robotics-automation",
    recommendationType: "RECOMMENDED",
    reason: "Programming simulated robots maps directly onto WRO's RoboMission challenges.",
  },
  {
    eventSlug: "first-lego-league",
    courseSlug: "block-robotics-sim",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "Block-based robot programming is a great warm-up for FIRST LEGO League.",
  },
  {
    eventSlug: "world-robot-olympiad",
    courseSlug: "block-robotics-sim",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "Your robot-simulator practice is a stepping stone toward WRO's beginner categories.",
  },
  {
    eventSlug: "astro-pi-mission-zero",
    courseSlug: "space-science-missions",
    recommendationType: "RECOMMENDED",
    reason: "Your space-science work pairs perfectly with writing your first ISS program in Astro Pi Mission Zero.",
  },
  {
    eventSlug: "nasa-space-apps-challenge",
    courseSlug: "space-science-missions",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "Space-mission concepts here lead toward NASA Space Apps' real open-data challenges.",
  },
  {
    eventSlug: "astro-pi-mission-zero",
    courseSlug: "python-logic-lab",
    recommendationType: "RECOMMENDED",
    reason: "Your Python foundations are exactly what Astro Pi Mission Zero needs.",
  },
  {
    eventSlug: "astro-pi-mission-space-lab",
    courseSlug: "python-logic-lab",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "Strengthen this Python base with data work and you'll be ready for Astro Pi Mission Space Lab.",
  },
  {
    eventSlug: "astro-pi-mission-zero",
    courseSlug: "python-starter-for-teens",
    recommendationType: "RECOMMENDED",
    reason: "Your introductory Python is enough to write and submit an Astro Pi Mission Zero program.",
  },
  {
    eventSlug: "astro-pi-mission-space-lab",
    courseSlug: "data-basics-with-python",
    recommendationType: "RECOMMENDED",
    reason: "Working with data in Python is the core skill for Astro Pi Mission Space Lab experiments.",
  },
  {
    eventSlug: "nasa-space-apps-challenge",
    courseSlug: "data-basics-with-python",
    recommendationType: "RECOMMENDED",
    reason: "Python data skills let you turn NASA open data into a Space Apps solution.",
  },
  {
    eventSlug: "nasa-space-apps-challenge",
    courseSlug: "data-detectives",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "Your data-investigation skills are great preparation for NASA Space Apps' open-data problems.",
  },
  {
    eventSlug: "astro-pi-mission-space-lab",
    courseSlug: "data-detectives",
    recommendationType: "ADVANCED_PREPARATION",
    reason: "Asking questions of data is exactly the mindset Astro Pi Mission Space Lab rewards.",
  },
  {
    eventSlug: "nasa-space-apps-challenge",
    courseSlug: "ai-literacy-ethics",
    recommendationType: "RECOMMENDED",
    reason: "Your AI literacy helps you apply AI responsibly to NASA Space Apps challenges.",
  },
  {
    eventSlug: "nasa-space-apps-challenge",
    courseSlug: "ai-foundations-future-leaders",
    recommendationType: "RECOMMENDED",
    reason: "Your AI foundations prepare you to innovate with open data at NASA Space Apps.",
  },

  // Event-readiness courses (seeded DRAFT in courses-teens.data.ts) → their events.
  {
    eventSlug: "esa-cansat",
    courseSlug: "electronics-sensors-arduino-raspberry-pi",
    recommendationType: "RECOMMENDED",
    reason: "Your hands-on electronics, sensor and telemetry work is the core build skill ESA CanSat requires.",
  },
  {
    eventSlug: "world-robot-olympiad",
    courseSlug: "electronics-sensors-arduino-raspberry-pi",
    recommendationType: "RECOMMENDED",
    reason: "Circuits, sensors and mission-design thinking prepare you for WRO's Future Engineers category.",
  },
  {
    eventSlug: "astro-pi-mission-zero",
    courseSlug: "python-on-hardware-sense-hat",
    recommendationType: "RECOMMENDED",
    reason: "Writing Python for the Sense HAT is exactly the skill behind an Astro Pi Mission Zero submission.",
  },
  {
    eventSlug: "astro-pi-mission-space-lab",
    courseSlug: "python-on-hardware-sense-hat",
    recommendationType: "RECOMMENDED",
    reason: "Reading sensors and designing a data experiment on real hardware is what Mission Space Lab is all about.",
  },
  {
    eventSlug: "nasa-space-apps-challenge",
    courseSlug: "team-hackathon-open-data-projects",
    recommendationType: "RECOMMENDED",
    reason: "Team problem-framing, open data and data storytelling are the exact skills NASA Space Apps rewards.",
  },
];
