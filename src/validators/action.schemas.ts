import { z } from "zod";
import { AGE_GROUP_VALUES } from "@/lib/constants";

// ── Shared ──────────────────────────────────────────────────────────────

export const cuidSchema = z.string().min(1, "ID is required");

// Single source of truth for the AgeGroup enum, derived from AGE_GROUPS so the
// six bands never drift between the DB enum, forms and validators.
const ageGroupEnum = z.enum(AGE_GROUP_VALUES);

// ── Admin: Users ────────────────────────────────────────────────────────

export const updateUserRoleSchema = z.object({
  userId: cuidSchema,
  role: z.enum(["STUDENT", "PARENT", "TUTOR", "ADMIN", "SUPER_ADMIN", "B2B_PARTNER"]),
});

export const toggleUserActiveSchema = z.object({
  userId: cuidSchema,
});

export const compAccessSchema = z.object({
  userId: cuidSchema,
});

// ── Admin: Courses ──────────────────────────────────────────────────────

const planTierEnum = z.enum(["FREE", "LEARNER", "PRO", "LIFETIME"]);

export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  ageGroup: ageGroupEnum,
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  category: z.string().min(1, "Category is required"),
  isFree: z.boolean(),
  price: z.number().min(0, "Price must be non-negative"),
  requiredPlan: planTierEnum.optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
});

export const updateCourseSchema = z.object({
  courseId: cuidSchema,
  data: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    ageGroup: ageGroupEnum.optional(),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
    category: z.string().min(1).optional(),
    isFree: z.boolean().optional(),
    price: z.number().min(0).optional(),
    requiredPlan: planTierEnum.optional().nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    thumbnail: z.string().url().optional().nullable(),
  }),
});

export const deleteCourseSchema = z.object({ courseId: cuidSchema });

// ── Admin: Badges ───────────────────────────────────────────────────────

export const createBadgeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
  criteria: z.record(z.string(), z.unknown()),
  points: z.number().min(0).optional(),
});

// ── Pages ───────────────────────────────────────────────────────────────

export const createPageSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  titleAr: z.string().optional(),
  titleDe: z.string().optional(),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  contentAr: z.string().optional(),
  contentDe: z.string().optional(),
  isPublished: z.boolean(),
});

export const updatePageSchema = z.object({
  pageId: cuidSchema,
  data: createPageSchema,
});

export const deletePageSchema = z.object({ pageId: cuidSchema });
export const togglePagePublishSchema = z.object({ pageId: cuidSchema });

// ── Products ────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  nameAr: z.string().optional(),
  nameDe: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  descriptionAr: z.string().optional(),
  descriptionDe: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  ageGroup: ageGroupEnum,
  category: z.string().min(1, "Category is required"),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  status: z.enum(["ACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]),
});

export const updateProductSchema = z.object({
  productId: cuidSchema,
  data: createProductSchema,
});

export const deleteProductSchema = z.object({ productId: cuidSchema });

// ── Tutor ───────────────────────────────────────────────────────────────

export const submitTutorApplicationSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  hourlyRate: z.number().min(1, "Hourly rate must be at least 1"),
  subjects: z.array(z.string().min(1)).min(1, "At least one subject is required"),
  languages: z.array(z.string().min(1)).min(1, "At least one language is required"),
  headline: z.string().max(200).optional(),
});

export const updateTutorProfileSchema = z.object({
  bio: z.string().min(10).optional(),
  hourlyRate: z.number().min(1).optional(),
  subjects: z.array(z.string().min(1)).min(1).optional(),
  languages: z.array(z.string().min(1)).min(1).optional(),
  headline: z.string().max(200).optional(),
});

export const setAvailabilitySchema = z.object({
  slots: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
      timezone: z.string().min(1, "Timezone is required"),
    })
  ),
});

export const tutorIdSchema = z.object({ tutorProfileId: cuidSchema });

// ── Bookings ────────────────────────────────────────────────────────────

// Price is derived server-side from the tutor's hourlyRate — never trust
// what the client sends for it, or a student could book a session for $0.01.
export const createBookingSchema = z.object({
  tutorId: cuidSchema,
  subject: z.string().min(1, "Subject is required").max(120),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  notes: z.string().max(1000).optional(),
});

