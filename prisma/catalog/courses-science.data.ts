import type { CatalogCourse } from "./types";

export const COURSES_SCIENCE: CatalogCourse[] = [
  // ===========================================================================
  // SPACE — ages 8-10 (BEGINNER)
  // ===========================================================================
  {
    slug: "nasa-space-explorer-intro",
    title: "NASA Space Explorer: Introduction to Space Science",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "A friendly first journey into space science using NASA's and ESA's free online explorer activities.",
    parentSummary:
      "Your child begins their space adventure entirely online, exploring real NASA Space Place games and ESA Kids activities that explain what space is and why we study it. There is no coding to learn and no hardware to buy, just safe, curated digital exploration. Every lesson uses interactive web activities from trusted space agencies to build curiosity and confidence.",
    studentSummary:
      "You get to blast off into space science and explore the universe with real NASA and ESA activities!",
    skills: [
      "space science basics",
      "scientific curiosity",
      "observation skills",
      "reading space facts",
      "digital exploration",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "My Space Explorer Notebook",
    finalProjectDescription:
      "Children create a digital notebook of their favourite space facts and activities discovered on NASA Space Place and ESA Kids.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "What Is Space?",
        lessons: [
          { title: "Looking Up: Why We Study Space", isFree: true },
          { title: "Exploring NASA Space Place", isFree: true },
          { title: "Discovering ESA Kids", isFree: true },
        ],
      },
      {
        title: "Becoming a Space Explorer",
        lessons: [
          { title: "Space Tools and How Scientists See" },
          { title: "Fun Space Facts and Games" },
          { title: "Putting Together My Space Notebook" },
        ],
      },
    ],
  },
  {
    slug: "solar-system-explorer",
    title: "Solar System Explorer",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "Young learners tour the planets of our solar system through NASA and ESA interactive web activities.",
    parentSummary:
      "Your child takes a guided tour of the Sun, planets, and moons using real NASA Space Place and ESA Kids interactive activities, all on screen. No telescopes or kits are required, only a browser and curiosity. The course builds an early understanding of how our solar system is arranged using trusted, age-appropriate digital resources.",
    studentSummary:
      "You get to zoom past every planet in our solar system and find out what makes each one special!",
    skills: [
      "solar system structure",
      "comparing planets",
      "ordering by distance",
      "space vocabulary",
      "digital exploration",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "My Solar System Tour",
    finalProjectDescription:
      "Children build a simple digital tour of the planets, sharing one amazing fact about each using NASA and ESA activities.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "The Sun and Inner Planets",
        lessons: [
          { title: "Our Star: The Sun", isFree: true },
          { title: "Mercury, Venus, Earth, and Mars", isFree: true },
          { title: "Why Earth Is Just Right", isFree: true },
        ],
      },
      {
        title: "The Outer Planets and Beyond",
        lessons: [
          { title: "Jupiter and Saturn: The Giants" },
          { title: "Uranus, Neptune, and the Edges" },
          { title: "Building My Solar System Tour" },
        ],
      },
    ],
  },
  {
    slug: "earth-from-space",
    title: "Earth from Space",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "Children discover what our home planet looks like from orbit using NASA, ESA, and National Geographic activities.",
    parentSummary:
      "Your child explores how satellites and astronauts see Earth, using NASA Space Place, ESA Kids, and National Geographic Kids online activities. Everything is screen-based with no equipment needed at home. The course connects space science to our own planet, helping children understand oceans, clouds, and continents through real agency imagery and games.",
    studentSummary:
      "You get to see our planet the way astronauts do and spot oceans, storms, and continents from space!",
    skills: [
      "Earth observation",
      "reading satellite views",
      "continents and oceans",
      "weather from space",
      "digital exploration",
    ],
    tools: ["NASA Space Place", "ESA Kids", "National Geographic Kids"],
    finalProjectTitle: "My View of Earth",
    finalProjectDescription:
      "Children assemble a digital picture-story of Earth from space, labelling features they discovered in NASA, ESA, and Nat Geo activities.",
    referenceKeys: ["nasa-space-place", "esa-kids", "natgeo-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Seeing Our Planet",
        lessons: [
          { title: "How Satellites Watch Earth", isFree: true },
          { title: "Oceans and Continents from Above", isFree: true },
          { title: "Clouds, Storms, and Weather", isFree: true },
        ],
      },
      {
        title: "Earth Up Close",
        lessons: [
          { title: "Day, Night, and the Spinning Earth" },
          { title: "Protecting Our Blue Planet" },
          { title: "Creating My View of Earth" },
        ],
      },
    ],
  },
  {
    slug: "space-science-games-challenges",
    title: "Space Science Games and Challenges",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "A playful course built around NASA Space Place games, puzzles, and space science challenges.",
    parentSummary:
      "Your child learns space science through play, working through the free interactive games, puzzles, and challenges on NASA Space Place. There is no hardware and no setup, just guided digital fun. Each activity reinforces real space concepts while keeping learning lively and rewarding.",
    studentSummary:
      "You get to play awesome space games and beat fun challenges while learning real NASA science!",
    skills: [
      "problem solving",
      "space science concepts",
      "logical thinking",
      "perseverance",
      "digital exploration",
    ],
    tools: ["NASA Space Place"],
    finalProjectTitle: "My Space Challenge Badge Collection",
    finalProjectDescription:
      "Children complete a series of NASA Space Place games and challenges and record the badges and facts they earned along the way.",
    referenceKeys: ["nasa-space-place"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Space Games to Play",
        lessons: [
          { title: "Getting Started with NASA Space Place Games", isFree: true },
          { title: "Planet and Star Puzzles", isFree: true },
          { title: "Space Trivia Challenges", isFree: true },
        ],
      },
      {
        title: "Level Up Your Space Skills",
        lessons: [
          { title: "Mission Mini-Games" },
          { title: "Beating the Tricky Challenges" },
          { title: "Collecting My Challenge Badges" },
        ],
      },
    ],
  },
  {
    slug: "esa-space-for-kids-missions",
    title: "ESA Space for Kids: Space Missions and Exploration",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "Young explorers discover real space missions through ESA Kids and NASA Space Place activities.",
    parentSummary:
      "Your child explores how rockets launch and how missions travel through space using ESA Kids and NASA Space Place online activities. No models or kits are needed, just engaging digital content from the space agencies themselves. The course introduces exploration, astronauts, and spacecraft in a fun, screen-based way.",
    studentSummary:
      "You get to follow real rockets and space missions and find out how astronauts explore space!",
    skills: [
      "space missions basics",
      "how rockets work",
      "astronaut facts",
      "exploration history",
      "digital exploration",
    ],
    tools: ["ESA Kids", "NASA Space Place"],
    finalProjectTitle: "My Mission Logbook",
    finalProjectDescription:
      "Children pick a favourite real space mission and build a simple digital logbook of its goals and discoveries using ESA Kids and NASA resources.",
    referenceKeys: ["esa-kids", "nasa-space-place"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Blast Off!",
        lessons: [
          { title: "How Rockets Reach Space", isFree: true },
          { title: "Meet the Astronauts", isFree: true },
          { title: "Exploring ESA Kids Missions", isFree: true },
        ],
      },
      {
        title: "Missions Across Space",
        lessons: [
          { title: "Robots and Spacecraft Explorers" },
          { title: "Famous Space Missions" },
          { title: "Writing My Mission Logbook" },
        ],
      },
    ],
  },

  // ===========================================================================
  // SPACE — ages 11-13 (INTERMEDIATE)
  // ===========================================================================
  {
    slug: "planets-moons-space-objects",
    title: "Planets, Moons, and Space Objects",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners investigate planets, moons, and other space objects using NASA and ESA digital resources.",
    parentSummary:
      "Your child takes a deeper look at planets, moons, dwarf planets, and other objects using NASA Space Place and ESA Kids interactive activities. The course is entirely digital with no coding or hardware required. Learners compare worlds and build real understanding of how our solar system is organised, all through trusted agency content.",
    studentSummary:
      "You get to compare strange moons, giant planets, and icy worlds across the whole solar system!",
    skills: [
      "classifying space objects",
      "comparing planets and moons",
      "scientific reasoning",
      "using data tables",
      "space vocabulary",
      "digital research",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Space Object Field Guide",
    finalProjectDescription:
      "Learners create a digital field guide comparing several planets, moons, and space objects using data from NASA and ESA activities.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Worlds of the Solar System",
        lessons: [
          { title: "What Makes a Planet a Planet", isFree: true },
          { title: "Moons Big and Small", isFree: true },
          { title: "Dwarf Planets and Other Objects", isFree: true },
        ],
      },
      {
        title: "Comparing Worlds",
        lessons: [
          { title: "Size, Distance, and Temperature" },
          { title: "Rings, Craters, and Atmospheres" },
          { title: "Building My Space Object Field Guide" },
        ],
      },
    ],
  },
  {
    slug: "sun-earth-connection",
    title: "The Sun and Earth Connection",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners explore how the Sun drives life and weather on Earth using NASA and ESA activities.",
    parentSummary:
      "Your child investigates the powerful relationship between the Sun and Earth using NASA Space Place and ESA Kids online activities. Everything is browser-based with no kits or coding involved. The course explains light, energy, and how the Sun shapes our days, seasons, and climate through real, age-appropriate agency content.",
    studentSummary:
      "You get to discover how the Sun powers life on Earth and controls our days and seasons!",
    skills: [
      "Sun-Earth relationship",
      "energy and light",
      "cause and effect",
      "scientific reasoning",
      "interpreting diagrams",
      "digital research",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Sun and Earth Explainer",
    finalProjectDescription:
      "Learners produce a digital explainer showing how energy travels from the Sun to Earth, drawing on NASA and ESA activities.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Our Star Up Close",
        lessons: [
          { title: "What the Sun Is Made Of", isFree: true },
          { title: "How Sunlight Reaches Earth", isFree: true },
          { title: "Energy That Powers Life", isFree: true },
        ],
      },
      {
        title: "The Sun Shapes Our World",
        lessons: [
          { title: "Day, Night, and the Spinning Earth" },
          { title: "How the Sun Affects Climate" },
          { title: "Creating My Sun and Earth Explainer" },
        ],
      },
    ],
  },
  {
    slug: "space-weather-and-seasons",
    title: "Space Weather and Seasons",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners discover space weather and the science of seasons through NASA and ESA digital activities.",
    parentSummary:
      "Your child explores why we have seasons and what space weather is, using NASA Space Place and ESA Kids interactive activities. The course is fully online with no hardware or coding needed. Learners connect Earth's tilt, the solar wind, and auroras to real science using trusted agency resources.",
    studentSummary:
      "You get to find out why seasons change and what makes the sky glow with auroras!",
    skills: [
      "understanding seasons",
      "space weather basics",
      "Earth's tilt and orbit",
      "scientific reasoning",
      "interpreting diagrams",
      "digital research",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Seasons and Space Weather Poster",
    finalProjectDescription:
      "Learners design a digital poster explaining how Earth's tilt creates seasons and how space weather affects our planet, using NASA and ESA activities.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Why Seasons Happen",
        lessons: [
          { title: "Earth's Tilt and Orbit", isFree: true },
          { title: "Sunlight Through the Year", isFree: true },
          { title: "Seasons Around the World", isFree: true },
        ],
      },
      {
        title: "Weather from Space",
        lessons: [
          { title: "The Solar Wind and Storms" },
          { title: "Auroras and Glowing Skies" },
          { title: "Designing My Seasons and Space Weather Poster" },
        ],
      },
    ],
  },
  {
    slug: "mars-rover-mission-explorer",
    title: "Mars Rover Mission Explorer",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners follow real Mars rover missions and exploration using NASA and ESA online activities.",
    parentSummary:
      "Your child explores how NASA and ESA send rovers to Mars and what they discover, using NASA Space Place and ESA Kids interactive activities. No coding or hardware is involved, only safe, curated digital content. The course introduces real mission science, rover instruments, and the search for water and life through trusted agency resources.",
    studentSummary:
      "You get to drive into real Mars missions and discover what rovers find on the Red Planet!",
    skills: [
      "Mars mission science",
      "how rovers explore",
      "scientific investigation",
      "interpreting mission data",
      "asking questions",
      "digital research",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "My Mars Rover Mission Plan",
    finalProjectDescription:
      "Learners design a digital plan for a Mars rover mission, choosing goals and instruments based on real NASA and ESA activities.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Journey to Mars",
        lessons: [
          { title: "Why We Explore Mars", isFree: true },
          { title: "How Rovers Get There", isFree: true },
          { title: "Meet the Real Mars Rovers", isFree: true },
        ],
      },
      {
        title: "Exploring the Red Planet",
        lessons: [
          { title: "Rover Tools and Instruments" },
          { title: "Searching for Water and Life" },
          { title: "Designing My Mars Rover Mission Plan" },
        ],
      },
    ],
  },
  {
    slug: "space-communications-signals",
    title: "Space Communications and Signals",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners discover how spacecraft send signals back to Earth using NASA and ESA digital activities.",
    parentSummary:
      "Your child explores how messages and data travel between Earth and distant spacecraft, using NASA Space Place and ESA Kids interactive activities. Everything is online with no coding or equipment required. The course explains radio waves, antennas, and deep-space networks through real, age-appropriate agency content.",
    studentSummary:
      "You get to follow space signals across millions of kilometres and learn how spacecraft talk to Earth!",
    skills: [
      "how signals travel",
      "radio waves basics",
      "deep-space communication",
      "scientific reasoning",
      "interpreting diagrams",
      "digital research",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Signal to Space Explainer",
    finalProjectDescription:
      "Learners create a digital explainer tracing how a signal travels from a spacecraft back to Earth, using NASA and ESA activities.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Talking Across Space",
        lessons: [
          { title: "What Are Radio Signals", isFree: true },
          { title: "How Spacecraft Send Data", isFree: true },
          { title: "Giant Antennas on Earth", isFree: true },
        ],
      },
      {
        title: "Signals Across the Solar System",
        lessons: [
          { title: "Why Signals Take Time" },
          { title: "Deep-Space Communication Networks" },
          { title: "Creating My Signal to Space Explainer" },
        ],
      },
    ],
  },
  {
    slug: "eclipses-and-sky-events",
    title: "Eclipses and Sky Events",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners explore eclipses, phases, and special sky events using NASA and ESA online activities.",
    parentSummary:
      "Your child discovers why eclipses happen and how to understand sky events safely, using NASA Space Place and ESA Kids interactive activities. The course is entirely digital with no hardware needed. Learners explore Moon phases, solar and lunar eclipses, and observing tips through trusted agency resources.",
    studentSummary:
      "You get to uncover the secrets behind eclipses, Moon phases, and amazing events in the sky!",
    skills: [
      "understanding eclipses",
      "Moon phases",
      "Sun-Earth-Moon geometry",
      "safe sky observation",
      "scientific reasoning",
      "digital research",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Sky Events Calendar",
    finalProjectDescription:
      "Learners build a digital calendar of upcoming sky events with explanations of eclipses and Moon phases drawn from NASA and ESA activities.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Patterns in the Sky",
        lessons: [
          { title: "The Moon and Its Phases", isFree: true },
          { title: "How the Sun, Earth, and Moon Line Up", isFree: true },
          { title: "What Is an Eclipse", isFree: true },
        ],
      },
      {
        title: "Watching the Sky Safely",
        lessons: [
          { title: "Solar and Lunar Eclipses" },
          { title: "Other Special Sky Events" },
          { title: "Building My Sky Events Calendar" },
        ],
      },
    ],
  },
  {
    slug: "stars-galaxies-universe",
    title: "Stars, Galaxies, and the Universe",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners journey beyond the solar system to stars and galaxies using NASA, ESA, and Nat Geo activities.",
    parentSummary:
      "Your child explores stars, galaxies, and the scale of the universe using NASA Space Place, ESA Kids, and National Geographic Kids online activities. Everything is screen-based with no coding or hardware required. The course introduces star life cycles, the Milky Way, and the vastness of space through trusted, age-appropriate resources.",
    studentSummary:
      "You get to travel beyond our solar system to explore glowing stars and giant galaxies!",
    skills: [
      "star life cycles",
      "galaxies and the Milky Way",
      "scale of the universe",
      "scientific reasoning",
      "interpreting space imagery",
      "digital research",
    ],
    tools: ["NASA Space Place", "ESA Kids", "National Geographic Kids"],
    finalProjectTitle: "Tour of the Universe",
    finalProjectDescription:
      "Learners create a digital tour journeying from our Sun to distant galaxies, using NASA, ESA, and Nat Geo activities.",
    referenceKeys: ["nasa-space-place", "esa-kids", "natgeo-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "The Life of Stars",
        lessons: [
          { title: "What Stars Are Made Of", isFree: true },
          { title: "How Stars Are Born and Die", isFree: true },
          { title: "Colours and Sizes of Stars", isFree: true },
        ],
      },
      {
        title: "Galaxies and Beyond",
        lessons: [
          { title: "Our Galaxy: The Milky Way" },
          { title: "The Vast Scale of the Universe" },
          { title: "Creating My Tour of the Universe" },
        ],
      },
    ],
  },
  {
    slug: "meteors-asteroids-comets",
    title: "Meteor Showers, Asteroids, and Comets",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners investigate meteors, asteroids, and comets using NASA and ESA interactive activities.",
    parentSummary:
      "Your child explores the small but exciting objects of space such as meteors, asteroids, and comets, using NASA Space Place and ESA Kids interactive activities. The course is fully online with no coding or hardware required. Learners discover where these objects come from and how scientists track them through trusted agency content.",
    studentSummary:
      "You get to chase meteor showers, track asteroids, and follow comets blazing across space!",
    skills: [
      "classifying space rocks",
      "meteors and meteor showers",
      "asteroids and comets",
      "scientific reasoning",
      "interpreting space data",
      "digital research",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Small Worlds Guide",
    finalProjectDescription:
      "Learners create a digital guide comparing meteors, asteroids, and comets using facts from NASA and ESA activities.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Rocks and Ice in Space",
        lessons: [
          { title: "What Are Asteroids", isFree: true },
          { title: "Comets and Their Tails", isFree: true },
          { title: "Meteors and Meteor Showers", isFree: true },
        ],
      },
      {
        title: "Tracking Small Worlds",
        lessons: [
          { title: "Where Space Rocks Come From" },
          { title: "How Scientists Watch the Skies" },
          { title: "Building My Small Worlds Guide" },
        ],
      },
    ],
  },
  {
    slug: "nasa-digital-stem-activities",
    title: "NASA Digital STEM Activities",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "A hands-on-screen course working through NASA's online STEM activities and challenges.",
    parentSummary:
      "Your child works through a curated set of NASA's free digital STEM activities, applying space science to real, browser-based tasks. There is no hardware or coding prerequisite, only guided exploration of trusted NASA resources. The course strengthens scientific thinking and problem solving using authentic agency materials.",
    studentSummary:
      "You get to take on real NASA STEM activities and think like a space scientist!",
    skills: [
      "applying space science",
      "STEM problem solving",
      "scientific investigation",
      "following procedures",
      "critical thinking",
      "digital research",
    ],
    tools: ["NASA Space Place"],
    finalProjectTitle: "My NASA STEM Portfolio",
    finalProjectDescription:
      "Learners complete several NASA digital STEM activities and assemble their results into a reflective online portfolio.",
    referenceKeys: ["nasa-space-place"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Getting Started with NASA STEM",
        lessons: [
          { title: "Exploring NASA's Digital Activities", isFree: true },
          { title: "Thinking Like a Space Scientist", isFree: true },
          { title: "Your First NASA STEM Challenge", isFree: true },
        ],
      },
      {
        title: "Applying Space Science",
        lessons: [
          { title: "Investigation Activities" },
          { title: "Reflecting on Results" },
          { title: "Building My NASA STEM Portfolio" },
        ],
      },
    ],
  },
  {
    slug: "space-science-final-project",
    title: "Space Science Final Project",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "A capstone where learners bring together everything they have learned using NASA and ESA resources.",
    parentSummary:
      "In this capstone course your child plans and creates an original space science project, drawing on NASA Space Place and ESA Kids activities they have explored. The work is entirely digital with no coding or hardware needed. Learners practise research, organisation, and clear communication using trusted agency resources.",
    studentSummary:
      "You get to become a real space scientist and create your very own space project to share!",
    skills: [
      "research and planning",
      "synthesising space science",
      "organising information",
      "clear communication",
      "self-directed learning",
      "digital presentation",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "My Space Science Showcase",
    finalProjectDescription:
      "Learners plan, research, and present an original digital space science project of their choice using NASA and ESA activities.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Planning My Project",
        lessons: [
          { title: "Choosing a Space Topic", isFree: true },
          { title: "Researching with NASA and ESA", isFree: true },
          { title: "Organising My Ideas", isFree: true },
        ],
      },
      {
        title: "Creating and Sharing",
        lessons: [
          { title: "Building My Project" },
          { title: "Preparing My Presentation" },
          { title: "Showcasing My Space Science Project" },
        ],
      },
    ],
  },

  // ===========================================================================
  // SIMULATIONS — ages 11-13 (INTERMEDIATE)
  // ===========================================================================
  {
    slug: "science-simulation-explorer",
    title: "Science Simulation Explorer",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "An introduction to learning science through interactive PhET simulations and CK-12 activities.",
    parentSummary:
      "Your child learns to investigate science using free, award-winning PhET interactive simulations and CK-12 online activities. Everything runs in a browser with no lab equipment or coding required. The course teaches how to use simulations as virtual experiments to explore real scientific ideas safely.",
    studentSummary:
      "You get to run virtual science experiments and discover how the world works with cool simulations!",
    skills: [
      "using simulations",
      "scientific inquiry",
      "making observations",
      "testing predictions",
      "interpreting results",
      "digital experimentation",
    ],
    tools: ["PhET Simulations", "CK-12"],
    finalProjectTitle: "My Simulation Investigation",
    finalProjectDescription:
      "Learners choose a PhET simulation, run a guided investigation, and report their findings using CK-12 support.",
    referenceKeys: ["phet", "ck12"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "What Are Science Simulations",
        lessons: [
          { title: "Exploring PhET Simulations", isFree: true },
          { title: "How a Virtual Experiment Works", isFree: true },
          { title: "Using CK-12 to Learn More", isFree: true },
        ],
      },
      {
        title: "Investigating with Simulations",
        lessons: [
          { title: "Making Predictions" },
          { title: "Recording Observations" },
          { title: "Creating My Simulation Investigation" },
        ],
      },
    ],
  },
  {
    slug: "forces-motion-simulations",
    title: "Forces and Motion with Simulations",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners explore forces, motion, and friction through PhET simulations and CK-12 activities.",
    parentSummary:
      "Your child investigates forces and motion using free PhET interactive simulations and CK-12 online activities, with no physical lab needed. Everything is browser-based and there is no coding prerequisite. Learners experiment with pushes, pulls, friction, and gravity safely on screen to understand real physics.",
    studentSummary:
      "You get to push, pull, and launch objects in virtual experiments to see how forces move things!",
    skills: [
      "forces and motion",
      "friction and gravity",
      "scientific inquiry",
      "testing variables",
      "interpreting graphs",
      "digital experimentation",
    ],
    tools: ["PhET Simulations", "CK-12"],
    finalProjectTitle: "Forces in Action Report",
    finalProjectDescription:
      "Learners use a PhET forces and motion simulation to test how a variable changes movement and report their results with CK-12 support.",
    referenceKeys: ["phet", "ck12"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Pushes and Pulls",
        lessons: [
          { title: "What Is a Force", isFree: true },
          { title: "Exploring Motion in PhET", isFree: true },
          { title: "Friction and Gravity", isFree: true },
        ],
      },
      {
        title: "Testing Motion",
        lessons: [
          { title: "Changing One Variable at a Time" },
          { title: "Reading Motion Graphs" },
          { title: "Writing My Forces in Action Report" },
        ],
      },
    ],
  },
  {
    slug: "energy-electricity-explorer",
    title: "Energy and Electricity Explorer",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners build virtual circuits and explore energy using PhET simulations and CK-12 activities.",
    parentSummary:
      "Your child explores energy and electricity by building virtual circuits in free PhET simulations and reading CK-12 activities. There is no real wiring, hardware, or coding involved, keeping everything safe and screen-based. Learners discover how energy transfers and how circuits work through authentic virtual experiments.",
    studentSummary:
      "You get to wire up virtual circuits, light up bulbs, and discover how energy flows!",
    skills: [
      "energy transfer",
      "building circuits",
      "electricity basics",
      "scientific inquiry",
      "testing variables",
      "digital experimentation",
    ],
    tools: ["PhET Simulations", "CK-12"],
    finalProjectTitle: "My Virtual Circuit Challenge",
    finalProjectDescription:
      "Learners design and test a working circuit in a PhET simulation and explain how energy moves through it using CK-12 support.",
    referenceKeys: ["phet", "ck12"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Energy All Around Us",
        lessons: [
          { title: "What Is Energy", isFree: true },
          { title: "Forms of Energy", isFree: true },
          { title: "How Energy Transfers", isFree: true },
        ],
      },
      {
        title: "Building Circuits",
        lessons: [
          { title: "Exploring the PhET Circuit Kit" },
          { title: "Series and Parallel Circuits" },
          { title: "Completing My Virtual Circuit Challenge" },
        ],
      },
    ],
  },
  {
    slug: "light-sound-waves-explorer",
    title: "Light, Sound, and Waves Explorer",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners investigate light, sound, and waves using PhET simulations and CK-12 activities.",
    parentSummary:
      "Your child explores how light and sound travel as waves using free PhET interactive simulations and CK-12 online activities. Everything is browser-based with no equipment or coding required. Learners experiment with reflection, frequency, and amplitude safely on screen to understand real wave science.",
    studentSummary:
      "You get to bend light, make sound waves, and see how waves carry energy around you!",
    skills: [
      "wave properties",
      "light and reflection",
      "sound and frequency",
      "scientific inquiry",
      "interpreting wave diagrams",
      "digital experimentation",
    ],
    tools: ["PhET Simulations", "CK-12"],
    finalProjectTitle: "Wave Explorer Report",
    finalProjectDescription:
      "Learners use PhET wave simulations to investigate how a property changes light or sound and report their findings with CK-12 support.",
    referenceKeys: ["phet", "ck12"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Waves Around Us",
        lessons: [
          { title: "What Is a Wave", isFree: true },
          { title: "Exploring Light in PhET", isFree: true },
          { title: "Exploring Sound in PhET", isFree: true },
        ],
      },
      {
        title: "Investigating Waves",
        lessons: [
          { title: "Frequency and Amplitude" },
          { title: "Reflection and Bending" },
          { title: "Writing My Wave Explorer Report" },
        ],
      },
    ],
  },
  {
    slug: "chemistry-basics-simulations",
    title: "Chemistry Basics with Simulations",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners explore atoms, molecules, and reactions through PhET simulations and CK-12 activities.",
    parentSummary:
      "Your child investigates the building blocks of matter using free PhET interactive simulations and CK-12 online activities. There are no chemicals, lab equipment, or coding involved, keeping everything safe and screen-based. Learners build atoms and molecules and explore reactions virtually to understand real chemistry.",
    studentSummary:
      "You get to build atoms, mix virtual molecules, and watch reactions happen safely on screen!",
    skills: [
      "atoms and molecules",
      "chemical reactions",
      "states of matter",
      "scientific inquiry",
      "testing variables",
      "digital experimentation",
    ],
    tools: ["PhET Simulations", "CK-12"],
    finalProjectTitle: "My Virtual Chemistry Lab",
    finalProjectDescription:
      "Learners use PhET chemistry simulations to build molecules and explore a reaction, then report their findings with CK-12 support.",
    referenceKeys: ["phet", "ck12"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Building Blocks of Matter",
        lessons: [
          { title: "Atoms and Elements", isFree: true },
          { title: "Building Molecules in PhET", isFree: true },
          { title: "States of Matter", isFree: true },
        ],
      },
      {
        title: "Exploring Reactions",
        lessons: [
          { title: "What Happens in a Reaction" },
          { title: "Testing Changes Safely" },
          { title: "Completing My Virtual Chemistry Lab" },
        ],
      },
    ],
  },
  {
    slug: "earth-science-digital-lab",
    title: "Earth Science Digital Lab",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Learners study Earth's systems through PhET simulations, CK-12, and Smithsonian Science activities.",
    parentSummary:
      "Your child explores Earth's systems such as the water cycle, climate, and landforms using free PhET simulations, CK-12 activities, and Smithsonian Science Education Center resources. Everything is online with no field trips, kits, or coding required. Learners run virtual investigations to understand how our planet works using trusted educational sources.",
    studentSummary:
      "You get to run a virtual Earth lab and explore volcanoes, climate, and the water cycle!",
    skills: [
      "Earth systems",
      "water cycle and climate",
      "scientific inquiry",
      "interpreting models",
      "drawing conclusions",
      "digital experimentation",
    ],
    tools: ["PhET Simulations", "CK-12", "Smithsonian Science"],
    finalProjectTitle: "My Earth Systems Investigation",
    finalProjectDescription:
      "Learners use a digital simulation to investigate an Earth system and present their findings using CK-12 and Smithsonian Science resources.",
    referenceKeys: ["phet", "ck12", "smithsonian-ssec"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Earth's Connected Systems",
        lessons: [
          { title: "The Water Cycle", isFree: true },
          { title: "Land, Air, and Oceans", isFree: true },
          { title: "Exploring Earth Models Online", isFree: true },
        ],
      },
      {
        title: "Investigating Our Planet",
        lessons: [
          { title: "Climate and Weather Patterns" },
          { title: "Volcanoes, Rocks, and Landforms" },
          { title: "Completing My Earth Systems Investigation" },
        ],
      },
    ],
  },

  // ===========================================================================
  // EXISTING — Space Science & Simulations (advanced slot)
  // ===========================================================================
  {
    slug: "space-science-missions",
    title: "Space Science & Simulations",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "An advanced space science course pairing real NASA and ESA mission content with interactive exploration.",
    parentSummary:
      "This course deepens your child's space science knowledge by connecting real NASA and ESA mission content with interactive online exploration. Everything is digital with no hardware or coding prerequisite, drawing on trusted NASA Space Place and ESA Kids resources. Learners study mission design, exploration, and discovery through authentic agency materials.",
    studentSummary:
      "You get to dive deep into real space missions and design your own space exploration challenge!",
    skills: [
      "space mission design",
      "applying space science",
      "scientific investigation",
      "interpreting mission data",
      "research and synthesis",
      "digital presentation",
    ],
    tools: ["NASA Space Place", "ESA Kids"],
    finalProjectTitle: "Space Mission Design Challenge",
    finalProjectDescription:
      "Learners design a complete space mission, defining goals, instruments, and discoveries using NASA and ESA activities.",
    referenceKeys: ["nasa-space-place", "esa-kids"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
    adminNotes:
      "Imported existing NASA-aligned course. Fills the master 'Space Mission Design Challenge' / advanced space slot; included in Space Science (NASA & ESA) and Digital STEM Explorer bundles.",
  },
];
