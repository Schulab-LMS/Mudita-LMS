import type { CatalogCourse } from "./types";

export const COURSES_AGES_8_10: CatalogCourse[] = [
  {
    slug: "scratch-starter-coding-blocks",
    title: "Scratch Starter: Coding with Blocks",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "CODING",
    description:
      "An introduction to block-based programming where kids snap together colourful code blocks to bring characters to life.",
    parentSummary:
      "Your child takes their first confident steps into coding using Scratch, a free drag-and-drop programming tool that runs entirely in a web browser. Every activity is software-only, so there is no robot, kit, or special hardware to buy. They build small interactive projects while learning the core ideas behind every program.",
    studentSummary:
      "You get to snap together code blocks and watch your very own character move, talk, and play right on the screen!",
    skills: [
      "Sequencing instructions",
      "Using loops",
      "Event-driven thinking",
      "Debugging simple errors",
      "Sprite and stage basics",
    ],
    tools: ["Scratch", "Code.org"],
    finalProjectTitle: "My First Interactive Scene",
    finalProjectDescription:
      "Build an animated scene in Scratch where a character responds to clicks and key presses with movement, sound, and dialogue.",
    referenceKeys: ["scratch", "code-org", "tynker"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Meet the Blocks",
        lessons: [
          { title: "What Is Code? Snapping Your First Block", isFree: true },
          { title: "Making a Sprite Move", isFree: true },
          { title: "Adding Sound and Speech", isFree: true },
        ],
      },
      {
        title: "Loops and Events",
        lessons: [
          { title: "Repeating Actions with Loops" },
          { title: "Reacting to Clicks and Keys" },
          { title: "Putting It All Together" },
        ],
      },
    ],
  },
  {
    slug: "scratch-game-design-level-1",
    title: "Scratch Game Design Level 1",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Kids design and code their own playable games using sprites, scoring, and simple game rules in Scratch.",
    parentSummary:
      "This course turns your child's love of games into a creative coding adventure, all using free browser-based software with no consoles or hardware required. They learn how real games work by building their own from scratch. Each lesson adds a new game-making skill they can reuse in future projects.",
    studentSummary:
      "You design and code a real game that your friends and family can actually play!",
    skills: [
      "Game logic design",
      "Collision detection",
      "Scorekeeping with variables",
      "Sprite control",
      "Iterative testing",
    ],
    tools: ["Scratch", "Tynker", "MakeCode"],
    finalProjectTitle: "My Arcade Game",
    finalProjectDescription:
      "Create a complete arcade-style game in Scratch with a player sprite, obstacles, a score counter, and a win or lose condition.",
    referenceKeys: ["scratch", "tynker", "makecode"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Game Building Blocks",
        lessons: [
          { title: "What Makes a Game Fun?", isFree: true },
          { title: "Controlling Your Player", isFree: true },
          { title: "Adding Obstacles and Enemies", isFree: true },
        ],
      },
      {
        title: "Rules and Scoring",
        lessons: [
          { title: "Keeping Score with Variables" },
          { title: "Winning and Losing" },
          { title: "Polishing and Playtesting" },
        ],
      },
    ],
  },
  {
    slug: "problem-solving-with-code",
    title: "Problem Solving with Code",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Kids learn to break big challenges into small steps and solve coding puzzles using logical thinking.",
    parentSummary:
      "This course builds the problem-solving muscles behind all of computer science using friendly, free coding puzzles in the browser. There is no hardware involved, just software activities your child can do from any device. They practise thinking like a programmer by tackling challenges one step at a time.",
    studentSummary:
      "You crack tricky coding puzzles by breaking them into easy little steps, just like a real problem solver!",
    skills: [
      "Decomposition",
      "Pattern recognition",
      "Algorithmic thinking",
      "Logical reasoning",
      "Debugging strategies",
    ],
    tools: ["Code.org", "Scratch"],
    finalProjectTitle: "The Great Puzzle Solver",
    finalProjectDescription:
      "Design and solve your own multi-step coding puzzle, then explain the step-by-step plan you used to crack it.",
    referenceKeys: ["code-org", "raspberry-pi"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Thinking in Steps",
        lessons: [
          { title: "Breaking Big Problems into Small Ones", isFree: true },
          { title: "Spotting Patterns", isFree: true },
          { title: "Writing a Plan Before You Code", isFree: true },
        ],
      },
      {
        title: "Puzzles and Debugging",
        lessons: [
          { title: "Solving Maze Challenges" },
          { title: "Finding and Fixing Bugs" },
          { title: "Your Own Puzzle Challenge" },
        ],
      },
    ],
  },
  {
    slug: "creative-coding-challenges",
    title: "Creative Coding Challenges",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "CODING",
    description:
      "A series of open-ended coding challenges that let kids invent, remix, and express themselves through code.",
    parentSummary:
      "This course encourages your child to use coding as a creative tool, blending art, storytelling, and play in free browser-based software. No hardware or kits are needed, just imagination and a device. Each challenge has many possible solutions, so children learn there is no single right answer in coding.",
    studentSummary:
      "You take on fun coding challenges and invent something totally your own every single time!",
    skills: [
      "Creative problem solving",
      "Remixing projects",
      "Animation basics",
      "Self-directed coding",
      "Sharing and feedback",
    ],
    tools: ["Scratch", "Code Club projects"],
    finalProjectTitle: "My Coding Challenge Collection",
    finalProjectDescription:
      "Combine your three favourite challenge projects into a single showcase that visitors can click through and explore.",
    referenceKeys: ["scratch", "code-club", "raspberry-pi"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Get Creative",
        lessons: [
          { title: "Coding as a Creative Tool", isFree: true },
          { title: "The Animation Challenge", isFree: true },
          { title: "The Remix Challenge", isFree: true },
        ],
      },
      {
        title: "Make It Yours",
        lessons: [
          { title: "The Story Challenge" },
          { title: "The Surprise Challenge" },
          { title: "Sharing Your Creations" },
        ],
      },
    ],
  },
  {
    slug: "creative-coder-final-project",
    title: "Creative Coder Final Project",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "A capstone project where kids plan, build, and present a complete coding creation of their choice.",
    parentSummary:
      "This capstone lets your child pull together everything they have learned into one original software project, built entirely in the browser. There is no hardware component at any stage. They experience the full creative process, from planning to building to presenting, just like real developers.",
    studentSummary:
      "You become the boss of your own big coding project and show it off to the world!",
    skills: [
      "Project planning",
      "Independent coding",
      "Debugging",
      "Presentation skills",
      "Reflection and iteration",
    ],
    tools: ["Scratch", "Code.org"],
    finalProjectTitle: "My Signature Coding Project",
    finalProjectDescription:
      "Plan, build, and present an original Scratch project of your own design, then explain how you made it and what you learned.",
    referenceKeys: ["scratch", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Plan Your Project",
        lessons: [
          { title: "Choosing Your Big Idea", isFree: true },
          { title: "Sketching Your Plan", isFree: true },
          { title: "Gathering Your Sprites and Sounds", isFree: true },
        ],
      },
      {
        title: "Build and Present",
        lessons: [
          { title: "Coding Your Project" },
          { title: "Testing and Polishing" },
          { title: "Presenting to an Audience" },
        ],
      },
    ],
  },
  {
    slug: "character-movement-controls",
    title: "Character Movement and Controls",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Kids learn to make game characters move smoothly and respond to player input using code.",
    parentSummary:
      "This course focuses on one of the most exciting parts of game-making: making a character respond to the player. Everything is done in free browser-based coding software with no hardware or controllers needed. Your child learns the techniques used in real games to create smooth, responsive movement.",
    studentSummary:
      "You make a character zoom, jump, and turn exactly when you press the keys!",
    skills: [
      "Keyboard and mouse input",
      "Sprite movement",
      "Coordinates and direction",
      "Smooth animation",
      "Testing controls",
    ],
    tools: ["Scratch", "MakeCode"],
    finalProjectTitle: "The Controllable Hero",
    finalProjectDescription:
      "Code a character that the player can move in every direction with the keyboard, including running, turning, and jumping.",
    referenceKeys: ["scratch", "makecode"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Moving Your Character",
        lessons: [
          { title: "Coordinates and the Stage", isFree: true },
          { title: "Moving with Arrow Keys", isFree: true },
          { title: "Turning and Facing Directions", isFree: true },
        ],
      },
      {
        title: "Smooth and Responsive",
        lessons: [
          { title: "Adding Jumping and Speed" },
          { title: "Making Movement Feel Smooth" },
          { title: "Testing Your Controls" },
        ],
      },
    ],
  },
  {
    slug: "events-conditions-scoring",
    title: "Events, Conditions, and Scoring",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Kids learn how events, if-then logic, and scoring systems make games react and reward players.",
    parentSummary:
      "This course teaches the decision-making logic that powers interactive software, all through free browser-based coding tools. No hardware or kits are required at any point. Your child learns to make programs react to what the player does and to keep track of points and progress.",
    studentSummary:
      "You teach your game to react, react, react, and rack up points every time you win!",
    skills: [
      "Event handling",
      "If-then conditions",
      "Variables for scoring",
      "Boolean logic",
      "Game state tracking",
    ],
    tools: ["Scratch", "MakeCode"],
    finalProjectTitle: "The Smart Scoring Game",
    finalProjectDescription:
      "Build a game that uses events and if-then rules to award points, trigger reactions, and decide when the player wins.",
    referenceKeys: ["scratch", "makecode"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Making Things React",
        lessons: [
          { title: "What Is an Event?", isFree: true },
          { title: "If-Then Decisions", isFree: true },
          { title: "Combining Conditions", isFree: true },
        ],
      },
      {
        title: "Keeping Score",
        lessons: [
          { title: "Counting Points with Variables" },
          { title: "Showing the Score on Screen" },
          { title: "Deciding the Winner" },
        ],
      },
    ],
  },
  {
    slug: "build-a-multi-level-game",
    title: "Build a Multi-Level Game",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Kids design a game with multiple levels that get harder as the player progresses.",
    parentSummary:
      "This course challenges your child to think like a game designer by building a game with several connected levels, all in free browser-based software. There is no hardware or downloadable kit involved. They learn how to manage game flow, increase difficulty, and keep players engaged across an entire game.",
    studentSummary:
      "You build a game with levels that get trickier and trickier as players climb higher!",
    skills: [
      "Level design",
      "Game state management",
      "Difficulty progression",
      "Backdrop switching",
      "Reusing and organising code",
    ],
    tools: ["Scratch", "MakeCode"],
    finalProjectTitle: "My Three-Level Adventure",
    finalProjectDescription:
      "Create a game with at least three levels, each with its own backdrop and a rising challenge that leads to a final win.",
    referenceKeys: ["scratch", "makecode"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Designing Levels",
        lessons: [
          { title: "What Makes a Good Level?", isFree: true },
          { title: "Switching Backdrops and Scenes", isFree: true },
          { title: "Tracking Which Level You Are On", isFree: true },
        ],
      },
      {
        title: "Building the Adventure",
        lessons: [
          { title: "Making Levels Harder" },
          { title: "Adding a Final Boss or Goal" },
          { title: "Connecting It All Together" },
        ],
      },
    ],
  },
  {
    slug: "creative-coding-game-showcase",
    title: "Creative Coding Game Showcase",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "A capstone where kids finish, polish, and present a complete original game to an audience.",
    parentSummary:
      "This capstone gives your child the chance to complete and showcase a game they are proud of, built entirely with free browser-based software. No hardware is required at any stage. They practise the full game-development cycle, from finishing touches to presenting their work to others.",
    studentSummary:
      "You polish up your very own game and put it on the big stage for everyone to play!",
    skills: [
      "Game completion",
      "Playtesting and feedback",
      "Polishing and debugging",
      "Presentation skills",
      "Reflection",
    ],
    tools: ["Scratch", "Code Club projects"],
    finalProjectTitle: "My Showcase Game",
    finalProjectDescription:
      "Finish, polish, and present an original game, gathering feedback from playtesters and sharing what you learned.",
    referenceKeys: ["scratch", "code-club"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Finishing Your Game",
        lessons: [
          { title: "From Prototype to Polished", isFree: true },
          { title: "Playtesting with Others", isFree: true },
          { title: "Fixing the Final Bugs", isFree: true },
        ],
      },
      {
        title: "The Showcase",
        lessons: [
          { title: "Writing Your Game Instructions" },
          { title: "Designing a Title Screen" },
          { title: "Presenting Your Showcase Game" },
        ],
      },
    ],
  },
  {
    slug: "scratch-creative-projects",
    title: "Scratch Creative Projects",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Kids explore a variety of fun mini-projects that show off different things Scratch can do.",
    parentSummary:
      "This course is a playful tour through many kinds of Scratch projects, from animations to quizzes to mini-games, all in free browser-based software. No hardware or kits are needed. Your child discovers the breadth of what coding can create and finds the styles they enjoy most.",
    studentSummary:
      "You try out tons of cool mini-projects and find your favourite kind of coding!",
    skills: [
      "Creative coding",
      "Animation",
      "Interactive quizzes",
      "Sound and music coding",
      "Project remixing",
    ],
    tools: ["Scratch", "Code Club projects"],
    finalProjectTitle: "My Project Sampler",
    finalProjectDescription:
      "Build a menu that links to three different mini-projects you created, showing off your range of coding skills.",
    referenceKeys: ["scratch", "raspberry-pi", "code-club"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Mini-Project Tour",
        lessons: [
          { title: "An Animated Greeting Card", isFree: true },
          { title: "A Clickable Quiz", isFree: true },
          { title: "A Music Maker", isFree: true },
        ],
      },
      {
        title: "Make and Remix",
        lessons: [
          { title: "A Simple Catch Game" },
          { title: "Remixing Someone Else's Project" },
          { title: "Building Your Project Menu" },
        ],
      },
    ],
  },
  {
    slug: "build-your-first-coding-game",
    title: "Build Your First Coding Game",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "CODING",
    description:
      "A gentle, step-by-step path to building a first complete game from start to finish.",
    parentSummary:
      "This course walks your child through building a full game one clear step at a time, using only free browser-based software with no hardware. It is designed for first-time game makers, so every concept is introduced gently. By the end your child has a finished game they coded themselves.",
    studentSummary:
      "You follow easy steps and end up with a real game you built all by yourself!",
    skills: [
      "Step-by-step coding",
      "Sprite control",
      "Simple game rules",
      "Adding sound effects",
      "Testing and finishing",
    ],
    tools: ["Scratch", "MakeCode"],
    finalProjectTitle: "My First Complete Game",
    finalProjectDescription:
      "Follow the build steps to create your own finished game with a player, a goal, sound, and a way to win.",
    referenceKeys: ["scratch", "makecode", "code-club"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Starting Your Game",
        lessons: [
          { title: "Choosing Your Game Idea", isFree: true },
          { title: "Setting Up the Player", isFree: true },
          { title: "Adding the Goal", isFree: true },
        ],
      },
      {
        title: "Finishing Your Game",
        lessons: [
          { title: "Adding Sound Effects" },
          { title: "Making It Winnable" },
          { title: "Testing and Sharing" },
        ],
      },
    ],
  },
  {
    slug: "creative-coding-showcase",
    title: "Creative Coding Showcase",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "A capstone where kids gather their best coding work into a polished personal showcase.",
    parentSummary:
      "This capstone helps your child curate and present their favourite coding projects in one place, all built with free browser-based software. No hardware is involved at any point. They learn to reflect on their growth as a coder and to present their work with confidence.",
    studentSummary:
      "You gather your coolest coding creations into one awesome showcase to share!",
    skills: [
      "Curating projects",
      "Polishing and debugging",
      "Reflection",
      "Presentation skills",
      "Organising work",
    ],
    tools: ["Scratch", "Code Club projects"],
    finalProjectTitle: "My Coding Portfolio Showcase",
    finalProjectDescription:
      "Create an interactive showcase that links to your best projects and includes a short reflection on what you learned.",
    referenceKeys: ["raspberry-pi", "code-club", "scratch"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Choosing Your Best Work",
        lessons: [
          { title: "Looking Back at Your Projects", isFree: true },
          { title: "Picking Your Favourites", isFree: true },
          { title: "Polishing Them Up", isFree: true },
        ],
      },
      {
        title: "Building the Showcase",
        lessons: [
          { title: "Designing a Welcome Screen" },
          { title: "Linking Your Projects Together" },
          { title: "Presenting Your Showcase" },
        ],
      },
    ],
  },
  {
    slug: "coding-starter-final-project",
    title: "Coding Starter Final Project",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "A capstone that brings together early coding skills into one complete beginner-friendly project.",
    parentSummary:
      "This capstone lets your child apply their foundational coding skills in a single guided project, using only free browser-based software. There is no hardware requirement at any step. It celebrates how far your child has come and gives them a finished project to be proud of.",
    studentSummary:
      "You put all your new coding skills together to make one project you can show off!",
    skills: [
      "Applying core concepts",
      "Project planning",
      "Sequencing and loops",
      "Debugging",
      "Presentation",
    ],
    tools: ["ScratchJr", "Scratch"],
    finalProjectTitle: "My Starter Capstone",
    finalProjectDescription:
      "Plan and build a complete beginner project that uses sequencing, loops, and events, then share it with your class.",
    referenceKeys: ["scratchjr", "scratch", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Planning Your Capstone",
        lessons: [
          { title: "Reviewing What You Know", isFree: true },
          { title: "Choosing Your Project Idea", isFree: true },
          { title: "Making a Build Plan", isFree: true },
        ],
      },
      {
        title: "Building and Sharing",
        lessons: [
          { title: "Coding Your Capstone" },
          { title: "Testing and Fixing" },
          { title: "Sharing Your Work" },
        ],
      },
    ],
  },
  {
    slug: "music-sound-interaction",
    title: "Music, Sound, and Interaction",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "ARTS",
    description:
      "Kids code interactive music and sound projects that respond to clicks, keys, and movement.",
    parentSummary:
      "This course blends creativity and coding as your child builds interactive musical projects, all in free browser-based software with no instruments or hardware needed. They explore rhythm, sound, and interactivity through code. It is a joyful way to connect the arts with computational thinking.",
    studentSummary:
      "You code your own beats and sounds that play when you click, tap, and press keys!",
    skills: [
      "Coding with sound blocks",
      "Rhythm and timing",
      "Interactive design",
      "Event handling",
      "Creative expression",
    ],
    tools: ["Scratch", "Code.org"],
    finalProjectTitle: "My Interactive Music Machine",
    finalProjectDescription:
      "Build an interactive music project where different keys and clicks play sounds, beats, and melodies you choose.",
    referenceKeys: ["scratch", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Making Sounds with Code",
        lessons: [
          { title: "Playing Your First Notes", isFree: true },
          { title: "Building a Beat", isFree: true },
          { title: "Triggering Sounds with Clicks", isFree: true },
        ],
      },
      {
        title: "Interactive Music",
        lessons: [
          { title: "Mapping Sounds to Keys" },
          { title: "Adding Visual Effects" },
          { title: "Building Your Music Machine" },
        ],
      },
    ],
  },
  {
    slug: "digital-creativity-final-showcase",
    title: "Digital Creativity Final Showcase",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    category: "ARTS",
    description:
      "A capstone where kids combine art, sound, and code into a single creative digital showcase.",
    parentSummary:
      "This capstone celebrates your child's creative side, bringing together animation, sound, and interactivity in one project built with free browser-based software. No hardware or kits are needed. Your child experiences the satisfaction of completing and sharing an artistic coding project.",
    studentSummary:
      "You mix art, sound, and code into one dazzling creation to show everyone!",
    skills: [
      "Combining art and code",
      "Sound integration",
      "Interactive design",
      "Project planning",
      "Presentation",
    ],
    tools: ["Scratch", "Code.org"],
    finalProjectTitle: "My Creative Showcase",
    finalProjectDescription:
      "Create an interactive digital artwork that combines animation, sound, and user interaction, then present it to others.",
    referenceKeys: ["scratch", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Planning Your Creation",
        lessons: [
          { title: "Dreaming Up Your Idea", isFree: true },
          { title: "Choosing Art and Sounds", isFree: true },
          { title: "Sketching Your Showcase", isFree: true },
        ],
      },
      {
        title: "Building and Sharing",
        lessons: [
          { title: "Coding the Interactivity" },
          { title: "Adding the Final Touches" },
          { title: "Presenting Your Showcase" },
        ],
      },
    ],
  },
  {
    slug: "math-patterns-and-games",
    title: "Math Patterns and Games",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "MATH",
    description:
      "Kids explore numbers, patterns, and shapes by coding playful math games and puzzles.",
    parentSummary:
      "This course makes maths exciting by turning numbers and patterns into interactive games your child codes in free browser-based software. There is no hardware required, just a device and curiosity. Your child strengthens key maths skills while seeing how maths and coding work hand in hand.",
    studentSummary:
      "You turn numbers and patterns into fun games you get to play and win!",
    skills: [
      "Number patterns",
      "Coordinates and shapes",
      "Logical reasoning",
      "Counting and operations",
      "Coding math rules",
    ],
    tools: ["Code.org", "Scratch"],
    finalProjectTitle: "My Math Pattern Game",
    finalProjectDescription:
      "Build a game that challenges players to spot, continue, or create number and shape patterns to score points.",
    referenceKeys: ["ck12", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Patterns and Numbers",
        lessons: [
          { title: "Spotting Patterns Everywhere", isFree: true },
          { title: "Coding a Counting Game", isFree: true },
          { title: "Drawing Shapes with Code", isFree: true },
        ],
      },
      {
        title: "Math Games",
        lessons: [
          { title: "A Quick Math Quiz Game" },
          { title: "A Pattern Challenge Game" },
          { title: "Building Your Math Game" },
        ],
      },
    ],
  },
  {
    slug: "engineering-thinking-for-kids",
    title: "Engineering Thinking for Kids",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "ENGINEERING",
    description:
      "Kids learn the engineering design process by planning, building, and improving digital solutions.",
    parentSummary:
      "This course introduces your child to how engineers think, using on-screen design challenges in free browser-based software with no physical materials or kits. They learn to define problems, plan solutions, and improve their designs through testing. It builds a problem-solving mindset they can use anywhere.",
    studentSummary:
      "You think like an engineer, designing and improving cool solutions right on the screen!",
    skills: [
      "Engineering design process",
      "Planning and prototyping",
      "Testing and improving",
      "Problem definition",
      "Iterative thinking",
    ],
    tools: ["Code.org", "Scratch"],
    finalProjectTitle: "My Digital Design Challenge",
    finalProjectDescription:
      "Use the engineering design process to plan, build, and improve a digital solution to a problem you choose.",
    referenceKeys: ["code-org", "smithsonian-ssec"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "How Engineers Think",
        lessons: [
          { title: "What Is the Design Process?", isFree: true },
          { title: "Defining the Problem", isFree: true },
          { title: "Planning a Solution", isFree: true },
        ],
      },
      {
        title: "Build and Improve",
        lessons: [
          { title: "Building Your First Version" },
          { title: "Testing and Finding Flaws" },
          { title: "Improving Your Design" },
        ],
      },
    ],
  },
  {
    slug: "digital-experiment-report-project",
    title: "Digital Experiment Report Project",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "A capstone where kids run virtual science experiments and write up their findings digitally.",
    parentSummary:
      "This capstone lets your child act like a real scientist using free online simulations, with no lab equipment or kits required. They run virtual experiments, collect results, and document what they discover. It strengthens scientific thinking and communication in a fully digital format.",
    studentSummary:
      "You run cool virtual experiments and write up what you discovered like a real scientist!",
    skills: [
      "Scientific method",
      "Running simulations",
      "Recording observations",
      "Drawing conclusions",
      "Science communication",
    ],
    tools: ["PhET", "CK-12"],
    finalProjectTitle: "My Experiment Report",
    finalProjectDescription:
      "Run a virtual experiment using an online simulation, record your results, and create a digital report of your findings.",
    referenceKeys: ["phet", "ck12", "smithsonian-ssec"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "LEARNER",
    modules: [
      {
        title: "Thinking Like a Scientist",
        lessons: [
          { title: "What Is an Experiment?", isFree: true },
          { title: "Making a Hypothesis", isFree: true },
          { title: "Using a Virtual Simulation", isFree: true },
        ],
      },
      {
        title: "Reporting Your Findings",
        lessons: [
          { title: "Collecting and Recording Data" },
          { title: "Drawing Conclusions" },
          { title: "Writing Your Report" },
        ],
      },
    ],
  },
  {
    slug: "scratch-game-studio",
    title: "Scratch Game Studio",
    ageGroup: "AGES_8_10",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Kids run their own game studio, designing and coding a portfolio of original Scratch games.",
    parentSummary:
      "Your child becomes the founder of their own virtual game studio, designing and coding multiple games in free browser-based Scratch. No hardware, consoles, or kits are required. They learn both the creative and technical sides of making games while building a small portfolio.",
    studentSummary:
      "You run your own game studio and build a whole collection of awesome games!",
    skills: [
      "Game design",
      "Sprite and animation control",
      "Scoring and levels",
      "Iterative development",
      "Portfolio building",
    ],
    tools: ["Scratch", "Tynker"],
    finalProjectTitle: "My Game Studio Portfolio",
    finalProjectDescription:
      "Design, code, and present a small portfolio of original games that show off your range as a game maker.",
    referenceKeys: ["scratch", "tynker"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "animation-storytelling-scratch",
    title: "Animation & Storytelling with Scratch",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "ARTS",
    description:
      "Kids bring stories to life by coding animated characters, scenes, and dialogue in Scratch.",
    parentSummary:
      "This course blends storytelling and coding as your child animates original tales in free browser-based Scratch. There is no hardware involved at any stage. They develop both creative writing and coding skills while producing animated stories they can share.",
    studentSummary:
      "You bring your stories to life with animated characters that move and talk!",
    skills: [
      "Animation",
      "Storytelling and dialogue",
      "Scene transitions",
      "Character design",
      "Timing and sequencing",
    ],
    tools: ["Scratch", "Code.org"],
    finalProjectTitle: "My Animated Story",
    finalProjectDescription:
      "Write and code an animated multi-scene story with characters that move, talk, and react across the stage.",
    referenceKeys: ["scratch", "code-org"],
    existing: true,
    contentStatus: "NEEDS_REVIEW",
    adminNotes:
      "Maps to master 'Scratch Animation Studio'. DRAFT placeholder pending curriculum.",
  },
  {
    slug: "media-smart-kids",
    title: "Media Smart Kids",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "TECHNOLOGY",
    description:
      "Kids learn to navigate the digital world safely, think critically, and use technology responsibly.",
    parentSummary:
      "This course helps your child become a thoughtful, safe, and confident user of technology, all through software-based lessons and activities with no hardware needed. They learn about online safety, recognising reliable information, and being kind online. It is essential digital-citizenship knowledge for growing up in a connected world.",
    studentSummary:
      "You become a smart, safe, and savvy explorer of the online world!",
    skills: [
      "Online safety",
      "Critical thinking about media",
      "Digital citizenship",
      "Recognising reliable sources",
      "Responsible technology use",
    ],
    tools: ["Code.org"],
    finalProjectTitle: "My Digital Safety Guide",
    finalProjectDescription:
      "Create a digital guide that teaches other kids your top tips for staying safe and smart online.",
    referenceKeys: ["code-org"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "junior-robotics-automation",
    title: "Virtual Robotics & Simulation",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "ROBOTICS",
    description:
      "Kids program and control virtual robots in an online simulator without any physical hardware.",
    parentSummary:
      "Your child explores robotics entirely through free online simulators, programming virtual robots without ever needing a physical robot or kit. They learn the same coding and control concepts used in real robotics, all on screen. It is a safe, affordable, and fully digital way to discover robotics.",
    studentSummary:
      "You program robots and watch them zoom around, all on your screen with no kit needed!",
    skills: [
      "Robot programming logic",
      "Sequencing commands",
      "Sensors in simulation",
      "Loops and conditions",
      "Debugging robot behaviour",
    ],
    tools: ["MakeCode", "Create & Learn"],
    finalProjectTitle: "My Virtual Robot Mission",
    finalProjectDescription:
      "Program a simulated robot to complete a mission, navigating obstacles and reacting to its environment on screen.",
    referenceKeys: ["create-learn", "makecode", "microbit"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
    adminNotes:
      "Maps to master 'Virtual Robotics and Simulation Basics'. Simulator-first, no hardware.",
  },
  {
    slug: "digital-stem-experiments",
    title: "Digital STEM Experiments",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "SCIENCE",
    description:
      "Kids explore science and math concepts through hands-on virtual experiments and simulations.",
    parentSummary:
      "This course lets your child experiment with science and maths ideas using free online simulations, with no lab kit or physical materials required. They observe, test, and discover STEM concepts safely on screen. It builds curiosity and scientific thinking through interactive digital play.",
    studentSummary:
      "You run amazing science experiments on screen and discover how the world works!",
    skills: [
      "Scientific inquiry",
      "Using simulations",
      "Observation and measurement",
      "Hypothesis testing",
      "Connecting science and math",
    ],
    tools: ["PhET", "CK-12"],
    finalProjectTitle: "My STEM Discovery",
    finalProjectDescription:
      "Choose a science question, explore it using an online simulation, and present what you discovered.",
    referenceKeys: ["phet", "ck12"],
    existing: true,
    contentStatus: "NEEDS_REVIEW",
    adminNotes: "Maps to master 'Digital STEM Challenges'. DRAFT placeholder.",
  },
  {
    slug: "block-robotics-sim",
    title: "Block Robotics Simulator",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "ROBOTICS",
    description:
      "Kids use block-based coding to program virtual robots in an online simulator.",
    parentSummary:
      "Your child programs simulated robots using friendly drag-and-drop code blocks in free browser-based software, with no physical robot or kit required. They learn robotics control concepts in a forgiving, on-screen environment. It is an accessible, fully digital introduction to robotics coding.",
    studentSummary:
      "You snap together code blocks to make virtual robots do exactly what you want!",
    skills: [
      "Block-based coding",
      "Robot control logic",
      "Sequencing and loops",
      "Simulated sensors",
      "Debugging",
    ],
    tools: ["MakeCode", "Create & Learn"],
    finalProjectTitle: "My Block Robot Challenge",
    finalProjectDescription:
      "Use block-based code to program a simulated robot to complete a multi-step challenge course.",
    referenceKeys: ["makecode", "microbit", "create-learn"],
    existing: true,
    contentStatus: "NEEDS_REVIEW",
    adminNotes: "DRAFT placeholder. Simulator-first, no hardware.",
  },
  {
    slug: "logic-problem-solving",
    title: "Logic & Problem Solving",
    ageGroup: "AGES_8_10",
    level: "BEGINNER",
    category: "CODING",
    description:
      "Kids sharpen their logical thinking by solving coding puzzles and computational challenges.",
    parentSummary:
      "This course strengthens your child's logical-reasoning and problem-solving skills through free browser-based coding puzzles, with no hardware needed. They learn to think methodically, spot patterns, and work through challenges step by step. These are foundational skills for both coding and everyday problem solving.",
    studentSummary:
      "You become a logic master, cracking puzzle after puzzle with smart thinking!",
    skills: [
      "Logical reasoning",
      "Pattern recognition",
      "Algorithmic thinking",
      "Decomposition",
      "Debugging",
    ],
    tools: ["Code.org", "Scratch"],
    finalProjectTitle: "My Logic Puzzle Pack",
    finalProjectDescription:
      "Design a small pack of logic puzzles for others to solve, then explain the reasoning behind each one.",
    referenceKeys: ["code-org", "raspberry-pi"],
    existing: true,
    contentStatus: "NEEDS_REVIEW",
    adminNotes:
      "Maps to master 'Logic Puzzles and Problem Solving'. DRAFT placeholder.",
  },
];