export const cancelBookingSchema = z.object({ bookingId: cuidSchema });

// ── Enrollment ──────────────────────────────────────────────────────────

export const enrollInCourseSchema = z.object({ courseId: cuidSchema });
export const adminEnrollSchema = z.object({
  userId: cuidSchema,
  courseId: cuidSchema,
});
export const adminUnenrollSchema = z.object({
  userId: cuidSchema,
  courseId: cuidSchema,
});
export const markLessonDoneSchema = z.object({
  lessonId: cuidSchema,
  courseId: cuidSchema,
});

// ── Quiz ────────────────────────────────────────────────────────────────

export const submitQuizAttemptSchema = z.object({
  quizId: cuidSchema,
  answers: z.record(z.string(), z.string()),
});

// ── Notifications ───────────────────────────────────────────────────────

export const markNotificationReadSchema = z.object({ id: cuidSchema });

// ── Competition ─────────────────────────────────────────────────────────

export const registerForCompetitionSchema = z.object({ competitionId: cuidSchema });

// ── Parent ──────────────────────────────────────────────────────────────

export const addChildAccountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dateOfBirth: z.coerce
    .date({ message: "Please enter a valid date of birth" })
    .max(new Date(), "Date of birth cannot be in the future")
    .min(new Date("1900-01-01"), "Please enter a valid date of birth"),
});

export const removeChildSchema = z.object({ childId: cuidSchema });

export const grantChildConsentSchema = z.object({
  childId: cuidSchema,
  type: z.enum(["PARENTAL_COPPA", "PARENTAL_GDPR_K"]),
});

export const withdrawChildConsentSchema = z.object({
  childId: cuidSchema,
  type: z.enum(["PARENTAL_COPPA", "PARENTAL_GDPR_K"]),
});

export const bulkGrantChildConsentSchema = z.object({
  type: z.enum(["PARENTAL_COPPA", "PARENTAL_GDPR_K"]),
});

export const enrollChildInCourseSchema = z.object({
  courseId: cuidSchema,
  childId: cuidSchema,
});

// ── Billing ─────────────────────────────────────────────────────────────
// Individual course purchases (buyCourse / buyCourseForChild) were retired
// in favour of a subscription-only access model; their schemas were removed
// when the actions were neutered.

const couponCodeSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[A-Za-z0-9_-]+$/)
  .optional();

export const startSubscriptionSchema = z.object({
  planId: cuidSchema,
  couponCode: couponCodeSchema,
});

// ── Coupons (admin) ─────────────────────────────────────────────────────

