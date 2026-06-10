# Soft-Launch Beta: "Payments OFF" Runbook

For the 25 June soft launch we run **without live Stripe**. This doc covers how
invited users get full access (comp), and how to actually test live tutoring.

## Why payments are off
The subscription **backend** exists (`startSubscription` action, `/api/billing/checkout`,
webhook handling), but it is **not wired into the UI**: the pricing page CTAs link to
`/register?plan=…` (which only shows a banner), nothing calls `startSubscription`, and
the marketed plans (Solo/Family/Custom, EUR) don't match the DB plans (Free/Learner/Pro,
USD, no Stripe price IDs). Selling those as-is would also charge a price different from
what's advertised — a German consumer-law problem. So: launch beta free, build the real
paid flow after. `STRIPE_SECRET_KEY` being empty already disables all billing paths.

## 1. Comp the cohort (full access, no Stripe)
Courses gated by `requiredPlan` (LEARNER/PRO) are unreachable with no subscriptions.
Grant invited users a complimentary **LIFETIME** subscription — a real `Subscription`
row, so nothing changes when real payments turn on later.

On the server (or via the repo clone at `/opt/projects/mudita-lms-src`):
```bash
cd /opt/projects/mudita-lms-src && git pull       # get scripts/comp-access.ts
cd /opt/projects/mudita-lms                       # has the runtime .env (DATABASE_URL)

# Grant to specific invited emails:
docker compose exec -T -e COMP_EMAILS="parent1@x.com,student1@y.com" web \
  npx tsx scripts/comp-access.ts

# …or comp every existing STUDENT/PARENT account:
docker compose exec -T -e COMP_ALL_STUDENTS=true web npx tsx scripts/comp-access.ts
```
Idempotent — re-run as you invite more people; already-comped users are skipped.
It creates a hidden `comp-lifetime` plan (`isActive:false`, not shown in any listing)
and points each comp at it.

> `tsx` is a dev dependency and is **not** in the production image's node_modules
> (`npm ci --omit=dev`). If `npx tsx` fails in the `web` container, run the script
> from the source clone instead, pointing at the same database:
> ```bash
> cd /opt/projects/mudita-lms-src
> npm ci                                  # once, to get tsx + deps
> DATABASE_URL="$(grep -E '^DATABASE_URL=' /opt/projects/mudita-lms/.env | cut -d= -f2-)" \
>   COMP_EMAILS="a@x.com" npx tsx scripts/comp-access.ts
> ```

To revoke a comp later: delete that user's `comp-lifetime` subscription row (or set
status `CANCELED`).

## 2. Testing live tutoring (LiveKit) — important prerequisite
The live LiveKit classroom only activates when **BOTH** are true (see
`src/app/[locale]/(dashboard)/session/[bookingId]/page.tsx`):
1. `isLiveKitConfigured()` — `LIVEKIT_URL` + `LIVEKIT_API_KEY` + `LIVEKIT_API_SECRET` set ✅ (done)
2. The booked lesson is a **PRESENTATION** type with deck content.

Otherwise it silently falls back to a static handout + optional external meeting URL —
**no video room**. So "book any session and join" may show the fallback and look broken.

To get a real room to join, you need a Booking tied to a PRESENTATION lesson. The
sample seeder creates exactly one (Aisha + tutor on the Intermediate sample deck), but
on prod it **skips** booking creation if those seed users are absent (logs
"Aisha or tutor profile missing"). Options:
```bash
# If the sample users exist, (re)create the sample booking + ClassroomSession:
docker compose exec -T web npx tsx scripts/seed-presentations.ts   # (tsx caveat above applies)
```
Then open the session as the tutor in one browser and the student in another
(`/<locale>/session/<bookingId>`), allow camera/mic, and confirm both see/hear each
other, slide-sync, chat, and polls.

> A/V scope (by design, P3 deferred): tutors publish camera+mic on join; students are
> subscriber-only until the tutor calls `grantStudentMedia`. Recording/egress is not
> implemented. Don't market "recorded sessions" or "students on camera by default".

## 3. Pricing page reframe (still TODO before public marketing)
The pricing page advertises purchasable Solo/Family/Custom plans with subscribe CTAs.
Before driving marketing traffic, reframe to "Free during early access" / "pricing
coming soon" so you're not advertising plans that can't be bought. Tracked separately.
