import type { CatalogCourse } from "./types";

export const COURSES_TEENS: CatalogCourse[] = [
  // ───────────────────────── AGES 14–16 (INTERMEDIATE) — NEW ─────────────────────────
  {
    slug: "python-starter-for-teens",
    title: "Python Starter for Teens",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Learn the fundamentals of Python programming by writing real scripts, functions, and small interactive programs.",
    parentSummary:
      "Python is the most in-demand language in tech, education, and data careers. In this course your teen builds genuine coding fluency through hands-on projects they can showcase in a digital portfolio. Every exercise runs in the browser, with no setup or hardware required.",
    studentSummary:
      "You'll write your first real Python programs and see your code come to life on screen.",
    skills: [
      "Variables and data types",
      "Conditionals and loops",
      "Functions and parameters",
      "Debugging and error handling",
      "Computational thinking",
    ],
    tools: ["Python", "Khan Academy"],
    finalProjectTitle: "Mini Python Toolkit",
    finalProjectDescription:
      "Build a small collection of interactive Python scripts — such as a calculator, quiz, and number-guessing game — and publish them to your portfolio.",
    referenceKeys: ["create-learn", "khan-computing"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Python Foundations",
        lessons: [
          { title: "Your First Python Program", isFree: true },
          { title: "Variables and Data Types", isFree: true },
          { title: "Conditionals and Decisions", isFree: true },
        ],
      },
      {
        title: "Loops and Functions",
        lessons: [
          { title: "Loops and Repetition" },
          { title: "Writing Your Own Functions" },
          { title: "Debugging Like a Pro" },
        ],
      },
    ],
  },
  {
    slug: "javascript-basics-interactive-web",
    title: "JavaScript Basics for Interactive Web",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Use JavaScript to add interactivity, logic, and dynamic behaviour to web pages.",
    parentSummary:
      "JavaScript powers nearly every interactive website on the internet, making it a cornerstone skill for any tech career. Your teen learns to write code that responds to clicks, input, and events, producing live demos for their portfolio. All work happens in a browser-based code editor with no installation needed.",
    studentSummary:
      "You'll make web pages react to clicks, typing, and your own clever code.",
    skills: [
      "JavaScript syntax and variables",
      "Functions and events",
      "DOM manipulation",
      "Conditional logic",
      "Interactive UI behaviour",
    ],
    tools: ["JavaScript", "VS Code in browser"],
    finalProjectTitle: "Interactive Web Widget",
    finalProjectDescription:
      "Create an interactive web widget — such as a quiz, tip calculator, or colour picker — that responds to user actions in real time.",
    referenceKeys: ["khan-computing", "makecode", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "JavaScript Foundations",
        lessons: [
          { title: "What JavaScript Can Do", isFree: true },
          { title: "Variables and Functions", isFree: true },
          { title: "Making Decisions with Logic", isFree: true },
        ],
      },
      {
        title: "Interactivity and the DOM",
        lessons: [
          { title: "Reacting to Clicks and Events" },
          { title: "Changing the Page with the DOM" },
          { title: "Building an Interactive Widget" },
        ],
      },
    ],
  },
  {
    slug: "html-css-build-first-website",
    title: "HTML and CSS: Build Your First Website",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Structure and style your own website from scratch using HTML and CSS.",
    parentSummary:
      "Knowing how to build and style a web page is a foundational, employer-recognised digital skill. Your teen finishes this course with a real, published website they can add to their portfolio and share with family. Everything is created in a browser editor — no software or hardware to install.",
    studentSummary:
      "You'll design and build a real website that you can share with anyone online.",
    skills: [
      "HTML structure and semantics",
      "CSS styling and layout",
      "Responsive design basics",
      "Colour and typography",
      "Web publishing",
    ],
    tools: ["VS Code in browser", "Khan Academy"],
    finalProjectTitle: "Personal Portfolio Website",
    finalProjectDescription:
      "Build and publish a multi-section personal website that showcases who you are, your interests, and your projects.",
    referenceKeys: ["khan-computing", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Structuring with HTML",
        lessons: [
          { title: "How Web Pages Are Built", isFree: true },
          { title: "Headings, Text, and Links", isFree: true },
          { title: "Images and Lists", isFree: true },
        ],
      },
      {
        title: "Styling with CSS",
        lessons: [
          { title: "Colours, Fonts, and Spacing" },
          { title: "Layout and Responsive Design" },
          { title: "Publishing Your Website" },
        ],
      },
    ],
  },
  {
    slug: "data-basics-with-python",
    title: "Data Basics with Python",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "DATA",
    description:
      "Explore, analyse, and visualise real datasets using Python.",
    parentSummary:
      "Data literacy is one of the fastest-growing career skills across science, business, and technology. Your teen learns to load, analyse, and chart real-world data with Python, building portfolio-ready data stories. All analysis runs in a browser notebook with no setup required.",
    studentSummary:
      "You'll turn raw data into charts and discoveries using your own Python code.",
    skills: [
      "Working with datasets",
      "Data cleaning basics",
      "Summary statistics",
      "Data visualisation",
      "Drawing conclusions from data",
    ],
    tools: ["Python", "Khan Academy"],
    finalProjectTitle: "Data Story Notebook",
    finalProjectDescription:
      "Analyse a real dataset of your choice and create a notebook with charts and findings that tells a clear data story.",
    referenceKeys: ["create-learn", "khan-computing"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Getting Started with Data",
        lessons: [
          { title: "What Is Data Analysis?", isFree: true },
          { title: "Loading and Exploring Datasets", isFree: true },
          { title: "Cleaning Messy Data", isFree: true },
        ],
      },
      {
        title: "Analysis and Visualisation",
        lessons: [
          { title: "Summary Statistics" },
          { title: "Making Charts with Python" },
          { title: "Telling a Data Story" },
        ],
      },
    ],
  },
  {
    slug: "tech-innovator-portfolio-project",
    title: "Tech Innovator Portfolio Project",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Plan, build, and present an original coding project for your digital portfolio.",
    parentSummary:
      "This capstone helps your teen consolidate their coding skills into one standout project that demonstrates initiative and creativity. They learn to scope, build, and present work the way real developers do, producing a portfolio centrepiece for school and future applications. The entire project is built and shared using browser-based tools.",
    studentSummary:
      "You'll bring your own tech idea to life and present it like a real innovator.",
    skills: [
      "Project planning and scoping",
      "Independent problem solving",
      "Combining coding skills",
      "Iteration and testing",
      "Presenting technical work",
    ],
    tools: ["VS Code in browser", "Python"],
    finalProjectTitle: "Innovator Showcase Project",
    finalProjectDescription:
      "Design, build, and present an original coding project of your choosing, complete with a short demo and write-up for your portfolio.",
    referenceKeys: ["khan-computing", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Planning Your Project",
        lessons: [
          { title: "Finding Your Project Idea", isFree: true },
          { title: "Scoping and Planning", isFree: true },
          { title: "Setting Up Your Workspace", isFree: true },
        ],
      },
      {
        title: "Build and Showcase",
        lessons: [
          { title: "Building Your Core Features" },
          { title: "Testing and Polishing" },
          { title: "Presenting Your Innovation" },
        ],
      },
    ],
  },
  {
    slug: "web-app-builder-final-demo",
    title: "Web & App Builder Final Demo",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Combine web and app-building skills to create and demo a complete digital product.",
    parentSummary:
      "This capstone lets your teen bring together everything they've learned to build a working web or mobile app and demonstrate it confidently. They practise the full build-and-present cycle that employers and universities value, ending with a polished portfolio demo. All building and presenting is done with browser and app-builder tools.",
    studentSummary:
      "You'll build a real web or mobile app and show it off in your own live demo.",
    skills: [
      "End-to-end product building",
      "Combining web and app skills",
      "User-focused design",
      "Testing and debugging",
      "Demoing a product",
    ],
    tools: ["MIT App Inventor", "VS Code in browser"],
    finalProjectTitle: "Web or App Demo Day",
    finalProjectDescription:
      "Build a functional web or mobile app and deliver a recorded or live demo that walks through its features and purpose.",
    referenceKeys: ["khan-computing", "app-inventor", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Choosing Your Build",
        lessons: [
          { title: "Web App or Mobile App?", isFree: true },
          { title: "Sketching Your Product", isFree: true },
          { title: "Setting Up the Project", isFree: true },
        ],
      },
      {
        title: "Build and Demo",
        lessons: [
          { title: "Building the Main Features" },
          { title: "Testing with Users" },
          { title: "Your Final Demo" },
        ],
      },
    ],
  },

  // ───────────────────────── AGES 17–18 (ADVANCED) — NEW ─────────────────────────
  {
    slug: "python-real-world-projects",
    title: "Python for Real-World Projects",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "CODING",
    description:
      "Apply Python to build practical, real-world programs and automations.",
    parentSummary:
      "This advanced course moves beyond fundamentals to the kind of applied Python used in real software and data roles. Your teen builds genuinely useful projects — automations, tools, and small applications — that strengthen a college- or career-ready portfolio. Everything is written and run in browser-based environments.",
    studentSummary:
      "You'll build Python projects that solve real problems people actually have.",
    skills: [
      "Applied Python programming",
      "Working with files and APIs",
      "Automation scripting",
      "Code organisation",
      "Debugging complex programs",
      "Project documentation",
    ],
    tools: ["Python", "VS Code in browser"],
    finalProjectTitle: "Real-World Python Application",
    finalProjectDescription:
      "Build a practical Python application or automation that solves a real problem, with documentation explaining how it works.",
    referenceKeys: ["create-learn", "raspberry-pi", "khan-computing"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Applied Python",
        lessons: [
          { title: "From Scripts to Real Programs", isFree: true },
          { title: "Working with Files and Data", isFree: true },
          { title: "Calling APIs", isFree: true },
        ],
      },
      {
        title: "Building Useful Tools",
        lessons: [
          { title: "Automating Repetitive Tasks" },
          { title: "Organising Larger Projects" },
          { title: "Documenting Your Code" },
        ],
      },
    ],
  },
  {
    slug: "ai-project-builder",
    title: "AI Project Builder",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "AI",
    description:
      "Design and build your own AI-powered project using accessible AI tools.",
    parentSummary:
      "AI fluency is rapidly becoming a baseline expectation in higher education and the workforce. Your teen learns how AI models work and builds a real AI-powered project they can feature in applications and portfolios. All tools used are browser-based and require no specialised hardware.",
    studentSummary:
      "You'll create your own AI-powered project from idea to working demo.",
    skills: [
      "How AI models work",
      "Training and using models",
      "Designing AI applications",
      "Evaluating AI outputs",
      "Responsible AI practices",
      "Presenting AI projects",
    ],
    tools: ["MIT App Inventor", "Python"],
    finalProjectTitle: "AI-Powered App",
    finalProjectDescription:
      "Build an AI-powered application — such as an image classifier or chatbot — and present how it works and what it does.",
    referenceKeys: ["create-learn", "code-org", "app-inventor"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Understanding AI",
        lessons: [
          { title: "How Modern AI Works", isFree: true },
          { title: "Training a Simple Model", isFree: true },
          { title: "Designing Your AI Idea", isFree: true },
        ],
      },
      {
        title: "Building Your AI Project",
        lessons: [
          { title: "Building the AI Feature" },
          { title: "Testing and Evaluating Outputs" },
          { title: "Presenting Your AI Project" },
        ],
      },
    ],
  },
  {
    slug: "web-product-development",
    title: "Web Product Development",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "CODING",
    description:
      "Plan and build a complete web product from concept to deployment.",
    parentSummary:
      "This advanced course mirrors how real web products are designed, built, and shipped. Your teen develops a deployable web application alongside the planning and product skills universities and employers look for. The entire workflow runs in browser-based development tools.",
    studentSummary:
      "You'll design, build, and launch a real web product from start to finish.",
    skills: [
      "Web product planning",
      "Front-end development",
      "Working with data and APIs",
      "Deployment basics",
      "User testing",
      "Version control concepts",
    ],
    tools: ["VS Code in browser", "JavaScript"],
    finalProjectTitle: "Deployed Web Product",
    finalProjectDescription:
      "Build and deploy a complete, working web product with multiple features, then share the live link in your portfolio.",
    referenceKeys: ["khan-computing", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Product Foundations",
        lessons: [
          { title: "From Idea to Product Plan", isFree: true },
          { title: "Designing the User Experience", isFree: true },
          { title: "Building the Front End", isFree: true },
        ],
      },
      {
        title: "Build and Ship",
        lessons: [
          { title: "Connecting Data and APIs" },
          { title: "Testing with Real Users" },
          { title: "Deploying Your Product" },
        ],
      },
    ],
  },
  {
    slug: "app-prototype-development",
    title: "App Prototype Development",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "CODING",
    description:
      "Turn an app idea into a working, testable prototype.",
    parentSummary:
      "Prototyping is how real product teams validate ideas before building them fully. Your teen learns to take an app concept through design, build, and user testing, producing a working prototype for their portfolio. All development is done with browser-based app-building tools.",
    studentSummary:
      "You'll turn your app idea into a working prototype people can actually try.",
    skills: [
      "App concept design",
      "Prototyping and wireframing",
      "Building interactive apps",
      "User testing and feedback",
      "Iterating on designs",
      "Pitching an app",
    ],
    tools: ["MIT App Inventor", "VS Code in browser"],
    finalProjectTitle: "Working App Prototype",
    finalProjectDescription:
      "Design and build a functional app prototype, test it with users, and present it with a short pitch.",
    referenceKeys: ["app-inventor", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "From Idea to Design",
        lessons: [
          { title: "Defining Your App Idea", isFree: true },
          { title: "Wireframing the Screens", isFree: true },
          { title: "Planning the Features", isFree: true },
        ],
      },
      {
        title: "Build and Test",
        lessons: [
          { title: "Building the Prototype" },
          { title: "Testing with Real Users" },
          { title: "Pitching Your App" },
        ],
      },
    ],
  },
  {
    slug: "data-thinking-future-leaders",
    title: "Data Thinking for Future Leaders",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "DATA",
    description:
      "Use data analysis and interpretation to make and defend real decisions.",
    parentSummary:
      "Data-driven decision-making is a defining leadership skill across every modern industry. Your teen learns to interpret data critically, recognise bias, and build evidence-based arguments they can present in portfolios and interviews. All analysis is performed in browser-based tools.",
    studentSummary:
      "You'll learn to read data critically and make decisions you can defend.",
    skills: [
      "Data interpretation",
      "Identifying bias in data",
      "Evidence-based reasoning",
      "Data visualisation",
      "Communicating insights",
      "Decision making with data",
    ],
    tools: ["Python", "Khan Academy"],
    finalProjectTitle: "Data-Driven Recommendation",
    finalProjectDescription:
      "Analyse a real dataset on an issue you care about and present a clear, evidence-based recommendation backed by visualisations.",
    referenceKeys: ["khan-computing", "ck12"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Thinking with Data",
        lessons: [
          { title: "Why Data Matters for Leaders", isFree: true },
          { title: "Reading Data Critically", isFree: true },
          { title: "Spotting Bias and Misleading Charts", isFree: true },
        ],
      },
      {
        title: "Deciding with Data",
        lessons: [
          { title: "Building an Evidence-Based Case" },
          { title: "Visualising Your Argument" },
          { title: "Presenting Your Recommendation" },
        ],
      },
    ],
  },
  {
    slug: "build-your-digital-portfolio",
    title: "Build Your Digital Portfolio",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "CODING",
    description:
      "Create a polished online portfolio that showcases your projects and skills.",
    parentSummary:
      "A strong digital portfolio is one of the most valuable assets for university and job applications. Your teen builds and publishes a professional portfolio site that presents their projects, skills, and story effectively. The site is built and hosted entirely with browser-based tools.",
    studentSummary:
      "You'll build a professional online portfolio that shows the world what you can do.",
    skills: [
      "Portfolio design",
      "Web building",
      "Presenting projects",
      "Personal branding",
      "Writing for impact",
      "Publishing online",
    ],
    tools: ["VS Code in browser", "Khan Academy"],
    finalProjectTitle: "Published Portfolio Site",
    finalProjectDescription:
      "Design, build, and publish a polished portfolio website that showcases your best projects and tells your story.",
    referenceKeys: ["khan-computing", "code-org"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Planning Your Portfolio",
        lessons: [
          { title: "What Makes a Great Portfolio", isFree: true },
          { title: "Choosing What to Showcase", isFree: true },
          { title: "Writing About Your Work", isFree: true },
        ],
      },
      {
        title: "Build and Publish",
        lessons: [
          { title: "Building Your Portfolio Site" },
          { title: "Adding Your Projects" },
          { title: "Publishing and Sharing" },
        ],
      },
    ],
  },
  {
    slug: "future-tech-leader-capstone-project",
    title: "Future Tech Leader Capstone Project",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "CODING",
    description:
      "Lead an ambitious, original tech project from concept to final presentation.",
    parentSummary:
      "This advanced capstone gives your teen the chance to lead a substantial, original technology project end to end. They practise the planning, building, and presentation skills expected of future tech leaders, producing a standout piece for college and career portfolios. The entire project is built and presented using browser-based tools.",
    studentSummary:
      "You'll lead an ambitious tech project of your own and present it like a future leader.",
    skills: [
      "End-to-end project leadership",
      "Advanced problem solving",
      "Integrating multiple technologies",
      "Project management",
      "Technical communication",
      "Reflective evaluation",
    ],
    tools: ["VS Code in browser", "Python"],
    finalProjectTitle: "Tech Leader Capstone",
    finalProjectDescription:
      "Plan, build, and present an ambitious original tech project that integrates skills from across your learning, with a full demo and reflection.",
    referenceKeys: ["code-org", "khan-computing", "create-learn"],
    status: "DRAFT",
    contentStatus: "SEED_NOW",
    requiredPlan: "PRO",
    modules: [
      {
        title: "Leading Your Project",
        lessons: [
          { title: "Choosing an Ambitious Idea", isFree: true },
          { title: "Planning and Managing the Work", isFree: true },
          { title: "Setting Up for Success", isFree: true },
        ],
      },
      {
        title: "Build and Present",
        lessons: [
          { title: "Building Your Capstone" },
          { title: "Testing and Refining" },
          { title: "Final Presentation and Reflection" },
        ],
      },
    ],
  },

  // ───────────────────────── AGES 14–16 — EXISTING ─────────────────────────
  {
    slug: "web-builders-bootcamp",
    title: "Web Builders Bootcamp",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "An intensive hands-on bootcamp for building real websites with HTML, CSS, and JavaScript.",
    parentSummary:
      "This bootcamp gives your teen a fast, project-driven path to building real websites from the ground up. They finish with multiple portfolio-ready sites and the confidence to keep building independently. All work is done in browser-based editors with no installation required.",
    studentSummary:
      "You'll build real websites fast and walk away with projects you're proud of.",
    skills: [
      "HTML and CSS",
      "JavaScript interactivity",
      "Responsive layouts",
      "Web debugging",
      "Publishing websites",
    ],
    tools: ["VS Code in browser", "JavaScript"],
    finalProjectTitle: "Bootcamp Website Showcase",
    finalProjectDescription:
      "Build and publish a complete multi-page website that demonstrates the full range of skills from the bootcamp.",
    referenceKeys: ["khan-computing", "code-org"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "python-logic-lab",
    title: "Python Logic Lab",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Strengthen programming logic and problem solving through Python challenges.",
    parentSummary:
      "This lab sharpens your teen's logical thinking through progressively challenging Python problems. The skills built here transfer directly to computer science courses and technical careers, with solutions they can add to a portfolio. Everything runs in a browser-based Python environment.",
    studentSummary:
      "You'll level up your problem-solving by cracking Python challenge after challenge.",
    skills: [
      "Algorithmic thinking",
      "Loops and conditionals",
      "Functions and logic",
      "Problem decomposition",
      "Debugging strategies",
    ],
    tools: ["Python", "Khan Academy"],
    finalProjectTitle: "Logic Challenge Portfolio",
    finalProjectDescription:
      "Solve a curated set of Python logic challenges and compile your best solutions into a portfolio with explanations.",
    referenceKeys: ["create-learn", "khan-computing", "raspberry-pi"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "ai-literacy-ethics",
    title: "AI Literacy & Ethics",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "AI",
    description:
      "Understand how AI works and explore the ethical questions it raises.",
    parentSummary:
      "As AI reshapes society, understanding how it works and where it can go wrong is essential for every young person. Your teen builds genuine AI literacy and the critical-thinking skills to use AI responsibly, with reflective work suitable for a portfolio. All activities are browser-based and require no special tools.",
    studentSummary:
      "You'll understand how AI really works and learn to use it wisely.",
    skills: [
      "How AI systems work",
      "Recognising AI bias",
      "Ethical reasoning",
      "Responsible AI use",
      "Critical evaluation",
    ],
    tools: ["Khan Academy", "Code.org"],
    finalProjectTitle: "AI Ethics Case Study",
    finalProjectDescription:
      "Research a real-world AI system, analyse its benefits and risks, and present an ethical evaluation with recommendations.",
    referenceKeys: ["code-org", "khan-computing"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
    adminNotes:
      "Maps to master 'AI Literacy and Responsible AI'. In Future Tech Leader bundle & Tech Innovator pathway.",
  },
  {
    slug: "cyber-basics-teens",
    title: "Cyber Basics for Teens",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "TECHNOLOGY",
    description:
      "Learn the essentials of cybersecurity and how to stay safe online.",
    parentSummary:
      "Cybersecurity awareness is a vital life and career skill in a connected world. Your teen learns how attacks work and how to protect data, building foundational knowledge relevant to a fast-growing tech field. All learning happens through browser-based activities with no special software.",
    studentSummary:
      "You'll learn how hackers think so you can keep yourself and others safe online.",
    skills: [
      "Online safety practices",
      "Password and account security",
      "Recognising phishing and threats",
      "Data privacy basics",
      "Security mindset",
    ],
    tools: ["Code.org", "Khan Academy"],
    finalProjectTitle: "Personal Security Plan",
    finalProjectDescription:
      "Create a practical cybersecurity plan that audits and improves the online safety of yourself or your family.",
    referenceKeys: ["code-org"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "design-build-test",
    title: "Design, Build, Test",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "ENGINEERING",
    description:
      "Apply the engineering design process to build and test digital solutions.",
    parentSummary:
      "The design-build-test cycle is at the heart of all engineering and product work. Your teen learns to define problems, build digital solutions, and test them systematically, producing iterative work for their portfolio. All building and testing is done with browser-based simulation tools.",
    studentSummary:
      "You'll design, build, and test your own digital solutions like a real engineer.",
    skills: [
      "Engineering design process",
      "Problem definition",
      "Prototyping",
      "Testing and iteration",
      "Documenting solutions",
    ],
    tools: ["MakeCode", "Code.org"],
    finalProjectTitle: "Design Challenge Solution",
    finalProjectDescription:
      "Take a design challenge through the full design-build-test cycle and present your tested digital solution.",
    referenceKeys: ["code-org", "makecode"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "app-development-basics",
    title: "App Development Basics",
    ageGroup: "AGES_14_16",
    level: "INTERMEDIATE",
    category: "CODING",
    description:
      "Build your first mobile apps using a visual app-building platform.",
    parentSummary:
      "Mobile app development is an engaging, portfolio-friendly entry into software building. Your teen creates working apps using a visual platform, learning core programming concepts they can carry into deeper coding. Everything is built in a browser-based app builder with no installation needed.",
    studentSummary:
      "You'll build your very first mobile apps and run them on a phone.",
    skills: [
      "App design basics",
      "Visual programming",
      "Event-driven logic",
      "User interface layout",
      "Testing apps",
    ],
    tools: ["MIT App Inventor", "Code.org"],
    finalProjectTitle: "My First Mobile App",
    finalProjectDescription:
      "Design and build a working mobile app of your choice and demonstrate it running on a device.",
    referenceKeys: ["app-inventor", "code-org"],
    existing: true,
    contentStatus: "NEEDS_REVIEW",
    adminNotes:
      "Maps to master 'App Development with MIT App Inventor'. DRAFT placeholder.",
  },

  // ───────────────────────── AGES 17–18 — EXISTING ─────────────────────────
  {
    slug: "ai-foundations-future-leaders",
    title: "AI Foundations for Future Leaders",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "AI",
    description:
      "Build a strong conceptual and practical foundation in artificial intelligence.",
    parentSummary:
      "This advanced course gives your teen a leadership-level grasp of how AI works and where it's headed. They combine technical understanding with strategic and ethical thinking, producing analyses and projects valued in college and career portfolios. All work is completed using browser-based tools.",
    studentSummary:
      "You'll build the AI knowledge that future leaders are expected to have.",
    skills: [
      "AI concepts and models",
      "Machine learning basics",
      "AI applications",
      "Ethical and strategic thinking",
      "Evaluating AI systems",
      "Communicating about AI",
    ],
    tools: ["Python", "Code.org"],
    finalProjectTitle: "AI Strategy Brief",
    finalProjectDescription:
      "Build a small AI project and pair it with a strategy brief explaining its impact, risks, and future potential.",
    referenceKeys: ["code-org", "create-learn"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "full-stack-thinking",
    title: "Full-Stack Thinking",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "CODING",
    description:
      "Understand how front-end and back-end systems work together in real applications.",
    parentSummary:
      "Full-stack understanding is highly valued because it shows how complete software systems fit together. Your teen learns how front-end and back-end pieces connect to form real applications, building portfolio work that demonstrates systems thinking. All development happens in browser-based environments.",
    studentSummary:
      "You'll see how complete apps work end to end, from screen to server.",
    skills: [
      "Front-end and back-end concepts",
      "How data flows in apps",
      "APIs and databases basics",
      "Systems thinking",
      "Building connected features",
      "Debugging across the stack",
    ],
    tools: ["VS Code in browser", "JavaScript"],
    finalProjectTitle: "Full-Stack Feature Demo",
    finalProjectDescription:
      "Build a small application feature that connects a front end to stored data and demonstrate the full flow end to end.",
    referenceKeys: ["khan-computing", "code-org"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "data-decisions-society",
    title: "Data Decisions & Society",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "DATA",
    description:
      "Examine how data shapes decisions and impacts society.",
    parentSummary:
      "Understanding the societal role of data is increasingly important for informed, responsible leaders. Your teen learns to analyse data, weigh its ethical implications, and communicate evidence-based positions, producing portfolio work that blends technical and critical skills. All analysis is done with browser-based tools.",
    studentSummary:
      "You'll explore how data shapes the world and learn to question it responsibly.",
    skills: [
      "Data analysis",
      "Data ethics and privacy",
      "Identifying bias",
      "Evidence-based argument",
      "Communicating findings",
      "Societal impact analysis",
    ],
    tools: ["Python", "CK-12"],
    finalProjectTitle: "Data and Society Report",
    finalProjectDescription:
      "Investigate a data-driven societal issue, analyse the evidence, and present a report on its impact and ethics.",
    referenceKeys: ["ck12", "code-org"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "startup-lab",
    title: "Startup Lab",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "ENTREPRENEURSHIP",
    description:
      "Develop a startup idea from concept to pitch using lean methods.",
    parentSummary:
      "Entrepreneurial skills empower teens to turn ideas into action and stand out in any field. Your teen learns lean startup methods, validates an idea, and builds a pitch, producing a portfolio-ready venture concept. All work is created and presented using browser-based tools.",
    studentSummary:
      "You'll take your own startup idea from a spark to a real pitch.",
    skills: [
      "Idea validation",
      "Lean startup methods",
      "Customer research",
      "Business model basics",
      "Pitching ideas",
      "Iteration and feedback",
    ],
    tools: ["Khan Academy", "Code.org"],
    finalProjectTitle: "Startup Pitch Deck",
    finalProjectDescription:
      "Develop and validate a startup concept, then present it as a polished pitch deck for your portfolio.",
    referenceKeys: ["outschool", "code-org"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "career-launch",
    title: "Career Launch",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "TECHNOLOGY",
    description:
      "Prepare for tech careers with portfolio, application, and interview skills.",
    parentSummary:
      "This course bridges learning and the real world by preparing teens for tech study and careers. Your teen builds a portfolio, refines applications, and practises interviews, gaining practical skills that pay off immediately. All preparation is done using browser-based tools and resources.",
    studentSummary:
      "You'll get ready to launch into tech with a portfolio and skills that impress.",
    skills: [
      "Portfolio building",
      "Tech career awareness",
      "Application and CV writing",
      "Interview preparation",
      "Professional communication",
      "Personal branding",
    ],
    tools: ["Khan Academy", "Code.org"],
    finalProjectTitle: "Career-Ready Package",
    finalProjectDescription:
      "Assemble a complete career-ready package including a portfolio, application materials, and a mock interview reflection.",
    referenceKeys: ["khan-computing", "code-org"],
    existing: true,
    contentStatus: "IMPORTED_EXISTING",
  },
  {
    slug: "entrepreneurship-product-thinking",
    title: "Entrepreneurship & Product Thinking",
    ageGroup: "AGES_17_18",
    level: "ADVANCED",
    category: "ENTREPRENEURSHIP",
    description:
      "Learn to think like a product builder and entrepreneur.",
    parentSummary:
      "Product thinking teaches teens to identify real needs and design solutions people value. Your teen learns to move from problem to product concept and pitch, building entrepreneurial portfolio work relevant to any future path. All work is created with browser-based tools.",
    studentSummary:
      "You'll learn to spot problems worth solving and design products people want.",
    skills: [
      "Product thinking",
      "Identifying user needs",
      "Concept development",
      "Prioritising features",
      "Business basics",
      "Pitching products",
    ],
    tools: ["Code.org", "Khan Academy"],
    finalProjectTitle: "Product Concept Pitch",
    finalProjectDescription:
      "Identify a real problem, design a product concept to solve it, and present a pitch with your reasoning.",
    referenceKeys: ["code-org", "outschool"],
    existing: true,
    contentStatus: "NEEDS_REVIEW",
    adminNotes:
      "Maps to master 'Product Thinking and Entrepreneurship'. DRAFT placeholder.",
  },
];
