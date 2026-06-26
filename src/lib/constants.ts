export const AGE_GROUPS = [
  { value: "AGES_3_5", label: "Early Learners (3–5)", minAge: 3, maxAge: 5 },
  { value: "AGES_5_7", label: "Juniors (5–7)", minAge: 5, maxAge: 7 },
  { value: "AGES_8_10", label: "Explorers (8–10)", minAge: 8, maxAge: 10 },
  { value: "AGES_11_13", label: "Builders (11–13)", minAge: 11, maxAge: 13 },
  { value: "AGES_14_16", label: "Teens (14–16)", minAge: 14, maxAge: 16 },
  { value: "AGES_17_18", label: "Seniors (17–18)", minAge: 17, maxAge: 18 },
] as const;

// Canonical enum-value tuple for the AgeGroup DB enum, derived from AGE_GROUPS
// so Zod schemas and selects never drift. Typed for z.enum() use.
export const AGE_GROUP_VALUES = AGE_GROUPS.map((g) => g.value) as unknown as [
  string,
  ...string[],
];

export const COURSE_CATEGORIES = [
  { value: "math", label: "Mathematics" },
  { value: "coding", label: "Coding & Programming" },
  { value: "science", label: "Science" },
  { value: "robotics", label: "Robotics" },
  { value: "engineering", label: "Engineering" },
  { value: "ai", label: "AI & Machine Learning" },
  { value: "electronics", label: "Electronics" },
  { value: "biology", label: "Biology" },
  { value: "chemistry", label: "Chemistry" },
  { value: "physics", label: "Physics" },
] as const;

export const COURSE_LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

export const USER_ROLES = [
  { value: "STUDENT", label: "Student" },
  { value: "PARENT", label: "Parent" },
  { value: "TUTOR", label: "Tutor" },
  { value: "ADMIN", label: "Admin" },
  { value: "B2B_PARTNER", label: "Organization" },
] as const;

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
