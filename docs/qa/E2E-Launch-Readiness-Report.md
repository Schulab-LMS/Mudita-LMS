# Mudita LMS (Schulab) — End‑to‑End Launch‑Readiness QA Report

**Date:** 2026‑07‑15
**Build under test:** branch `claude/lms-e2e-browser-testing-kghusi` (current HEAD of the app repo)
**Method:** Automated browser testing (Playwright + Chromium) driving real user journeys across all five roles, cross‑checked against the database and source code.
**Tester posture:** Both "real user" happy‑path and adversarial/professional‑QA (permissions, direct‑URL, edge cases, i18n, responsive).

---

## 0. Important scope caveat — what was actually tested

The requested target, **https://schulab.com/** (and the legacy `edu.mudita-solutions.de`), is **not reachable from this environment** — the session's outbound egress policy returns `403 (policy denial)` on `CONNECT` to those hosts. Per the environment's proxy rules, policy denials must not be routed around. The live production site therefore could **not** be exercised directly.

To still deliver a meaningful launch‑readiness assessment, I built and ran the **identical codebase locally** — the same commit that CI builds into the deployed Docker image — against a freshly‑seeded Postgres, and drove it with a headless browser. This means:

- ✅ **Validated:** application code, business logic, role permissions, forms, navigation, i18n, responsive behavior, data consistency, error handling — everything that ships inside the image.
- ⚠️ **NOT validated (needs a run against the real deployment):** production configuration/secrets, live Stripe/Mux/Resend/UploadThing/LiveKit integrations, real production data, TLS/CDN/CSP‑enforced behavior, email deliverability, and anything environment‑specific.

Treat the verdict in §5 as **"the code is / isn't launch‑ready"**, and re‑run the same journeys against the live site once it is reachable to close the environment‑specific gap.

The test accounts behaved exactly as specified (all password `password123`): `admin@schulab.com` (ADMIN), `marcus@example.com` (TUTOR), `aisha@example.com` (STUDENT), `liam@example.com` (STUDENT), `sara@example.com` (PARENT).

---

## 1. Executive summary

The product is **substantially built and largely works well**. Authentication, role‑based dashboards, the core learn→complete→XP/badge loop, enrollment gating, parental‑consent compliance, cross‑role data consistency, admin tooling, form validation, RTL/i18n, and notifications were all exercised and mostly pass.

However, testing surfaced **2 High**, **3 Medium**, and **5 Low** severity defects plus a few observations. Two of the High items (a missing role guard on the student area, and an inability to initialize the database from migrations) should be fixed before a public launch.

| Severity | Count | IDs |
|---|---|---|
| 🔴 High | 2 | D1, D2 |
| 🟠 Medium | 3 | D3, D4, D5 |
| 🟡 Low | 5 | D6, D7, D8, D9, D10 |
| ⚪ Observation | 3 | O1, O2, O3 |

**Launch verdict: _Conditional Go_** — ship once D1 and D2 are fixed and D3/D4/D5 are triaged (see §5).

---

## 2. Coverage

| Area | Coverage | Result |
|---|---|---|
| Auth (login/logout, invalid creds, enumeration) | All 5 roles + invalid/nonexistent | ✅ Pass |
| Role dashboards & routing | admin / tutor / parent / student | ⚠️ student guard gap (D2) |
| Direct‑URL restrictions (authed + unauthenticated) | 12‑URL matrix × 5 roles + anon | ⚠️ student gap (D2), rest ✅ |
| Student learning journey | catalog → enroll → lesson → complete → progress → XP/badge | ✅ Pass (after consent) |
| Parental consent / children's‑data compliance | set DOB + grant consent + unblock child | ✅ Pass |
| Tutor journey | dashboard, teaching, students, bookings, availability, profile | ✅ Pass |
| Parent journey | dashboard, children, consent, live child data | ⚠️ Orders link 404 (D3) |
| Admin journey | 20 sections, users search/export, settings, audit | ✅ Pass |
| Cross‑role data consistency | tutor↔student booking, parent↔child progress, public directory | ✅ Pass |
| Forms & validation | login, registration, account DOB, consent | ✅ Pass |
| Navigation (broken‑link crawl) | every sidebar link, all roles | ⚠️ 1 broken (D3) |
| Error handling | 404, bogus slugs, invalid input | ⚠️ soft‑404 (D9) |
| i18n (en/ar/de) + RTL | homepage + dashboard | ⚠️ chrome gaps (D8) |
| Responsive (390px mobile) | homepage + dashboard | ⚠️ dashboard overflow (D5) |
| Notifications | student notifications | ✅ Pass |
| Deploy/DB provisioning | migrations from scratch | ❌ Fails (D1) |

