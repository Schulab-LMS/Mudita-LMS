# Full Business Workflow Review — Schulab STEAM LMS

## Context

This plan file is the deliverable itself: a complete end-to-end business workflow audit of the Mudita/Schulab STEAM LMS codebase, produced from a triangulated exploration (architecture + learning workflows + commerce/compliance). The repo is a single Next.js 16 app targeting DACH (DE/AT/CH) + MENA (EG/Arabic) markets with GDPR constraints. The audit evaluates whether each business workflow is production-ready, not whether the code "runs" — gaps, dead-ends, and legal/regulatory exposure are called out explicitly. The output below is structured exactly as requested in the task brief (Steps 1–3).

---

## STEP 1 — CODEBASE MAP

### 1.1 Tech Stack

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | **16.2.1** | `output: "standalone"`. AGENTS.md warns "this is NOT the Next.js you know" — conventions differ from training data. |
| UI | React | 19.2.4 | |
| Runtime | Node (Alpine) | 20 | Docker + CI pinned |
| DB ORM | Prisma | **v7.5.0** | PostgreSQL via `@prisma/adapter-pg`, client generated to `src/generated/prisma` |
| Auth | NextAuth | **v5.0.0-beta.30** | JWT strategy, Credentials + Google OAuth, `@auth/prisma-adapter` |
| Styling | Tailwind | v4 (PostCSS plugin) | |
| State | Zustand | 5.0.12 | |
| Validation | Zod | 4.3.6 | Used server-side + client-side |
| Forms | React Hook Form | 7.72 | |
| Uploads | UploadThing | 7.7.4 | |
| Email | Resend | 6.10.0 | Sender `noreply@schulab.com` |
| Payments | Stripe | 22.0.2 | Subscriptions + one-time checkout |
| Video | Mux (primary), Cloudflare Stream / Vimeo / YouTube / External fallback | — | `VideoAsset` abstraction; Mux signed playback |
| Rate Limit | ioredis | 5.10.1 | Sliding-window, in-memory fallback |
| Sanitization | sanitize-html | 2.17.2 | Rich + text-only modes |
| i18n | next-intl | 4.8.3 | `/messages/*.json` |
| Password | bcryptjs | 3.0.3 | Cost 12 |
| Testing | Vitest | 2.1.9 | Only foundation tests present (`rate-limit.test.ts`, `compliance.test.ts`) |
| CI/CD | GitHub Actions + Docker → Hetzner | — | Auto-rollback on `/api/health` failure |

### 1.2 Directory Structure

```
src/
├── app/[locale]/        # All routes locale-scoped (next-intl)
│   ├── (public)/        # Catalog, course detail, legal pages
│   ├── (authenticated)/
│   └── (admin)/
├── app/api/             # Route handlers (auth, billing, videos, cron, help, uploadthing)
├── actions/             # ~28 "use server" server actions
├── components/          # ui/, admin/, course/, quiz/, dashboard/, gamification/
├── lib/                 # auth, db, email, mux, stripe, rate-limit, compliance, audit, sanitize
├── services/            # Business logic (course, quiz, progress, certificate, billing, coupon)
├── validators/          # Zod schemas
├── i18n/                # next-intl resolver
├── stores/              # Zustand client state
└── generated/prisma/    # Prisma client output
prisma/
└── schema.prisma        # Single 1168-line schema, 48 models
messages/                # en.json, de.json, ar.json (~1005 keys each)
.github/workflows/       # ci.yml, deploy.yml
```

Single app, no monorepo. Mix of server actions + API route handlers.

### 1.3 Roles

Enum `User.role` in `prisma/schema.prisma`:
`STUDENT` (default) · `PARENT` · `TUTOR` · `ADMIN` · `SUPER_ADMIN` · `B2B_PARTNER` (defined, unused).

Guard helpers in `src/lib/auth-helpers.ts`: `isAdminRole()`, `isSuperAdmin()`, `requireAdmin()`, `requireSuperAdmin()`. **There is a `Permission` + `RolePermission` table in the schema that is never queried** — all authorization is hardcoded string comparison on `role`. Route-level protection exists only for i18n routing (Next.js 16 renamed `middleware.ts` → `proxy.ts`; see `src/proxy.ts`, which runs `next-intl/middleware`); there is **no auth gate** in the proxy, so every route handler / server action still must call `auth()` and check roles inline. `B2B_PARTNER` is an active role (used in navigation, role matrix, admin UI).

### 1.4 API Routes

| Route | Method | Guard | Purpose |
|---|---|---|---|
| `api/auth/[...nextauth]` | GET/POST | NextAuth | Credentials + Google |
| `api/billing/checkout` | POST | — | Stripe checkout |
| `api/billing/portal` | POST | — | Stripe customer portal |
| `api/billing/webhook` | POST | Stripe signature | Subscription/payment sync |
| `api/certificates/[code]/download` | GET | owner or admin | (Returns code only — no PDF) |
| `api/coupons/validate` | POST | — | Promo code check |
| `api/cron/drip` | POST | `CRON_SECRET` | Email lifecycle |
| `api/health` | GET | — | Docker healthcheck |
| `api/help/search` | POST | — | Help article FTS |
| `api/lessons/[lessonId]/preview` | GET | — | Free-lesson preview |
| `api/reviews` | POST | — | Course review |
| `api/videos/[assetId]/playback` | GET | enrolled/purchased/admin | Signed Mux URL |
| `api/videos/mux/webhook` | POST | `MUX_WEBHOOK_SECRET` | Video status |
| `api/uploadthing/*` | — | `requireAdmin` | File upload |

No DELETE, PUT, or PATCH routes. No API versioning.

### 1.5 Database Models (48)