export const createCouponSchema = z.object({
  code: z.string().min(3).max(32),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  currency: z.string().length(3).optional(),
  scope: z.enum(["ALL", "COURSE", "PLAN"]).default("ALL"),
  appliesToId: cuidSchema.optional(),
  maxRedemptions: z.number().int().positive().optional(),
  perUserLimit: z.number().int().min(0).default(1),
  minAmount: z.number().min(0).optional(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
});

export const deactivateCouponSchema = z.object({ couponId: cuidSchema });

// ── Modules ─────────────────────────────────────────────────────────────

export const createModuleSchema = z.object({
  courseId: cuidSchema,
  title: z.string().min(1, "Title is required").max(200),
  titleAr: z.string().optional(),
  titleDe: z.string().optional(),
  order: z.number().int().min(0),
});

export const updateModuleSchema = z.object({
  moduleId: cuidSchema,
  title: z.string().min(1, "Title is required").max(200),
  titleAr: z.string().optional(),
  titleDe: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const deleteModuleSchema = z.object({ moduleId: cuidSchema });

export const reorderModulesSchema = z.object({
  courseId: cuidSchema,
  moduleIds: z.array(cuidSchema),
});

// ── Lessons ─────────────────────────────────────────────────────────────

export const createLessonSchema = z.object({
  moduleId: cuidSchema,
  title: z.string().min(1, "Title is required").max(200),
  titleAr: z.string().optional(),
  titleDe: z.string().optional(),
  content: z.string().optional(),
  contentAr: z.string().optional(),
  contentDe: z.string().optional(),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  thumbnail: z.string().url().optional().or(z.literal("")).nullable(),
  duration: z.number().int().min(0).optional(),
  type: z.enum(["VIDEO", "TEXT", "QUIZ", "INTERACTIVE", "ASSIGNMENT"]),
  order: z.number().int().min(0),
  isFree: z.boolean(),
});

export const updateLessonSchema = z.object({
  lessonId: cuidSchema,
  title: z.string().min(1, "Title is required").max(200),
  titleAr: z.string().optional(),
  titleDe: z.string().optional(),
  content: z.string().optional(),
  contentAr: z.string().optional(),
  contentDe: z.string().optional(),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  thumbnail: z.string().url().optional().or(z.literal("")).nullable(),
  duration: z.number().int().min(0).optional(),
  type: z.enum(["VIDEO", "TEXT", "QUIZ", "INTERACTIVE", "ASSIGNMENT"]),
  order: z.number().int().min(0).optional(),
  isFree: z.boolean(),
});

export const deleteLessonSchema = z.object({ lessonId: cuidSchema });

export const reorderLessonsSchema = z.object({
  moduleId: cuidSchema,
  lessonIds: z.array(cuidSchema),
});

// ── Quizzes ─────────────────────────────────────────────────────────────

export const createQuizSchema = z.object({
  lessonId: cuidSchema,
  title: z.string().min(1, "Title is required").max(200),
  passingScore: z.number().int().min(0).max(100),
  timeLimit: z.number().int().min(0).optional(),
});

export const updateQuizSchema = z.object({
  quizId: cuidSchema,
  title: z.string().min(1, "Title is required").max(200),
  passingScore: z.number().int().min(0).max(100),
  timeLimit: z.number().int().min(0).optional(),
});

export const deleteQuizSchema = z.object({ quizId: cuidSchema });

const questionTypeEnum = z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]);

const answerInput = z.object({
  text: z.string().min(1, "Answer text is required"),
  textAr: z.string().optional(),
  textDe: z.string().optional(),
  isCorrect: z.boolean(),
});

export const createQuestionSchema = z.object({
  quizId: cuidSchema,
  text: z.string().min(1, "Question text is required"),
  textAr: z.string().optional(),
  textDe: z.string().optional(),
  type: questionTypeEnum,
  points: z.number().int().min(1).default(1),
  order: z.number().int().min(0),
  explanation: z.string().optional(),
  answers: z.array(answerInput).min(1, "At least one answer is required"),
});

export const updateQuestionSchema = z.object({
  questionId: cuidSchema,
  text: z.string().min(1, "Question text is required"),
  textAr: z.string().optional(),
  textDe: z.string().optional(),
  type: questionTypeEnum,
  points: z.number().int().min(1),
  order: z.number().int().min(0).optional(),
  explanation: z.string().optional(),
  answers: z.array(answerInput.extend({ id: z.string().optional() })).min(1),
});

export const deleteQuestionSchema = z.object({ questionId: cuidSchema });

// ── Roles & Permissions ─────────────────────────────────────────────────

const roleEnum = z.enum(["STUDENT", "PARENT", "TUTOR", "ADMIN", "SUPER_ADMIN", "B2B_PARTNER"]);

export const createPermissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
});

export const deletePermissionSchema = z.object({ permissionId: cuidSchema });

export const assignPermissionSchema = z.object({
  role: roleEnum,
  permissionId: cuidSchema,
});

export const revokePermissionSchema = z.object({
  role: roleEnum,
  permissionId: cuidSchema,
});

export const bulkUpdateRolePermissionsSchema = z.object({
  role: roleEnum,
  permissionIds: z.array(cuidSchema),
});

// ── Settings ────────────────────────────────────────────────────────────

export const updateSettingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string(),
});

export const bulkUpdateSettingsSchema = z.object({
  updates: z.array(z.object({ key: z.string().min(1), value: z.string() })),
});

export const createSettingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "json"]),
  category: z.string().min(1, "Category is required"),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
});

export const deleteSettingSchema = z.object({ key: z.string().min(1) });