---

## 3. Defect report

> Severity scale: **High** = blocks launch / security‑correctness / no workaround; **Medium** = broken feature with workaround or subset impact; **Low** = cosmetic, SEO, or edge; **Observation** = confirm‑intent / non‑defect note.

### 🔴 D1 — `prisma migrate deploy` cannot initialize a fresh database (no baseline migration)
- **Severity:** High · **Area:** Deployment / DevOps / Disaster‑recovery
- **Steps to reproduce:** Point `DATABASE_URL` at an empty Postgres and run `npx prisma migrate deploy` (exactly what `.github/workflows/deploy.yml:234` runs on deploy).
- **Expected:** Migrations build the full schema on an empty DB.
- **Actual:** Fails on the very first migration:
  `Applying migration 20260409000000_add_lesson_thumbnail` → `ERROR: relation "Lesson" does not exist (42P01)`.
- **Root cause:** There is **no baseline/init migration** that creates the base tables. The lexicographically‑first migration `20260409000000_add_lesson_thumbnail` does `ALTER TABLE "Lesson" ADD COLUMN …`, but nothing ever `CREATE TABLE "Lesson"` / `"User"` / `"Course"`. Verified: `grep -rl 'CREATE TABLE "User"' prisma/migrations/*/migration.sql` → **no matches**. The current production DB survives only because its volume was bootstrapped once via `prisma db push` and then persists across deploys.
- **Impact:** Current prod is fine, but **any new environment, staging spin‑up, local onboarding via the documented path, or disaster‑recovery restore into an empty DB will fail.** Directly contradicts `CLAUDE.md`'s "Always create a migration file … `prisma migrate deploy` (used in production deploy)".
- **Recommended fix:** Generate a squashed baseline migration from the current schema and mark it applied on existing environments:
  `mkdir -p prisma/migrations/00000000000000_init && npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/00000000000000_init/migration.sql`, then `prisma migrate resolve --applied 00000000000000_init` against prod. Add a CI check that `migrate deploy` succeeds against a throwaway empty DB.
- **Evidence:** reproduced during environment setup; `prisma/migrations/` listing.

### 🔴 D2 — Student area enforces authentication but **not role**; unauthenticated hit throws a React error
- **Severity:** High · **Area:** RBAC / correctness
- **Steps to reproduce:**
  1. Log in as **tutor** (`marcus`), **parent** (`sara`), or **admin** → navigate to `/en/student` (or `/en/student/certificates`). → the **student dashboard renders** ("Welcome back, Dr.! 🚀" / "…Sara! 🚀" / "…Admin! 🚀").
  2. In a fresh, **unauthenticated** browser → `GET /en/student`.
- **Expected:** Non‑students are redirected to their own dashboard; unauthenticated users are cleanly redirected to `/login` — the behavior the other three dashboards already have.
- **Actual:**
  - Authenticated non‑students **reach the student dashboard** (they see their own empty student surface — gamification, quests, "enroll in your first course").
  - Unauthenticated request returns **HTTP 200 at `/student`** (not a clean redirect) and emits a runtime **`pageerror: "Rendered more hooks than during the previous render."`**; the login panel renders at the wrong URL.
