import { z } from "zod";

// Login still accepts the old minimum so existing accounts (which may
// have been registered with a 6-char password) can still sign in.
// The stricter rule is enforced on registration and password reset only.
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// ISO date string YYYY-MM-DD used by <input type="date">. We keep it as a
// string in the schema (so the form can bind directly) and coerce later.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date of birth")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid date of birth",
  });

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "PARENT", "TUTOR"]),
    dateOfBirth: isoDate,
    // Tracks document versions the user actually saw, so a later policy
    // change can force re-consent without invalidating prior acceptance.
    acceptedTerms: z.literal(true, {
      error: "You must accept the Terms of Service",
    }),
    acceptedPrivacy: z.literal(true, {
      error: "You must accept the Privacy Policy",
    }),
    // Only required when the applicant is below the jurisdiction's digital
    // age of consent. The form should toggle this based on dateOfBirth.
    parentalConsent: z.boolean().optional(),
    parentEmail: z.string().email().optional().or(z.literal("")),
    marketingOptIn: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