// ── Messages ─────────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  receiverId: cuidSchema,
  body: z.string().min(1, "Message cannot be empty").max(5000),
  subject: z.string().max(200).optional(),
});

export const markThreadReadSchema = z.object({
  otherUserId: cuidSchema,
});

// ── Competition Scoring ──────────────────────────────────────────────────

export const updateScoreSchema = z.object({
  registrationId: cuidSchema,
  score: z.number().int().min(0).max(10000),
});

export const updateSubmissionSchema = z.object({
  registrationId: cuidSchema,
  submissionUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  teamName: z.string().max(100).optional(),
});

// ── Account (self-service) ───────────────────────────────────────────────

export const updateAccountProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  locale: z.enum(["en", "de", "ar"]),
  avatar: z
    .string()
    .url("Avatar must be a valid URL")
    .max(500)
    .optional()
    .or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(200),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const deleteAccountSchema = z.object({
  // Password is required for credentials users; OAuth-only users confirm by
  // typing DELETE instead (validated at action level — we don't know the auth
  // method at schema parse time).
  password: z.string().optional(),
  confirmation: z.literal("DELETE", {
    message: "Type DELETE to confirm",
  }),
});

// ── Bundles ─────────────────────────────────────────────────────────────

export const createBundleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  themeCategory: z.string().min(1, "Theme category is required"),
  ageGroup: ageGroupEnum,
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  requiredPlan: planTierEnum.optional().nullable(),
  finalProjectTitle: z.string().max(200).optional().nullable(),
  finalProjectDescription: z.string().optional().nullable(),
  recommendedDurationWeeks: z.number().int().min(0).optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
});

export const updateBundleSchema = z.object({
  bundleId: cuidSchema,
  data: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    themeCategory: z.string().min(1).optional(),
    ageGroup: ageGroupEnum.optional(),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
    requiredPlan: planTierEnum.optional().nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    finalProjectTitle: z.string().max(200).optional().nullable(),
    finalProjectDescription: z.string().optional().nullable(),
    recommendedDurationWeeks: z.number().int().min(0).optional().nullable(),
    thumbnail: z.string().url().optional().nullable(),
  }),
});

export const deleteBundleSchema = z.object({ bundleId: cuidSchema });

export const addCourseToBundleSchema = z.object({
  bundleId: cuidSchema,
  courseId: cuidSchema,
  isRequired: z.boolean().optional(),
});

export const removeCourseFromBundleSchema = z.object({
  bundleCourseId: cuidSchema,
});

export const setBundleCourseRequiredSchema = z.object({
  bundleCourseId: cuidSchema,
  isRequired: z.boolean(),
});

export const reorderBundleCoursesSchema = z.object({
  bundleId: cuidSchema,
  bundleCourseIds: z.array(cuidSchema),
});

// ── Pathways ────────────────────────────────────────────────────────────

export const createPathwaySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  ageGroup: ageGroupEnum,
  order: z.number().int().min(0).optional(),
  thumbnail: z.string().url().optional().nullable(),
});

export const updatePathwaySchema = z.object({
  pathwayId: cuidSchema,
  data: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    ageGroup: ageGroupEnum.optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    order: z.number().int().min(0).optional(),
    thumbnail: z.string().url().optional().nullable(),
  }),
});

export const deletePathwaySchema = z.object({ pathwayId: cuidSchema });

// A stage points at EXACTLY ONE of a bundle or a course (XOR), mirroring the
// DB CHECK constraint at the app layer (defense in depth).
export const addPathwayStageSchema = z
  .object({
    pathwayId: cuidSchema,
    title: z.string().max(200).optional().nullable(),
    bundleId: cuidSchema.optional(),
    courseId: cuidSchema.optional(),
  })
  .refine((d) => Boolean(d.bundleId) !== Boolean(d.courseId), {
    message: "Provide exactly one of bundleId or courseId",
  });

export const removePathwayStageSchema = z.object({ stageId: cuidSchema });

export const reorderPathwayStagesSchema = z.object({
  pathwayId: cuidSchema,
  stageIds: z.array(cuidSchema),
});