- **Root cause:** `admin/`, `tutor/`, and `parent/` each have a `layout.tsx` that checks the effective role (`if (effectiveRole !== "ROLE") redirect("/dashboard")`). **`student/` has no `layout.tsx`.** `student/page.tsx` only checks `if (!session?.user) redirect("/login")` — authentication, not role — so any logged‑in user passes, and the unauthenticated path degrades into the hooks error instead of a clean server redirect.
- **Impact:** No cross‑user data leak (each user sees only their own scoped data), so impact is *mitigated* — but it is a genuine RBAC inconsistency and a runtime error on a publicly reachable route (will spam error monitoring and can flash a broken UI).
- **Recommended fix:** Add `src/app/[locale]/(dashboard)/student/layout.tsx` mirroring the parent guard:
  ```tsx
  import { redirect } from "next/navigation";
  import { getViewContext } from "@/lib/view-as.server";
  export default async function StudentSegmentLayout({ children }) {
    const { session, effectiveRole } = await getViewContext();
    if (!session?.user) redirect("/login");
    if (effectiveRole !== "STUDENT") redirect("/dashboard");
    return <>{children}</>;
  }
  ```
  This fixes both the role gap and the unauthenticated hooks error in one place.
- **Evidence:** `02-permission-matrix`, `03-student-as-tutor.png`, `03-student-as-parent.png`, `15-unauth-student.png`.

### 🟠 D3 — Parent sidebar "Orders" link 404s (route does not exist)
- **Severity:** Medium · **Area:** Navigation
- **Steps to reproduce:** Log in as **parent** (`sara`) → click **Orders** in the sidebar (or `GET /en/parent/orders`).
- **Expected:** An orders page (the `Order`/`OrderItem` models exist for STEM‑kit fulfilment).
- **Actual:** **HTTP 404 – "This page could not be found."**
- **Root cause:** `src/config/navigation.ts:58` links `{ href: "/parent/orders", labelKey: "nav.orders" }`, but there is **no `parent/orders/` route** (only `parent/children/` and `parent/page.tsx`).
- **Recommended fix:** Either implement `parent/orders/page.tsx`, or remove/redirect the nav item until the feature ships (in the "payments OFF" beta, hiding it is fine).
- **Evidence:** `04‑nav‑crawl (sara)`.

### 🟠 D4 — "Access paused" DOB gate is a dead‑end (no way to act)
- **Severity:** Medium · **Area:** UX / compliance flow
- **Steps to reproduce:** As a student with no `dateOfBirth` (e.g. seeded `aisha`) open any lesson: `/en/student/learn/<course>/<lesson>`.
- **Expected:** A blocking screen that *links to* where the problem is fixed (account/onboarding) or tells the child to ask a parent.
- **Actual:** A card reading **"Access paused — Please add your date of birth to your profile before continuing."** with **no button, link, or guidance.** The user is stranded (the DOB field lives on `/account`, but nothing points there; for a minor, only the linked parent can actually unblock via `/parent/children/[id]`).
- **Root cause:** The `dob_missing` branch of `assertMinorConsent` renders a static message with no CTA.
- **Recommended fix:** Add a primary action — "Complete your profile" → `/account` (or the onboarding wizard) — and, when the user is a minor with a linked parent, show "Ask your parent to confirm your account" instead.
- **Evidence:** `06-lesson.png`.

### 🟠 D5 — Student dashboard has horizontal overflow on mobile
- **Severity:** Medium · **Area:** Responsive / UI
- **Steps to reproduce:** Open `/en/student` at a 390 × 844 mobile viewport.
- **Expected:** No horizontal scrolling; content fits (the marketing homepage does — it collapses to a hamburger with `scrollWidth == clientWidth`).
- **Actual:** `document.scrollWidth > clientWidth` → the hero/stat cards are clipped on the left with dead space on the right.
- **Root cause:** The dashboard shell/grid doesn't fully collapse at small widths (likely a fixed sidebar offset or non‑wrapping grid on the hero + stat cards).
- **Impact:** A parent/child‑oriented platform will see heavy phone/tablet usage; a horizontally‑scrolling dashboard reads as broken.
- **Recommended fix:** Audit the dashboard shell's mobile breakpoint (make the sidebar an off‑canvas drawer on `< md`, ensure the stat grid is `grid-cols-2` with `min-w-0`, and clamp the hero card to `max-w-full`).
- **Evidence:** `16-mobile-dashboard.png` (vs clean `16-mobile-home.png`).

