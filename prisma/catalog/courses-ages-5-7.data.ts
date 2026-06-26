import type { CatalogCourse } from "./types";

export const COURSES_AGES_5_7: CatalogCourse[] = [
  {
    slug: "scratchjr-animation-adventures",
    title: "ScratchJr Animation Adventures",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "ARTS",
    description:
      "Young learners bring colourful characters to life with simple drag-and-drop animation in ScratchJr.",
    parentSummary:
      "Your child explores the joy of animation entirely on screen, using the free ScratchJr app to make characters move, talk, and dance. There are no kits or printouts to buy and nothing to assemble. Every activity is tap-and-play, building early creativity and screen-based confidence at a gentle pace.",
    studentSummary:
      "You get to make your own cartoon characters wiggle, jump, and zoom across the screen!",
    skills: [
      "creative animation",
      "drag-and-drop blocks",
      "storytelling with motion",
      "cause and effect",
      "digital tool confidence",
    ],
    tools: ["ScratchJr", "Tynker"],
    finalProjectTitle: "My Animated Scene",
    finalProjectDescription:
      "Children create a short animated scene where their chosen characters move and react to taps.",
    referenceKeys: ["scratchjr", "tynker"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Meet Your Characters",
        lessons: [
          { title: "Tapping to Make Things Move", isFree: true },
          { title: "Choosing Fun Backgrounds", isFree: true },
          { title: "Making a Character Wave Hello", isFree: true },
        ],
      },
      {
        title: "Adding Motion Magic",
        lessons: [
          { title: "Jump, Spin, and Slide" },
          { title: "Adding Sounds and Voices" },
          { title: "Putting Your Animation Together" },
        ],
      },
    ],
  },
  {
    slug: "sequencing-loops-young-coders",
    title: "Sequencing and Loops for Young Coders",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "CODING",
    description:
      "An on-screen introduction to putting steps in order and repeating them with loops using friendly coding apps.",
    parentSummary:
      "This course teaches the foundational coding ideas of sequencing and loops through playful digital puzzles, all done in free apps like ScratchJr, Code.org, and Tynker. No robots, boards, or physical kits are needed. Your child learns to think in steps and spot patterns, which supports early maths and logical thinking.",
    studentSummary:
      "You become a coding wizard who puts steps in the right order and uses loops to do things again and again!",
    skills: [
      "sequencing steps",
      "using loops",
      "pattern recognition",
      "logical thinking",
      "problem solving",
      "debugging mistakes",
    ],
    tools: ["ScratchJr", "Code.org", "Tynker"],
    finalProjectTitle: "Looping Dance Party",
    finalProjectDescription:
      "Learners build a program that uses a loop to make characters repeat a fun dance.",
    referenceKeys: ["scratchjr", "code-org", "tynker"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Step by Step",
        lessons: [
          { title: "What Comes First?", isFree: true },
          { title: "Giving Clear Instructions", isFree: true },
          { title: "Fixing the Order", isFree: true },
        ],
      },
      {
        title: "Again and Again with Loops",
        lessons: [
          { title: "Why We Repeat Things" },
          { title: "Making a Loop Block" },
          { title: "Loops That Tell a Story" },
        ],
      },
    ],
  },
  {
    slug: "my-first-interactive-game",
    title: "My First Interactive Game",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Kids design a simple tap-and-play game that reacts to the player using ScratchJr blocks.",
    parentSummary:
      "Your child designs and plays their very first interactive game using the free ScratchJr app and Tynker, with everything happening on the tablet or computer screen. No controllers, cartridges, or hardware are required. The course nurtures problem-solving and the thrill of making something others can play.",
    studentSummary:
      "You design your own game and watch your friends and family tap to play it!",
    skills: [
      "interactivity basics",
      "designing rules",
      "responding to taps",
      "creative planning",
      "testing and improving",
    ],
    tools: ["ScratchJr", "Tynker"],
    finalProjectTitle: "Tap-to-Win Mini Game",
    finalProjectDescription:
      "Children create a playable mini game where tapping a character makes something fun happen.",
    referenceKeys: ["scratchjr", "tynker"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "What Makes a Game Fun?",
        lessons: [
          { title: "Games You Already Love", isFree: true },
          { title: "Choosing a Hero and a Goal", isFree: true },
          { title: "Making Things Move When You Tap", isFree: true },
        ],
      },
      {
        title: "Build and Play",
        lessons: [
          { title: "Adding Points and Surprises" },
          { title: "Testing Your Game" },
          { title: "Sharing Your Game with Friends" },
        ],
      },
    ],
  },
  {
    slug: "digital-storytelling-with-characters",
    title: "Digital Storytelling with Characters",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "ARTS",
    description:
      "Learners craft animated stories with talking characters and scenes entirely on screen.",
    parentSummary:
      "Your child becomes a digital storyteller, using ScratchJr and Code.org activities to create animated tales with characters, dialogue, and scene changes. Everything is created in free software with no printing, props, or kits involved. The course strengthens early literacy, sequencing, and creative expression.",
    studentSummary:
      "You write and bring to life your very own animated story full of talking characters!",
    skills: [
      "story structure",
      "character creation",
      "scene sequencing",
      "adding dialogue",
      "creative expression",
    ],
    tools: ["ScratchJr", "Code.org"],
    finalProjectTitle: "My Animated Storybook",
    finalProjectDescription:
      "Children produce a multi-scene animated story with characters that talk and move.",
    referenceKeys: ["scratchjr", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Once Upon a Tap",
        lessons: [
          { title: "Beginning, Middle, and End", isFree: true },
          { title: "Picking Your Characters", isFree: true },
          { title: "Setting the Scene", isFree: true },
        ],
      },
      {
        title: "Bringing the Story to Life",
        lessons: [
          { title: "Making Characters Talk" },
          { title: "Changing Scenes" },
          { title: "Telling Your Whole Story" },
        ],
      },
    ],
  },
  {
    slug: "junior-creator-final-project",
    title: "Junior Creator Final Project",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "CODING",
    description:
      "A capstone course where young creators combine everything they have learned into one polished ScratchJr project.",
    parentSummary:
      "In this capstone, your child plans, builds, and presents a complete ScratchJr creation, choosing between an interactive story, an animation, or a simple game. All work is done on screen in free apps with no hardware or kits required. The course celebrates independence, planning, and the pride of finishing a real project.",
    studentSummary:
      "You get to pick your favourite idea and build a finished project to show off to everyone!",
    skills: [
      "project planning",
      "combining coding skills",
      "creative decision making",
      "self-directed building",
      "presenting work",
      "reflection",
    ],
    tools: ["ScratchJr", "Code.org"],
    finalProjectTitle: "My Junior Creator Showcase",
    finalProjectDescription:
      "Children present a finished interactive ScratchJr story, animation, or simple game of their own design.",
    referenceKeys: ["scratchjr", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Plan Your Big Idea",
        lessons: [
          { title: "Choosing Story, Animation, or Game", isFree: true },
          { title: "Sketching Your Plan", isFree: true },
          { title: "Gathering Your Characters and Scenes", isFree: true },
        ],
      },
      {
        title: "Build and Show",
        lessons: [
          { title: "Building Your Project Step by Step" },
          { title: "Testing and Polishing" },
          { title: "Presenting Your Showcase" },
        ],
      },
    ],
  },
  {
    slug: "scratchjr-first-stories",
    title: "ScratchJr: First Stories",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "CODING",
    description:
      "A gentle first taste of coding where children make simple animated stories in ScratchJr.",
    parentSummary:
      "This introductory course lets your child take their first steps in coding by building short animated stories in the free ScratchJr app. Everything happens on screen with no kits, robots, or materials to buy. It builds early sequencing skills and the confidence to create with technology.",
    studentSummary:
      "You make your very first coded story where characters move and play on the screen!",
    skills: [
      "first coding steps",
      "sequencing blocks",
      "simple animation",
      "storytelling basics",
      "digital confidence",
    ],
    tools: ["ScratchJr", "Code.org"],
    finalProjectTitle: "My First Story",
    finalProjectDescription:
      "Children create a short animated story with a character that moves from one scene to the next.",
    referenceKeys: ["scratchjr", "code-org", "tynker"],
    existing: true,
    contentStatus: "NEEDS_REVIEW",
    adminNotes:
      "Maps to master course 'ScratchJr Starter: Create Your First Story'. Currently a DRAFT placeholder pending curriculum.",
  },
  {
    slug: "coding-adventures-blocks",
    title: "Coding Adventures with Blocks",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Block-based coding puzzles guide young learners through fun on-screen challenges.",
    parentSummary:
      "Your child works through playful block-coding adventures using free apps like ScratchJr, Code.org, and Tynker. All challenges are completed on a tablet or computer with no physical kits needed. The course strengthens logical thinking and persistence through bite-sized puzzles.",
    studentSummary:
      "You snap colourful blocks together to solve puzzles and guide your characters on big adventures!",
    skills: [
      "block-based coding",
      "logical sequencing",
      "puzzle solving",
      "trial and error",
      "perseverance",
    ],
    tools: ["ScratchJr", "Code.org", "Tynker"],
    finalProjectTitle: "Block Adventure Challenge",
    finalProjectDescription:
      "Learners complete a self-built block-coding puzzle that guides a character to its goal.",
    referenceKeys: ["scratchjr", "code-org", "tynker"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "science-detectives",
    title: "Science Detectives",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "Curious kids investigate everyday science mysteries through interactive digital simulations.",
    parentSummary:
      "Your child becomes a science detective, exploring how the world works through interactive online simulations and kid-friendly digital explorations. There are no experiments kits or messy materials needed, just curiosity and a screen. The course nurtures observation, questioning, and early scientific thinking.",
    studentSummary:
      "You put on your detective hat and solve cool science mysteries on your screen!",
    skills: [
      "observation",
      "asking questions",
      "making predictions",
      "exploring simulations",
      "drawing conclusions",
    ],
    tools: ["PhET", "CK-12"],
    finalProjectTitle: "Solve the Science Mystery",
    finalProjectDescription:
      "Children use an interactive simulation to investigate and explain a simple science mystery.",
    referenceKeys: ["phet", "ck12", "natgeo-kids"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "inventor-studio",
    title: "Digital Inventor Studio",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "ENGINEERING",
    description:
      "Young inventors design and test imaginative creations using digital design activities.",
    parentSummary:
      "Your child steps into a digital inventor studio, dreaming up and testing creative ideas through online design and coding activities from Code.org and Raspberry Pi resources. Everything is done on screen with no physical building kits required. The course encourages creative engineering thinking and iterative problem solving.",
    studentSummary:
      "You become an inventor and design wild new creations right on your screen!",
    skills: [
      "design thinking",
      "creative problem solving",
      "planning ideas",
      "testing designs",
      "improving inventions",
    ],
    tools: ["Code.org", "Tynker"],
    finalProjectTitle: "My Big Invention",
    finalProjectDescription:
      "Children design and present a digital invention that solves a fun everyday problem.",
    referenceKeys: ["code-org", "raspberry-pi"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "ai-around-us",
    title: "AI Around Us",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "AI",
    description:
      "A friendly first look at how artificial intelligence shows up in everyday life.",
    parentSummary:
      "This gentle introduction helps your child notice where AI appears in daily life, from voice assistants to recommendations, using interactive online activities from Code.org, Create & Learn, and Tynker. All learning is screen-based with no devices or kits to purchase. The course builds early awareness and curiosity about smart technology.",
    studentSummary:
      "You discover the smart helpers all around you and learn how they think!",
    skills: [
      "spotting AI in daily life",
      "how computers learn",
      "patterns and sorting",
      "curiosity about technology",
      "thoughtful questions",
    ],
    tools: ["Code.org", "Tynker"],
    finalProjectTitle: "AI in My World",
    finalProjectDescription:
      "Children create a simple show-and-tell of the AI helpers they have spotted around them.",
    referenceKeys: ["code-org", "create-learn", "tynker"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
    adminNotes:
      "Maps to master course 'AI Around Us: Introduction for Kids' (used in AI Native Kids bundle & Creative Coder pathway).",
  },
  {
    slug: "smart-safe-online",
    title: "Smart & Safe Online",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "TECHNOLOGY",
    description:
      "Young learners build healthy, safe habits for exploring the digital world.",
    parentSummary:
      "Your child learns the basics of being smart and safe online through age-appropriate interactive lessons from Code.org. Everything is delivered on screen with no kits or materials needed. The course gives families a friendly foundation for kind, careful, and confident digital habits.",
    studentSummary:
      "You learn how to be a kind and careful explorer in the online world!",
    skills: [
      "online safety basics",
      "kind digital behaviour",
      "asking a grown-up",
      "protecting personal info",
      "healthy screen habits",
    ],
    tools: ["Code.org"],
    finalProjectTitle: "My Safety Promise",
    finalProjectDescription:
      "Children create a friendly online-safety promise sharing the smart habits they have learned.",
    referenceKeys: ["code-org"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "digital-creativity-studio",
    title: "Digital Creativity Studio",
    ageGroup: "AGES_5_7",
    level: "BEGINNER",
    category: "ARTS",
    description:
      "A playful studio where kids mix art and coding to make colourful digital creations.",
    parentSummary:
      "Your child explores the meeting point of art and coding in a digital creativity studio, using free tools like Scratch, Tynker, and Code.org. All projects are made on screen with no art supplies or kits required. The course celebrates imagination, self-expression, and creative confidence.",
    studentSummary:
      "You mix art and code to make your own colourful, moving creations!",
    skills: [
      "creative coding",
      "digital art",
      "colour and design",
      "combining ideas",
      "self-expression",
    ],
    tools: ["Scratch", "Tynker", "Code.org"],
    finalProjectTitle: "My Creative Masterpiece",
    finalProjectDescription:
      "Children create a colourful interactive artwork that blends drawing with simple coding.",
    referenceKeys: ["scratch", "tynker", "code-org"],
    existing: true,
    contentStatus: "NEEDS_REVIEW",
    adminNotes: "DRAFT placeholder pending curriculum.",
  },
];
