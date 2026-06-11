# Smoke-Test Runbook

Run this **before and after every deploy**, and as the **launch-morning Go gate** (June 25).
Two parts: an automated public-surface check (seconds) and a manual authenticated
journey (~10 min) that no headless script can cover.

## Part 1 — Automated public surface (run first)

```bash
npm run smoke                                  # against https://schulab.com
BASE_URL=https://edu.mudita-solutions.de npm run smoke   # any environment
```

Exits non-zero if any required check fails (so it can gate a deploy). Covers: health +
DB, homepage, security headers, public pages, the German legal pack, de/ar locale
routing + RTL, sitemap/robots/OG, auth pages, NextAuth providers, old-domain 301.

**Last run:** 10/10 green on schulab.com (2026-06-11).

## Part 2 — Manual authenticated journey (the critical path)

Do this in a real browser. Use a throwaway email. This is the journey a launch user
takes, and the part that decides Go/No-Go.

| # | Step | Pass criteria |
|---|---|---|
| 1 | Go to `/register`, sign up with email + password | Account created; verification email arrives (check Resend) |
| 2 | Verify the email via the link | Link lands on schulab.com; login now allowed |
| 3 | Complete onboarding incl. **date of birth** | Profile saved |
| 4 | **Consent gate (minor):** with a DOB under 16 and no parental consent, try to enrol | **Blocked** with the parental-consent message — this MUST hold (CSF #3) |
| 5 | As an adult account (DOB 18+), enrol in a free course | Enrolment succeeds |
| 6 | Open a lesson, mark it complete | Progress advances |
| 7 | Take the lesson's quiz, submit | Score shown; pass recorded |
| 8 | Complete the course | Certificate issued; visible in dashboard |
| 9 | Open the certificate verify page | Certificate validates by code |
| 10 | **Google login:** log out, "Continue with Google" | Returns to schulab.com logged in |
| 11 | **Cookie consent → analytics:** accept analytics in the banner | PostHog/GA4 begins loading only AFTER accept (check Network tab — nothing before) |
| 12 | Book a tutor session | Booking created, shows in dashboard |
| 13 | **Live classroom** (needs a PRESENTATION lesson + LiveKit keys): join as tutor + student in two browsers | Both join; tutor A/V; slides/chat/poll sync. ⚠️ See note. |

### Known launch-readiness notes (not script failures)
- **Step 13 (live A/V):** prod currently has **no PRESENTATION lessons**, so the LiveKit
  classroom can't mount and falls back to the static handout view. Until curriculum
  content is synced, this step only validates the booking + fallback, not live A/V.
- **Step 4 (consent gate):** enforced in code and covered by automated tests
  (`src/actions/enrollment.actions.test.ts`); step 4 is the live confirmation.
- **Payments:** intentionally OFF for the beta — there is no purchase step to smoke.
- **Step 11 (analytics):** only meaningful once `NEXT_PUBLIC_ANALYTICS_PROVIDER` is set
  to POSTHOG/GA4 with keys; until then no analytics loads at all (by design).

## Launch-morning sequence (June 25)
1. Fresh DB backup verified (`ls backups/` + last restore-test date on record).
2. `npm run smoke` → must be 10/10.
3. Manual journey steps 1–12 → green.
4. Only then: release gated launch posts (`--include-gated`) + confirm the E4 email.
5. Watch Sentry error rate + `/api/health` for the first 60–90 min before widening invites.