### 🟡 D6 — Seeded demo student accounts are blocked from all learning out‑of‑the‑box
- **Severity:** Low · **Area:** Seed data / demo readiness
- **Steps to reproduce:** Log in as `aisha` or `liam` → open any lesson or try to enroll.
- **Expected (for demo/QA):** The provided demo accounts can explore the core product.
- **Actual:** All seeded students have **no `dateOfBirth` and no parental consent**, so every lesson and every enrollment is blocked by the (correct) compliance gate. The full journey only opens after a parent sets DOB + grants consent on `/parent/children/[id]`.
- **Note:** This is **correct compliance behavior**, and **real signups do collect DOB + consents** (verified on `/register`). It is flagged only because anyone evaluating the platform with the *given* accounts hits an immediate wall. Related to D4.
- **Recommended fix:** Seed `dateOfBirth` + a granted `PARENTAL_GDPR_K` consent for `aisha` (and link/consent `liam`) so demo accounts work; keep at least one un‑consented child to demo the gate.
- **Evidence:** DB: all 4 seeded students `dateOfBirth IS NULL`.

### 🟡 D7 — React hydration mismatch on the login page
- **Severity:** Low · **Area:** UI / correctness
- **Steps to reproduce:** Load `/en/login`; observe the console / Next dev overlay ("1 Issue").
- **Expected:** Clean hydration.
- **Actual:** `A tree hydrated but some attributes … didn't match … style={{caret-color:"transparent"}}` on the email/password inputs.
- **Root cause:** A client‑only style (`caret-color: transparent`) is applied post‑mount but not on the server render.
- **Recommended fix:** Apply the caret style via CSS class (server + client) or gate it behind a mounted flag so SSR and client agree.
- **Evidence:** `00-recon` console capture.

### 🟡 D8 — Dashboard "chrome" strings aren't localized (visible in Arabic & German)
- **Severity:** Low (Medium for Arabic‑market credibility) · **Area:** i18n
- **Steps to reproduce:** Switch to `ar` or `de` and open a dashboard.
- **Expected:** Full localization (RTL mirroring itself is correct ✅).
- **Actual:** Hardcoded English leaks through: the **"Help"** nav item (ar+de), **"NEXT UP"**, the entire **UPGRADE** card ("Unlock 1:1 tutoring / Join Family plan and learn with expert mentors / See plans"), **"ROLE"**, the role name **"Student"**, the **"Home"** breadcrumb, and **"min 15"**.
- **Recommended fix:** Route these strings through `next-intl` message keys (`messages/{ar,de}.json`).
- **Evidence:** `16-arabic-dashboard.png`.

### 🟡 D9 — Soft‑404 on non‑existent course slugs
- **Severity:** Low · **Area:** Error handling / SEO
- **Steps to reproduce:** `GET /en/courses/<nonexistent-slug>`.
- **Expected:** HTTP **404** (as generic unknown routes correctly return).
- **Actual:** HTTP **200** with a correct‑looking "Lost in space?" not‑found page + `<title>Course Not Found</title>`. User‑facing UI is fine; only the **status code** is wrong.
- **Root cause:** The course page renders a custom not‑found body instead of calling Next's `notFound()`.
- **Recommended fix:** Call `notFound()` when the course lookup misses so the response is a true 404 (better for SEO/crawlers/monitoring).
- **Evidence:** `15-bogus-course.png`.

### 🟡 D10 — Hardcoded social‑proof numbers on a pre‑launch beta
- **Severity:** Low · **Area:** Marketing / legal (German UWG)
- **Detail:** Homepage animates to **"5,000+ Active Students", "50+ Expert Tutors", "30+ Countries"** and shows **"4.9 from 2,400+ parents"**; login shows **"Loved by 5,000+ families in 30+ countries"** — all hardcoded (`src/app/[locale]/page.tsx:47`). For a "payments‑OFF, early‑access" beta whose real counts are ~0, these unverifiable claims risk being misleading advertising under German UWG.
- **Recommended fix:** Confirm the numbers are substantiable at launch, or soften to non‑quantified copy ("Trusted by families across the region") until real metrics exist.

---

## 4. What works well (verified, not assumed)

