@AGENTS.md

# Mudita LMS (Schulab)

A multilingual Learning Management System for STEM education targeting ages 3–18. Built by Mudita Solutions and deployed at `edu.mudita-solutions.de`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router, standalone output) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS v4 + PostCSS |
| ORM | Prisma 7 + `@prisma/adapter-pg` (PostgreSQL) |
| Auth | NextAuth v5 (beta) — credentials + Google OAuth |
| i18n | next-intl v4 — en / ar / de; Arabic is RTL |
| Payments | Stripe (subscriptions, one-time purchases, orders) |
| Video | Provider-agnostic: Mux (primary), Cloudflare Stream, Vimeo, YouTube, External |
| Email | Resend API |
| File upload | UploadThing |
| Rate limiting | Redis (ioredis) or in-process Map fallback |
| Analytics | PostHog or GA4 (configurable via env) |
| State | Zustand (client stores) |
| Forms | react-hook-form + Zod v4 |
| Testing | Vitest (node environment) |
| PDF | @react-pdf/renderer (certificates) |

---

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run lint         # ESLint
npm test             # Vitest (run once)
npm run test:watch   # Vitest watch
npm run db:push      # prisma db push (dev schema sync, no migration file)
npm run db:seed      # tsx prisma/seed.ts
npx prisma generate  # regenerate client after schema changes
npx prisma migrate deploy  # apply migrations (used in production deploy)
```

---

## Project Structure

```
src/
  app/
    [locale]/
      (auth)/          # login, register, forgot-password, reset-password, verify-email
      (public)/        # marketing: courses catalog, tutors, competitions, STEM kits, pricing, legal
      (dashboard)/     # protected: student, tutor, parent, admin dashboards
      help/            # help center (public, locale-prefixed)
      layout.tsx       # locale root layout (intl provider, theme)
      page.tsx         # homepage
    api/
      auth/            # NextAuth catch-all handler
      billing/         # Stripe checkout, portal, webhook
      videos/          # Mux direct-upload, playback, webhook
      uploadthing/     # UploadThing core + route
      coupons/         # coupon validation
      cron/drip/       # lifecycle email drip trigger (Bearer-protected)
      health/          # readiness probe for Docker health check
      lessons/         # lesson preview
      reviews/         # course reviews
      certificates/    # PDF download
  actions/             # Next.js Server Actions, one file per domain
  services/            # Pure business logic called by actions
  lib/                 # Utilities (auth, db, stripe, mux, email, compliance, rate-limit, tokens, sanitize…)
  components/
    admin/             # Admin dashboard components
    booking/           # Tutor booking UI
    brand/             # Logo, brand assets
    compliance/        # Cookie banner, consent components
    course/            # Course cards, player, progress
    dashboard/         # Shared dashboard layout chrome
    gamification/      # Badges, points, leaderboard
    help/              # Help center components
    quiz/              # Quiz player and results
    shared/            # Generic shared components
    ui/                # Primitive UI components (buttons, modals, inputs…)
  validators/          # Zod schemas (action.schemas.ts, auth.schema.ts…)
  stores/              # Zustand stores
  i18n/                # next-intl config, request.ts, navigation.ts
  config/              # site.ts, navigation.ts
  types/               # Shared TypeScript types
  generated/prisma/    # Auto-generated Prisma client (do not edit)
prisma/
  schema.prisma        # Database schema
  migrations/          # Migration history (do not edit manually)
  seed.ts              # Database seed script
messages/
  en.json / ar.json / de.json   # i18n translation files
