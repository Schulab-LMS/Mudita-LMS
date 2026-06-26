import type { CatalogCourse } from "./types";

export const COURSES_AGES_11_13: CatalogCourse[] = [
  {
    slug: "coding-logic-scratch-blocks",
    title: "Coding Logic with Scratch and Blocks",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Build a solid foundation in programming logic using block-based tools to master sequencing, loops, and conditionals.",
    parentSummary:
      "Your child moves beyond drag-and-drop play into structured computational thinking. They learn the core building blocks of every programming language—loops, conditionals, variables, and events—through visual block coding. By the end they can read, debug, and design their own multi-step programs.",
    studentSummary:
      "You'll snap blocks together to make characters think, loop, and make decisions all on their own!",
    skills: [
      "Sequencing and ordering instructions",
      "Loops and repetition",
      "Conditional logic (if/then)",
      "Using variables to store data",
      "Debugging and testing programs",
    ],
    tools: ["Scratch", "Code.org App Lab", "MakeCode editor"],
    finalProjectTitle: "Interactive Logic Puzzle",
    finalProjectDescription:
      "Design a block-based puzzle game that uses loops, variables, and at least three conditional rules to challenge a player.",
    referenceKeys: ["scratch", "code-org", "makecode"],
    requiredPlan: "LEARNER",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Logic Foundations",
        lessons: [
          { title: "Thinking in Sequences", isFree: true },
          { title: "Loops That Repeat", isFree: true },
          { title: "Making Decisions with Conditionals", isFree: true },
        ],
      },
      {
        title: "Variables and Debugging",
        lessons: [
          { title: "Storing Data in Variables" },
          { title: "Finding and Fixing Bugs" },
          { title: "Putting Logic Together" },
        ],
      },
    ],
  },
  {
    slug: "game-design-level-2",
    title: "Game Design Level 2",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Level up your game-making skills with scoring systems, multiple levels, and game physics in a block coding environment.",
    parentSummary:
      "Building on basic game concepts, this course teaches your child how real games are engineered. They explore sprite collisions, scoring logic, win/lose conditions, and level progression. The result is a polished, multi-level game they design and code themselves.",
    studentSummary:
      "You'll build a real game with levels, a score counter, and enemies that actually fight back!",
    skills: [
      "Sprite and collision logic",
      "Scoring and game state",
      "Designing multiple levels",
      "Win and lose conditions",
      "Playtesting and iteration",
    ],
    tools: ["MakeCode Arcade", "Scratch", "Tynker"],
    finalProjectTitle: "Multi-Level Arcade Game",
    finalProjectDescription:
      "Create a playable game with at least two levels, a working score system, and clear win and lose conditions.",
    referenceKeys: ["makecode", "scratch", "tynker"],
    requiredPlan: "LEARNER",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Game Mechanics",
        lessons: [
          { title: "Sprites and Collisions", isFree: true },
          { title: "Building a Score System", isFree: true },
          { title: "Win and Lose Conditions", isFree: true },
        ],
      },
      {
        title: "Levels and Polish",
        lessons: [
          { title: "Designing Multiple Levels" },
          { title: "Adding Difficulty and Balance" },
          { title: "Playtesting Your Game" },
        ],
      },
    ],
  },
  {
    slug: "ai-basics-young-innovators",
    title: "AI Basics for Young Innovators",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "AI",
    description:
      "Discover how artificial intelligence learns, recognizes patterns, and makes predictions through hands-on browser activities.",
    parentSummary:
      "This course demystifies artificial intelligence for young learners. Your child explores how machines are trained on data, how image and text recognition works, and where AI shows up in everyday life. They build their own simple AI model and learn to think critically about how it makes decisions.",
    studentSummary:
      "You'll train a computer to recognize things and watch it get smarter the more you teach it!",
    skills: [
      "How machine learning works",
      "Training models with data",
      "Pattern recognition concepts",
      "Identifying AI in daily life",
      "Critical thinking about AI decisions",
    ],
    tools: ["Code.org AI Lab", "Create & Learn online classroom", "Tynker"],
    finalProjectTitle: "My First Trained AI Model",
    finalProjectDescription:
      "Train a simple browser-based AI model to classify images or text and explain how the training data shaped its results.",
    referenceKeys: ["code-org", "create-learn", "tynker"],
    requiredPlan: "PRO",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "What Is AI?",
        lessons: [
          { title: "AI All Around Us", isFree: true },
          { title: "How Machines Learn", isFree: true },
          { title: "Patterns and Data", isFree: true },
        ],
      },
      {
        title: "Training a Model",
        lessons: [
          { title: "Collecting Good Training Data" },
          { title: "Teaching a Model to Classify" },
          { title: "Testing and Improving Your Model" },
        ],
      },
    ],
  },
  {
    slug: "web-basics-build-your-first-page",
    title: "Web Basics: Build Your First Page",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Learn how the web works and build your very first web page using HTML structure and basic styling.",
    parentSummary:
      "Your child takes their first step into web development by learning how websites are structured and displayed. They write real HTML to create headings, links, images, and lists, then add simple styling. By the end they have published their own personal web page.",
    studentSummary:
      "You'll write real code and watch your very own web page appear on the screen!",
    skills: [
      "How the web works",
      "HTML structure and tags",
      "Adding links and images",
      "Basic page styling",
      "Organizing content clearly",
    ],
    tools: ["Khan Academy computing editor", "Code.org Web Lab"],
    finalProjectTitle: "My Personal Web Page",
    finalProjectDescription:
      "Build a single web page about yourself using headings, a list, an image, and at least one working link.",
    referenceKeys: ["khan-computing", "code-org"],
    requiredPlan: "LEARNER",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "How the Web Works",
        lessons: [
          { title: "From Browser to Web Page", isFree: true },
          { title: "Your First HTML Tags", isFree: true },
          { title: "Headings, Lists, and Text", isFree: true },
        ],
      },
      {
        title: "Building a Page",
        lessons: [
          { title: "Adding Links and Images" },
          { title: "Styling Your Page" },
          { title: "Publishing Your Web Page" },
        ],
      },
    ],
  },
  {
    slug: "app-design-thinking-for-kids",
    title: "App Design Thinking for Kids",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Use the design thinking process to imagine, prototype, and build a simple mobile app that solves a real problem.",
    parentSummary:
      "This course blends creativity with coding as your child learns to think like an app designer. They follow the design thinking cycle—empathize, define, ideate, prototype, and test—to plan a useful app. Then they build a working prototype in a beginner-friendly block-based app builder.",
    studentSummary:
      "You'll dream up an app idea and actually build it into a working prototype you can show off!",
    skills: [
      "Design thinking process",
      "Identifying user needs",
      "Prototyping interfaces",
      "Block-based app building",
      "User testing and feedback",
    ],
    tools: ["MIT App Inventor", "Code.org App Lab"],
    finalProjectTitle: "Problem-Solving App Prototype",
    finalProjectDescription:
      "Design and build a working app prototype that solves a real problem you identified through user research.",
    referenceKeys: ["app-inventor", "code-org"],
    requiredPlan: "LEARNER",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Thinking Like a Designer",
        lessons: [
          { title: "What Is Design Thinking?", isFree: true },
          { title: "Finding a Problem to Solve", isFree: true },
          { title: "Sketching Your App Idea", isFree: true },
        ],
      },
      {
        title: "Building the Prototype",
        lessons: [
          { title: "Designing the Screens" },
          { title: "Making Buttons Work" },
          { title: "Testing with Real Users" },
        ],
      },
    ],
  },
  {
    slug: "stem-builder-final-project",
    title: "STEM Builder Final Project",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "SCIENCE",
    description:
      "Apply coding, science, and engineering skills together in a capstone project that connects multiple STEM disciplines.",
    parentSummary:
      "This capstone challenges your child to combine everything they have learned across STEM into one integrated project. They investigate a science question, model it digitally, and use code to bring their solution to life. It builds independence, planning, and cross-disciplinary thinking.",
    studentSummary:
      "You'll mash up science, code, and engineering into one awesome project that's totally your own!",
    skills: [
      "Cross-disciplinary problem solving",
      "Project planning and scoping",
      "Digital science modeling",
      "Applying code to real problems",
      "Presenting findings clearly",
    ],
    tools: ["Code.org App Lab", "PhET simulations", "NASA Space Place activities"],
    finalProjectTitle: "Integrated STEM Showcase",
    finalProjectDescription:
      "Build a capstone project that combines a coded element, a science concept, and an engineering idea, then present how they connect.",
    referenceKeys: ["code-org", "phet", "nasa-space-place"],
    requiredPlan: "LEARNER",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Planning Your Project",
        lessons: [
          { title: "Choosing a STEM Challenge", isFree: true },
          { title: "Researching with Simulations", isFree: true },
          { title: "Mapping Out Your Build", isFree: true },
        ],
      },
      {
        title: "Build and Showcase",
        lessons: [
          { title: "Coding Your Solution" },
          { title: "Connecting Science and Engineering" },
          { title: "Presenting Your Showcase" },
        ],
      },
    ],
  },
  {
    slug: "ai-art-creative-tools",
    title: "AI Art and Creative Tools",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "AI",
    description:
      "Explore how AI generates images, music, and stories while creating your own digital art with creative AI tools.",
    parentSummary:
      "Your child discovers the creative side of artificial intelligence in this hands-on course. They learn how generative AI produces images and media, experiment with creative tools, and explore the ideas of originality and authorship. The course balances fun creation with thoughtful discussion about AI-made art.",
    studentSummary:
      "You'll team up with AI to make wild art, music, and stories no one has ever seen before!",
    skills: [
      "How generative AI works",
      "Creating with AI tools",
      "Guiding AI output with input",
      "Understanding originality and authorship",
      "Combining human and AI creativity",
    ],
    tools: ["Create & Learn online classroom", "Tynker"],
    finalProjectTitle: "AI-Assisted Art Gallery",
    finalProjectDescription:
      "Create a small gallery of AI-assisted artworks and write about how you guided the tools and what made each piece your own.",
    referenceKeys: ["create-learn", "tynker"],
    requiredPlan: "PRO",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Creative AI Basics",
        lessons: [
          { title: "How AI Makes Art", isFree: true },
          { title: "Your First AI Creation", isFree: true },
          { title: "Guiding the AI", isFree: true },
        ],
      },
      {
        title: "Building Your Gallery",
        lessons: [
          { title: "Mixing Human and AI Ideas" },
          { title: "Curating Your Best Work" },
          { title: "Sharing Your Gallery" },
        ],
      },
    ],
  },
  {
    slug: "data-patterns-ml-basics",
    title: "Data, Patterns, and Machine Learning Basics",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "AI",
    description:
      "Learn how computers find patterns in data and use them to make predictions through interactive machine learning activities.",
    parentSummary:
      "This course introduces your child to the data science behind machine learning. They collect and organize data, spot patterns, and see how those patterns power predictions. Through visual, browser-based activities they build intuition for how AI systems learn from examples.",
    studentSummary:
      "You'll hunt for hidden patterns in data and use them to teach a computer to predict what comes next!",
    skills: [
      "Collecting and organizing data",
      "Spotting patterns in data",
      "How predictions are made",
      "Training and testing concepts",
      "Reading simple charts and results",
    ],
    tools: ["Code.org AI Lab", "Create & Learn online classroom", "Tynker"],
    finalProjectTitle: "Pattern Prediction Project",
    finalProjectDescription:
      "Gather a small dataset, identify a pattern, and use a browser-based tool to make and test a prediction from it.",
    referenceKeys: ["code-org", "create-learn", "tynker"],
    requiredPlan: "PRO",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Working with Data",
        lessons: [
          { title: "What Is Data?", isFree: true },
          { title: "Organizing and Sorting Data", isFree: true },
          { title: "Finding Patterns", isFree: true },
        ],
      },
      {
        title: "Making Predictions",
        lessons: [
          { title: "From Patterns to Predictions" },
          { title: "Training and Testing" },
          { title: "Checking Your Results" },
        ],
      },
    ],
  },
  {
    slug: "responsible-ai-digital-ethics",
    title: "Responsible AI and Digital Ethics",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "AI",
    description:
      "Explore fairness, bias, privacy, and responsibility so you can use and build AI thoughtfully and ethically.",
    parentSummary:
      "As AI becomes part of daily life, this course helps your child become a thoughtful digital citizen. They examine real cases of AI bias, privacy, and misinformation, and discuss how to use technology responsibly. The course builds the judgment and ethics that should guide every young technologist.",
    studentSummary:
      "You'll become an AI detective who spots when technology is unfair and figures out how to make it better!",
    skills: [
      "Recognizing AI bias",
      "Understanding data privacy",
      "Spotting misinformation",
      "Ethical decision making",
      "Responsible digital citizenship",
    ],
    tools: ["Code.org AI Lab"],
    finalProjectTitle: "Responsible AI Charter",
    finalProjectDescription:
      "Write and illustrate a charter of rules for using and building AI fairly, using examples of bias and privacy you studied.",
    referenceKeys: ["code-org"],
    requiredPlan: "PRO",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "AI and Fairness",
        lessons: [
          { title: "When AI Gets It Wrong", isFree: true },
          { title: "Understanding Bias", isFree: true },
          { title: "Privacy and Your Data", isFree: true },
        ],
      },
      {
        title: "Being a Responsible Builder",
        lessons: [
          { title: "Spotting Misinformation" },
          { title: "Making Ethical Choices" },
          { title: "Writing Your AI Charter" },
        ],
      },
    ],
  },
  {
    slug: "ai-native-kids-final-project",
    title: "AI Native Kids Final Project",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "AI",
    description:
      "Bring together everything you know about AI to design, build, and present your own responsible AI-powered project.",
    parentSummary:
      "This capstone lets your child apply their full AI toolkit to a project of their own design. They plan an AI-powered idea, build it with browser-based tools, and reflect on its fairness and impact. It rewards creativity, independence, and responsible thinking in equal measure.",
    studentSummary:
      "You'll design and build your very own AI-powered project from idea all the way to showtime!",
    skills: [
      "Planning an AI project",
      "Training and using a model",
      "Applying responsible AI principles",
      "Independent problem solving",
      "Presenting a technical project",
    ],
    tools: ["Code.org AI Lab", "Create & Learn online classroom"],
    finalProjectTitle: "My AI-Powered Solution",
    finalProjectDescription:
      "Design and build an AI-powered project that solves a problem you care about, then present how it works and how it stays fair.",
    referenceKeys: ["code-org", "create-learn"],
    requiredPlan: "PRO",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Designing Your AI Project",
        lessons: [
          { title: "Choosing Your AI Idea", isFree: true },
          { title: "Planning the Build", isFree: true },
          { title: "Gathering Your Data", isFree: true },
        ],
      },
      {
        title: "Build and Present",
        lessons: [
          { title: "Building Your AI Solution" },
          { title: "Checking for Fairness" },
          { title: "Presenting Your Project" },
        ],
      },
    ],
  },
  {
    slug: "robot-movement-direction-logic",
    title: "Robot Movement and Direction Logic",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "ROBOTICS",
    description:
      "Program a virtual robot to move, turn, and navigate using directional logic—all in a software simulator.",
    parentSummary:
      "Your child learns the fundamentals of robotics entirely through simulation, with no hardware required. They program a virtual robot to move precisely, turn by angles, and follow paths using sequencing and loops. It builds spatial reasoning and the logic that drives all robotic systems.",
    studentSummary:
      "You'll command a virtual robot to zoom, spin, and follow paths exactly where you tell it to go!",
    skills: [
      "Directional and movement logic",
      "Sequencing robot commands",
      "Using loops for navigation",
      "Spatial reasoning",
      "Simulator-based programming",
    ],
    tools: ["MakeCode simulator", "Create & Learn online classroom"],
    finalProjectTitle: "Virtual Robot Navigator",
    finalProjectDescription:
      "Program a virtual robot in the simulator to navigate a set path using turns and loops without hitting any obstacles.",
    referenceKeys: ["makecode", "create-learn", "microbit"],
    requiredPlan: "PRO",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Moving a Virtual Robot",
        lessons: [
          { title: "Meet Your Simulated Robot", isFree: true },
          { title: "Moving Forward and Back", isFree: true },
          { title: "Turning by Direction", isFree: true },
        ],
      },
      {
        title: "Navigating with Logic",
        lessons: [
          { title: "Repeating Moves with Loops" },
          { title: "Following a Path" },
          { title: "Navigating Around Obstacles" },
        ],
      },
    ],
  },
  {
    slug: "sensors-decisions-simulation",
    title: "Sensors and Decisions in Simulation",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "ROBOTICS",
    description:
      "Use simulated sensors to help a virtual robot detect its surroundings and make smart decisions automatically.",
    parentSummary:
      "This course teaches your child how robots sense and respond to their environment, all within a software simulator. They program virtual sensors to detect light, distance, and conditions, then use conditional logic so the robot reacts on its own. No physical sensors or kits are needed.",
    studentSummary:
      "You'll give a virtual robot senses so it can see, feel, and decide what to do all by itself!",
    skills: [
      "How sensors gather input",
      "Conditional decision making",
      "Event-driven programming",
      "Combining sensing and movement",
      "Simulator-based testing",
    ],
    tools: ["MakeCode simulator", "Create & Learn online classroom"],
    finalProjectTitle: "Smart Sensing Robot",
    finalProjectDescription:
      "Program a virtual robot to use simulated sensors and conditional logic so it automatically reacts to changes around it.",
    referenceKeys: ["makecode", "microbit", "create-learn"],
    requiredPlan: "PRO",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Robot Senses",
        lessons: [
          { title: "What Sensors Do", isFree: true },
          { title: "Reading Simulated Sensors", isFree: true },
          { title: "Reacting to Input", isFree: true },
        ],
      },
      {
        title: "Smart Decisions",
        lessons: [
          { title: "Conditional Reactions" },
          { title: "Combining Sensing and Movement" },
          { title: "Testing Your Smart Robot" },
        ],
      },
    ],
  },
  {
    slug: "robotics-challenge-maze-solver",
    title: "Robotics Challenge: Maze Solver",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "ROBOTICS",
    description:
      "Take on a virtual robotics challenge by programming a simulated robot to find its way through a maze.",
    parentSummary:
      "Your child puts robotics logic to the test in this challenge-based course, working entirely in a simulator. They combine movement, sensing, and decision logic to guide a virtual robot through increasingly tricky mazes. It rewards persistence, debugging, and algorithmic thinking.",
    studentSummary:
      "You'll program a virtual robot to outsmart a maze and race it to the exit!",
    skills: [
      "Algorithmic thinking",
      "Maze-solving strategies",
      "Combining sensing and movement",
      "Debugging robot logic",
      "Iterative problem solving",
    ],
    tools: ["MakeCode simulator", "Create & Learn online classroom"],
    finalProjectTitle: "Maze Solver Champion",
    finalProjectDescription:
      "Program a virtual robot in the simulator to solve a maze on its own using sensing and decision logic.",
    referenceKeys: ["makecode", "create-learn"],
    requiredPlan: "PRO",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "The Maze Challenge",
        lessons: [
          { title: "Understanding the Maze", isFree: true },
          { title: "Planning a Solving Strategy", isFree: true },
          { title: "First Steps Through the Maze", isFree: true },
        ],
      },
      {
        title: "Solving It All",
        lessons: [
          { title: "Sensing Walls and Turns" },
          { title: "Debugging Wrong Turns" },
          { title: "Racing to the Exit" },
        ],
      },
    ],
  },
  {
    slug: "automation-thinking-students",
    title: "Automation Thinking for Students",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "ROBOTICS",
    description:
      "Learn how automation works by designing software routines that handle repetitive tasks automatically.",
    parentSummary:
      "This course introduces your child to the powerful idea of automation that drives modern robotics and software. They learn to spot repetitive tasks and design logical routines to handle them automatically in a simulator. It strengthens efficiency thinking and the foundations of algorithmic design.",
    studentSummary:
      "You'll teach the computer to do boring repeated jobs all by itself so you don't have to!",
    skills: [
      "Identifying repetitive tasks",
      "Designing automation routines",
      "Loops and triggers",
      "Efficiency thinking",
      "Algorithmic design",
    ],
    tools: ["MakeCode simulator", "Code.org App Lab"],
    finalProjectTitle: "Automation Routine Builder",
    finalProjectDescription:
      "Design a simulated automation routine that detects a repetitive task and completes it automatically using loops and triggers.",
    referenceKeys: ["makecode", "code-org"],
    requiredPlan: "PRO",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "What Is Automation?",
        lessons: [
          { title: "Automation All Around Us", isFree: true },
          { title: "Spotting Repetitive Tasks", isFree: true },
          { title: "Your First Automated Routine", isFree: true },
        ],
      },
      {
        title: "Building Smart Routines",
        lessons: [
          { title: "Triggers and Conditions" },
          { title: "Making Routines Efficient" },
          { title: "Testing Your Automation" },
        ],
      },
    ],
  },
  {
    slug: "virtual-robotics-final-challenge",
    title: "Virtual Robotics Final Challenge",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "ROBOTICS",
    description:
      "Combine movement, sensing, and automation in a capstone robotics challenge run entirely in a software simulator.",
    parentSummary:
      "This capstone brings together every robotics skill your child has built—all without any physical hardware. They design and program a virtual robot to complete a complex multi-step challenge using movement, sensors, and decision logic. It rewards independence, planning, and creative problem solving.",
    studentSummary:
      "You'll put all your robot skills together to crush one epic virtual challenge!",
    skills: [
      "Integrating robotics concepts",
      "Multi-step problem solving",
      "Combining sensing and automation",
      "Independent project planning",
      "Debugging complex programs",
    ],
    tools: ["MakeCode simulator", "Create & Learn online classroom"],
    finalProjectTitle: "Ultimate Virtual Robot Challenge",
    finalProjectDescription:
      "Program a virtual robot in the simulator to complete a multi-step challenge that uses movement, sensing, and automation together.",
    referenceKeys: ["create-learn", "makecode"],
    requiredPlan: "PRO",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Planning the Challenge",
        lessons: [
          { title: "Reviewing Your Robot Skills", isFree: true },
          { title: "Designing the Challenge", isFree: true },
          { title: "Mapping Your Solution", isFree: true },
        ],
      },
      {
        title: "Build and Conquer",
        lessons: [
          { title: "Programming Movement and Sensing" },
          { title: "Adding Automation" },
          { title: "Completing the Challenge" },
        ],
      },
    ],
  },
  {
    slug: "python-starter-projects",
    title: "Python Starter Projects",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Take your first steps into text-based programming by building fun, real projects in Python.",
    parentSummary:
      "Your child transitions from block coding to real text-based programming with Python, one of the world's most popular languages. They learn variables, loops, conditionals, and functions by building small interactive projects. It is the perfect on-ramp to professional-style coding.",
    studentSummary:
      "You'll write real Python code and build cool projects like quizzes and number games!",
    skills: [
      "Python syntax basics",
      "Variables and data types",
      "Loops and conditionals",
      "Writing simple functions",
      "Debugging text-based code",
    ],
    tools: ["Create & Learn online classroom", "Raspberry Pi online editor"],
    finalProjectTitle: "Python Mini-Project",
    finalProjectDescription:
      "Build an interactive Python program such as a quiz or number game that uses variables, loops, and conditionals.",
    referenceKeys: ["create-learn", "raspberry-pi"],
    requiredPlan: "LEARNER",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Hello, Python",
        lessons: [
          { title: "Your First Python Code", isFree: true },
          { title: "Variables and Input", isFree: true },
          { title: "Making Decisions", isFree: true },
        ],
      },
      {
        title: "Building Projects",
        lessons: [
          { title: "Loops and Repetition" },
          { title: "Writing Functions" },
          { title: "Building Your Mini-Project" },
        ],
      },
    ],
  },
  {
    slug: "html-css-project-lab",
    title: "HTML and CSS Project Lab",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Combine HTML structure with CSS styling to design and build complete, good-looking web pages.",
    parentSummary:
      "Building on basic web skills, this project lab teaches your child how to make web pages that look great. They master CSS to control colors, fonts, layout, and spacing, then apply it across a multi-page project. The result is a styled website they design from scratch.",
    studentSummary:
      "You'll style your web pages with colors, fonts, and layouts to make them look amazing!",
    skills: [
      "HTML structure review",
      "CSS colors and fonts",
      "Layout and spacing",
      "Styling multiple pages",
      "Responsive design basics",
    ],
    tools: ["Khan Academy computing editor", "Raspberry Pi online editor"],
    finalProjectTitle: "Styled Website Project",
    finalProjectDescription:
      "Design and build a multi-section web page styled with CSS for colors, fonts, and an organized layout.",
    referenceKeys: ["khan-computing", "raspberry-pi", "code-club"],
    requiredPlan: "LEARNER",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Styling Foundations",
        lessons: [
          { title: "Adding CSS to HTML", isFree: true },
          { title: "Colors and Fonts", isFree: true },
          { title: "Boxes and Spacing", isFree: true },
        ],
      },
      {
        title: "Building a Styled Site",
        lessons: [
          { title: "Designing a Layout" },
          { title: "Styling Across Pages" },
          { title: "Finishing Your Website" },
        ],
      },
    ],
  },
  {
    slug: "makecode-arcade-game-builder",
    title: "MakeCode Arcade Game Builder",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Build retro-style arcade games with sprites, animation, and game logic in the MakeCode Arcade editor.",
    parentSummary:
      "Your child becomes a game developer in this hands-on course built around MakeCode Arcade. They create sprites, animate characters, add player controls, and program game logic for a complete arcade game. It blends creativity with serious programming practice, all in the browser.",
    studentSummary:
      "You'll build your own retro arcade game with animated sprites and real player controls!",
    skills: [
      "Creating and animating sprites",
      "Player controls and input",
      "Game logic and scoring",
      "Levels and difficulty",
      "Testing and polishing games",
    ],
    tools: ["MakeCode Arcade"],
    finalProjectTitle: "My Arcade Game",
    finalProjectDescription:
      "Build a complete arcade game in MakeCode Arcade with animated sprites, player controls, and a working score system.",
    referenceKeys: ["makecode"],
    requiredPlan: "LEARNER",
    status: "PUBLISHED",
    contentStatus: "SEED_NOW",
    modules: [
      {
        title: "Arcade Basics",
        lessons: [
          { title: "Meet MakeCode Arcade", isFree: true },
          { title: "Creating Sprites", isFree: true },
          { title: "Player Controls", isFree: true },
        ],
      },
      {
        title: "Building Your Game",
        lessons: [
          { title: "Animation and Effects" },
          { title: "Game Logic and Scoring" },
          { title: "Polishing Your Arcade Game" },
        ],
      },
    ],
  },
  {
    slug: "data-detectives",
    title: "Data Detectives",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "DATA",
    description:
      "Investigate real-world data like a detective, uncovering patterns and telling stories with charts and numbers.",
    parentSummary:
      "Your child becomes a data detective, learning to collect, organize, and interpret data to answer real questions. They explore charts, spot trends, and learn how data can reveal—or mislead. It builds the data literacy that underpins science, AI, and everyday decision making.",
    studentSummary:
      "You'll crack real-world mysteries by digging through data and spotting clues hidden in the numbers!",
    skills: [
      "Collecting and organizing data",
      "Reading charts and graphs",
      "Spotting trends and outliers",
      "Drawing conclusions from data",
      "Telling stories with data",
    ],
    tools: ["CK-12 interactive simulations", "Code.org App Lab", "PhET simulations"],
    finalProjectTitle: "Data Mystery Report",
    finalProjectDescription:
      "Investigate a real dataset, create charts to reveal a pattern, and present your findings like a detective solving a case.",
    referenceKeys: ["ck12", "code-org", "phet"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
    adminNotes:
      "Maps to master 'Data and Patterns for Young Learners'. In Digital STEM Explorer bundle.",
  },
  {
    slug: "prompt-engineering-for-students",
    title: "Prompt Engineering for Students",
    ageGroup: "AGES_11_13",
    level: "INTERMEDIATE",
    category: "AI",
    description:
      "Learn how to write clear, effective prompts to get great results from AI tools.",
    parentSummary:
      "This course teaches your child the increasingly essential skill of communicating with AI. They learn how to craft clear prompts, refine their wording, and evaluate AI responses critically. It builds practical AI fluency along with thoughtful, responsible usage habits.",
    studentSummary:
      "You'll learn the secret words and tricks to make AI give you exactly what you want!",
    skills: [
      "Writing clear prompts",
      "Refining and iterating prompts",
      "Evaluating AI responses",
      "Giving context and examples",
      "Using AI responsibly",
    ],
    tools: ["Code.org AI Lab", "Create & Learn online classroom", "MIT App Inventor"],
    finalProjectTitle: "Prompt Engineering Playbook",
    finalProjectDescription:
      "Create a playbook of effective prompts for different tasks, showing before-and-after examples of how refining a prompt improves the result.",
    referenceKeys: ["code-org", "create-learn", "app-inventor"],
    existing: true,
    status: "PUBLISHED",
    contentStatus: "NEEDS_REVIEW",
    adminNotes: "Maps to master 'Prompt Engineering for Students'. DRAFT placeholder.",
  },
];
