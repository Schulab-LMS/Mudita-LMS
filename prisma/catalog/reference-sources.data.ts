import type { CatalogReferenceSource } from "./types";

// ── SchuLab Trusted Source Library ──────────────────────────────────────────
// Real, reputable, digital-first sources only. Every URL/provider below is
// verbatim from the platform owner's vetted list — NEVER add fabricated
// sources, providers or URLs. This is the source-first guarantee: AI may only
// collect/map/adapt/cite content from these sources, never invent it.
//
// CLASSIFICATION (the `sourceType` field — the platform owner's 6 categories):
//   • "Core curriculum source"            — direct scope/sequence to ground lessons
//   • "Activity source"                   — projects/activities to ground lessons
//   • "Simulation source"                 — interactive sims (simulator-first)
//   • "Enrichment source"                 — curiosity/extension only, not grounding
//   • "Marketplace/discovery inspiration" — model/inspiration only, NOT a content source
//   • "Historical reference only"         — inactive; inspiration only
//
// HOW CATEGORY MAPS TO THE RAG RETRIEVAL GATE (the `status` field):
//   Core curriculum / Activity      → ACTIVE      ┐ retrievable to GROUND curriculum
//   Simulation                      → OPTIONAL    ┘ (rag.service CURRICULUM_STATUSES)
//   Enrichment / Marketplace        → ENRICHMENT  ┐ NOT used to ground curriculum;
//   Historical                      → HISTORICAL  ┘ enrichment/inspiration prompts only
//
// Hardware-centric sources (micro:bit, Raspberry Pi) are used simulator-first /
// project-first; never as a hardware requirement. Proprietary/commercial
// platforms (Tynker, Create & Learn, Outschool, Nat Geo) are inspiration or
// enrichment only — their content is never copied or used to ground lessons.
export const REFERENCE_SOURCES: CatalogReferenceSource[] = [
  // ── Coding & AI ──────────────────────────────────────────────────────────
  {
    key: "scratchjr",
    name: "ScratchJr",
    url: "https://www.scratchjr.org/",
    provider: "ScratchJr (DevTech Research Group, MIT Media Lab & others)",
    sourceType: "Activity source",
    relatedTopics: ["visual coding", "interactive stories", "sequencing", "characters", "animation", "simple games"],
    recommendedAgeRange: "5-7",
    usageInSchulab: "Block-based first-coding for ages 5–7: interactive stories, animation, sequencing and simple games.",
    status: "ACTIVE",
  },
  {
    key: "scratch",
    name: "Scratch",
    url: "https://scratch.mit.edu/",
    provider: "Scratch Foundation / MIT Media Lab",
    sourceType: "Activity source",
    relatedTopics: ["block coding", "animation", "games", "interactive stories", "creative coding"],
    recommendedAgeRange: "8-13",
    usageInSchulab: "Core block-based coding for ages 8+: animation, games, interactive stories and creative coding projects.",
    status: "ACTIVE",
  },
  {
    key: "code-org",
    name: "Code.org",
    url: "https://code.org/",
    provider: "Code.org",
    sourceType: "Core curriculum source",
    relatedTopics: ["computer science", "AI literacy", "coding fundamentals", "digital citizenship", "web", "programming concepts"],
    recommendedAgeRange: "3-18",
    usageInSchulab: "K–12 CS scope and sequence: coding fundamentals, AI literacy, digital citizenship and web/programming concepts. (CC BY-NC-SA — adapt + attribute.)",
    status: "ACTIVE",
  },
  {
    key: "experience-ai",
    name: "Experience AI",
    url: "https://experience-ai.org/",
    provider: "Experience AI (Google DeepMind & Raspberry Pi Foundation)",
    sourceType: "Core curriculum source",
    relatedTopics: ["AI literacy", "machine learning", "large language models", "prompting", "responsible AI"],
    recommendedAgeRange: "11-14",
    usageInSchulab: "AI literacy for ages 11–14: how AI and large language models work, using AI responsibly, and writing clear, effective prompts. (Free educational resources — adapt + attribute.)",
    status: "ACTIVE",
  },
  {
    key: "tynker",
    name: "Tynker",
    url: "https://www.tynker.com/",
    provider: "Tynker",
    sourceType: "Marketplace/discovery inspiration",
    relatedTopics: ["beginner coding", "creative coding", "game-based learning", "AI/ML introduction", "block coding progression"],
    recommendedAgeRange: "5-14",
    usageInSchulab: "Commercial platform — inspiration only for topic coverage and progression ideas. Proprietary content is NEVER copied or used to ground lessons.",
    status: "ENRICHMENT",
  },
  {
    key: "create-learn",
    name: "Create & Learn",
    url: "https://www.create-learn.us/",
    provider: "Create & Learn",
    sourceType: "Marketplace/discovery inspiration",
    relatedTopics: ["online coding", "AI for kids", "Python", "virtual robotics", "project-based learning"],
    recommendedAgeRange: "11-18",
    usageInSchulab: "Commercial online-class platform — inspiration only for course structure (AI, Python, virtual robotics). Not a content source.",
    status: "ENRICHMENT",
  },
  {
    key: "makecode",
    name: "Microsoft MakeCode",
    url: "https://www.microsoft.com/en-us/makecode",
    provider: "Microsoft",
    sourceType: "Activity source",
    relatedTopics: ["block coding", "JavaScript progression", "Python progression", "simulator-first coding"],
    recommendedAgeRange: "8-16",
    usageInSchulab: "Simulator-first block→JavaScript→Python coding activities. No hardware required.",
    status: "ACTIVE",
  },
  {
    key: "makecode-arcade",
    name: "MakeCode Arcade",
    url: "https://arcade.makecode.com/",
    provider: "Microsoft",
    sourceType: "Activity source",
    relatedTopics: ["game design", "retro games", "block coding", "JavaScript progression", "sprites and tilemaps"],
    recommendedAgeRange: "8-16",
    usageInSchulab: "Browser-based retro game building (sprites, tilemaps, block→JavaScript). Fully digital, no hardware.",
    status: "ACTIVE",
  },
  {
    key: "app-inventor",
    name: "MIT App Inventor",
    url: "https://appinventor.mit.edu/",
    provider: "MIT",
    sourceType: "Activity source",
    relatedTopics: ["app development", "mobile app prototypes", "AI app projects"],
    recommendedAgeRange: "12-18",
    usageInSchulab: "Mobile app prototyping and AI-related app projects for older students.",
    status: "ACTIVE",
  },
  {
    key: "khan-computing",
    name: "Khan Academy Computing",
    url: "https://www.khanacademy.org/computing",
    provider: "Khan Academy",
    sourceType: "Core curriculum source",
    relatedTopics: ["JavaScript", "HTML/CSS", "web development", "programming foundations", "computing concepts"],
    recommendedAgeRange: "13-18",
    usageInSchulab: "JavaScript, HTML/CSS, web development and programming foundations for teens. (CC BY-NC-SA — adapt + attribute.)",
    status: "ACTIVE",
  },
  {
    key: "raspberry-pi",
    name: "Raspberry Pi Foundation Projects",
    url: "https://projects.raspberrypi.org/",
    provider: "Raspberry Pi Foundation",
    sourceType: "Activity source",
    relatedTopics: ["Scratch projects", "Python projects", "HTML/CSS projects", "digital making", "project-based coding"],
    recommendedAgeRange: "8-18",
    usageInSchulab: "Project-based Scratch, Python and HTML/CSS making. Used digital-first; no hardware requirement. (CC BY-SA — adapt + attribute.)",
    status: "ACTIVE",
  },
  {
    key: "code-club",
    name: "Code Club Projects",
    url: "https://codeclub.org/",
    provider: "Raspberry Pi Foundation",
    sourceType: "Activity source",
    relatedTopics: ["creative coding", "Scratch", "Python", "HTML/CSS", "youth coding"],
    recommendedAgeRange: "8-16",
    usageInSchulab: "Creative youth coding projects across Scratch, Python and HTML/CSS. (CC BY-SA — adapt + attribute.)",
    status: "ACTIVE",
  },

  // ── Science & STEM ───────────────────────────────────────────────────────
  {
    key: "nasa-space-place",
    name: "NASA Space Place",
    url: "https://spaceplace.nasa.gov/",
    provider: "NASA",
    sourceType: "Core curriculum source",
    relatedTopics: ["space science", "Earth science", "solar system", "astronomy", "space games"],
    recommendedAgeRange: "7-13",
    usageInSchulab: "Primary space-science source: solar system, astronomy, Earth-from-space and NASA digital STEM activities. (Public domain.)",
    status: "ACTIVE",
    notes: "Existing platform space courses are mapped to this source and marked IMPORTED_EXISTING.",
  },
  {
    key: "nasa-kids-club",
    name: "NASA Kids' Club",
    url: "https://www.nasa.gov/learning-resources/nasa-kids-club/",
    provider: "NASA",
    sourceType: "Activity source",
    relatedTopics: ["space games", "early space science", "rockets", "astronauts", "interactive activities"],
    recommendedAgeRange: "5-10",
    usageInSchulab: "Playful, interactive early-years space activities and games. (Public domain.)",
    status: "ACTIVE",
  },
  {
    key: "esa-kids",
    name: "ESA Kids / ESA Space for Kids",
    url: "https://www.esa.int/kids/en/home",
    provider: "European Space Agency (ESA)",
    sourceType: "Core curriculum source",
    relatedTopics: ["space science", "European space missions", "satellites", "planets", "Earth observation", "astronomy"],
    recommendedAgeRange: "7-13",
    usageInSchulab: "European space missions, satellites, Earth observation and astronomy for children. (Check per-page ESA terms.)",
    status: "ACTIVE",
  },
  {
    key: "phet",
    name: "PhET Interactive Simulations",
    url: "https://phet.colorado.edu/",
    provider: "University of Colorado Boulder",
    sourceType: "Simulation source",
    relatedTopics: ["physics", "chemistry", "math", "Earth science", "digital experiments"],
    recommendedAgeRange: "9-18",
    usageInSchulab: "Interactive science and math simulations for digital experiments (forces, energy, waves, chemistry). Embed/link the sim; (CC BY — attribute).",
    status: "OPTIONAL",
  },
  {
    key: "ck12",
    name: "CK-12 Foundation",
    url: "https://www.ck12.org/",
    provider: "CK-12 Foundation",
    sourceType: "Core curriculum source",
    relatedTopics: ["science content", "math content", "FlexBooks", "adaptive practice", "STEM"],
    recommendedAgeRange: "9-18",
    usageInSchulab: "Digital science/math FlexBooks and adaptive practice across STEM. (CC BY-NC — adapt + attribute.)",
    status: "ACTIVE",
  },
  {
    key: "smithsonian-ssec",
    name: "Smithsonian Science Education Center",
    url: "https://ssec.si.edu/",
    provider: "Smithsonian Institution",
    sourceType: "Activity source",
    relatedTopics: ["inquiry-based science", "STEM activities", "K–12 science", "science project design"],
    recommendedAgeRange: "9-14",
    usageInSchulab: "Inquiry-based science activities and project-design models. (Respect per-resource Smithsonian terms; transform + attribute.)",
    status: "ACTIVE",
  },
  {
    key: "natgeo-kids",
    name: "National Geographic Kids",
    url: "https://kids.nationalgeographic.com/",
    provider: "National Geographic",
    sourceType: "Enrichment source",
    relatedTopics: ["Earth science", "animals", "geography", "environment", "space curiosity"],
    recommendedAgeRange: "5-13",
    usageInSchulab: "Enrichment only: Earth science, environment and space curiosity. Proprietary — never copied or used to ground lessons.",
    status: "ENRICHMENT",
  },

  // ── Additional vetted sources (beyond the core list) ─────────────────────
  {
    key: "microbit",
    name: "micro:bit / MakeCode micro:bit",
    url: "https://microbit.org/",
    provider: "Micro:bit Educational Foundation",
    sourceType: "Simulation source",
    relatedTopics: ["simulator-first coding", "block coding", "JavaScript/Python transition", "computational thinking"],
    recommendedAgeRange: "10-16",
    usageInSchulab: "Simulator-first block→JavaScript/Python coding via https://makecode.microbit.org/ — used entirely in-browser, no hardware required.",
    status: "OPTIONAL",
    notes: "Hardware optional only for offline workshops/camps; the main SchuLab experience uses the online simulator.",
  },
  {
    key: "outschool",
    name: "Outschool",
    url: "https://outschool.com/",
    provider: "Outschool",
    sourceType: "Marketplace/discovery inspiration",
    relatedTopics: ["course discovery", "age filters", "flexible browsing"],
    recommendedAgeRange: "3-18",
    usageInSchulab: "Inspiration only for marketplace/course discovery, age filters and flexible browsing. NOT a curriculum or content source.",
    status: "ENRICHMENT",
  },
  {
    key: "google-cs-first",
    name: "Google CS First / Experience CS",
    url: "https://csfirst.withgoogle.com/",
    provider: "Google",
    sourceType: "Historical reference only",
    relatedTopics: ["computer science", "Scratch-based activities"],
    recommendedAgeRange: "8-14",
    usageInSchulab: "Historical inspiration only — not an active source. (CS First is being phased out / replaced; do not treat as live curriculum.)",
    status: "HISTORICAL",
  },

  // ── Entrepreneurship & product thinking ───────────────────────────────────
  {
    key: "junior-achievement",
    name: "Junior Achievement",
    url: "https://www.juniorachievement.org/",
    provider: "Junior Achievement (JA Worldwide)",
    sourceType: "Core curriculum source",
    relatedTopics: ["entrepreneurship", "product thinking", "design thinking", "business model", "value proposition", "work readiness"],
    recommendedAgeRange: "14-18",
    usageInSchulab: "Youth entrepreneurship and work-readiness for ages 14–18: idea validation, customer/value proposition, business-model basics and product thinking. (Concepts adapted + attributed.)",
    status: "ACTIVE",
  },
];