- **Authentication & security hygiene:** all 5 roles land on the correct dashboard; invalid **and** nonexistent credentials return the *same* generic "Invalid email or password." (no user enumeration).
- **RBAC (3 of 4 dashboards):** admin/tutor/parent correctly redirect both cross‑role and unauthenticated access to the right place.
- **Core learning loop:** lesson renders (Overview/Notes/Resources/Q&A), **Mark‑as‑complete** advances `0/9 → 1/9`, auto‑advances to the next lesson, and **recomputes** enrollment progress (seeded 50% → correct 11%).
- **Enrollment gating:** blocked for an un‑consented minor (correct), succeeds after consent, creates the row, and redirects into the course.
- **Children's‑data compliance flow:** parent sets child DOB → "Date of birth saved" → grants consent (immutable ledger) → child's lesson access unblocks. Well designed.
- **Gamification:** completing a lesson awarded **35 XP + the "First Steps" badge + a streak + 2 notifications**, end‑to‑end.
- **Cross‑role data consistency:** the marcus↔aisha booking (Math, CONFIRMED, Jul 16) shows identically on tutor and student sides; the parent dashboard reflects the child's **live** state (including an enrollment created mid‑test) with correctly recomputed averages; the public `/tutors` directory lists the verified tutor.
- **Admin tooling:** 20/20 admin pages return 200 with no console errors; users table search filters correctly; Export CSV, role/status filters, settings, and the append‑only audit log all render.
- **Forms:** registration validates name/email/DOB/password and collects Terms/Privacy/marketing consents; account DOB uses a proper bounded `type="date"`.
- **i18n:** Arabic renders `dir="rtl"` with a fully mirrored, translated layout; German is translated; no page errors in either.
- **Responsive homepage:** no horizontal overflow, hamburger menu present.
- **Error & notifications:** true 404 page for unknown routes; notifications show unread counts and mark‑all‑read.

---

## 5. Launch‑readiness assessment

**Overall: 🟠 Conditional Go.** The application is feature‑complete for a beta and the critical business flows (learn, enroll, consent, book, admin) work. Nothing catastrophic (no data loss, no cross‑user data leak, no auth bypass) was found.

**Must‑fix before public launch (blockers):**
1. **D1** — add a baseline migration so the schema can be provisioned/restored from scratch (DR + new‑env risk).
2. **D2** — add the `student/layout.tsx` role guard (RBAC consistency + kills the runtime hooks error on a public route).

**Should‑fix (strongly recommended, quick):**
3. **D3** — remove or implement the parent "Orders" link (no 404 in shipped nav).
4. **D4** — give the "Access paused" screen an actionable CTA.
5. **D5** — fix the mobile dashboard horizontal overflow (high phone/tablet audience).

**Nice‑to‑have / pre‑GA polish:** D6 (seed demo accounts), D7 (hydration), D8 (finish dashboard localization — matters for the Arabic market), D9 (true 404 status), D10 (verify marketing claims).

**Confirm intent (observations):**
- **O1** — Seeded `Enrollment.progress` diverges from actual `LessonProgress` until the first real completion recomputes it. Self‑corrects at runtime; consider a seed/backfill so historical numbers are truthful.
- **O2** — Admin **Settings** page is labelled **Read‑only** for the ADMIN role. Confirm this is intended (view‑only for ADMIN, editable only by SUPER_ADMIN?) rather than an unfinished editor.
- **O3** — Tutor dashboard shows **rating 4.8** while "0 completed sessions". Confirm the rating source (seeded reviews vs placeholder) so it isn't a fabricated metric at launch.

**Not yet covered — do before/at launch (blocked by the egress restriction, see §0):** re‑run these journeys against the **live** https://schulab.com with production config to validate Stripe checkout/webhooks, Mux signed playback, Resend email delivery, UploadThing, LiveKit live classroom, CSP‑enforced headers, and real data. Everything in this report validates the **code**; those validate the **deployment**.

---

## Appendix — how this was tested (reproducible)

Local harness (identical codebase, seeded DB, headless Chromium via Playwright):
```bash
# Postgres 16 (local cluster) + pgvector, then:
npx prisma db push          # baseline can't migrate-deploy from scratch (D1)
npm run db:seed             # creates the 5 role accounts (password123)
npm run dev                 # http://localhost:3000
# Playwright scripts drive login per role (saved storageState),
# then permission matrix, nav crawl, journeys, i18n, responsive.
```
49 screenshots and structured per‑journey logs were captured as evidence for every finding above.