```

---

## Database Schema — Key Domains

All models use cuid() IDs. `src/lib/db.ts` exports `db` — a singleton PrismaClient using the PrismaPg adapter.

**Users & Auth**
- `User` — core user record; roles: `STUDENT | PARENT | TUTOR | ADMIN | SUPER_ADMIN | B2B_PARTNER`
- `Account`, `Session`, `VerificationToken` — NextAuth adapter models
- `Profile` — extended student profile (bio, DOB, grade, school, interests)
- `TutorProfile` — tutor-specific data (subjects, languages, hourly rate, verification)
- `ParentChild` — parent↔child linkage (many-to-many via join table)
- `OnboardingProfile` — post-signup onboarding wizard state

**Courses & Content**
- `Course → Module → Lesson` — three-level hierarchy; lessons have types: VIDEO, TEXT, QUIZ, INTERACTIVE, ASSIGNMENT, PRESENTATION
- `Course.requiredPlan` — nullable `PlanTier`; gates subscription access alongside free/paid model
- `Lesson.presentationContent*` — raw Reveal.js markdown synced from `presentation.md` (+ `.ar.md` / `.de.md`); rendered client-side by `src/components/course/reveal-presentation.tsx`. When present the lesson's `type` is `PRESENTATION` and the deck replaces the video block as the primary surface. Frontmatter (theme / transition / plugins) lives in `presentationConfig` (JSON). Sync-time helpers live in `src/lib/presentation.ts`.
- `Quiz → Question → Answer` — quizzes are 1:1 with lessons
- `QuizAttempt` — per-user attempt records with JSON answers
- `Enrollment` — user↔course; tracks progress (0–100) and completion
- `LessonProgress` — per-lesson completion + time spent
- `Certificate` — issued on course completion; unique code; optional PDF URL

**Billing**
- `Plan` — catalog of purchasable plans (tier × interval × currency); holds Stripe price ID
- `Subscription` — user plan subscription linked to Stripe subscription
- `CoursePurchase` — one-time course purchase (separate from `Order`)
- `Order + OrderItem` — STEM kit fulfilment orders
- `Invoice` — unified invoice for subscriptions, course purchases, and orders
- `Coupon + CouponRedemption` — percent/fixed discounts; per-user and total redemption limits
- `WebhookEvent` — idempotency ledger for Stripe webhook events (PK = Stripe event id)

**Plan Tiers** (ordered): `FREE < LEARNER < PRO < LIFETIME` — see `src/lib/subscription-access.ts`

**Compliance**
- `ConsentRecord` — append-only ledger; withdrawal = new row with `granted: false`
- Types: `TERMS_OF_SERVICE | PRIVACY_POLICY | PARENTAL_COPPA | PARENTAL_GDPR_K | MARKETING_EMAIL | MARKETING_SMS | COOKIES_ANALYTICS | COOKIES_MARKETING`
- `CHILD_AGE_THRESHOLD` defaults to 16 (German GDPR-K); configurable via env
- Minors without verified parental consent cannot enrol, purchase, or access paid content

**Video**
- `VideoAsset` — provider-agnostic; providers: MUX, CLOUDFLARE_STREAM, VIMEO, YOUTUBE, EXTERNAL
- Mux signed playback uses PKCS#8 RS256 JWTs (`src/lib/mux.ts`)

**Multi-tenant (scaffolding only)**
- `Organization` — schools / B2B partners. Nullable `organizationId` FKs live on `User`, `Course`, `Booking`. Not enforced anywhere yet — added so the live-classroom + tenant-scoping work in later phases doesn't need a painful retrofit. New queries should NOT filter on `organizationId` until the enforcement phase ships.

**Other**
- `AuditLog` — admin action trail
- `AnalyticsEvent` — server-side product analytics mirror
- `Notification`, `Message` — in-app notifications and direct messages
- `Badge + UserBadge + PointTransaction` — gamification
- `Competition + CompetitionRegistration` — STEM competitions
- `HelpArticle + HelpFeedback + HelpSearchLog` — help centre CMS
- `Page` — CMS pages
- `SystemSetting` — admin-editable key/value store
- `DripState` — lifecycle email drip state per user/journey
- `TutorAvailability + Booking` — tutor scheduling

---

## Authentication

- **Strategy**: JWT sessions (NextAuth v5 beta)
- **Providers**: Google OAuth + email/password (bcrypt)
- **Email verification**: Required before password login; unverified users are blocked at `authorize()`
- **Google OAuth signup**: Creates user + consent records (Terms + Privacy) atomically in a single `$transaction`
- **Rate limiting**: `src/lib/rate-limit.ts` uses a sliding window; Redis-backed when `REDIS_URL` is set, in-process Map otherwise
- **Role & ID in session**: JWT callback queries DB on sign-in to embed `id` and `role` into the token

---

## Internationalization

- **Locales**: `en` (default), `ar` (RTL), `de`
- **Routing**: All user-facing pages live under `src/app/[locale]/`; next-intl middleware handles locale detection
- **Translation files**: `messages/{en,ar,de}.json`
- **RTL**: Arabic requires RTL layout; `src/i18n/config.ts` exports `isRtl(locale)`
- **Content**: Many DB models have `*Ar` / `*De` columns for localized content (e.g., `Course.titleAr`, `Course.titleDe`)

---

## Payments (Stripe)

- `src/lib/stripe.ts` — lazy-initialized Stripe singleton; check `isStripeConfigured()` before billing actions
- `src/app/api/billing/checkout/` — creates Stripe Checkout sessions
- `src/app/api/billing/portal/` — opens Stripe Customer Portal
- `src/app/api/billing/webhook/` — receives Stripe events; uses `WebhookEvent` table for idempotency
- `src/services/billing.service.ts` — billing business logic

---

## Video (Mux)

- `src/lib/mux.ts` — Mux REST client (no `@mux/mux-node` dep); handles direct uploads, asset fetching, signed playback JWTs, webhook verification
- Signed playback JWTs use `RS256`; key stored as single-line PEM with literal `\n` separators (multi-line values break `docker --env-file`)
- `src/app/api/videos/mux/webhook/` — processes Mux asset lifecycle events
- `src/app/api/videos/[assetId]/playback/` — returns signed playback token

---

## Compliance (Children's Privacy)

`src/lib/compliance.ts` exposes:
- `assertMinorConsent(userId)` — gates minors on verified parental consent; users without a `dateOfBirth` fail with `dob_missing` and must complete onboarding
- `recordConsent(ctx, type, version)` — appends a consent record (never updates)
- `hasActiveConsent(userId, type, minVersion?)` — reads the latest record for a consent type
- Bump `TERMS_VERSION` and `PRIVACY_VERSION` env vars to force re-consent after document updates

---

## Lifecycle Email Drip

- `src/services/drip.service.ts` + `src/lib/email-drip.ts`
- Journeys: `ACTIVATION | PARENT_DIGEST | CART_ABANDONMENT | WIN_BACK`
- Triggered by `POST /api/cron/drip` — requires `Authorization: Bearer $CRON_SECRET`
- `DripState` tracks per-user journey step and `nextSendAt`

---

## Testing

- **Framework**: Vitest (node environment, no jsdom)
- **Location**: `src/**/*.test.ts` and `tests/**/*.test.ts`
- **Path alias**: `@` → `src/`
- Run: `npm test` (single run) or `npm run test:watch`
- Existing test files: compliance, mux, rate-limit, safe-redirect, sanitize, tokens, utils, booking.service, catalog-ranking, video.service

---

## Deployment

- **Target**: Hetzner VPS, Docker Compose, port `127.0.0.1:3020 → 3000`
- **Registry**: GHCR — `ghcr.io/schulab-lms/mudita-lms`
- **CI/CD**: GitHub Actions (`main` branch push or manual dispatch)
  1. `verify` job: `npm ci` → `prisma generate` → `tsc --noEmit` → `lint` → `build`
  2. `deploy` job: build + push Docker image tagged with commit SHA → SSH to Hetzner → validate `.env` → `prisma migrate deploy` → force-recreate container → poll `/api/health` → auto-rollback on failure
- **Health check**: `GET /api/health` must return `{"status":"ok"}`
- **Schema changes**: Always create a migration file (`npx prisma migrate dev --name <name>`); `prisma db push` is for dev prototyping only and does not create migration files

---

## Environment Variables

See `.env.example` for the full list. Critical ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth JWT secret (generate with `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID / SECRET` | Google OAuth |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe |
| `RESEND_API_KEY` | Transactional email |
| `UPLOADTHING_SECRET / APP_ID` | File uploads |
| `VIDEO_PROVIDER` | MUX \| CLOUDFLARE_STREAM \| VIMEO \| YOUTUBE \| EXTERNAL |
| `MUX_TOKEN_ID / SECRET` | Mux API credentials |
| `MUX_SIGNING_KEY_ID / PRIVATE` | Mux signed playback (single-line PEM) |
| `MUX_WEBHOOK_SECRET` | Mux webhook verification |
| `REDIS_URL` | Optional — enables distributed rate limiting |
| `CRON_SECRET` | Bearer token for `/api/cron/drip` |
| `CHILD_AGE_THRESHOLD` | Age of consent (default 16 for DE) |
| `TERMS_VERSION / PRIVACY_VERSION` | Force re-consent when bumped |
| `ANALYTICS_PROVIDER` | POSTHOG \| GA4 \| NONE |

---

## Key Conventions

- **Server Actions** live in `src/actions/` — one file per domain; they validate input with Zod then delegate to a service
- **Services** in `src/services/` contain pure business logic; they import `db` directly and return typed data
- **`db` singleton** — import from `@/lib/db`; never instantiate PrismaClient directly
- **Prisma client** is generated to `src/generated/prisma` (non-default location); import types from `@/generated/prisma/client`
- **Path alias** `@` → `src/`; always use it instead of relative imports
- **Zod v4** — schemas live in `src/validators/`; Zod v4 has a different API from v3 (e.g., `.parse` vs `.safeParse` shapes unchanged, but some utility methods differ)
- **Stripe lazy init** — always call `isStripeConfigured()` before billing-optional paths; calling `stripe()` without the key throws
- **Consent is immutable** — never UPDATE a ConsentRecord; always INSERT a new row
- **Multi-line env values** — not supported by `docker --env-file`; PEM keys must use literal `\n` separators on a single line