Core groups:
- **Auth:** `User`, `Account`, `Session`, `VerificationToken`, `Profile`, `ParentChild`
- **Courses:** `Course`, `Module`, `Lesson`, `Enrollment`, `LessonProgress`, `Certificate`, `Review`
- **Assessment:** `Quiz`, `Question`, `Answer`, `QuizAttempt`
- **Tutoring:** `TutorProfile`, `TutorAvailability`, `Booking`
- **Shop (STEM kits):** `Product`, `Order`, `OrderItem`
- **Competitions:** `Competition`, `CompetitionRegistration`
- **Gamification:** `Badge`, `UserBadge`, `PointTransaction`
- **Notifications:** `Notification`, `Message`
- **CMS:** `Page`, `HelpArticle`, `HelpFeedback`, `HelpSearchLog`
- **RBAC (unused):** `Permission`, `RolePermission`
- **Billing:** `Plan`, `Subscription`, `Invoice`, `CoursePurchase`, `Coupon`, `CouponRedemption`
- **Compliance:** `ConsentRecord` (append-only)
- **Video:** `VideoAsset` (provider enum)
- **Ops:** `SystemSetting`, `AuditLog`, `OnboardingProfile`, `DripState`, `WebhookEvent`, `AnalyticsEvent`

All IDs are CUIDs. Currency fields are `Decimal(10,2)`. No soft deletes on most entities (User has `isActive`).

### 1.6 Third-Party Integrations

Stripe · Resend · Mux (+ Cloudflare Stream/Vimeo/YouTube fallbacks) · UploadThing · Google OAuth · Redis (optional) · PostHog / GA4 (stubbed, SDK not installed).

---

## STEP 2 — BUSINESS WORKFLOW REVIEW

### 2.1 User Acquisition & Registration — ⚠️ Partial

**Current state:**
- Registration action: `src/actions/auth.actions.ts` `registerUser()` — Zod-validated (email, 8+ char password, DOB, consent booleans), rate-limited (3/60s per email), bcrypt cost 12, writes `User` + `ConsentRecord` (TERMS, PRIVACY) in a single transaction.
- Google OAuth first-time signup also appends consent records and sets `emailVerified` automatically.
- Email verification: `VerificationToken` model + Resend-sent token, re-send rate-limited 3/300s.
- Minor handling: if DOB under `CHILD_AGE_THRESHOLD` (default 16), parent email is captured and parental-consent gating is prepared via `src/lib/compliance.ts`.

