// Seed data for the "Events & Competitions" catalog — reputable EXTERNAL STEM
// programs students can prepare for on SchuLab. The platform DB is the single
// source of truth for this metadata; the curriculum Git repo only owns the
// preparation *content* (linked here via `preparationPathSlug` → LearningPathway).
//
// Pure data module (string-literal unions, no runtime imports). seed-catalog.ts
// casts these strings onto the Prisma enums at write time (1:1 compatible) and
// resolves preparationPathSlug → an existing LearningPathway id.
//
// Every URL/provider below is a real, verified program. Do NOT invent events.

import type { AgeBand, Level } from "./types";

export type RegionKey = "GLOBAL" | "EUROPE" | "GERMANY" | "US" | "UK";
export type ListingStatusKey = "ACTIVE" | "OPTIONAL" | "ARCHIVED";

export interface CatalogEvent {
  slug: string;
  name: string;
  description: string;
  officialProvider: string;
  officialUrl: string;
  /** Human-readable event type, e.g. "Robotics / STEM Challenge". */
  eventType: string;
  region: RegionKey;
  /** Primary track, kept to the course `category` vocabulary for filtering. */
  category: string;
  tracks: string[];
  /** Representative age band; precise span is ageMin/ageMax. */
  ageGroup: AgeBand;
  ageMin: number;
  ageMax: number;
  levelMin: Level;
  levelMax: Level;
  /** Months (1–12) the event typically runs / registers. */
  seasonMonths: number[];
  listingStatus: ListingStatusKey;
  /** Machine-readable gate consumed by the eligibility engine + admin UI. */
  eligibilityRules: {
    minAge: number;
    maxAge: number;
    tracks: string[];
    notes: string;
  };
  /** Slug of an existing LearningPathway used as the "preparation path". */
  preparationPathSlug?: string;
}

