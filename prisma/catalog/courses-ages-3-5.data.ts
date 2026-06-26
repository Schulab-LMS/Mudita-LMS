import type { CatalogCourse } from "./types";

export const COURSES_AGES_3_5: CatalogCourse[] = [
  // 1 — NEW (free)
  {
    slug: "digital-discovery-shapes-patterns-logic",
    title: "Digital Discovery: Shapes, Patterns, and Logic",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "CODING",
    description:
      "A playful first taste of pre-coding where little ones spot shapes, finish patterns, and make tiny logic choices on screen.",
    parentSummary:
      "This is a gentle, screen-light introduction to logical thinking your child explores alongside you. Everything is fully digital and parent-guided, with short tappable activities and no hardware, kits, or downloads to manage. Sessions stay brief so curiosity leads the way.",
    studentSummary: "You get to match shapes, finish patterns, and tap your way through fun puzzles!",
    skills: ["Shape recognition", "Pattern matching", "Cause and effect", "Sorting", "Early logic"],
    tools: ["ScratchJr", "Drawing canvas"],
    finalProjectTitle: "My Pattern Parade",
    finalProjectDescription:
      "Your child arranges colorful shapes into a repeating pattern parade they can show off to the family.",
    referenceKeys: ["code-org", "scratchjr"],
    isFree: true,
    contentStatus: "SEED_NOW",
    status: "DRAFT",
    nextSlug: "pre-coding-sequencing-games",
    modules: [
      {
        title: "Spotting Shapes and Colors",
        lessons: [
          { title: "Hello Shapes! Circles, Squares, and Triangles", isFree: true },
          { title: "Color Hunt: Tap What Matches", isFree: true },
          { title: "Big or Small? Sorting Fun" },
        ],
      },
      {
        title: "Patterns and Tiny Choices",
        lessons: [
          { title: "Finish the Pattern" },
          { title: "What Comes Next?" },
          { title: "My First Logic Puzzle" },
        ],
      },
    ],
  },

  // 2 — NEW
  {
    slug: "my-first-digital-story",
    title: "My First Digital Story",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "ARTS",
    description:
      "Young storytellers tap to add characters, scenes, and sounds to make their very first wiggly digital tale.",
    parentSummary:
      "Your child builds a simple animated story by tapping friendly characters into colorful scenes. It is a screen-light, parent-guided activity that is entirely digital, so there is nothing to print, ship, or assemble. The focus is imagination and language, not real coding.",
    studentSummary: "You pick characters, drop them into a scene, and make your own story come alive!",
    skills: ["Storytelling", "Sequencing", "Imagination", "Early narrative", "Self-expression"],
    tools: ["ScratchJr", "Story builder"],
    finalProjectTitle: "My Storybook Animation",
    finalProjectDescription:
      "Your child creates a short tap-and-play animated story with a beginning, middle, and end to share.",
    referenceKeys: ["scratchjr", "code-org"],
    requiredPlan: "LEARNER",
    contentStatus: "SEED_NOW",
    status: "DRAFT",
    modules: [
      {
        title: "Meet the Characters",
        lessons: [
          { title: "Tap to Add a Friend", isFree: true },
          { title: "Choosing a Scene", isFree: true },
          { title: "Making Characters Move" },
        ],
      },
      {
        title: "Telling My Story",
        lessons: [
          { title: "Adding Sounds and Voices" },
          { title: "Beginning, Middle, and End" },
          { title: "Show Your Story!" },
        ],
      },
    ],
  },

  // 3 — NEW
  {
    slug: "creative-thinking-little-explorers",
    title: "Creative Thinking for Little Explorers",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "ARTS",
    description:
      "A wonder-filled mix of imagination games and gentle nature discovery that sparks big ideas in little minds.",
    parentSummary:
      "Through short imaginative challenges and digital nature peeks, your child practices curiosity, observation, and creative problem-solving. It is a screen-light, parent-guided experience that stays fully digital with no kits or materials needed. Each activity invites you to wonder and chat together.",
    studentSummary: "You imagine, explore, and find clever new ways to see the world around you!",
    skills: ["Creative thinking", "Curiosity", "Observation", "Imagination", "Problem-solving"],
    tools: ["Drawing canvas", "Story builder"],
    finalProjectTitle: "My Wonder Collection",
    finalProjectDescription:
      "Your child puts together a little digital collection of their favorite curious ideas and discoveries.",
    referenceKeys: ["code-org", "natgeo-kids"],
    requiredPlan: "LEARNER",
    contentStatus: "SEED_NOW",
    status: "DRAFT",
    modules: [
      {
        title: "Wonder All Around",
        lessons: [
          { title: "I Spy Something New", isFree: true },
          { title: "What Could It Be?", isFree: true },
          { title: "Animals and Their Homes" },
        ],
      },
      {
        title: "Big Imagination",
        lessons: [
          { title: "Invent a Silly Thing" },
          { title: "What If...? Imagination Game" },
          { title: "Share Your Wonder" },
        ],
      },
    ],
  },

  // 4 — NEW
  {
    slug: "pre-coding-sequencing-games",
    title: "Pre-Coding with Sequencing Games",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Tiny learners put steps in the right order to guide friendly characters, building the first ideas behind coding.",
    parentSummary:
      "Your child learns that order matters by arranging simple step-by-step sequences to move characters toward a goal. It is screen-light and parent-guided, completely digital, with no robots, kits, or real programming involved. These playful drag-and-tap games quietly build logical thinking.",
    studentSummary: "You put the steps in order and watch your character reach the goal!",
    skills: ["Sequencing", "Step-by-step thinking", "Directions", "Cause and effect", "Early logic"],
    tools: ["ScratchJr", "Story builder"],
    finalProjectTitle: "Guide the Character Home",
    finalProjectDescription:
      "Your child arranges a sequence of steps to help a friendly character find its way home.",
    referenceKeys: ["code-org", "scratchjr"],
    requiredPlan: "LEARNER",
    contentStatus: "SEED_NOW",
    status: "DRAFT",
    prereqSlug: "digital-discovery-shapes-patterns-logic",
    modules: [
      {
        title: "First Steps in Order",
        lessons: [
          { title: "One Step at a Time", isFree: true },
          { title: "Left, Right, Go!", isFree: true },
          { title: "Putting Steps in a Row" },
        ],
      },
      {
        title: "Solving with Sequences",
        lessons: [
          { title: "Fix the Mixed-Up Steps" },
          { title: "Find the Path" },
          { title: "My Sequencing Challenge" },
        ],
      },
    ],
  },

  // 5 — NEW
  {
    slug: "digital-art-and-imagination",
    title: "Digital Art and Imagination",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "ARTS",
    description:
      "Little artists splash colors, stamps, and shapes on a digital canvas to bring their wildest ideas to life.",
    parentSummary:
      "Your child explores color, shape, and creativity on a simple digital drawing canvas. It is a screen-light, parent-guided activity that is fully digital, so there is no paint, mess, or materials to buy. The goal is joyful self-expression and fine-motor confidence.",
    studentSummary: "You paint, stamp, and create amazing pictures with your fingertips!",
    skills: ["Creativity", "Color exploration", "Fine motor skills", "Self-expression", "Composition"],
    tools: ["Drawing canvas"],
    finalProjectTitle: "My Digital Art Gallery",
    finalProjectDescription:
      "Your child creates a small gallery of digital artworks to display and celebrate with family.",
    referenceKeys: ["code-org"],
    requiredPlan: "LEARNER",
    contentStatus: "SEED_NOW",
    status: "DRAFT",
    modules: [
      {
        title: "Colors and Brushes",
        lessons: [
          { title: "My First Digital Brush", isFree: true },
          { title: "A Rainbow of Colors", isFree: true },
          { title: "Stamps and Stickers" },
        ],
      },
      {
        title: "Making Pictures",
        lessons: [
          { title: "Drawing My Family" },
          { title: "An Imaginary Creature" },
          { title: "My Art Show" },
        ],
      },
    ],
  },

  // 6 — NEW
  {
    slug: "simple-stem-challenges-young-learners",
    title: "Simple STEM Challenges for Young Learners",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "Bite-sized digital STEM discoveries about space, nature, and how things work, perfect for the youngest explorers.",
    parentSummary:
      "Your child meets gentle STEM ideas through short digital challenges about the sky, animals, and everyday science. It is screen-light and parent-guided, entirely digital, with no kits, tools, or experiments to set up. Each challenge invites a little observe-and-wonder moment together.",
    studentSummary: "You explore the stars, animals, and cool science with quick, fun challenges!",
    skills: ["Science curiosity", "Observation", "Sorting", "Predicting", "Early STEM concepts"],
    tools: ["Drawing canvas", "Story builder"],
    finalProjectTitle: "My STEM Discovery Board",
    finalProjectDescription:
      "Your child gathers favorite discoveries into a simple digital board to share what they learned.",
    referenceKeys: ["code-org", "nasa-space-place", "natgeo-kids"],
    requiredPlan: "LEARNER",
    contentStatus: "SEED_NOW",
    status: "DRAFT",
    modules: [
      {
        title: "Wonders of the World",
        lessons: [
          { title: "Up in the Sky", isFree: true },
          { title: "Animals Big and Small", isFree: true },
          { title: "Float or Sink?" },
        ],
      },
      {
        title: "Little Scientist Challenges",
        lessons: [
          { title: "Sort It Out" },
          { title: "Guess What Happens Next" },
          { title: "My Discovery Board" },
        ],
      },
    ],
  },

  // 7 — EXISTING
  {
    slug: "wonder-lab-science-tiny-explorers",
    title: "Wonder Lab: Science for Tiny Explorers",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "A wonder-packed science lab where tiny explorers observe, predict, and discover the world through playful digital activities.",
    parentSummary:
      "Your child investigates simple science ideas with short, screen-light digital activities you guide together. Everything is fully digital, so there are no experiments to prepare or materials to gather. The emphasis is on noticing, wondering, and asking questions.",
    studentSummary: "You become a tiny scientist and discover how the world works!",
    skills: ["Observation", "Predicting", "Science curiosity", "Sorting", "Early discovery"],
    tools: ["Drawing canvas", "Story builder"],
    finalProjectTitle: "My Wonder Lab Journal",
    finalProjectDescription:
      "Your child records favorite discoveries in a simple digital journal to share with family.",
    referenceKeys: ["natgeo-kids", "smithsonian-ssec", "phet"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },

  // 8 — EXISTING
  {
    slug: "little-coders-unplugged",
    title: "Little Coders Unplugged",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Playful pre-coding logic where little ones learn to think in steps, patterns, and simple commands on screen.",
    parentSummary:
      "Your child builds the thinking behind coding through gentle, screen-light digital games you explore together. It is fully digital with no robots, kits, or real programming required. The focus is sequencing, patterns, and problem-solving at a toddler-friendly pace.",
    studentSummary: "You learn to think like a coder with fun step-by-step games!",
    skills: ["Sequencing", "Pattern recognition", "Early logic", "Following directions", "Problem-solving"],
    tools: ["ScratchJr", "Story builder"],
    finalProjectTitle: "My Step-by-Step Adventure",
    finalProjectDescription:
      "Your child orders a set of steps to guide a character through a small adventure.",
    referenceKeys: ["code-org", "scratchjr"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },

  // 9 — EXISTING
  {
    slug: "tiny-engineers",
    title: "Tiny Builders (Digital)",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "ENGINEERING",
    description:
      "Young builders design and stack digital structures, learning how shapes fit together to make sturdy creations.",
    parentSummary:
      "Your child explores early engineering ideas by building and balancing shapes on a digital canvas. It is a screen-light, parent-guided activity that stays completely digital, so there are no blocks, kits, or shipped materials. The focus is creative building and simple problem-solving.",
    studentSummary: "You stack and build amazing digital towers and bridges!",
    skills: ["Building", "Spatial reasoning", "Balance", "Problem-solving", "Creativity"],
    tools: ["Drawing canvas", "Story builder"],
    finalProjectTitle: "My Tallest Tower",
    finalProjectDescription:
      "Your child designs and builds a digital tower or bridge and shares how they made it sturdy.",
    referenceKeys: ["code-org"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },

  // 10 — EXISTING
  {
    slug: "space-and-sky",
    title: "Space & Sky",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "A dreamy journey through stars, planets, and the moon that fills little explorers with cosmic wonder.",
    parentSummary:
      "Your child discovers the sky, the moon, and the planets through short, screen-light digital activities. Everything is fully digital and parent-guided, with no telescopes, kits, or materials needed. The goal is gentle wonder and early science vocabulary.",
    studentSummary: "You zoom up to the stars and meet the moon and the planets!",
    skills: ["Space awareness", "Observation", "Science vocabulary", "Curiosity", "Day and night"],
    tools: ["Drawing canvas", "Story builder"],
    finalProjectTitle: "My Sky Map",
    finalProjectDescription:
      "Your child creates a simple digital sky map showing their favorite things in space.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
    adminNotes: "Imported existing space course; NASA Space Place + ESA Kids enrichment.",
  },

  // 11 — EXISTING
  {
    slug: "creative-robot-stories",
    title: "Creative Robot Stories",
    ageGroup: "AGES_3_5",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Little ones invent playful robot characters and tap them into animated stories full of beeps and giggles.",
    parentSummary:
      "Your child creates fun robot characters and brings them to life in simple animated stories. It is a screen-light, parent-guided experience that is entirely digital, with no real robots or hardware involved. The focus is imagination, storytelling, and early sequencing.",
    studentSummary: "You build silly robot friends and make them star in your own story!",
    skills: ["Storytelling", "Sequencing", "Imagination", "Character creation", "Self-expression"],
    tools: ["ScratchJr", "Story builder"],
    finalProjectTitle: "My Robot's Big Day",
    finalProjectDescription:
      "Your child creates a short animated story starring a robot character they invented.",
    referenceKeys: ["scratchjr", "code-org"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
];