**Gaps:**
- No marketing landing page or hero with conversion CTA (only catalog `(public)/courses`).
- No SSO for enterprise (SAML/OIDC) — blocks schools/universities.
- No invite-token signup flow (despite B2B narrative and `B2B_PARTNER` role).
- Email-verification enforcement is now wired into `enrollInCourse`, `buyCourse`, `startSubscription`, `submitReview`, and `sendMessageAction` via `assertEmailVerified()` in `src/lib/auth-helpers.ts` (matching the `assertMinorConsent` pattern). Still not gated on the Google OAuth signup path (users arriving through Google are auto-verified so it's a non-issue) or on tutor booking flows — follow-up.
- No separate B2B/institution onboarding form (org name, seat count, VAT ID).

**Issues:**
- Credentials login schema (`src/validators/auth.schema.ts`) accepts any non-empty password, which is **intentional** (see inline comment) to keep legacy 6-char accounts able to sign in; register/reset require 8+. Migrating to uniform 8+ needs a forced-reset-on-next-login flag, not a schema tightening.
- Google OAuth bypasses DOB capture; a minor can sign in and only be caught during onboarding (race condition vs. enrollment).

**Risk: High** — acquisition funnel works for self-serve B2C but unusable for DACH school procurement (no SSO, no invites, no contract/quote flow).

---

### 2.2 Onboarding — ⚠️ Partial

**Current state:**
- `OnboardingProfile` model stores age group, interests, goals used by `catalog-ranking.service` for personalized ranking.
- Locale is set by URL segment (`/[locale]`) rather than user preference — stored in `User.locale`? Only via `next-intl` cookies.
- Dashboard shells exist for `student/`, `admin/`, `tutor/`.

**Gaps:**
- No post-registration welcome email template dedicated to first-time UX (welcome is inlined in enrollment email).
- No guided tour / tooltip / empty-state-to-action flow for new learners.
- No distinct onboarding for instructors vs learners — role determines route but not any guided setup.
- `Profile` model exists but no profile-completion UI requires bio/avatar/skills before first course.
- Parent onboarding (for minor's account) has consent capture but no verification step (parent email unverified → minor can self-grant consent).

**Risk: Medium** — retention will suffer; first-run experience is essentially "you're in, figure it out."

---

### 2.3 Course & Content Management — ⚠️ Partial

**Current state:**
- Course CRUD in `src/actions/admin.actions.ts` (`createCourse`, `updateCourse`, `deleteCourse`) and `course-content.actions.ts` (module/lesson).
- Hierarchy: `Course → Module → Lesson` (+ optional `Quiz` 1:1 with Lesson).
- `CourseStatus` enum: `DRAFT | PUBLISHED | ARCHIVED` — direct state toggle.
- Video upload via Mux: `video.service.ts` `createVideoUpload()` → direct-to-Mux → `confirmVideoUpload()`. `VideoAsset` abstraction supports Mux/Cloudflare/Vimeo/YouTube/External.
- Lesson types defined: `VIDEO | TEXT | QUIZ | INTERACTIVE | ASSIGNMENT`.
- i18n content: `Course.titleAr/titleDe`, `Module.titleAr/titleDe`.

**Gaps:**
- **`ASSIGNMENT` and `INTERACTIVE` lesson types have no backend** — no submission model, no rendering component, no grading path. Schema lies about supported types.
- **No generic file upload for course content** (PDF, DOCX, images embedded in lessons). UploadThing is wired only for admin file uploads, not lesson attachments.
- No SCORM / xAPI / LTI support — blocks schools with existing content libraries.
- No course versioning (editing published courses silently mutates what enrolled learners are consuming).
- No admin/moderator approval queue; any `ADMIN` user publishes directly — no review pipeline for multi-instructor deployments.
- No draft preview for instructors (they see the same learner view as published).
- Cloudflare Stream provider: `src/lib/video-provider.ts:167` and `:170` throw `"Cloudflare Stream provider is not implemented yet."` even though the enum advertises it.

**Risk: High** — "STEAM" positioning implies rich interactive + assignment content, neither of which is delivered.

---

### 2.4 Learner Enrollment — ⚠️ Partial

**Current state:**
- Public catalog `src/app/[locale]/(public)/courses/page.tsx` with filters `ageGroup | category | level | search` via `course.service.ts` `getCourses()`.
- Personalized ranking (logged-in with onboarding data) falls back to popularity ranking.
- Free enrollment: `src/actions/enrollment.actions.ts` `enrollInCourse()` — creates `Enrollment` row, triggers confirmation email (non-blocking).
- Paid enrollment: Stripe checkout via `billing.service.ts` `createCourseCheckoutSession()` → webhook (`api/billing/webhook`) handles `checkout.session.completed` to create `CoursePurchase` + `Enrollment`.

**Gaps:**
- **Subscription-gated courses are not implemented.** `Plan`/`Subscription` models exist, but enrollment never checks for an active subscription — subscribers gain no course access.
- No capacity / seat limit per course (unlimited enrollment).
- No waitlist model or flow.
- No invite-only enrollment (despite narrative for B2B partners sharing a course with a cohort).
- No cooldown on unenroll→re-enroll — a learner can toggle to reset state (abuse vector).
- No unenroll confirmation / refund link if previously paid.

**Issues:**
- Webhook-created enrollment depends on Stripe webhook reaching the server; no reconciliation cron. A missed webhook → paid user with no course access and no support tooling.
- No idempotency check on manual `enrollInCourse` if called twice rapidly during client double-click (relies on unique constraint → 500 response).

**Risk: High (revenue)** — subscription courses, the most common SaaS-LMS revenue model, do not function.

---

### 2.5 Learning Experience — ✅ Mostly Complete

**Current state:**
- Lesson viewer at `/[locale]/(dashboard)/student/learn/[courseSlug]/[lessonId]`, gated on enrollment OR `isFree`, only against `PUBLISHED` courses.
- Next/prev derived from flattened `allLessons` list; sidebar shows module tree with completion indicators.
- Progress tracking: `src/services/progress.service.ts` `markLessonComplete()` upserts `LessonProgress` (`userId_lessonId`, `completed`, `timeSpent`, `lastAccess`). `recalculateProgress()` updates `Enrollment.progress` %, flips `Enrollment.status → COMPLETED` at 100%, and idempotently triggers certificate generation.
- Resume-where-you-left-off derived from `lastAccess` on `LessonProgress`.
- `video-player.tsx` uses Mux signed playback via `/api/videos/[assetId]/playback`.

**Gaps:**
- No bookmarks, highlights, or in-video notes — no schema, no UI.
- Transcripts / captions: `VideoAsset.hasCaptions` exists but no retrieval or UI.
- No offline / download-for-later (Android schools with spotty connectivity will notice).
- No "estimated time remaining" display beyond per-lesson `duration`.
- No course-level discussion / Q&A — `Message` is 1:1 only.

**Issues:**
- `timeSpent` increments rely on client reports — no server-side sanity bounds, easily spoofed.
- Progress recalc runs on every lesson-complete — fine today, risks N+1 on large courses at scale.

**Risk: Low** — core loop is solid end-to-end.

---

### 2.6 Assessment & Evaluation — ⚠️ Partial

**Current state:**
- Quiz builder: `src/actions/quiz-admin.actions.ts` `createQuiz/updateQuiz`, 1:1 with a lesson; `passingScore` default 70, optional `timeLimit`.
- Question types: `MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER`.
- Quiz taker: `/student/quizzes/[quizId]`, rate-limited 10/60s.
- Auto-grading: `src/services/quiz.service.ts` `submitAttempt()` compares selected answer IDs to `Answer.isCorrect`, stores `QuizAttempt{score, passed, answers JSON}`.
- Learner can retry; attempts are append-only; score returned immediately.

**Gaps:**
- **`SHORT_ANSWER` is auto-graded by string match** — no manual review UI, no fuzzy match, no rubric. In practice this means instructors cannot assess free-text reliably.
- **No manual grading UI at all** — the concept of a gradebook does not exist.
- **No assignment submission flow** — `ASSIGNMENT` lesson type has no model, no file upload path, no review workflow (stated earlier).
- No question-type support for code, file, essay, ordering, matching, drag-drop — weak for STEAM.
- No question bank / randomization / pool per attempt.
- No proctoring hooks, no anti-cheat (tab switch, paste disable, webcam) — acceptable for self-paced, insufficient for institutional assessment.
- No time-per-question enforcement; `timeLimit` is whole-quiz client-side.
- No grade visibility rules (release on deadline, hide until reviewed).

**Risk: High** — marketed as STEAM; cannot assess anything beyond multiple-choice recall.

---

### 2.7 Certification & Completion — ⚠️ Partial

**Current state:**
- Completion rule: 100% of lessons marked complete → `Enrollment.status = COMPLETED` → `generateCertificate()` (`src/services/certificate.service.ts`).
- `Certificate{code(unique), userId, courseId, issuedAt, pdfUrl}` written idempotently (pre-checks existing).
- Public verification endpoint at `/certificates/verify/[code]` returns holder name + course title.
- Completion email sent via Resend non-blocking.

**Gaps:**
- **No PDF is ever generated.** `pdfUrl` field is declared but always `null`. No PDF library present (pdfkit / puppeteer / pdf-lib / react-pdf). The route `api/certificates/[code]/download` exists but has no PDF to serve. Learners receive a code, not a certificate.
- No certificate template system (branding, course-specific, signature image).
- No multilingual cert (learner may study in Arabic/German but get English template once PDF is added).
- Completion criteria is purely "all lessons seen" — no requirement that quizzes be passed or assignments submitted (consistent with 2.6 gap).
- No in-app notification created on completion (Notification model exists but unused here).
- No LinkedIn / Open Badges integration.

**Risk: High** — shipping "certificates" without a deliverable PDF is a credibility-breaking bug for any paying or B2B customer.

---

### 2.8 Payments & Subscriptions — ⚠️ Partial

**Current state:**
- Stripe v22 integrated: `src/lib/stripe.ts` (lazy init, webhook secret validated).
- One-time course purchase via `billing.service.ts` `createCourseCheckoutSession()`.
- Subscription model: `Plan{FREE | LEARNER | PRO | LIFETIME, MONTHLY | YEARLY}` + `Subscription{status, trial, stripeIds}`.
- Webhook: `api/billing/webhook/route.ts` — signature-verified, idempotent via `WebhookEvent` de-dupe, handles `checkout.session.completed`, `invoice.*`, `customer.subscription.*`, `charge.refunded`.
- `Invoice` model: `number`, `tax`, `currency`, `pdfUrl` (Stripe-hosted), `hostedInvoiceUrl`.
- `Coupon` + `CouponRedemption` with validation service.
- Free trial via `Plan.trialDays`.

**Gaps (DACH-critical):**
- **No §14 UStG compliance.** Invoices record `number/tax/currency` but there is no seller-side metadata (company name, address, USt-IdNr., register court / HRB number) stored or rendered. Relying on Stripe's hosted invoice is insufficient for an EdTech selling from Germany — invoices must show the German seller details by law.
- **No B2B invoicing path** — no buyer company name, VAT ID capture, purchase-order field, net-payment terms, or manual invoice generation. School procurement is blocked.
- **No EU VAT logic** — no reverse-charge handling for B2B intra-EU, no OSS (ex-MOSS) routing by buyer country, no VAT-rate table per country, no VAT ID validation (VIES). Tax is whatever Stripe Tax is set to charge — risky to assume.
- **No admin refund UI** — refunds land via Stripe webhook only (`CoursePurchase.refundedAt`); support staff must log into Stripe.
- No partial refund / credit-note / reversal UI.
- No dunning / failed-payment retry messaging to user (Stripe's automatic but user never sees in-app).
- No currency localization — `DEFAULT_CURRENCY` is a single value.

**Issues:**
- Subscriptions do not gate course access (repeat of 2.4). A paying subscriber gets nothing.
- If webhook secret is misconfigured in prod, all payments succeed on Stripe but never reconcile → silent revenue loss with no surfaced error.

**Risk: Critical** — ship-blocking for any paid DACH launch. Legally uninvoiceable.

---

### 2.9 Notifications & Communications — ⚠️ Partial

**Current state:**
- Email: `src/lib/email.ts` via Resend; password reset, enrollment confirmation, course completion, verify-email templates inlined.
- Drip framework: `src/lib/email-drip.ts` + `DripState` model + `api/cron/drip` (Hetzner cron calls with `CRON_SECRET`).
- In-app notifications: `Notification{type, isRead}` model + `notification.service.ts` (create / unread count / mark read).
- Messaging: `Message{sender, receiver}` — peer-to-peer only.

**Gaps:**
- **No notification preferences UI.** GDPR + DSGVO require granular opt-out per category — currently none exists. Unsubscribe is all-or-nothing.
- Drip campaigns are framework-only — no pre-wired triggers for abandoned-cart, inactive-learner re-engagement, quiz-due reminder, trial-ending.
- No instructor-to-cohort announcement (broadcast) — messaging is 1:1.
- No in-app notification push for course completion (despite model presence).
- No SMS / WhatsApp / push for MENA (WhatsApp is the dominant channel).
- Unsubscribe link present in emails but no suppression list / bounce handling evidence.
- Email templates are hardcoded — no admin UI for editing, no locale-aware rendering verification.

**Risk: Medium-High** — GDPR exposure from missing preference center; retention impaired without drip triggers.

---

### 2.10 Analytics & Reporting — ⚠️ Partial

**Current state:**
- `AnalyticsEvent` table (userId, name, properties, context) with 14 canonical event constants (`user_signed_up`, `course_viewed`, `course_purchase_completed`, etc.) in `src/lib/analytics.ts`.
- PostHog / GA4 forwarding stubbed (intentional stub, SDK not installed).
- Enrollment progress (%), completion date tracked per `Enrollment`.
- `QuizAttempt` stores score/pass per attempt.

**Gaps:**
- **No learner-visible progress dashboard beyond a course tile.** No "hours learned this week", no streak, no achievements overview.
- **No instructor analytics dashboard.** Despite enrollments/completions/scores being queryable, there is no instructor page that aggregates them (admin course pages compute on-read but no per-instructor rollup).
- No admin platform KPIs (MRR, DAU/WAU, cohort retention, funnel).
- **No exportable reports** (CSV/PDF/XLSX). Required by schools for district-level reporting.
- PostHog/GA4 stubs mean product analytics is local-DB-only, no funnel tooling.
- No real-time analytics; `AnalyticsEvent` is batch-inserted, never read.

**Risk: Medium** — operational opacity for both business and educators.

---

### 2.11 User & Role Management (Admin) — ⚠️ Partial

**Current state:**
- Admin UI exists at `/admin/users`, `/admin/roles`, `/admin/courses`, `/admin/tutors`, `/admin/certificates`, `/admin/pages`.
- User CRUD via server actions; `User.isActive` soft-deactivation.
- `AuditLog` schema present: actorId, action, resource, metadata, IP, UA.
- Password reset: `src/actions/password-reset.actions.ts` — token-based, bcrypt, rate-limited.
- Google OAuth account linking via `@auth/prisma-adapter`.

**Gaps:**
- **`AuditLog` is well-populated and has a reader view.** `src/lib/audit.ts` exports a defensive `audit()` helper called from `admin.actions.ts` (role change, user (de)activate, course CRUD + status-change, badge create), `course-content.actions.ts` (module / lesson CRUD), `quiz-admin.actions.ts` (quiz + question CRUD), `tutor.actions.ts` (verify / reject / delete-profile), `account.actions.ts` (3 sites), `review.actions.ts` (2 sites), and `coupon.actions.ts` (2 sites). Admin reader at `/admin/audit` with filters (resource, action-contains, actor id) and pagination. Earlier revisions of this doc claimed the model was orphaned; that was incorrect.
- **`Permission` + `RolePermission` tables are declared but never queried** — RBAC is hardcoded role-string checks only. Admin role changes cannot be fine-grained per feature.
- **No bulk CSV import** for institutional B2B onboarding (primary DACH EdTech use case).
- No admin-initiated password reset / impersonation / magic-link for support.
- No account-merge tooling (Google OAuth + Credentials with same email will fail or double-create depending on timing).
- No scheduled deactivation / auto-archive of stale accounts.
- No middleware gating `/admin/*` routes — guard is per-action; a missed `requireAdmin()` call on a new admin route = unauthorized access.

**Risk: High** — launching B2B/institutional without audit log + bulk import is a non-starter.

---

### 2.12 Multi-Language & Localization — ⚠️ Partial

**Current state:**
- `next-intl` v4 fully configured; locales `en`, `de`, `ar`.
- Translation files in `/messages/` — ~1005 keys in each of `en.json`, `de.json`, `ar.json`.
- RTL: `isRtl()` helper with `dir={rtl ? "rtl" : "ltr"}` on root layout.
- Currency/date: `Intl.NumberFormat` / `Intl.DateTimeFormat` in `src/lib/utils.ts`.
- Content i18n: `Course.titleAr/titleDe`, `Module.titleAr/titleDe`, `Lesson.titleAr/titleDe` fields.
- Legal pages present: `/(public)/privacy`, `/(public)/terms`.

**Gaps (DACH legal-critical):**
- **Impressum placeholder page exists** at `/impressum` (env-driven company fields — `COMPANY_LEGAL_NAME`, `COMPANY_ADDRESS_LINE1/2`, `COMPANY_REGISTER_COURT`, `COMPANY_REGISTER_NUMBER`, `COMPANY_MANAGING_DIRECTOR`, `COMPANY_VAT_ID`, `COMPANY_RESPONSIBLE_EDITOR`). Must be populated with real data + reviewed by counsel before German launch.
- **AGB placeholder page exists** at `/agb` with a 9-section skeleton (Geltungsbereich, Vertragsgegenstand, Widerrufsrecht reference, etc.). Draft only — legal review required.
- **Widerrufsbelehrung placeholder page exists** at `/widerruf` with the 14-day cancellation text + sample withdrawal form + digital-content exception clause. Draft only — legal review required.
- **No Datenschutzerklärung** that enumerates the specific processors used (Stripe, Resend, Mux, UploadThing, Google OAuth, PostHog/GA4 if enabled). Generic privacy page is insufficient.
- Translation completeness unverified — 1005 keys per file but no translator QA evidence; legal phrasings (especially Arabic) need attorney review.
- Currency / number formatting is per-locale but the **price in `Course.price` is a single `Decimal`** — no multi-currency price table, so a DACH learner still sees the same numeric value formatted differently.

**Issues:**
- Course content i18n is column-based (`titleAr/titleDe`); this does not scale beyond 3 locales and has no fallback chain.
- No `hreflang` tags / localized sitemap visible for SEO.

**Risk: Critical (DACH legal)** — Impressum omission alone blocks German launch.

---

### 2.13 Security & Compliance — ⚠️ Partial

**Authentication / Authorization:**
- NextAuth v5 JWT, bcryptjs cost 12, Credentials + Google OAuth, rate-limited (login 5/60s, register 3/60s, forgot 3/300s).
- Guards inline via `requireAdmin()`; `src/proxy.ts` (Next.js 16's renamed middleware entry) runs `next-intl` but has **no auth gate** — each API/action must remember to call `auth()` + role check. High drift risk. Adding an auth gate to `proxy.ts` requires splitting auth config into an Edge-safe variant (bcryptjs import in `lib/auth.ts` is currently Edge-incompatible).
- Login schema intentionally accepts any non-empty password for legacy accounts; register/reset require 8+.
- Email verification not enforced on protected actions.
- CSRF: relies on NextAuth's SameSite + httpOnly cookies — no explicit token; state-changing actions on custom routes could be CSRF-exposed.
- No CSP / HSTS / `X-Frame-Options` configured in `next.config.ts`.

**GDPR:**
- `ConsentRecord` append-only ledger is well-designed (TERMS, PRIVACY, MARKETING_EMAIL, PARENTAL_COPPA, PARENTAL_GDPR_K, IP/UA recorded).
- **No data export endpoint** (Art. 15/20 right of access / portability).
- **No right-to-be-forgotten flow** (Art. 17) — no anonymization routine, no cascade-delete strategy across 48 models.
- **Cookie banner now captures consent.** `src/components/compliance/cookie-banner.tsx` (mounted in `src/app/[locale]/layout.tsx`) + `src/actions/consent.actions.ts`: anonymous visitors get an HTTP cookie (`schulab_cookie_consent` — JSON `{functional, analytics, marketing, v, ts}`); authenticated visitors additionally get `ConsentRecord` rows for `COOKIES_ANALYTICS` and `COOKIES_MARKETING`. "Reject all" is the default if the visitor ignores the banner. Still outstanding: client-side analytics/marketing script loaders need to read this cookie before firing (relevant when the PostHog/GA4 stub is filled in).
- No data-retention schedule / automatic purge.
- No data-residency isolation (single Hetzner region is fine for EU, but no documented processor register / TOMs).
- `Profile`, `User` PII is plaintext in DB; no field-level encryption.

**Input / File:**
- Zod validation is consistent on server actions.
- `sanitize-html` used in review rendering and rich content.
- UploadThing integrated but **no explicit MIME allowlist, size cap, or virus scan** defined for lesson attachments.
- Prisma parameterized queries — no raw SQL surface.

**Rate limit / DoS:**
- Sliding-window Redis limiter on auth, help, messaging.
- No limiter on `/api/billing/webhook` (Stripe-signed, arguably fine), `/api/videos/[assetId]/playback` (signed, but resource-heavy).

**Dependencies:**
- `npm audit` flagged HIGH severity on transitive `@hono/node-server` (CVE — authorization bypass via encoded slash). Appears indirect; should be verified and either bumped or documented as non-exposed.
- Several beta / canary versions (NextAuth v5-beta.30, React 19.2.4) — acceptable but warrant a pinned upgrade plan.

**Risk: Critical** — the combination of no middleware, no audit log population, no GDPR DSR flows, and no Impressum/cookie banner is a direct DSGVO exposure. One complaint → up to 4% global revenue fine in theory, Abmahnung in practice.

---

## STEP 3 — PRIORITIZED FINDINGS REPORT

### Executive Summary

Schulab is an impressively broad codebase — 48 Prisma models covering courses, tutoring, e-commerce, competitions, gamification, billing, and compliance sit on a modern Next.js 16 / React 19 / Prisma v7 / Stripe / Mux / Resend stack. The core learning loop (catalog → enroll → play lessons → auto-graded quiz → progress → completion) is genuinely end-to-end. However, the platform is **not production-ready for paid DACH launch**: certificates have no PDF, subscriptions do not gate course access, invoices are not §14 UStG compliant, there is no Impressum / AGB / Widerrufsbelehrung, no GDPR data-subject-request endpoints, no cookie banner, and `AuditLog` + `Permission` schemas exist but are never written to or queried. Ambitious marketing ("STEAM assessments") is undermined by the absence of assignment submission, manual grading, and non-multiple-choice question types. The strongest foundation layers are auth (rate-limited, consent-ledgered), video (Mux signed playback), and localization wiring (3 locales, RTL, content columns) — the weakest are commerce-legal compliance, admin operations (audit/bulk), and analytics/reporting.

### Workflow Completion Matrix

| # | Workflow | Status | Critical Issues | Priority |
|---|---|---|---|---|
| 2.1 | Acquisition & Registration | ⚠️ Partial | No SSO, no invite flow, no B2B onboarding, email verification not enforced | P1 |
| 2.2 | Onboarding | ⚠️ Partial | No welcome journey, no guided setup, no parent email verification | P2 |
| 2.3 | Course & Content Management | ⚠️ Partial | ASSIGNMENT/INTERACTIVE no backend, no file attachments, no versioning | P1 |
| 2.4 | Learner Enrollment | ⚠️ Partial | Subscriptions do not grant access; no reconciliation for missed webhooks | P0 |
| 2.5 | Learning Experience | ✅ Complete | Minor: bookmarks/transcripts/offline missing | P2 |
| 2.6 | Assessment & Evaluation | ⚠️ Partial | No manual grading, no assignment submission, MC-only question bank | P1 |
| 2.7 | Certification & Completion | ⚠️ Partial | **No PDF is generated** — certificates are codes only | P0 |
| 2.8 | Payments & Subscriptions | ⚠️ Partial | No §14 UStG invoice fields, no EU VAT, no B2B invoicing | P0 |
| 2.9 | Notifications | ⚠️ Partial | No preference center (GDPR), no drip triggers, no broadcast | P1 |
| 2.10 | Analytics & Reporting | ⚠️ Partial | No exportable reports, no instructor/admin dashboards, PostHog stub | P1 |
| 2.11 | User & Role Management | ⚠️ Partial | AuditLog orphaned, Permission table unused, no bulk CSV | P0 |
| 2.12 | Multi-Language & Localization | ⚠️ Partial | **No Impressum / AGB / Widerrufsbelehrung** | P0 |
| 2.13 | Security & Compliance | ⚠️ Partial | No middleware, no GDPR DSR, no cookie banner, dependency CVE | P0 |

Legend: ✅ Complete · ⚠️ Partial · ❌ Missing

### Critical Issues (P0 — Blockers)

1. **Certificates have no PDF output.**
   - File: `src/services/certificate.service.ts`; `Certificate.pdfUrl` always `null`; `api/certificates/[code]/download` has nothing to serve.
   - Fix: add `@react-pdf/renderer` (or `pdfkit`), render a localized template (EN/DE/AR) using `User.name` + `Course.title` + `issuedAt` + verification URL, upload to UploadThing (or write to disk + serve), persist `pdfUrl`. Route should stream the stored asset.

2. **Subscriptions do not grant course access.**
   - File: `src/actions/enrollment.actions.ts`, `src/services/course.service.ts`.
   - Fix: when a course is subscription-gated (add `Course.requiredPlanTier` enum), check `Subscription.status = ACTIVE` AND `Subscription.planId.tier >= required` before permitting `enrollInCourse()` / `playback`. Auto-enroll subscribers in eligible courses on `customer.subscription.created` webhook.

3. **Stripe webhook reconciliation is fire-and-forget.**
   - File: `src/app/api/billing/webhook/route.ts`.
   - Fix: add a nightly reconciliation cron that pulls Stripe sessions/invoices from the past 48h and cross-checks `CoursePurchase`/`Subscription` / `Invoice` state. Surface drift to admin.

4. **§14 UStG non-compliance on invoices.**
   - Files: `prisma/schema.prisma` `Invoice`, any invoice render path.
   - Fix: extend `Invoice` with seller fields or reference a `SellerProfile` singleton (company name, address, USt-IdNr., HRB-no., court). Render own branded invoice PDF for DE/AT/CH buyers instead of relying on Stripe-hosted. Add buyer VAT ID field for B2B.

5. **Impressum, AGB, Widerrufsbelehrung — placeholder pages only (draft).**
   - Files: `src/app/[locale]/(public)/impressum/page.tsx`, `/agb/page.tsx`, `/widerruf/page.tsx`. Footer links added across all locales (`messages/{en,de,ar}.json`).
   - Fix: populate `COMPANY_*` env vars with real company data and have the draft AGB + Widerrufsbelehrung reviewed / signed off by a German lawyer before DE launch. Add last-updated dates.

6. **No GDPR data-subject-request endpoints.**
   - Files: need new `src/actions/gdpr.actions.ts` + `api/user/export`, `api/user/delete`.
   - Fix: (a) export: JSON dump of all records referencing `userId`, 48-model cascade defined once. (b) delete: anonymize `User`, cascade-delete owned data (LessonProgress, QuizAttempt, Enrollment, OnboardingProfile, Notification, Message, Booking) while **retaining** `ConsentRecord` / `AuditLog` / `Invoice` (legal retention under AO §147, 10 years). Provide self-serve UI at `/account/privacy`.

7. **Cookie banner + cookie-consent capture — implemented.**
   - Files: `src/components/compliance/cookie-banner.tsx`, `src/actions/consent.actions.ts`, `src/app/[locale]/layout.tsx` (mount), `messages/{en,de,ar}.json` (i18n). Banner is pre-deny, offers "Accept all / Reject all / Customize", and the cookie is readable client-side so analytics loaders can gate themselves once they're wired in. Follow-up: wire PostHog/GA4 initialisation behind `document.cookie` check on `schulab_cookie_consent.analytics`.

8. **`AuditLog` coverage is now comprehensive + has a reader view.**
   - Files: `src/lib/audit.ts` (helper), `admin.actions.ts`, `course-content.actions.ts`, `quiz-admin.actions.ts`, `tutor.actions.ts` (verify / reject / delete — wired in batch 3), `account.actions.ts`, `review.actions.ts`, `coupon.actions.ts`. Reader at `src/app/[locale]/(dashboard)/admin/audit/page.tsx` with resource / action-contains / actor filters + pagination. Nav entry at `src/config/navigation.ts`.
   - Follow-up: RBAC tables (`Permission`, `RolePermission`) remain unused — wire into `auth-helpers.ts` or drop from schema. Booking user-initiated actions (`createBooking`, `cancelBooking`) are not audited; they're not admin actions and the booking lifecycle is reconstructable from the `Booking` table itself.

9. **No auth gate in `src/proxy.ts` — every admin/authenticated route depends on inline guards.**
   - File: `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`; this file currently only runs `next-intl/middleware`).
   - Fix: split NextAuth config into an Edge-safe `auth.config.ts` (no bcryptjs, no headers()) imported by both `lib/auth.ts` and `proxy.ts`. In `proxy.ts`, wrap the existing `createMiddleware(routing)` so unauthenticated requests under `/[locale]/(authenticated)` or `/[locale]/(admin)` are redirected to `/login` before i18n routing runs. Keep existing `requireAdmin()` as defense-in-depth.

10. **`Permission` + `RolePermission` tables are declared but unused.**
    - Fix: either wire them into `auth-helpers.ts` (replace hardcoded role strings with a permission lookup) or delete them from schema to stop advertising capability the app does not have.

### High Priority (P1 — Launch-Blockers)

1. **Login schema accepts any non-empty password for legacy accounts.** Add a `passwordNeedsReset` flag (or re-use `User.emailVerified` bump) and force a reset on next login for anyone with a hash shorter than the current 8-char rule. Then tighten `loginSchema`.
2. **Email verification now enforced on enrolment, checkout (`buyCourse`, `startSubscription`), review submission, and messaging.** Helper at `src/lib/auth-helpers.ts#assertEmailVerified`. Follow-up: extend to tutor booking creation.
3. **Assignment submission missing despite being advertised.** Add `AssignmentSubmission{lessonId, userId, fileUrl, text, submittedAt, grade, feedback, gradedBy, gradedAt}`, UI in the lesson viewer, instructor review page.
4. **Manual grading UI.** Gradebook at `/admin/courses/[slug]/grading` surfacing pending `SHORT_ANSWER` attempts + `AssignmentSubmission` records with override.
5. **B2B onboarding + bulk CSV import.** New `/admin/organizations` + `/admin/users/import` with Zod-validated CSV parser, dry-run, rollback.
6. **Notification preferences UI.** `/account/notifications` backed by a `NotificationPreference{userId, category, channel}` table; honored in every email/in-app send.
7. **Drip triggers beyond framework.** Wire abandoned-cart (no `CoursePurchase` after `course_checkout_started`), inactive-learner (no `LessonProgress` in 14 days), trial-ending (3 days before).
8. **Cloudflare Stream provider is stubbed.** `getVideoProvider()` now falls back to `ExternalUrlProvider` with a startup warning if `VIDEO_PROVIDER=CLOUDFLARE_STREAM` is set, so a misconfigured env no longer crashes uploads on first use (`src/lib/video-provider.ts`). Follow-up: either implement the CF Stream client or drop it from the `VideoProvider` enum.
9. **Instructor analytics dashboard** (enrollments, completion rate, average quiz score per course) and **admin platform KPIs** (MRR via Stripe API, DAU/WAU via `AnalyticsEvent`).
10. **CSV export for reports** (enrollments, completions, revenue) — `papaparse` / native.
11. **PostHog / GA4 SDK integration** — currently stubbed; install, gate on cookie consent.
12. **Webhook signing + rate-limit on `api/videos/mux/webhook`** — verify already present, audit.
13. **File upload validation on UploadThing** — define per-uploader MIME allowlist, max size, and consider ClamAV proxy for institutional trust.
14. **Course versioning** — add `CourseVersion` or freeze-on-publish snapshot so edits don't silently mutate live content.
15. **Transitive dependency CVE** (`@hono/node-server`) — run `npm ls @hono/node-server`, bump or document non-exposure.

### Medium Priority (P2 — Quality & Growth)

1. Welcome / first-run tour for new learners and instructors; empty-state CTAs on dashboards.
2. Bookmarks, highlights, lesson notes (new `LessonNote` model).
3. Video captions / transcript UI (leverage existing `VideoAsset.hasCaptions`).
4. Course Q&A / discussion per lesson (new `Discussion`, `DiscussionReply`).
5. Instructor broadcast / cohort announcement (extend `Message` or add `Announcement`).
6. Offline / downloadable lesson content for MENA connectivity constraints.
7. Course capacity + waitlist model.
8. Re-enrollment cooldown / unenroll refund workflow.
9. Extra question types: code, file upload, ordering, matching, essay with rubric.
10. Proctoring hooks (tab-switch / paste-disable) for institutional assessments.
11. Multi-currency pricing table per course (`CoursePrice{courseId, currency, amount}`).
12. `hreflang` alternates + localized sitemap for SEO across DE/EN/AR.
13. Per-processor privacy policy detail (Stripe/Resend/Mux/UploadThing/Google) to satisfy DSGVO Art. 13/14.
14. Impersonation / admin "view as user" with audit trail entry.
15. Open Badges / LinkedIn share on certificate issuance.
16. WhatsApp / SMS channel abstraction for MENA — Twilio/Vonage stub.
17. Pin Next.js 16 + NextAuth 5-beta upgrade plan; remove beta dependency before GA of commercial tier.
18. CSP / HSTS / security headers in `next.config.ts`.
19. Field-level encryption on PII columns (`User.name`, `Profile.bio`, DOB).
20. `B2B_PARTNER` role is already wired into navigation, role matrix, and admin UI — no need to delete. Confirm the intended feature set for it in the B2B/institutional phase.

### Quick Wins (< 1 day each, high value)

- **Add Impressum placeholder page** with legally-required fields pulled from env vars — unblocks any DE traffic while AGB is being drafted.
- **Link existing `/privacy` + `/terms` + new `/impressum` in global footer** across all locales.
- ~~**Enforce email verification** in `enrollInCourse()` + extend to checkout / reviews / messaging~~ — **done** (`src/lib/auth-helpers.ts#assertEmailVerified`).
- **Unify password min-length to 8** — needs a forced-reset flag, not a pure schema tightening (legacy users).
- ~~**Populate `AuditLog`** in remaining `admin.actions.ts` course/badge sites + `course-content.actions.ts` + `quiz-admin.actions.ts`~~ — **done**. Outstanding: tutor admin + `/admin/audit` reader view.
- ~~**Harden Cloudflare Stream fallback**~~ — **done** (soft fallback + warning in `src/lib/video-provider.ts`).
- ~~**Add Impressum, AGB, Widerrufsbelehrung placeholder pages + footer links**~~ — **done**; still needs real `COMPANY_*` env values and attorney sign-off before DE launch.
- **Add an auth gate in `src/proxy.ts`** — blocked on NextAuth v5 Edge-safe config split (separate PR).
- **Pre-deny cookie banner** shown once, persisted via `ConsentRecord` — minimal design, unblock DE visibility.
- **CSV export of enrollments** — one Prisma query → `papaparse` → download. Solves most urgent reporting ask.
- **Admin refund button** — Stripe SDK call + mark `CoursePurchase.refundedAt`.
- **Remove unused `B2B_PARTNER` enum** (or the whole `Permission`/`RolePermission` pair if not taken up) to stop suggesting features that are not there.
- **Fix login password length schema** (`6 → 8`) — requires adding a `passwordNeedsReset` flag before tightening.

### Recommended Roadmap

**Phase 1 — MVP Go-Live (weeks 1–4, P0 work):**
- PDF certificate generation (react-pdf, 3 locales)
- Subscription-gated course access + webhook reconciliation cron
- German legal pages: Impressum, AGB, Widerrufsbelehrung, Datenschutz (with attorney)
- Cookie banner + cookie-consent capture before PostHog/GA4 enablement
- GDPR export + delete endpoints at `/account/privacy`
- §14 UStG-compliant invoice rendering with seller profile
- Populate `AuditLog` across all remaining admin mutations (course-content, quiz-admin, tutor/booking) + `/admin/audit` read view
- Auth gate in `src/proxy.ts` (Next.js 16's middleware entry) — requires NextAuth v5 Edge-safe config split
- Email verification enforcement (started in `enrollInCourse`; extend to checkout, reviews, messaging) + password-rule unification with forced-reset flag
- Transitive CVE remediation, security headers

**Phase 2 — DACH + MENA Launch (weeks 5–10, P1 work):**
- B2B onboarding: organization model, VAT ID capture, bulk CSV user import, manual invoicing path
- EU VAT: VIES validation, country rate table, reverse-charge logic, OSS reporting export
- Assignment submission + manual grading UI + gradebook
- Notification preference center + drip triggers (abandoned cart, inactive learner, trial-end)
- Instructor analytics dashboard + admin platform KPIs + CSV export
- Arabic + German content QA by native speakers / attorney, RTL audit
- Cloudflare Stream implementation or enum removal
- Course versioning / snapshot-on-publish
- WhatsApp / SMS channel for MENA (minimal)

**Phase 3 — Scale & Institutional (weeks 11–20, P2 work):**
- SSO (SAML/OIDC) for schools and universities
- RBAC: wire `Permission` / `RolePermission` into `auth-helpers.ts`, admin matrix UI
- Multi-tenant / organization-scoped data partitioning
- SCORM / xAPI / LTI support
- Proctoring, richer question types, question banks
- Multi-currency pricing per course
- Discussion / cohort communications (instructor broadcast, lesson Q&A)
- Open Badges + LinkedIn share
- Field-level PII encryption, formal TOMs, processor register
- Upgrade NextAuth v5 to GA when released; pin React/Next to LTS once available

---

## Verification

Because this deliverable is an audit rather than a code change, verification means **confirming each P0/P1 finding against the live codebase** before committing resource to the roadmap:

1. **Smoke-check P0 claims:**
   - `rg "pdfUrl" src/services/certificate.service.ts` → confirm no PDF generator is called.
   - `rg "subscription" src/actions/enrollment.actions.ts src/services/course.service.ts` → confirm no plan/tier check on enrollment.
   - `rg "auditLog|AuditLog" src/ --type ts` → confirm no writer other than the schema.
   - `ls src/middleware.ts` → confirm absence.
   - `ls src/app/\[locale\]/\(public\)` → confirm no `impressum/`, `agb/`, `widerruf/`.
2. **Re-run exploration if schema changes:** any Prisma migration after this audit invalidates the model counts above — re-run `rg "model " prisma/schema.prisma | wc -l` to confirm current model count.
3. **Dependency CVE:** `npm audit --production` + `npm ls @hono/node-server` to confirm exposure or transitive-only status.
4. **Localization QA:** for each of `messages/{en,de,ar}.json`, count keys and diff — missing keys indicate partial translations.
5. **Running end-to-end:** after any P0 fix, run through the golden path in all 3 locales — register → verify email → enroll (free + paid) → complete lessons → pass quiz → receive certificate PDF — in a browser. Confirm RTL for Arabic, invoice PDF shows seller details for DE buyer.

*End of audit.*