export const EVENTS: CatalogEvent[] = [
  {
    slug: "first-lego-league",
    name: "FIRST LEGO League",
    description:
      "A global, age-appropriate robotics and STEM program — from playful Discover/Explore divisions to real-world problem solving in the Challenge division. Teams design, build and program while practising teamwork and innovation.",
    officialProvider: "FIRST",
    officialUrl: "https://www.firstlegoleague.org/",
    eventType: "Robotics / STEM Challenge",
    region: "GLOBAL",
    category: "ROBOTICS",
    tracks: ["Robotics", "STEM", "Engineering", "Coding", "Innovation", "Teamwork"],
    ageGroup: "AGES_8_10",
    ageMin: 5,
    ageMax: 16,
    levelMin: "BEGINNER",
    levelMax: "INTERMEDIATE",
    seasonMonths: [8, 9, 10, 11, 12],
    listingStatus: "ACTIVE",
    eligibilityRules: {
      minAge: 5,
      maxAge: 16,
      tracks: ["Robotics", "Coding"],
      notes:
        "Divisions are age-banded: Discover/Explore (early years) through Challenge (older students). Team-based.",
    },
    preparationPathSlug: "stem-builder",
  },
  {
    slug: "world-robot-olympiad",
    name: "World Robot Olympiad (WRO)",
    description:
      "A major international robotics competition with RoboMission, RoboSports, Future Innovators and Future Engineers categories — students design and program robots to complete missions and engineering challenges.",
    officialProvider: "WRO Association",
    officialUrl: "https://wro-association.org/",
    eventType: "Robotics Competition",
    region: "GLOBAL",
    category: "ROBOTICS",
    tracks: ["Robotics", "Engineering", "Programming", "Innovation"],
    ageGroup: "AGES_11_13",
    ageMin: 8,
    ageMax: 19,
    levelMin: "BEGINNER",
    levelMax: "ADVANCED",
    seasonMonths: [4, 5, 6, 7, 8, 9],
    listingStatus: "ACTIVE",
    eligibilityRules: {
      minAge: 8,
      maxAge: 19,
      tracks: ["Robotics", "Engineering"],
      notes:
        "RoboMission Elementary/Junior for younger teams; Future Innovators / Future Engineers for advanced. Some categories run to age 22.",
    },
    preparationPathSlug: "stem-builder",
  },
  {
    slug: "robocupjunior",
    name: "RoboCupJunior",
    description:
      "A project-driven robotics and AI initiative for students up to 19, with Rescue, Soccer and OnStage (performance) leagues at local, regional and international events.",
    officialProvider: "RoboCup Federation",
    officialUrl: "https://junior.robocup.org/",
    eventType: "Robotics / AI Competition",
    region: "GLOBAL",
    category: "ROBOTICS",
    tracks: ["Robotics", "AI", "Rescue Robotics", "Soccer Robotics", "Performance Robotics"],
    ageGroup: "AGES_14_16",
    ageMin: 11,
    ageMax: 19,
    levelMin: "INTERMEDIATE",
    levelMax: "ADVANCED",
    seasonMonths: [3, 4, 5, 6, 7],
    listingStatus: "OPTIONAL",
    eligibilityRules: {
      minAge: 11,
      maxAge: 19,
      tracks: ["Robotics", "AI"],
      notes: "Best suited to learners with autonomous-robot and sensor experience.",
    },
    preparationPathSlug: "tech-innovator",
  },
  {
    slug: "astro-pi-mission-zero",
    name: "European Astro Pi Challenge — Mission Zero",
    description:
      "A beginner-friendly space coding challenge: young learners write a short Python program that runs on Astro Pi computers aboard the International Space Station. No special hardware required.",
    officialProvider: "ESA Education & Raspberry Pi Foundation",
    officialUrl: "https://astro-pi.org/mission-zero",
    eventType: "Space Coding Challenge",
    region: "EUROPE",
    category: "CODING",
    tracks: ["Python", "Space", "Coding", "Creativity", "Sensors"],
    ageGroup: "AGES_11_13",
    ageMin: 7,
    ageMax: 19,
    levelMin: "BEGINNER",
    levelMax: "INTERMEDIATE",
    seasonMonths: [9, 10, 11, 12, 1, 2, 3],
    listingStatus: "ACTIVE",
    eligibilityRules: {
      minAge: 7,
      maxAge: 19,
      tracks: ["Coding", "Space"],
      notes: "Open to beginners (19 and under). A first taste of real Python on the ISS.",
    },
    preparationPathSlug: "creative-coder",
  },
  {
    slug: "astro-pi-mission-space-lab",
    name: "European Astro Pi Challenge — Mission Space Lab",
    description:
      "An advanced space-science challenge for learners who can design experiments and work with sensor and image data from the International Space Station using Python.",
    officialProvider: "ESA Education & Raspberry Pi Foundation",
    officialUrl: "https://astro-pi.org/mission-space-lab",
    eventType: "Space Coding / Data Challenge",
    region: "EUROPE",
    category: "DATA",
    tracks: ["Python", "Space Science", "Data", "Sensors", "Experimentation"],
    ageGroup: "AGES_14_16",
    ageMin: 11,
    ageMax: 19,
    levelMin: "INTERMEDIATE",
    levelMax: "ADVANCED",
    seasonMonths: [9, 10, 11, 12, 1, 2, 3, 4],
    listingStatus: "OPTIONAL",
    eligibilityRules: {
      minAge: 11,
      maxAge: 19,
      tracks: ["Coding", "Data", "Space"],
      notes: "For learners comfortable with Python who can design and run a data experiment.",
    },
    preparationPathSlug: "tech-innovator",
  },
  {
    slug: "esa-cansat",
    name: "ESA CanSat",
    description:
      "A space-engineering competition where older students build a satellite-like system inside the volume of a soft-drink can — integrating electronics, sensors, programming and mission design.",
    officialProvider: "ESA Education",
    officialUrl: "https://www.esa.int/Education/CanSat",
    eventType: "Space Engineering Competition",
    region: "EUROPE",
    category: "ENGINEERING",
    tracks: ["Space Engineering", "Electronics", "Sensors", "Programming", "Mission Design"],
    ageGroup: "AGES_14_16",
    ageMin: 14,
    ageMax: 19,
    levelMin: "ADVANCED",
    levelMax: "ADVANCED",
    seasonMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6],
    listingStatus: "OPTIONAL",
    eligibilityRules: {
      minAge: 14,
      maxAge: 19,
      tracks: ["Engineering", "Electronics", "Space"],
      notes: "Requires electronics, sensors and programming skills. Hardware build (physical kit).",
    },
    preparationPathSlug: "future-tech-leader",
  },
  {
    slug: "nasa-space-apps-challenge",
    name: "NASA Space Apps Challenge",
    description:
      "The world's largest global hackathon: teams solve real-world challenges using NASA open data across space, AI, coding, design and storytelling.",
    officialProvider: "NASA",
    officialUrl: "https://www.spaceappschallenge.org/",
    eventType: "Hackathon / Innovation Challenge",
    region: "GLOBAL",
    category: "DATA",
    tracks: ["Space", "Data", "AI", "Coding", "Design", "Storytelling", "Innovation"],
    ageGroup: "AGES_14_16",
    ageMin: 11,
    ageMax: 18,
    levelMin: "INTERMEDIATE",
    levelMax: "ADVANCED",
    seasonMonths: [10],
    listingStatus: "ACTIVE",
    eligibilityRules: {
      minAge: 11,
      maxAge: 18,
      tracks: ["Data", "AI", "Coding"],
      notes:
        "Open to all ages, but participants under 18 require a parent/guardian to register and supervise.",
    },
    preparationPathSlug: "tech-innovator",
  },
  {
    slug: "bebras-challenge",
    name: "Bebras Challenge",
    description:
      "An international computational-thinking challenge — short, engaging logic and algorithm puzzles solved without prior programming knowledge. Age-banded from primary to upper-secondary.",
    officialProvider: "Bebras International",
    officialUrl: "https://www.bebras.org/",
    eventType: "Computational Thinking Challenge",
    region: "GLOBAL",
    category: "CODING",
    tracks: ["Computational Thinking", "Logic", "Algorithms", "Problem Solving"],
    ageGroup: "AGES_8_10",
    ageMin: 6,
    ageMax: 19,
    levelMin: "BEGINNER",
    levelMax: "ADVANCED",
    seasonMonths: [11],
    listingStatus: "ACTIVE",
    eligibilityRules: {
      minAge: 6,
      maxAge: 19,
      tracks: ["Coding", "Logic"],
      notes: "No programming required — age-banded difficulty. Great entry challenge for any learner.",
    },
    preparationPathSlug: "creative-coder",
  },
  {
    slug: "coolest-projects",
    name: "Coolest Projects",
    description:
      "A global technology showcase where young creators present their Scratch projects, apps, games, websites and hardware and receive friendly feedback — any digital creation welcome.",
    officialProvider: "Raspberry Pi Foundation",
    officialUrl: "https://online.coolestprojects.org/",
    eventType: "Digital Making / Project Showcase",
    region: "GLOBAL",
    category: "CODING",
    tracks: ["Scratch", "Apps", "Games", "Websites", "Hardware", "Digital Creativity"],
    ageGroup: "AGES_8_10",
    ageMin: 7,
    ageMax: 18,
    levelMin: "BEGINNER",
    levelMax: "ADVANCED",
    seasonMonths: [1, 2, 3, 4, 5],
    listingStatus: "ACTIVE",
    eligibilityRules: {
      minAge: 7,
      maxAge: 18,
      tracks: ["Coding", "Digital Creativity"],
      notes: "A showcase, not a competition — any digital project a learner has made can be entered.",
    },
    preparationPathSlug: "junior-creator",
  },
];
