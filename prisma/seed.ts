import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCatalog } from "./seed-catalog";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// Helper: create modules + lessons for a course (skips if modules already exist)
async function seedCourseContent(
  courseId: string,
  modules: {
    title: string;
    order: number;
    lessons: { title: string; order: number; isFree?: boolean; duration?: number; content?: string }[];
  }[]
) {
  const existing = await db.module.findFirst({ where: { courseId } });
  if (existing) return; // already seeded

  for (const mod of modules) {
    const createdMod = await db.module.create({
      data: { courseId, title: mod.title, order: mod.order },
    });
    for (const lesson of mod.lessons) {
      await db.lesson.create({
        data: {
          moduleId: createdMod.id,
          title: lesson.title,
          order: lesson.order,
          isFree: lesson.isFree ?? false,
          duration: lesson.duration ?? 1800,
          content: lesson.content ?? `<p>${lesson.title}</p>`,
          type: "VIDEO",
        },
      });
    }
  }
}

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);
  // Credentials provider blocks login until emailVerified is set. Seeded
  // accounts skip the verification email by setting this directly.
  const seededVerifiedAt = new Date("2026-05-28T00:00:00Z");

  // ── Organisations (P4 multi-tenant scaffolding) ──────────────────────────
  // We seed two orgs to make tenant-isolation testing trivial: any cross-org
  // action should fail; same-org and "global ↔ org" should succeed.
  const muditaAcademy = await db.organization.upsert({
    where: { slug: "mudita-academy" },
    update: {},
    create: {
      name: "Mudita Academy",
      slug: "mudita-academy",
    },
  });
  const demoSchool = await db.organization.upsert({
    where: { slug: "demo-school-berlin" },
    update: {},
    create: {
      name: "Demo School Berlin",
      slug: "demo-school-berlin",
    },
  });

  // ── Users ────────────────────────────────────────────────────────────────
  // Existing test accounts — kept on no-org so they continue exercising the
  // "global content" path. emailVerified is now set on update so password
  // login works without manually flipping the column.
  const admin = await db.user.upsert({
    where: { email: "admin@schulab.com" },
    update: { emailVerified: seededVerifiedAt },
    create: {
      name: "Admin User",
      email: "admin@schulab.com",
      passwordHash,
      role: "ADMIN",
      isActive: true,
      emailVerified: seededVerifiedAt,
    },
  });

  const student1 = await db.user.upsert({
    where: { email: "aisha@example.com" },
    update: { emailVerified: seededVerifiedAt },
    create: {
      name: "Aisha Mohammed",
      email: "aisha@example.com",
      passwordHash,
      role: "STUDENT",
      isActive: true,
      emailVerified: seededVerifiedAt,
    },
  });

  const student2 = await db.user.upsert({
    where: { email: "liam@example.com" },
    update: { emailVerified: seededVerifiedAt },
    create: {
      name: "Liam Chen",
      email: "liam@example.com",
      passwordHash,
      role: "STUDENT",
      isActive: true,
      emailVerified: seededVerifiedAt,
    },
  });

  const parent1 = await db.user.upsert({
    where: { email: "sara@example.com" },
    update: { emailVerified: seededVerifiedAt },
    create: {
      name: "Sara Ahmed",
      email: "sara@example.com",
      passwordHash,
      role: "PARENT",
      isActive: true,
      emailVerified: seededVerifiedAt,
    },
  });

  const tutorUser = await db.user.upsert({
    where: { email: "marcus@example.com" },
    update: { emailVerified: seededVerifiedAt },
    create: {
      name: "Dr. Marcus Lee",
      email: "marcus@example.com",
      passwordHash,
      role: "TUTOR",
      isActive: true,
      emailVerified: seededVerifiedAt,
    },
  });

  // ── Phase 4 multi-tenant test fixtures ───────────────────────────────────
  // One account per role on each org, plus a no-org SUPER_ADMIN. The
  // helper handles tutor-profile + availability creation when the role is
  // TUTOR so we don't repeat that boilerplate 4× below.
  type SeedUser = {
    name: string;
    email: string;
    role:
      | "STUDENT"
      | "PARENT"
      | "TUTOR"
      | "ADMIN"
      | "SUPER_ADMIN"
      | "ORG_ADMIN"
      | "B2B_PARTNER";
    organizationId: string | null;
    tutorBio?: string;
    tutorSubjects?: string[];
    tutorLanguages?: string[];
    tutorHourlyRate?: number;
  };

  async function seedUser(spec: SeedUser) {
    const user = await db.user.upsert({
      where: { email: spec.email },
      update: {
        emailVerified: seededVerifiedAt,
        role: spec.role,
        organizationId: spec.organizationId,
      },
      create: {
        name: spec.name,
        email: spec.email,
        passwordHash,
        role: spec.role,
        isActive: true,
        emailVerified: seededVerifiedAt,
        organizationId: spec.organizationId,
      },
    });
    if (spec.role === "TUTOR") {
      const profile = await db.tutorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          bio: spec.tutorBio ?? "Seeded test tutor.",
          subjects: spec.tutorSubjects ?? ["Math"],
          languages: spec.tutorLanguages ?? ["English"],
          hourlyRate: spec.tutorHourlyRate ?? 40,
          rating: 4.5,
          isVerified: true,
        },
      });
      const slots = await db.tutorAvailability.count({
        where: { tutorId: profile.id },
      });
      if (slots === 0) {
        for (let day = 1; day <= 5; day++) {
          await db.tutorAvailability.create({
            data: {
              tutorId: profile.id,
              dayOfWeek: day,
              startTime: "09:00",
              endTime: "17:00",
              timezone: "UTC",
            },
          });
        }
      }
    }
    return user;
  }

  await seedUser({
    name: "Super Admin",
    email: "superadmin@mudita.test",
    role: "SUPER_ADMIN",
    organizationId: null,
  });

  // Mudita Academy: full role grid
  await seedUser({
    name: "Mudita Org Admin",
    email: "orgadmin@mudita-academy.test",
    role: "ORG_ADMIN",
    organizationId: muditaAcademy.id,
  });
  await seedUser({
    name: "Mudita Tutor",
    email: "tutor@mudita-academy.test",
    role: "TUTOR",
    organizationId: muditaAcademy.id,
    tutorBio: "Mudita Academy lead tutor — physics and astronomy.",
    tutorSubjects: ["Physics", "Astronomy"],
    tutorLanguages: ["English", "German"],
    tutorHourlyRate: 50,
  });
  await seedUser({
    name: "Mudita Student",
    email: "student@mudita-academy.test",
    role: "STUDENT",
    organizationId: muditaAcademy.id,
  });
  await seedUser({
    name: "Mudita Parent",
    email: "parent@mudita-academy.test",
    role: "PARENT",
    organizationId: muditaAcademy.id,
  });
  await seedUser({
    name: "Mudita B2B Partner",
    email: "partner@mudita-academy.test",
    role: "B2B_PARTNER",
    organizationId: muditaAcademy.id,
  });

  // Demo School Berlin: full role grid (used for cross-org isolation checks)
  await seedUser({
    name: "Demo School Org Admin",
    email: "orgadmin@demo-school.test",
    role: "ORG_ADMIN",
    organizationId: demoSchool.id,
  });
  await seedUser({
    name: "Demo School Tutor",
    email: "tutor@demo-school.test",
    role: "TUTOR",
    organizationId: demoSchool.id,
    tutorBio: "Demo School Berlin tutor — coding and robotics.",
    tutorSubjects: ["Coding", "Robotics"],
    tutorLanguages: ["English", "German"],
    tutorHourlyRate: 45,
  });
  await seedUser({
    name: "Demo School Student",
    email: "student@demo-school.test",
    role: "STUDENT",
    organizationId: demoSchool.id,
  });
  await seedUser({
    name: "Demo School Parent",
    email: "parent@demo-school.test",
    role: "PARENT",
    organizationId: demoSchool.id,
  });

  // Parent-child link
  await db.parentChild.upsert({
    where: { parentId_childId: { parentId: parent1.id, childId: student1.id } },
    update: {},
    create: { parentId: parent1.id, childId: student1.id },
  });

  // Tutor profile
  const tutorProfile = await db.tutorProfile.upsert({
    where: { userId: tutorUser.id },
    update: {},
    create: {
      userId: tutorUser.id,
      bio: "Experienced STEM educator with 10+ years teaching math and coding to children.",
      subjects: ["Math", "Coding", "Robotics"],
      languages: ["English", "Arabic"],
      hourlyRate: 45,
      rating: 4.8,
      isVerified: true,
    },
  });

  // Tutor availability (Mon–Fri, only if not already set)
  const availCount = await db.tutorAvailability.count({ where: { tutorId: tutorProfile.id } });
  if (availCount === 0) {
    for (let day = 1; day <= 5; day++) {
      await db.tutorAvailability.create({
        data: { tutorId: tutorProfile.id, dayOfWeek: day, startTime: "09:00", endTime: "17:00", timezone: "UTC" },
      });
    }
  }

  // ── Ages 3–5 Courses ─────────────────────────────────────────────────────

  const c1 = await db.course.upsert({
    where: { slug: "wonder-lab-science-tiny-explorers" },
    update: {},
    create: {
      title: "Wonder Lab: Science for Tiny Explorers",
      slug: "wonder-lab-science-tiny-explorers",
      description: "Hands-on science experiments for curious minds aged 3–5.",
      ageGroup: "AGES_3_5",
      level: "BEGINNER",
      category: "SCIENCE",
      status: "PUBLISHED",
      isFree: true,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c1.id, [
    {
      title: "Water Wonders",
      order: 1,
      lessons: [
        { title: "Does It Sink or Float?", order: 1, isFree: true, duration: 900 },
        { title: "Mixing Colours with Water", order: 2, isFree: true, duration: 900 },
        { title: "Bubbles Everywhere!", order: 3, isFree: true, duration: 900 },
      ],
    },
    {
      title: "Growing Things",
      order: 2,
      lessons: [
        { title: "Seeds and Soil", order: 1, duration: 1200 },
        { title: "What Do Plants Need?", order: 2, duration: 1200 },
        { title: "Watch It Grow!", order: 3, duration: 1200 },
      ],
    },
    {
      title: "Weather & Sky",
      order: 3,
      lessons: [
        { title: "Light and Shadow", order: 1, duration: 900 },
        { title: "Mixing Colours (Rainbow Science)", order: 2, duration: 900 },
        { title: "Our Final Experiment", order: 3, duration: 1200 },
      ],
    },
  ]);

  const c2 = await db.course.upsert({
    where: { slug: "little-coders-unplugged" },
    update: {},
    create: {
      title: "Little Coders Unplugged",
      slug: "little-coders-unplugged",
      description: "Learn coding logic through storytelling and games — no screen required.",
      ageGroup: "AGES_3_5",
      level: "BEGINNER",
      category: "CODING",
      status: "PUBLISHED",
      isFree: false,
      price: 29,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c2.id, [
    {
      title: "Sequences & Stories",
      order: 1,
      lessons: [
        { title: "The Robot Needs Instructions", order: 1, duration: 900 },
        { title: "Story Sequences", order: 2, duration: 900 },
        { title: "Order the Steps", order: 3, duration: 1200 },
      ],
    },
    {
      title: "Loops & Patterns",
      order: 2,
      lessons: [
        { title: "Patterns in Nature", order: 1, duration: 900 },
        { title: "Do It Again!", order: 2, duration: 900 },
        { title: "Loop Dance Party", order: 3, duration: 1200 },
      ],
    },
    {
      title: "Debugging",
      order: 3,
      lessons: [
        { title: "Something Went Wrong!", order: 1, duration: 900 },
        { title: "Fix the Fairy Tale", order: 2, duration: 900 },
        { title: "Be a Bug Finder", order: 3, duration: 1200 },
      ],
    },
  ]);

  const c3 = await db.course.upsert({
    where: { slug: "tiny-engineers" },
    update: {},
    create: {
      title: "Tiny Builders (Digital)",
      slug: "tiny-engineers",
      description: "Build and test playful structures and machines in colourful on-screen building games — drag, snap and watch them work.",
      ageGroup: "AGES_3_5",
      level: "BEGINNER",
      category: "ENGINEERING",
      status: "PUBLISHED",
      isFree: false,
      price: 29,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c3.id, [
    {
      title: "Build It Up",
      order: 1,
      lessons: [
        { title: "What Is Engineering?", order: 1, duration: 900 },
        { title: "Tower Challenge", order: 2, duration: 1200 },
        { title: "Test Your Tower", order: 3, duration: 1200 },
      ],
    },
    {
      title: "Bridges & Ramps",
      order: 2,
      lessons: [
        { title: "Paper Bridge Design", order: 1, duration: 1200 },
        { title: "Make a Ramp", order: 2, duration: 1200 },
        { title: "Roll It Down", order: 3, duration: 900 },
      ],
    },
    {
      title: "Design & Improve",
      order: 3,
      lessons: [
        { title: "What Went Wrong?", order: 1, duration: 900 },
        { title: "Make It Better", order: 2, duration: 1200 },
        { title: "Share Your Invention", order: 3, duration: 1200 },
      ],
    },
  ]);

  const c4 = await db.course.upsert({
    where: { slug: "space-and-sky" },
    update: {},
    create: {
      title: "Space & Sky",
      slug: "space-and-sky",
      description: "Discover planets, stars, and the moon through songs, stories, and crafts.",
      ageGroup: "AGES_3_5",
      level: "BEGINNER",
      category: "SCIENCE",
      status: "PUBLISHED",
      isFree: false,
      price: 29,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c4.id, [
    {
      title: "The Solar System",
      order: 1,
      lessons: [
        { title: "Meet the Planets", order: 1, duration: 900 },
        { title: "The Sun Is a Star", order: 2, duration: 900 },
        { title: "Planet Song & Craft", order: 3, duration: 1200 },
      ],
    },
    {
      title: "The Moon",
      order: 2,
      lessons: [
        { title: "Moon Shapes", order: 1, duration: 900 },
        { title: "Why Does the Moon Change?", order: 2, duration: 1200 },
        { title: "Moon Phase Calendar", order: 3, duration: 1200 },
      ],
    },
    {
      title: "Stars & Space Travel",
      order: 3,
      lessons: [
        { title: "Stars at Night", order: 1, duration: 900 },
        { title: "Astronauts & Rockets", order: 2, duration: 900 },
        { title: "My Space Mission", order: 3, duration: 1200 },
      ],
    },
  ]);

  const c5 = await db.course.upsert({
    where: { slug: "creative-robot-stories" },
    update: {},
    create: {
      title: "Creative Robot Stories",
      slug: "creative-robot-stories",
      description: "Meet friendly robots and learn how they think, move, and help us.",
      ageGroup: "AGES_3_5",
      level: "BEGINNER",
      category: "AI",
      status: "PUBLISHED",
      isFree: false,
      price: 29,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c5.id, [
    {
      title: "What Is a Robot?",
      order: 1,
      lessons: [
        { title: "Robots Are Everywhere", order: 1, duration: 900 },
        { title: "Robots Need Instructions", order: 2, duration: 900 },
        { title: "Be a Robot", order: 3, duration: 1200 },
      ],
    },
    {
      title: "Robots Learn",
      order: 2,
      lessons: [
        { title: "Teaching Remy", order: 1, duration: 900 },
        { title: "What Can Robots Sense?", order: 2, duration: 900 },
        { title: "Robot Memory Game", order: 3, duration: 1200 },
      ],
    },
    {
      title: "Design a Robot",
      order: 3,
      lessons: [
        { title: "What Problem Will It Solve?", order: 1, duration: 900 },
        { title: "Draw Your Robot", order: 2, duration: 1200 },
        { title: "Share Your Robot Story", order: 3, duration: 1200 },
      ],
    },
  ]);

  // ── Ages 5–7 Courses ─────────────────────────────────────────────────────

  const c6 = await db.course.upsert({
    where: { slug: "coding-adventures-blocks" },
    update: {},
    create: {
      title: "Coding Adventures with Blocks",
      slug: "coding-adventures-blocks",
      description: "Learn real programming using Scratch blocks — no typing required.",
      ageGroup: "AGES_5_7",
      level: "BEGINNER",
      category: "CODING",
      status: "PUBLISHED",
      isFree: true,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c6.id, [
    {
      title: "Meet Scratch",
      order: 1,
      lessons: [
        { title: "What Is Scratch?", order: 1, isFree: true, duration: 1200 },
        { title: "Your First Sprite", order: 2, isFree: true, duration: 1200 },
        { title: "Make It Move", order: 3, isFree: true, duration: 1200 },
      ],
    },
    {
      title: "Stories & Animations",
      order: 2,
      lessons: [
        { title: "Add a Background", order: 1, duration: 1200 },
        { title: "Make Characters Talk", order: 2, duration: 1800 },
        { title: "Animate a Story", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Your First Game",
      order: 3,
      lessons: [
        { title: "Catching Game Setup", order: 1, duration: 1800 },
        { title: "Add a Score", order: 2, duration: 1800 },
        { title: "Share Your Game", order: 3, duration: 1200 },
      ],
    },
  ]);

  const c7 = await db.course.upsert({
    where: { slug: "science-detectives" },
    update: {},
    create: {
      title: "Science Detectives",
      slug: "science-detectives",
      description: "Investigate the world like a scientist — ask questions, experiment, explain.",
      ageGroup: "AGES_5_7",
      level: "BEGINNER",
      category: "SCIENCE",
      status: "PUBLISHED",
      isFree: false,
      price: 35,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c7.id, [
    {
      title: "Forces & Motion",
      order: 1,
      lessons: [
        { title: "Push and Pull", order: 1, duration: 1200 },
        { title: "Sink or Float Experiment", order: 2, duration: 1800 },
        { title: "Ramp Speed Test", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Living Things",
      order: 2,
      lessons: [
        { title: "Plants Need Light", order: 1, duration: 1200 },
        { title: "Animal Habitats", order: 2, duration: 1200 },
        { title: "Life Cycles", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Materials & Changes",
      order: 3,
      lessons: [
        { title: "Solids, Liquids, Gases", order: 1, duration: 1200 },
        { title: "Melting and Freezing", order: 2, duration: 1800 },
        { title: "My Science Report", order: 3, duration: 1800 },
      ],
    },
  ]);

  const c8 = await db.course.upsert({
    where: { slug: "inventor-studio" },
    update: {},
    create: {
      title: "Digital Inventor Studio",
      slug: "inventor-studio",
      description: "Design inventions that solve real problems using a free online design canvas — sketch, label and animate your ideas.",
      ageGroup: "AGES_5_7",
      level: "BEGINNER",
      category: "DESIGN",
      status: "PUBLISHED",
      isFree: false,
      price: 35,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c8.id, [
    {
      title: "Spot the Problem",
      order: 1,
      lessons: [
        { title: "Problems Are Everywhere", order: 1, duration: 1200 },
        { title: "Choose Your Problem", order: 2, duration: 1200 },
        { title: "What Do Users Need?", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Design & Build",
      order: 2,
      lessons: [
        { title: "Sketch Your Idea", order: 1, duration: 1200 },
        { title: "Build a Prototype", order: 2, duration: 1800 },
        { title: "Test It Out", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Improve & Share",
      order: 3,
      lessons: [
        { title: "What Needs Fixing?", order: 1, duration: 1200 },
        { title: "Make Version 2", order: 2, duration: 1800 },
        { title: "Invention Fair Presentation", order: 3, duration: 1800 },
      ],
    },
  ]);

  const c9 = await db.course.upsert({
    where: { slug: "ai-around-us" },
    update: {},
    create: {
      title: "AI Around Us",
      slug: "ai-around-us",
      description: "Spot AI in everyday life and learn how it works in simple, friendly terms.",
      ageGroup: "AGES_5_7",
      level: "BEGINNER",
      category: "AI",
      status: "PUBLISHED",
      isFree: false,
      price: 35,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c9.id, [
    {
      title: "What Is AI?",
      order: 1,
      lessons: [
        { title: "AI Is Everywhere", order: 1, duration: 1200 },
        { title: "How Does AI Learn?", order: 2, duration: 1200 },
        { title: "AI vs. Human", order: 3, duration: 1800 },
      ],
    },
    {
      title: "AI Helpers",
      order: 2,
      lessons: [
        { title: "Voice Assistants", order: 1, duration: 1200 },
        { title: "Recommendation Engines", order: 2, duration: 1200 },
        { title: "AI in Games", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Using AI Wisely",
      order: 3,
      lessons: [
        { title: "When AI Makes Mistakes", order: 1, duration: 1200 },
        { title: "Privacy and AI", order: 2, duration: 1200 },
        { title: "Be an AI Detective", order: 3, duration: 1800 },
      ],
    },
  ]);

  const c10 = await db.course.upsert({
    where: { slug: "smart-safe-online" },
    update: {},
    create: {
      title: "Smart & Safe Online",
      slug: "smart-safe-online",
      description: "Learn how to stay safe, kind, and smart on the internet.",
      ageGroup: "AGES_5_7",
      level: "BEGINNER",
      category: "DIGITAL_LITERACY",
      status: "PUBLISHED",
      isFree: false,
      price: 35,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c10.id, [
    {
      title: "Safe Online",
      order: 1,
      lessons: [
        { title: "Personal Information", order: 1, duration: 1200 },
        { title: "Strong Passwords", order: 2, duration: 1200 },
        { title: "Strangers Online", order: 3, duration: 1200 },
      ],
    },
    {
      title: "Kind Online",
      order: 2,
      lessons: [
        { title: "What Is Cyberbullying?", order: 1, duration: 1200 },
        { title: "How to Respond", order: 2, duration: 1200 },
        { title: "Being Upstander", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Smart Online",
      order: 3,
      lessons: [
        { title: "Is It True?", order: 1, duration: 1200 },
        { title: "Spot Fake News", order: 2, duration: 1800 },
        { title: "My Digital Pledge", order: 3, duration: 1200 },
      ],
    },
  ]);

  // ── Ages 8–10 & 11–13 Courses ─────────────────────────────────────────────────────

  const c11 = await db.course.upsert({
    where: { slug: "scratch-game-studio" },
    update: {},
    create: {
      title: "Scratch Game Studio",
      slug: "scratch-game-studio",
      description: "Design and build complete Scratch games with scoring, levels, and sound.",
      ageGroup: "AGES_8_10",
      level: "INTERMEDIATE",
      category: "CODING",
      status: "PUBLISHED",
      isFree: true,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c11.id, [
    {
      title: "Game Design Foundations",
      order: 1,
      lessons: [
        { title: "Game Ideas & Design Docs", order: 1, isFree: true, duration: 1800 },
        { title: "Sprites, Costumes & Sounds", order: 2, isFree: true, duration: 1800 },
        { title: "Movement & Controls", order: 3, isFree: true, duration: 2400 },
      ],
    },
    {
      title: "Game Mechanics",
      order: 2,
      lessons: [
        { title: "Collision Detection", order: 1, duration: 2400 },
        { title: "Score & Lives", order: 2, duration: 2400 },
        { title: "Levels & Difficulty", order: 3, duration: 2400 },
      ],
    },
    {
      title: "Polish & Publish",
      order: 3,
      lessons: [
        { title: "Music & Sound Effects", order: 1, duration: 1800 },
        { title: "Start Screen & Game Over", order: 2, duration: 1800 },
        { title: "Publish & Get Feedback", order: 3, duration: 1800 },
      ],
    },
  ]);

  const c12 = await db.course.upsert({
    where: { slug: "junior-robotics-automation" },
    update: {},
    create: {
      title: "Virtual Robotics & Simulation",
      slug: "junior-robotics-automation",
      description: "Program robots entirely in your browser — drive, sense and solve missions in an online robot simulator. No hardware needed.",
      ageGroup: "AGES_11_13",
      level: "INTERMEDIATE",
      category: "ROBOTICS",
      status: "PUBLISHED",
      isFree: false,
      price: 49,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c12.id, [
    {
      title: "Robot Basics",
      order: 1,
      lessons: [
        { title: "How Robots Work", order: 1, duration: 1800 },
        { title: "Sensors & Actuators", order: 2, duration: 1800 },
        { title: "Your First Robot Program", order: 3, duration: 2400 },
      ],
    },
    {
      title: "Robot Missions",
      order: 2,
      lessons: [
        { title: "Navigate a Maze", order: 1, duration: 2400 },
        { title: "Delivery Mission", order: 2, duration: 2400 },
        { title: "Sort by Colour", order: 3, duration: 2400 },
      ],
    },
    {
      title: "Automation",
      order: 3,
      lessons: [
        { title: "Loops and Repetition", order: 1, duration: 1800 },
        { title: "Condition-Based Actions", order: 2, duration: 2400 },
        { title: "Design Your Own Mission", order: 3, duration: 2400 },
      ],
    },
  ]);

  const c13 = await db.course.upsert({
    where: { slug: "space-science-missions" },
    update: {},
    create: {
      title: "Space Science & Simulations",
      slug: "space-science-missions",
      description: "Explore the solar system and design space missions in interactive online simulations and orbital sandboxes.",
      ageGroup: "AGES_11_13",
      level: "INTERMEDIATE",
      category: "SCIENCE",
      status: "PUBLISHED",
      isFree: false,
      price: 45,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c13.id, [
    {
      title: "Our Solar System",
      order: 1,
      lessons: [
        { title: "Scale of the Solar System", order: 1, duration: 1800 },
        { title: "Rocky vs. Gas Planets", order: 2, duration: 1800 },
        { title: "Dwarf Planets & Moons", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Spacecraft & Missions",
      order: 2,
      lessons: [
        { title: "How Rockets Work", order: 1, duration: 1800 },
        { title: "Famous Space Missions", order: 2, duration: 1800 },
        { title: "Design a Mars Mission", order: 3, duration: 2400 },
      ],
    },
    {
      title: "Life in Space",
      order: 3,
      lessons: [
        { title: "Living on the ISS", order: 1, duration: 1800 },
        { title: "Could We Live on Mars?", order: 2, duration: 1800 },
        { title: "Search for Life", order: 3, duration: 2400 },
      ],
    },
  ]);

  const c14 = await db.course.upsert({
    where: { slug: "data-detectives" },
    update: {},
    create: {
      title: "Data Detectives",
      slug: "data-detectives",
      description: "Collect, chart, and interpret real data to answer questions that matter.",
      ageGroup: "AGES_11_13",
      level: "INTERMEDIATE",
      category: "DATA_SCIENCE",
      status: "PUBLISHED",
      isFree: false,
      price: 45,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c14.id, [
    {
      title: "Collecting Data",
      order: 1,
      lessons: [
        { title: "What Is Data?", order: 1, duration: 1800 },
        { title: "Surveys & Tally Charts", order: 2, duration: 1800 },
        { title: "Organising Your Data", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Visualising Data",
      order: 2,
      lessons: [
        { title: "Bar Charts & Pie Charts", order: 1, duration: 1800 },
        { title: "Line Graphs", order: 2, duration: 1800 },
        { title: "Choosing the Right Chart", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Interpreting Data",
      order: 3,
      lessons: [
        { title: "Averages & Ranges", order: 1, duration: 1800 },
        { title: "Spotting Patterns", order: 2, duration: 1800 },
        { title: "Data Investigation Project", order: 3, duration: 2400 },
      ],
    },
  ]);

  const c15 = await db.course.upsert({
    where: { slug: "media-smart-kids" },
    update: {},
    create: {
      title: "Media Smart Kids",
      slug: "media-smart-kids",
      description: "Create, critique, and fact-check media like a professional journalist.",
      ageGroup: "AGES_8_10",
      level: "INTERMEDIATE",
      category: "DIGITAL_LITERACY",
      status: "PUBLISHED",
      isFree: false,
      price: 45,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c15.id, [
    {
      title: "Understanding Media",
      order: 1,
      lessons: [
        { title: "What Is Media?", order: 1, duration: 1800 },
        { title: "Who Makes the News?", order: 2, duration: 1800 },
        { title: "Media Ownership & Bias", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Fact-Checking",
      order: 2,
      lessons: [
        { title: "True, False, or Opinion?", order: 1, duration: 1800 },
        { title: "Fact-Check a Story", order: 2, duration: 2400 },
        { title: "Deepfakes & Manipulation", order: 3, duration: 1800 },
      ],
    },
    {
      title: "Create Media",
      order: 3,
      lessons: [
        { title: "Write a News Article", order: 1, duration: 2400 },
        { title: "Film a Short Video Report", order: 2, duration: 2400 },
        { title: "Publish Responsibly", order: 3, duration: 1800 },
      ],
    },
  ]);

  // ── Ages 14–16 Courses ────────────────────────────────────────────────────

  const c16 = await db.course.upsert({
    where: { slug: "web-builders-bootcamp" },
    update: {},
    create: {
      title: "Web Builders Bootcamp",
      slug: "web-builders-bootcamp",
      description: "Build real websites with HTML, CSS, and JavaScript from scratch.",
      ageGroup: "AGES_14_16",
      level: "BEGINNER",
      category: "CODING",
      status: "PUBLISHED",
      isFree: true,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c16.id, [
    {
      title: "HTML Foundations",
      order: 1,
      lessons: [
        { title: "What Is the Web?", order: 1, isFree: true, duration: 2400 },
        { title: "HTML Structure", order: 2, isFree: true, duration: 2400 },
        { title: "Links, Images & Lists", order: 3, isFree: true, duration: 2400 },
      ],
    },
    {
      title: "CSS Styling",
      order: 2,
      lessons: [
        { title: "Colours & Fonts", order: 1, duration: 2400 },
        { title: "Box Model & Layout", order: 2, duration: 2700 },
        { title: "Responsive Design", order: 3, duration: 2700 },
      ],
    },
    {
      title: "JavaScript Basics",
      order: 3,
      lessons: [
        { title: "Variables & Events", order: 1, duration: 2400 },
        { title: "Interactivity with JS", order: 2, duration: 2700 },
        { title: "Publish Your Portfolio Site", order: 3, duration: 2400 },
      ],
    },
  ]);

  const c17 = await db.course.upsert({
    where: { slug: "python-logic-lab" },
    update: {},
    create: {
      title: "Python Logic Lab",
      slug: "python-logic-lab",
      description: "Learn Python programming through logical puzzles, data, and mini-projects.",
      ageGroup: "AGES_14_16",
      level: "INTERMEDIATE",
      category: "CODING",
      status: "PUBLISHED",
      isFree: false,
      price: 59,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c17.id, [
    {
      title: "Python Foundations",
      order: 1,
      lessons: [
        { title: "Variables & Data Types", order: 1, duration: 2700 },
        { title: "Input & Output", order: 2, duration: 2700 },
        { title: "Conditions & Decisions", order: 3, duration: 2700 },
      ],
    },
    {
      title: "Loops & Functions",
      order: 2,
      lessons: [
        { title: "For Loops & While Loops", order: 1, duration: 2700 },
        { title: "Writing Functions", order: 2, duration: 2700 },
        { title: "Lists & Dictionaries", order: 3, duration: 2700 },
      ],
    },
    {
      title: "Mini Projects",
      order: 3,
      lessons: [
        { title: "Number Guessing Game", order: 1, duration: 2700 },
        { title: "Text Analyser", order: 2, duration: 2700 },
        { title: "Final Project: Your Choice", order: 3, duration: 3600 },
      ],
    },
  ]);

  const c18 = await db.course.upsert({
    where: { slug: "ai-literacy-ethics" },
    update: {},
    create: {
      title: "AI Literacy & Ethics",
      slug: "ai-literacy-ethics",
      description: "Understand how AI systems work and think critically about their impact on society.",
      ageGroup: "AGES_14_16",
      level: "INTERMEDIATE",
      category: "AI",
      status: "PUBLISHED",
      isFree: false,
      price: 59,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c18.id, [
    {
      title: "How AI Works",
      order: 1,
      lessons: [
        { title: "What Is Machine Learning?", order: 1, duration: 2400 },
        { title: "Training Data & Labels", order: 2, duration: 2400 },
        { title: "Train Your First Model", order: 3, duration: 2700 },
      ],
    },
    {
      title: "AI in Society",
      order: 2,
      lessons: [
        { title: "AI Bias Case Studies", order: 1, duration: 2400 },
        { title: "Privacy & Surveillance", order: 2, duration: 2400 },
        { title: "Automation & Jobs", order: 3, duration: 2400 },
      ],
    },
    {
      title: "Responsible AI",
      order: 3,
      lessons: [
        { title: "AI Rules & Regulations", order: 1, duration: 2400 },
        { title: "Design for Fairness", order: 2, duration: 2700 },
        { title: "AI Ethics Debate", order: 3, duration: 2700 },
      ],
    },
  ]);

  const c19 = await db.course.upsert({
    where: { slug: "cyber-basics-teens" },
    update: {},
    create: {
      title: "Cyber Basics for Teens",
      slug: "cyber-basics-teens",
      description: "Learn to protect yourself and others online with real cybersecurity skills.",
      ageGroup: "AGES_14_16",
      level: "INTERMEDIATE",
      category: "CYBERSECURITY",
      status: "PUBLISHED",
      isFree: false,
      price: 59,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c19.id, [
    {
      title: "Stay Secure",
      order: 1,
      lessons: [
        { title: "Passwords & Authentication", order: 1, duration: 2400 },
        { title: "Phishing & Social Engineering", order: 2, duration: 2400 },
        { title: "Safe Browsing Habits", order: 3, duration: 2400 },
      ],
    },
    {
      title: "How Attacks Work",
      order: 2,
      lessons: [
        { title: "Common Cyber Threats", order: 1, duration: 2400 },
        { title: "Encryption Basics", order: 2, duration: 2700 },
        { title: "Network Security", order: 3, duration: 2700 },
      ],
    },
    {
      title: "Ethical Hacking",
      order: 3,
      lessons: [
        { title: "What Do Ethical Hackers Do?", order: 1, duration: 2400 },
        { title: "Try a CTF Challenge", order: 2, duration: 3600 },
        { title: "Write a Security Report", order: 3, duration: 2700 },
      ],
    },
  ]);

  const c20 = await db.course.upsert({
    where: { slug: "design-build-test" },
    update: {},
    create: {
      title: "Design, Build, Test",
      slug: "design-build-test",
      description: "Master the full design thinking process from user research to final prototype.",
      ageGroup: "AGES_14_16",
      level: "INTERMEDIATE",
      category: "DESIGN",
      status: "PUBLISHED",
      isFree: false,
      price: 59,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c20.id, [
    {
      title: "Understand the User",
      order: 1,
      lessons: [
        { title: "Interview and Observe", order: 1, duration: 2700 },
        { title: "Define the Problem", order: 2, duration: 2400 },
        { title: "Ideate Without Limits", order: 3, duration: 2400 },
      ],
    },
    {
      title: "Prototype",
      order: 2,
      lessons: [
        { title: "Paper Prototype", order: 1, duration: 2700 },
        { title: "Digital Mockup", order: 2, duration: 2700 },
        { title: "Prototype Walkthrough", order: 3, duration: 2400 },
      ],
    },
    {
      title: "Iterate",
      order: 3,
      lessons: [
        { title: "Collect Feedback", order: 1, duration: 2400 },
        { title: "Design for Version 2", order: 2, duration: 2700 },
        { title: "Present Version 2", order: 3, duration: 2700 },
      ],
    },
  ]);

  // ── Ages 17–18 Courses ────────────────────────────────────────────────────

  const c21 = await db.course.upsert({
    where: { slug: "ai-foundations-future-leaders" },
    update: {},
    create: {
      title: "AI Foundations for Future Leaders",
      slug: "ai-foundations-future-leaders",
      description: "Understand machine learning, societal AI impacts, and build your first model.",
      ageGroup: "AGES_17_18",
      level: "INTERMEDIATE",
      category: "AI",
      status: "PUBLISHED",
      isFree: true,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c21.id, [
    {
      title: "How AI Learns",
      order: 1,
      lessons: [
        { title: "Data, Patterns, Predictions", order: 1, isFree: true, duration: 3600 },
        { title: "Training a Model", order: 2, isFree: true, duration: 3600 },
        { title: "When Models Fail", order: 3, isFree: true, duration: 3600 },
      ],
    },
    {
      title: "AI in Society",
      order: 2,
      lessons: [
        { title: "Bias in the Machine", order: 1, duration: 3600 },
        { title: "Privacy and Surveillance", order: 2, duration: 3600 },
        { title: "Automation and the Future of Work", order: 3, duration: 3600 },
      ],
    },
    {
      title: "Responsible AI Leadership",
      order: 3,
      lessons: [
        { title: "Ethical Frameworks for AI", order: 1, duration: 3600 },
        { title: "Designing for Good", order: 2, duration: 3600 },
        { title: "Your AI Manifesto", order: 3, duration: 3600 },
      ],
    },
  ]);

  const c22 = await db.course.upsert({
    where: { slug: "full-stack-thinking" },
    update: {},
    create: {
      title: "Full-Stack Thinking",
      slug: "full-stack-thinking",
      description: "Build and deploy a full-stack web app with front-end, back-end, and database.",
      ageGroup: "AGES_17_18",
      level: "ADVANCED",
      category: "CODING",
      status: "PUBLISHED",
      isFree: false,
      price: 79,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c22.id, [
    {
      title: "Front-End Foundations",
      order: 1,
      lessons: [
        { title: "HTML + CSS Revisited", order: 1, duration: 4500 },
        { title: "JavaScript in the Browser", order: 2, duration: 4500 },
        { title: "Fetch and APIs", order: 3, duration: 4500 },
      ],
    },
    {
      title: "Back-End Basics",
      order: 2,
      lessons: [
        { title: "Servers and Routes", order: 1, duration: 4500 },
        { title: "Connecting a Database", order: 2, duration: 4500 },
        { title: "Authentication Basics", order: 3, duration: 4500 },
      ],
    },
    {
      title: "Ship It",
      order: 3,
      lessons: [
        { title: "Wiring Front-End to Back-End", order: 1, duration: 4500 },
        { title: "Deployment", order: 2, duration: 4500 },
        { title: "Git, GitHub, and Collaboration", order: 3, duration: 4500 },
      ],
    },
  ]);

  const c23 = await db.course.upsert({
    where: { slug: "data-decisions-society" },
    update: {},
    create: {
      title: "Data Decisions & Society",
      slug: "data-decisions-society",
      description: "Collect, visualise, and communicate data insights on real social issues.",
      ageGroup: "AGES_17_18",
      level: "ADVANCED",
      category: "DATA_SCIENCE",
      status: "PUBLISHED",
      isFree: false,
      price: 69,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c23.id, [
    {
      title: "Data Literacy",
      order: 1,
      lessons: [
        { title: "Every Number Tells a Story", order: 1, duration: 3600 },
        { title: "Cleaning Messy Data", order: 2, duration: 3600 },
        { title: "Descriptive Statistics", order: 3, duration: 3600 },
      ],
    },
    {
      title: "Visualise and Communicate",
      order: 2,
      lessons: [
        { title: "Chart Types and When to Use Them", order: 1, duration: 3600 },
        { title: "Telling a Story with Data", order: 2, duration: 3600 },
        { title: "Spotting Misleading Data", order: 3, duration: 3600 },
      ],
    },
    {
      title: "Data for Good",
      order: 3,
      lessons: [
        { title: "Open Data and Civic Tech", order: 1, duration: 3600 },
        { title: "Algorithmic Decision-Making", order: 2, duration: 3600 },
        { title: "Data for Change (Capstone)", order: 3, duration: 4500 },
      ],
    },
  ]);

  const c24 = await db.course.upsert({
    where: { slug: "startup-lab" },
    update: {},
    create: {
      title: "Startup Lab",
      slug: "startup-lab",
      description: "Build a real startup from problem discovery to MVP, pitch, and business model.",
      ageGroup: "AGES_17_18",
      level: "ADVANCED",
      category: "ENTREPRENEURSHIP",
      status: "PUBLISHED",
      isFree: false,
      price: 79,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c24.id, [
    {
      title: "Find the Problem",
      order: 1,
      lessons: [
        { title: "Problems Are Opportunities", order: 1, duration: 4500 },
        { title: "Customer Discovery Interviews", order: 2, duration: 4500 },
        { title: "Problem-Solution Fit", order: 3, duration: 4500 },
      ],
    },
    {
      title: "Build the Solution",
      order: 2,
      lessons: [
        { title: "The Business Model Canvas", order: 1, duration: 4500 },
        { title: "Your Minimum Viable Product", order: 2, duration: 4500 },
        { title: "Test and Learn", order: 3, duration: 4500 },
      ],
    },
    {
      title: "Pitch and Grow",
      order: 3,
      lessons: [
        { title: "Financial Basics for Founders", order: 1, duration: 4500 },
        { title: "Storytelling for Startups", order: 2, duration: 4500 },
        { title: "Demo Day (Capstone)", order: 3, duration: 5400 },
      ],
    },
  ]);

  const c25 = await db.course.upsert({
    where: { slug: "career-launch" },
    update: {},
    create: {
      title: "Career Launch",
      slug: "career-launch",
      description: "Build your professional portfolio, CV, and LinkedIn — and land your first opportunity.",
      ageGroup: "AGES_17_18",
      level: "ADVANCED",
      category: "CAREER",
      status: "PUBLISHED",
      isFree: false,
      price: 59,
      createdById: admin.id,
    },
  });
  await seedCourseContent(c25.id, [
    {
      title: "Know Yourself",
      order: 1,
      lessons: [
        { title: "Strengths, Skills, Interests", order: 1, duration: 3600 },
        { title: "Exploring STEM Careers", order: 2, duration: 3600 },
        { title: "Setting a 12-Month Goal", order: 3, duration: 3600 },
      ],
    },
    {
      title: "Build Your Portfolio",
      order: 2,
      lessons: [
        { title: "What Goes in a Portfolio", order: 1, duration: 3600 },
        { title: "Build Your Portfolio Site", order: 2, duration: 4500 },
        { title: "GitHub for Professionals", order: 3, duration: 3600 },
      ],
    },
    {
      title: "Apply and Interview",
      order: 3,
      lessons: [
        { title: "CVs and Cover Letters", order: 1, duration: 3600 },
        { title: "Mock Interviews", order: 2, duration: 4500 },
        { title: "Launch Day (Capstone)", order: 3, duration: 4500 },
      ],
    },
  ]);

  // ── Catalog expansion ────────────────────────────────────────────────────
  // Reference sources, the full 93-course master list (new courses created with
  // placeholder lessons; the 25 base courses above + 9 former placeholders are
  // enriched and mapped, never duplicated), the 11 bundles and 6 age pathways,
  // and every reference-source link. See prisma/catalog/* and seed-catalog.ts.
  await seedCatalog(db, admin.id);


  // ── Enrollments (skip gracefully if they already exist) ─────────────────
  const enrollments = [
    { userId: student1.id, courseId: c1.id, status: "ACTIVE" as const, progress: 50 },
    { userId: student2.id, courseId: c1.id, status: "COMPLETED" as const, progress: 100, completedAt: new Date() },
    { userId: student1.id, courseId: c2.id, status: "ACTIVE" as const, progress: 25 },
  ];
  for (const enr of enrollments) {
    try {
      await db.enrollment.upsert({
        where: { userId_courseId: { userId: enr.userId, courseId: enr.courseId } },
        update: {},
        create: enr,
      });
    } catch {
      console.log(`⚠️  Skipped enrollment (userId=${enr.userId}, courseId=${enr.courseId}) — already exists`);
    }
  }

  // ── Badges ────────────────────────────────────────────────────────────────
  const badge1 = await db.badge.upsert({
    where: { slug: "first-steps" },
    update: {},
    create: { slug: "first-steps", name: "First Steps", description: "Complete your first lesson", icon: "👟", criteria: { minPoints: 10 } },
  });
  await db.badge.upsert({
    where: { slug: "star-learner" },
    update: {},
    create: { slug: "star-learner", name: "Star Learner", description: "Earn 100 points", icon: "⭐", criteria: { minPoints: 100 } },
  });
  await db.badge.upsert({
    where: { slug: "course-champion" },
    update: {},
    create: { slug: "course-champion", name: "Course Champion", description: "Complete 3 courses", icon: "🏆", criteria: { minEnrollments: 3 } },
  });

  // Award badge
  await db.userBadge.upsert({
    where: { userId_badgeId: { userId: student1.id, badgeId: badge1.id } },
    update: {},
    create: { userId: student1.id, badgeId: badge1.id },
  });

  // ── Points ────────────────────────────────────────────────────────────────
  const pointCount = await db.pointTransaction.count({ where: { userId: student1.id } });
  if (pointCount === 0) {
    await db.pointTransaction.createMany({
      data: [
        { userId: student1.id, action: "LESSON_COMPLETED", points: 10 },
        { userId: student1.id, action: "QUIZ_PASSED", points: 25 },
        { userId: student2.id, action: "COURSE_COMPLETED", points: 100 },
        { userId: student2.id, action: "LESSON_COMPLETED", points: 10 },
      ],
    });
  }

  // ── Booking ───────────────────────────────────────────────────────────────
  const bookingCount = await db.booking.count({ where: { studentId: student1.id } });
  if (bookingCount === 0) {
    await db.booking.create({
      data: {
        studentId: student1.id,
        tutorId: tutorProfile.id,
        subject: "Math",
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 86400000 + 3600000),
        status: "CONFIRMED",
        price: 45,
        notes: "Need help with fractions",
      },
    });
  }

  // ── Products ──────────────────────────────────────────────────────────────
  await db.product.upsert({
    where: { slug: "robotics-starter-kit" },
    update: {},
    create: {
      name: "Robotics Starter Kit",
      slug: "robotics-starter-kit",
      description: "Build your first robot with this beginner-friendly kit including servo motors, sensors, and step-by-step guide.",
      price: 79,
      ageGroup: "AGES_8_10",
      category: "ROBOTICS",
      status: "ACTIVE",
      stock: 50,
    },
  });
  await db.product.upsert({
    where: { slug: "circuit-explorer-kit" },
    update: {},
    create: {
      name: "Circuit Explorer Kit",
      slug: "circuit-explorer-kit",
      description: "Learn electronics fundamentals with hands-on circuit experiments and color-coded components.",
      price: 49,
      ageGroup: "AGES_5_7",
      category: "ELECTRONICS",
      status: "ACTIVE",
      stock: 100,
    },
  });

  // ── Competitions ──────────────────────────────────────────────────────────
  await db.competition.upsert({
    where: { slug: "global-stem-challenge-2026" },
    update: {},
    create: {
      title: "Global STEM Challenge 2026",
      slug: "global-stem-challenge-2026",
      description: "The world's premier STEM competition for young innovators aged 9-18.",
      rules: "Projects must be original. Teams of 1-3 members.",
      prizes: { first: "$500 + trophy", second: "$250", third: "$100" },
      status: "UPCOMING",
      category: "STEM",
      ageGroup: "AGES_8_10",
      registrationStart: new Date("2026-03-01"),
      registrationEnd: new Date("2026-03-31"),
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-30"),
      maxParticipants: 500,
    },
  });
  await db.competition.upsert({
    where: { slug: "young-coders-hackathon" },
    update: {},
    create: {
      title: "Young Coders Hackathon",
      slug: "young-coders-hackathon",
      description: "A 48-hour online hackathon for budding programmers aged 6-12.",
      rules: "Individual participation only. Use Scratch or Python.",
      prizes: { first: "Schulab Pro 1-year", second: "STEM Kit", third: "Course voucher" },
      status: "UPCOMING",
      category: "CODING",
      ageGroup: "AGES_5_7",
      registrationStart: new Date("2026-04-15"),
      registrationEnd: new Date("2026-05-10"),
      startDate: new Date("2026-05-15"),
      endDate: new Date("2026-05-17"),
      maxParticipants: 200,
    },
  });

  // ── Notifications ─────────────────────────────────────────────────────────
  const notifCount = await db.notification.count({ where: { userId: student1.id } });
  if (notifCount === 0) {
    await db.notification.create({
      data: { userId: student1.id, title: "Welcome to Schulab!", body: "You've successfully joined Schulab. Start exploring courses.", type: "INFO" },
    });
    await db.notification.create({
      data: { userId: student1.id, title: "Badge Earned!", body: "You earned the 'First Steps' badge. Keep learning!", type: "BADGE" },
    });
  }

  // ── Super Admin User ───────────────────────────────────────────────────
  await db.user.upsert({
    where: { email: "superadmin@schulab.com" },
    update: { role: "SUPER_ADMIN" },
    create: { name: "Super Admin", email: "superadmin@schulab.com", passwordHash, role: "SUPER_ADMIN", isActive: true },
  });

  // ── Default Permissions ───────────────────────────────────────────────
  const defaultPermissions = [
    { resource: "courses", action: "create", description: "Create courses" },
    { resource: "courses", action: "read", description: "View courses" },
    { resource: "courses", action: "update", description: "Edit courses" },
    { resource: "courses", action: "delete", description: "Delete courses" },
    { resource: "users", action: "create", description: "Create users" },
    { resource: "users", action: "read", description: "View users" },
    { resource: "users", action: "update", description: "Edit users" },
    { resource: "users", action: "delete", description: "Delete users" },
    { resource: "products", action: "create", description: "Create products" },
    { resource: "products", action: "read", description: "View products" },
    { resource: "products", action: "update", description: "Edit products" },
    { resource: "products", action: "delete", description: "Delete products" },
    { resource: "pages", action: "create", description: "Create CMS pages" },
    { resource: "pages", action: "read", description: "View CMS pages" },
    { resource: "pages", action: "update", description: "Edit CMS pages" },
    { resource: "pages", action: "delete", description: "Delete CMS pages" },
    { resource: "tutors", action: "read", description: "View tutor profiles" },
    { resource: "tutors", action: "manage", description: "Approve/reject tutors" },
    { resource: "bookings", action: "read", description: "View bookings" },
    { resource: "bookings", action: "manage", description: "Manage bookings" },
    { resource: "badges", action: "create", description: "Create badges" },
    { resource: "badges", action: "read", description: "View badges" },
    { resource: "badges", action: "update", description: "Edit badges" },
    { resource: "badges", action: "delete", description: "Delete badges" },
    { resource: "competitions", action: "create", description: "Create competitions" },
    { resource: "competitions", action: "read", description: "View competitions" },
    { resource: "competitions", action: "update", description: "Edit competitions" },
    { resource: "competitions", action: "delete", description: "Delete competitions" },
    { resource: "settings", action: "read", description: "View system settings" },
    { resource: "settings", action: "manage", description: "Manage system settings" },
    { resource: "roles", action: "read", description: "View roles and permissions" },
    { resource: "roles", action: "manage", description: "Manage roles and permissions" },
    { resource: "enrollments", action: "read", description: "View enrollments" },
    { resource: "enrollments", action: "manage", description: "Manage enrollments" },
    { resource: "notifications", action: "create", description: "Send notifications" },
    { resource: "notifications", action: "read", description: "View notifications" },
  ];

  const permissionRecords = [];
  for (const p of defaultPermissions) {
    const perm = await db.permission.upsert({
      where: { resource_action: { resource: p.resource, action: p.action } },
      update: { description: p.description },
      create: { name: `${p.resource}.${p.action}`, description: p.description, resource: p.resource, action: p.action },
    });
    permissionRecords.push(perm);
  }

  // ── Role-Permission Mappings ──────────────────────────────────────────
  // SUPER_ADMIN gets all permissions
  for (const perm of permissionRecords) {
    await db.rolePermission.upsert({
      where: { role_permissionId: { role: "SUPER_ADMIN", permissionId: perm.id } },
      update: {},
      create: { role: "SUPER_ADMIN", permissionId: perm.id },
    });
  }

  // ADMIN gets most permissions (except roles.manage and settings.manage)
  const adminPerms = permissionRecords.filter(
    (p) => !(p.resource === "roles" && p.action === "manage") && !(p.resource === "settings" && p.action === "manage")
  );
  for (const perm of adminPerms) {
    await db.rolePermission.upsert({
      where: { role_permissionId: { role: "ADMIN", permissionId: perm.id } },
      update: {},
      create: { role: "ADMIN", permissionId: perm.id },
    });
  }

  // TUTOR gets limited read permissions
  const tutorPermNames = ["courses.read", "bookings.read", "bookings.manage", "notifications.read"];
  for (const name of tutorPermNames) {
    const perm = permissionRecords.find((p) => p.name === name);
    if (perm) {
      await db.rolePermission.upsert({
        where: { role_permissionId: { role: "TUTOR", permissionId: perm.id } },
        update: {},
        create: { role: "TUTOR", permissionId: perm.id },
      });
    }
  }

  // STUDENT gets basic read permissions
  const studentPermNames = ["courses.read", "badges.read", "competitions.read", "notifications.read"];
  for (const name of studentPermNames) {
    const perm = permissionRecords.find((p) => p.name === name);
    if (perm) {
      await db.rolePermission.upsert({
        where: { role_permissionId: { role: "STUDENT", permissionId: perm.id } },
        update: {},
        create: { role: "STUDENT", permissionId: perm.id },
      });
    }
  }

  // PARENT gets read access to courses, enrollments, notifications
  const parentPermNames = ["courses.read", "enrollments.read", "notifications.read"];
  for (const name of parentPermNames) {
    const perm = permissionRecords.find((p) => p.name === name);
    if (perm) {
      await db.rolePermission.upsert({
        where: { role_permissionId: { role: "PARENT", permissionId: perm.id } },
        update: {},
        create: { role: "PARENT", permissionId: perm.id },
      });
    }
  }

  // ── Default System Settings ───────────────────────────────────────────
  const defaultSettings = [
    { key: "site.name", value: "Schulab", type: "string", category: "general", label: "Site Name", description: "The name of the platform" },
    { key: "site.tagline", value: "STEM Education for Every Child", type: "string", category: "general", label: "Tagline", description: "Platform tagline shown on homepage" },
    { key: "site.supportEmail", value: "support@schulab.com", type: "string", category: "general", label: "Support Email", description: "Email address for support inquiries" },
    { key: "site.defaultLocale", value: "en", type: "string", category: "general", label: "Default Locale", description: "Default language for the platform" },
    { key: "site.maintenanceMode", value: "false", type: "boolean", category: "general", label: "Maintenance Mode", description: "Put the site in maintenance mode" },
    { key: "email.fromName", value: "Schulab", type: "string", category: "email", label: "From Name", description: "Sender name for outgoing emails" },
    { key: "email.fromAddress", value: "noreply@schulab.com", type: "string", category: "email", label: "From Address", description: "Sender email for outgoing emails" },
    { key: "email.smtpHost", value: "", type: "string", category: "email", label: "SMTP Host", description: "SMTP server hostname" },
    { key: "email.smtpPort", value: "587", type: "number", category: "email", label: "SMTP Port", description: "SMTP server port" },
    { key: "payments.currency", value: "USD", type: "string", category: "payments", label: "Currency", description: "Default payment currency" },
    { key: "payments.taxRate", value: "0", type: "number", category: "payments", label: "Tax Rate (%)", description: "Tax rate applied to purchases" },
    { key: "payments.stripeEnabled", value: "false", type: "boolean", category: "payments", label: "Stripe Enabled", description: "Enable Stripe payment processing" },
    { key: "branding.primaryColor", value: "#6366f1", type: "string", category: "branding", label: "Primary Color", description: "Primary brand color (hex)" },
    { key: "branding.logoUrl", value: "", type: "string", category: "branding", label: "Logo URL", description: "URL to the platform logo" },
    { key: "notifications.emailEnabled", value: "true", type: "boolean", category: "notifications", label: "Email Notifications", description: "Send email notifications to users" },
    { key: "notifications.pushEnabled", value: "false", type: "boolean", category: "notifications", label: "Push Notifications", description: "Enable push notifications" },
  ];

  for (const s of defaultSettings) {
    await db.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // ── Plans ───────────────────────────────────────────────────────────────
  // Stripe price IDs stay null until the catalog is connected to Stripe.
  // checkout creation intentionally refuses to start a subscription for a
  // plan with no stripePriceId, so missing data fails loudly.
  const plans = [
    {
      slug: "free",
      tier: "FREE" as const,
      interval: null,
      name: "Free",
      description: "Sample lessons, certificate of participation on free courses, limited community access.",
      amount: 0,
      currency: "USD",
      features: { sampleLessons: true, community: "read-only" },
      isFeatured: false,
      sortOrder: 0,
    },
    {
      slug: "learner-monthly",
      tier: "LEARNER" as const,
      interval: "MONTHLY" as const,
      name: "Learner — Monthly",
      description: "Full access to every course, certificates, badges, and the community.",
      amount: 29,
      currency: "USD",
      features: { allCourses: true, certificates: true, community: true },
      sortOrder: 10,
    },
    {
      slug: "learner-yearly",
      tier: "LEARNER" as const,
      interval: "YEARLY" as const,
      name: "Learner — Annual",
      description: "Everything in Monthly, billed annually. Includes offline access and priority support.",
      amount: 199,
      currency: "USD",
      features: { allCourses: true, certificates: true, community: true, offline: true, prioritySupport: true },
      isFeatured: true,
      trialDays: 7,
      sortOrder: 20,
    },
    {
      slug: "pro-yearly",
      tier: "PRO" as const,
      interval: "YEARLY" as const,
      name: "Pro — Annual",
      description: "All Learner benefits plus a monthly 1:1 mentor session and proctored certification exams.",
      amount: 399,
      currency: "USD",
      features: {
        allCourses: true,
        certificates: true,
        community: true,
        offline: true,
        prioritySupport: true,
        liveClasses: true,
        mentorHoursPerMonth: 1,
        proctoredExams: true,
      },
      trialDays: 7,
      sortOrder: 30,
    },
  ];

  for (const p of plans) {
    await db.plan.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log(
    `✅ Seed complete — base courses + full catalog (93-course master list, 11 bundles, 6 pathways, reference sources), ${plans.length} plans`
  );
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
