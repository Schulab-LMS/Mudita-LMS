# Schulab Launch Roadmap — Go-Live 25 June 2026

> **Document type:** Strategic launch roadmap (not a code change).
> **Author hat:** EdTech product launch strategist / PM.
> **Window:** Tue 9 Jun 2026 (today, T‑16) → Thu 25 Jun 2026 (launch, T‑0). ~12 working days.
> **Decisions locked with you:** **Soft launch (invite cohort)** · day‑1 scope = **Courses+Subscriptions, Live Tutoring, Certificates+Gamification** · team = **small (2–5)** · market = **Germany + Arabic-speaking (en/ar/de, RTL)**.
> **Domain:** primary brand domain becomes **`schulab.com`**; `edu.mudita-solutions.de` **301‑redirects** to it (see Section 0 — do first).

---

## 🌐 Section 0 — Domain Cutover & Rebrand to `schulab.com` (DO FIRST · Phase 0 · critical path)

**What:** Make **`https://schulab.com/`** the canonical primary domain and **301‑redirect** `https://edu.mudita-solutions.de/*` → `https://schulab.com/*`, preserving path, query string, and locale prefixes (`/en` `/ar` `/de`). Keep the old domain serving 301s indefinitely for SEO + bookmark continuity.

**Why this is first:** Nearly every launch‑config task downstream depends on the *final* domain — OAuth redirect URIs, Stripe/Mux/LiveKit webhook endpoints, email domain authentication (SPF/DKIM/DMARC), CSP/allowed origins, `NEXT_PUBLIC_APP_URL` (**baked at Next.js build time → requires a rebuild + redeploy**), SEO canonicals, and every marketing/UTM link. Doing the cutover late means redoing all of them. DNS and email‑auth verification also carry propagation lead time. **Target: complete by Fri 12 Jun (T‑13), before the env‑audit, security‑headers, Stripe‑live, and marketing‑link tasks.**

| Group | Checklist | Owner |
|---|---|---|
| **DNS & TLS** | Confirm registrar access for `schulab.com` · point A/AAAA (or CNAME) for apex + `www`, pick canonical · issue TLS cert (Let's Encrypt via the reverse proxy — nginx/Caddy/Traefik fronting the container on `127.0.0.1:3020`) · implement the **301** at the proxy (preserve path+query+locale) | ENG |
| **App & auth config** | `NEXT_PUBLIC_APP_URL=https://schulab.com` → **rebuild + redeploy** · NextAuth trusted host / `AUTH_URL` + cookie domain · update `src/config/site.ts` and any hardcoded domain | ENG |
| **3rd‑party callbacks** *(each silently breaks login/payments/video if missed)* | **Google OAuth:** add `https://schulab.com/api/auth/callback/google` to redirect URIs + JS origins · **Stripe:** new webhook endpoint + signing secret, update checkout success/cancel + portal return URLs · **Mux + LiveKit:** update webhook callback URLs · **CSP/CORS:** add schulab.com (ties to the Phase 0 security‑headers task) | ENG+PM |
| **Email domain** *(lead time)* | Authenticate `schulab.com` (or `mail.schulab.com`) in Resend — SPF, DKIM, DMARC; verify · update From addresses + all in‑email links | ENG+MKT |
| **SEO & brand** | Canonical tags, `sitemap.xml`, `robots.txt`, Open Graph URLs → schulab.com · Google Search Console: verify both domains, submit sitemap, set **Change of Address** · point all marketing/UTM/social/waitlist + `[app-link]`/`[waitlist-link]` (§9★) to schulab.com | PM+MKT |
| **Verify** | Run the critical‑journey smoke runbook against schulab.com (esp. Google login + Stripe webhook + email links) · confirm old‑domain 301s preserve locale paths | ENG |

**Risks:** DNS/email‑auth propagation lead time (start day 1) · `NEXT_PUBLIC_APP_URL` needs a rebuild, not just an env swap · a missed OAuth/Stripe/Mux/LiveKit callback breaks auth/payments/video silently → catch with the smoke runbook · existing sessions/cookies on the old domain are invalidated (acceptable pre‑launch). **Priority: H.** Blocks: env audit, security headers, Stripe live mode, Resend broadcasts, all marketing link finalization.

---

## Context — why this plan, and why this shape

Schulab (Mudita LMS) is a multilingual STEM LMS for ages 3–18, currently deployed at `edu.mudita-solutions.de` and **migrating to its primary brand domain `schulab.com` as the first launch task (Section 0)**. A codebase readiness sweep (9 Jun) found the **product is largely built and clean** — auth, course catalog/enrollment/player, quizzes, Reveal.js presentations, Stripe subscriptions+webhooks, tutor booking, all four role dashboards, certificates, full en/ar/de parity, and a mature CI/CD pipeline with auto-rollback. Code debt is near-zero (no TODO/FIXME/@ts-ignore in `src/`).

The risk is **not the product — it's launch readiness around it**: no database backups, no error tracking/analytics, no security headers, untested revenue & auth journeys, and no staging environment. On top of that sit three things that block a *compliant, revenue-generating* launch in Germany: mandatory parental consent for minors, a German/EU legal pack, and Stripe live-mode + EU‑VAT readiness.

A **big-bang public launch in 16 days would be reckless** against those gaps. A **soft launch to an invite cohort** lets us hit 25 June with a real, public-feeling event while capping blast radius — we ramp capacity and openness only after the revenue path, consent flow, backups, and monitoring are proven with real users. This roadmap front-loads de-risking, holds a hard feature freeze on **Fri 12 Jun**, and treats the three revenue blockers as critical-path, not paperwork.

---

## 1. Executive Summary

- **Launch model:** Soft launch on **Thu 25 Jun 2026** to a curated **invite cohort + public waitlist**, badged as an exclusive early-access opening. Controlled ramp to fully public over the following 2–4 weeks once revenue, consent, backups, and monitoring are proven in production.
- **What's live day‑1:** Self-serve **courses + Stripe subscriptions** (Solo/Family/Custom), **live tutor sessions** (tutor A/V + slides/chat/polls), **certificates + gamification**, full **en/ar/de** with Arabic RTL.
- **Explicitly deferred (and NOT promised in marketing):** Passkey/WebAuthn login, lesson Notes/Resources/Q&A tabs, **student A/V publishing in live rooms**, and **live-session recording/egress**. Marketing must avoid promising "recorded sessions."
- **The real risk is operational, not the code.** Top blockers, in priority order: (1) **no DB backups**, (2) **revenue path unproven in Stripe live mode + VAT**, (3) **minor parental-consent flow unverified end-to-end**, (4) **German/EU legal pack completeness**, (5) **no monitoring/error tracking**, (6) **no staging** (mitigated by a rehearsal/shadow deploy).
- **Feature freeze: Fri 12 Jun (T‑13).** After that, only hardening, bug fixes, content, config, and legal copy — no new features.
- **Cadence:** 5 phases — De-risk (Jun 9–12) → Hardening/Revenue/Legal lock (Jun 13–17) → Closed beta + rehearsal (Jun 18–21) → Launch week (Jun 22–25) → Post-launch growth (Jun 26 – Jul 25).
- **Team & owners (functional hats, shared across 2–5 people):** **PM** = Founder/Product (Mark), **ENG** = engineering/devops, **MKT** = marketing/content, **OPS** = operations/support/tutor-ops. A solo person may wear several hats — owners denote *accountability*, not headcount.
- **Calendar reality:** 25 Jun is a **Thursday** → day‑2 is Friday into a weekend (27–28 Jun). **Weekend on-call is planned, not optional.**

---

## 2. Top 10 Critical Success Factors

| # | Critical success factor | Why it's make-or-break |
|---|---|---|
| 1 | **Automated Postgres backups live + a *tested* restore** before any real user data lands | Today a VPS/volume loss = total data loss. Non-negotiable for trust. |
| 2 | **Revenue proven in Stripe LIVE mode** — real `Plan`/price IDs, charge→refund→cancel test, **EU‑OSS VAT / Stripe Tax** configured | "Code-complete" ≠ "can legally take money across DE + Arabic markets." |
| 3 | **Minor parental-consent (GDPR‑K) flow verified end-to-end** | Audience is ages 3–18; minors *cannot* enrol/pay/access paid content without verified parental consent. Legal + ethical hard gate. |
| 4 | **German/EU legal pack complete & reviewed** — Impressum, AGB, Widerrufsbelehrung + digital-content waiver, Datenschutzerklärung, cookie consent | Selling digital subscriptions to German consumers without these is a fineable offence. |
| 5 | **Critical-journey smoke runbook green in production on every deploy** | The end-to-end revenue+learning path is currently untested. This is the safety net. |
| 6 | **Observability before users** — Sentry, analytics on, extended health check, log aggregation, uptime alerts | You cannot run a launch you can't see. Currently blind. |
| 7 | **Rehearsal / shadow deploy completed + rollback drilled** | Substitute for the missing staging environment. |
| 8 | **Feature freeze held (12 Jun); stubs deferred & not over-promised** | Building new features in 16 days is how launches slip or break. |
| 9 | **Invite-cohort funnel + waitlist instrumented with capacity guardrails** | The whole point of soft launch: controlled ramp, measured trust. |
| 10 | **Launch-week + weekend on-call + 3-language support staffed and rehearsed** | Thursday launch bleeds into the weekend; early-trust is won or lost in the first 72h. |

---

## 3. Section 1 — Launch Readiness Assessment

### 3.1 Verdict snapshot (from 9 Jun codebase sweep)

| Area | Status | Note |
|---|---|---|
| Auth + onboarding | ✅ Ready | Passkey is a "coming soon" stub — **defer**. |
| Course catalog / enrollment / player / quizzes / presentations | ✅ Ready | Notes/Resources/Q&A tabs are "soon" stubs — **defer**. |
| Stripe subscriptions + webhooks + coupons | ✅ Code-complete | **Not yet revenue-ready** (live mode, price IDs, VAT) — see CSF #2. |
| Tutor booking + availability | ✅ Ready | |
| Live classroom (LiveKit) | 🟡 Partial | Tutor A/V + slides/chat/polls work. **Student A/V + recording deferred (P3).** |
| Role dashboards (student/tutor/parent/admin) | ✅ Ready | |
| Certificates (PDF + email + verify) | ✅ Ready | |
| i18n en/ar/de | ✅ Ready | Full key parity, RTL working. |
| CI/CD + deploy + rollback | ✅ Ready | No staging env — mitigate via rehearsal deploy. |
| Security primitives (rate-limit, sanitize, tokens, safe-redirect) | ✅ Ready | Missing CSP/HSTS headers — quick fix. |
| **Backups** | 🔴 **Critical gap** | None. Launch blocker. |
| **Monitoring / error tracking / analytics** | 🔴 Gap | No Sentry; analytics off; console-only logs. |
| **Automated tests of revenue/auth/E2E** | 🟠 Gap | ~1,575 lines of infra unit tests only; critical journeys untested. |
| **DE/EU legal content completeness** | 🟠 Verify | Routes exist (`(public)/legal`); German-law completeness unconfirmed. |
| **Minor consent path live verification** | 🟠 Verify | Logic in `src/lib/compliance.ts`; needs end-to-end proof. |

### 3.2 Go / No‑Go criteria (gate decision Wed 24 Jun, 17:00)

**GO requires ALL of:**
- ✅ Backups running + at least one successful test restore documented.
- ✅ Stripe live mode: one real subscription purchased + refunded + cancelled in production; VAT/OSS correct on invoice.
- ✅ Minor cannot enrol/pay without verified parental consent (proven with `smoke-prep.ts` minor account).
- ✅ Legal pack (Impressum, AGB, Widerruf + digital waiver, Datenschutz, cookie consent) live and reviewed.
- ✅ Sentry capturing; analytics firing; uptime + health alerts wired to the on-call channel.
- ✅ Critical-journey smoke runbook green against production.
- ✅ Rehearsal deploy + rollback drill completed successfully.
- ✅ Support inbox, 3-language canned replies, and on-call rota (incl. weekend) staffed.

**NO‑GO fallback:** hold public invites, keep cohort at internal/friendly-tester size, slip the *public* opening (not the platform) by up to a week. The soft-launch model makes this a low-drama option.

---

## 4. The Phased Roadmap (chronological spine)

> Priority key: **H** = High (blocks launch) · **M** = Medium (needed but has slack) · **L** = Low (nice-to-have / post-launch ok). **∥** = run in parallel with siblings.

### PHASE 0 — Foundation & De‑risk Sprint · **Tue 9 – Fri 12 Jun** (T‑16 → T‑13)
*Objective: stop the bleeding on the critical gaps, confirm scope, freeze features.*

| Task | Pri | Owner | Depends on | Parallel |
|---|---|---|---|---|
| Kickoff: lock scope, owners, daily standup time, shared launch tracker | H | PM | — | |
| **Domain cutover to `schulab.com`** + 301 from edu.mudita-solutions.de — full checklist in **Section 0** (DNS/TLS, app+auth config, OAuth/Stripe/Mux/LiveKit callbacks, Resend domain, SEO) | H | ENG+PM | — | ∥ (do first) |
| **Stand up Postgres backups** (`pg_dump` nightly + WAL/volume snapshot) → offsite object storage (e.g. Hetzner Storage Box / S3-compatible) | H | ENG | — | ∥ |
| Define RPO/RTO; write restore runbook | H | ENG | backups | ∥ |
| **Integrate Sentry** (server + client) | H | ENG | — | ∥ |
| **Enable analytics** (`ANALYTICS_PROVIDER` = POSTHOG or GA4) + verify events fire | H | ENG | — | ∥ |
| Add **security headers** (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) via middleware/next config | M | ENG | — | ∥ |
| Audit `.env` for production: list every credential needed live (Stripe, Resend, Mux/video, LiveKit, Google OAuth, Redis, CRON_SECRET, curricula) | H | ENG | — | ∥ |
| Confirm **deferred stubs** in writing (Passkey, Notes/Resources/Q&A, student A/V, recording) — remove from any UI surface that implies availability | M | PM+ENG | — | |
| **FEATURE FREEZE — EOD Fri 12 Jun.** After this: hardening, bugs, content, config, legal only | H | PM | — | |

**Phase 0 deliverables:** working backups + restore runbook · Sentry + analytics live · security headers · production credential checklist · signed-off scope & freeze.

---

### PHASE 1 — Hardening, Revenue & Legal Lock · **Sat 13 – Wed 17 Jun** (T‑12 → T‑8)
*Objective: make the platform legally able to take money and protect minors; prove the revenue path; lock content. (Sat/Sun light-touch — backups verification + content.)*

| Task | Pri | Owner | Depends on | Parallel |
|---|---|---|---|---|
| **Stripe live mode:** real `Plan` rows + live price IDs seeded; switch keys | H | ENG+PM | env checklist | |
| **Configure EU VAT** — Stripe Tax / OSS, customer-location VAT for DE + Arabic markets | H | PM+ENG | live mode | ∥ |
| **Revenue smoke (live):** real subscribe → invoice (VAT correct) → refund → cancel | H | ENG | VAT, live mode | |
| **Verify minor consent path end-to-end** using `scripts/smoke-prep.ts` minor (Aisha): block enrol/pay until parental GDPR‑K consent recorded | H | ENG+OPS | — | ∥ |
| **German legal pack:** finalize Impressum, AGB, Widerrufsbelehrung **+ digital-content immediate-access waiver at checkout**, Datenschutzerklärung; confirm cookie banner consent categories | H | PM (w/ legal review) | — | ∥ |
| Verify a **withdrawal-waiver consent type** exists (current `ConsentRecord` enum lacks one) — add/track if missing | M | ENG+PM | legal copy | |
| Arabic-market note: data-handling + consumer-info disclosures in `ar` | M | PM | legal pack | ∥ |
| **Build critical-journey smoke runbook** (extend `scripts/smoke-prep.ts`): signup → verify email → consent → subscribe → enrol → learn lesson → take quiz → book tutor → join live → complete → certificate | H | ENG | — | ∥ |
| Add automated tests for the **revenue + auth** seams (checkout/webhook, subscription lifecycle, login/verify/reset) | M | ENG | — | ∥ |
| **Extend `/api/health`** to probe Redis/Stripe/Resend/LiveKit readiness | M | ENG | — | ∥ |
| **Content & curriculum QA** (see §6) — courses, presentations, quizzes verified in en/ar/de | H | OPS+MKT | freeze | ∥ |
| **Rehearsal/shadow deploy #1** to a DNS alias on the same Hetzner box; run smoke runbook against it | H | ENG | smoke runbook | |
| Tutor onboarding: verify availability set, profiles complete, payout/rate sane for launch tutors | M | OPS | — | ∥ |

**Phase 1 deliverables:** revenue-ready Stripe (live + VAT, proven) · minor-consent proven · legal pack live + reviewed · smoke runbook + revenue/auth tests · extended health check · content locked · first rehearsal deploy green.

---

### PHASE 2 — Closed Beta & Launch Rehearsal · **Thu 18 – Sun 21 Jun** (T‑7 → T‑4)
*Objective: real users on the real platform at small scale; find & fix; rehearse the launch.*

| Task | Pri | Owner | Depends on | Parallel |
|---|---|---|---|---|
| **Closed beta** to 10–30 friendly users (incl. real parent+minor pairs, a paying subscriber, a live session) | H | PM+OPS | Phase 1 done | |
| Daily **bug triage** — severity-tag in tracker; fix S1/S2 only, defer S3/S4 | H | ENG+PM | beta | ∥ |
| **Load/perf check** — simulate concurrent learners + 1–2 live rooms; watch DB, LiveKit, memory; confirm Redis-backed rate limiting under multi-user | M | ENG | beta | ∥ |
| Verify **live session at real concurrency** (tutor A/V + 5–15 followers, slide sync, chat, polls) | H | ENG+OPS | beta | ∥ |
| **Mobile + browser matrix** pass: iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari/Edge; RTL Arabic on mobile | H | OPS | beta | ∥ |
| **Marketing assets finalized** — landing/waitlist page, email sequences (en/ar/de), social calendar, invite mechanics (see §7) | H | MKT | — | ∥ |
| **Support readiness** — help articles published (HelpArticle CMS), 3-language canned replies, support inbox + SLA, escalation path to ENG | H | OPS | — | ∥ |
| **Go-live rehearsal (dry run):** full deploy → smoke runbook → simulated rollback drill | H | ENG | rehearsal #1 | |
| Pre-warm **waitlist / invite list**; segment cohort; schedule invite send | M | MKT | landing page | ∥ |
| Fix triaged S1/S2 bugs from beta | H | ENG | triage | |

**Phase 2 deliverables:** beta feedback + bugs triaged & S1/S2 fixed · load + live-room validated · device/browser matrix green · marketing + support fully prepped · rollback drilled · cohort segmented.

---

### PHASE 3 — Launch Week & Go‑Live · **Mon 22 – Thu 25 Jun** (T‑3 → T‑0)
*Objective: ship calmly. No new code except hotfixes. See §8 for the hour-by-hour day-of plan.*

| Day | Focus | Pri |
|---|---|---|
| **Mon 22** | Final S1/S2 bug fixes land; **code soft-freeze** (hotfix-only). Re-run smoke runbook. Confirm all credentials in prod `.env`. Brief whole team on go-live runbook + escalation. | H |
| **Tue 23** | **Final rehearsal deploy** + full smoke runbook + rollback rehearsal. Marketing: schedule launch emails/social. Support: staff rota incl. weekend confirmed. | H |
| **Wed 24** | **GO / NO‑GO meeting 17:00** (§3.2 criteria). Freeze content. Pre-stage invite emails. Backups verified fresh. Status page / maintenance message ready. | H |
| **Thu 25 — LAUNCH** | Morning final smoke → **deploy to prod** → verify health/smoke → **send invite wave 1** → open waitlist → monitor live. Staggered invite waves, not all at once. | H |

**Phase 3 deliverables:** Schulab live to invite cohort · monitoring dashboards watched · incident/escalation channel active · launch comms sent.

---

### PHASE 4 — Post‑Launch Growth (First 30 Days) · **Fri 26 Jun – Sat 25 Jul** (see §9)
*Objective: stabilize, learn, retain, then open the funnel wider.*

---

## 5. Section 2 — Product & Platform Finalization (detailed checklist)

**Website & LMS completion**
- [ ] Marketing/public pages render correctly in en/ar/de incl. RTL (courses catalog, tutors, pricing, competitions, STEM kits, legal, help). **[H]**
- [ ] Pricing page reflects live Solo/Family/Custom plans + "free first session" messaging; no stale individual-purchase copy (subscription-only model). **[H]**
- [ ] Remove/disable any UI implying deferred stubs (Passkey "coming soon", Notes/Resources/Q&A "soon" tabs, recording). **[M]**
- [ ] 404/500 and empty states localized. **[M]**

**User-role testing (admin / tutor / student / parent)** — run each as a scripted pass **[H]**
- [ ] **Student:** register → verify → onboarding → browse → subscribe → enrol → learn → quiz → certificate → book tutor → join live.
- [ ] **Parent:** register → link child → grant GDPR‑K consent → child can then enrol/access → view child progress → purchase on behalf.
- [ ] **Tutor:** profile/verification → set availability → receive booking → join live room → publish A/V → run slides/poll → grant nothing-extra (student A/V deferred).
- [ ] **Admin:** course/user/tutor CRUD, certificates, badges, competitions, audit log, settings, help articles.
- [ ] Role-based access: confirm each role is blocked from others' routes.

**Course enrollment flows [H]**
- [ ] Free course enrol. [ ] Subscription-gated enrol (`requiredPlan`). [ ] Minor blocked without consent. [ ] Re-enrol/idempotency. [ ] Progress + completion → certificate trigger.

**Payment system validation [H]** — *the revenue gate*
- [ ] Stripe **live** keys + real price IDs. [ ] Subscribe each plan. [ ] **VAT/OSS** correct per customer country. [ ] Invoice/receipt emails (Resend). [ ] Customer portal: upgrade/downgrade/cancel. [ ] Webhook idempotency (`WebhookEvent`). [ ] Coupon redemption + limits. [ ] Refund path. [ ] Failed-payment/dunning behavior.

**Mobile responsiveness & browser compatibility [H]**
- [ ] iOS Safari, Android Chrome (incl. Arabic RTL). [ ] Desktop Chrome/Firefox/Safari/Edge. [ ] Reveal.js deck usable on mobile. [ ] Live room (camera/mic perms) on mobile. [ ] Tap targets, forms, checkout on small screens.

**Performance, security & backup checks [H]**
- [ ] Lighthouse/Core Web Vitals on key pages. [ ] DB query check under beta load. [ ] CSP/HSTS/security headers present. [ ] Rate limiting confirmed (Redis-backed in prod). [ ] Input sanitization on user-generated content. [ ] **Backups running + restore tested.** [ ] Secrets only in env, single-line PEMs.

---

## 6. Section 3 — Content & Curriculum Preparation

- **Launch catalog scope [H]:** confirm the *minimum credible* set of courses per level (Beginner/Intermediate/Advanced) and age band that justifies a subscription. Quality over quantity for a soft launch.
- **Trilingual content QA [H]:** every launch course's title/description/lessons reviewed in en + ar + de; no English fallbacks leaking; Arabic RTL renders correctly; math/highlight/notes plugins work in presentations.
- **Quizzes [H]:** each launch lesson's quiz has correct answers, passing score, and explanations; verified via parser.
- **Presentations [M]:** Reveal.js decks (incl. `.ar.md`/`.de.md`) synced and rendering; speaker notes present for live-taught decks.
- **Curriculum sync [M]:** confirm `CURRICULA_*` GitHub sync works in prod (token + webhook secret) or freeze content and sync manually for launch.
- **Live-session material [H]:** for each launch live class, tutor has a prepared deck + agenda; dry-run one full class in beta.
- **Certificates [M]:** template branding correct; verification page works; sample issued in beta.
- **Seed/demo hygiene [H]:** ensure `seed.ts`/`seed-presentations.ts` test users (e.g. `password123`) are NOT exposed in production; production-safe sample content reviewed.

---

## 7. Section 4 — Operations & Customer Support

- **Support channels [H]:** one primary inbox (e.g. support@) + in-app contact; realistic hours (**not** 24/7 for a 2–5 person team) — e.g. Mon–Fri business hours CET + **weekend on-call during launch week**. Publish hours clearly.
- **3-language support [H]:** canned replies / macros in en/ar/de for the top ~15 expected issues (login, email verification, payment, consent for minors, joining a live session, refunds/withdrawal, cancellation).
- **Help center [M]:** publish core HelpArticle CMS articles (getting started, subscriptions & billing, parental consent, joining a live class, certificates) in all three languages before launch.
- **Escalation path [H]:** Support → PM triage → ENG hotfix. Define S1 (revenue/auth/data down), S2 (major feature broken), S3/S4 (minor). S1/S2 page on-call immediately.
- **Tutor operations [M]:** onboard & verify launch tutors; confirm availability, rates, and a tested live room; a tutor liaison (OPS) for launch-week issues.
- **Refund/withdrawal handling [H]:** documented process aligned to the 14-day Widerruf + digital-waiver rules; who approves, how processed in Stripe.
- **Runbooks [H]:** incident runbook, rollback runbook, restore runbook all written and linked in the launch tracker.

---

## 8. Section 5 — Legal & Compliance *(surfaced prominently — revenue blocker)*

**German / EU consumer + e-commerce (selling digital subscriptions to DE consumers) [H]**
- [ ] **Impressum** (legally mandated) — complete & reachable.
- [ ] **AGB** (terms of service) — German-law reviewed.
- [ ] **Widerrufsbelehrung** (14-day right of withdrawal) **+ the digital-content immediate-access waiver presented at checkout** so access can start before the 14 days lapse.
- [ ] **Datenschutzerklärung** (privacy policy) — GDPR-complete, names processors (Stripe, Mux, LiveKit, Resend, UploadThing, analytics).
- [ ] **Cookie consent** — banner live; categories (analytics/marketing) actually gate the corresponding scripts.
- [ ] Confirm a **withdrawal-waiver consent type** is captured (current `ConsentRecord` enum has TOS/Privacy/Parental/Marketing/Cookies — likely **missing** a digital-waiver type; add or track explicitly).

**Children's privacy (mandatory day-1 — audience is 3–18) [H]**
- [ ] `CHILD_AGE_THRESHOLD` set (16 for DE). [ ] DOB captured in onboarding; missing DOB blocks paid access (`dob_missing`). [ ] Minor cannot enrol/purchase/access paid content without **verified parental consent** (`assertMinorConsent`). [ ] Consent is append-only (never updated). [ ] `TERMS_VERSION`/`PRIVACY_VERSION` set so future doc changes force re-consent.

**Arabic-market note [M]**
- [ ] Provide consumer-info + data-handling disclosures in Arabic; confirm no DE-specific claim is mistranslated as a legal guarantee in `ar`/`en`.

**Data & vendor posture [M]**
- [ ] DPA/processor list current. [ ] Data-retention + deletion (account deletion) path defined. [ ] Backups stored in an EU region (data residency).

> **Recommendation:** have a German lawyer (or a reputable DE legal-text service) review the AGB/Widerruf/Datenschutz/Impressum **in Phase 1**. This is the cheapest insurance against a launch-week cease-and-desist (Abmahnung).

---

## 9. Section 6 — Marketing & Pre‑Launch Campaign

*Tuned for soft launch + small team + DE/Arabic dual market.*

**Branding & messaging refinement [H]**
- One-line positioning in en/ar/de: "modern, interactive STEM learning with live tutoring + community." Lead with **trust + interactivity**, not feature lists.
- Consistent logo/brand assets; "Early Access" badge for the soft-launch framing.
- **Do not promise** session recordings, student-on-camera in classes, or anything deferred.

**Landing page optimization [H]**
- Waitlist/invite-request page as the primary CTA pre-launch; clear value prop, social proof (beta testimonials), pricing transparency (Solo/Family/Custom + free first session).
- Trilingual + RTL; fast (Core Web Vitals); analytics + conversion events instrumented.

**Early-access / beta strategy [H] — the core of soft launch**
- Curate an invite cohort (beta testers + their referrals + waitlist). Staggered invite waves (don't open the floodgates). Capacity guardrail tied to support + infra headroom.
- "Founding member" perks (e.g. discount, badge, early-access) to drive early conversions and goodwill.

**Email marketing sequence [H]** (en/ar/de, via Resend; respects MARKETING_EMAIL consent)
- Pre-launch: waitlist confirmation → "you're invited" → "doors open 25 Jun" countdown.
- Launch day: invite wave(s).
- Post-launch lifecycle: hook into existing **drip journeys** (ACTIVATION, PARENT_DIGEST, CART_ABANDONMENT, WIN_BACK).

**Social media content plan [M]**
- 2–3 week calendar: behind-the-scenes/build-in-public, tutor spotlights, "what is Schulab," demo clips of the interactive player/live room, countdown. Channels matched to DE + Arabic audiences. Trilingual posts.

**Influencer / school / community outreach [M]**
- DE: homeschool/Nachhilfe communities, STEM/MINT parent groups, teacher networks; a few micro-influencers in education.
- Arabic: education-focused creators + community groups.
- Soft B2B seeding: a couple of friendly schools as early orgs (full B2B is a later phase, but seed relationships now).
- Competitions hook: tease STEM competitions as a community draw.

---

## 9★. Marketing Automation Engine & Ready‑Made Content Bank *(expansion of Section 6)*

> **Goal:** a "set‑it‑and‑forget‑it" engine — write/design once, auto‑schedule across all channels, so a 2–5 person team can run launch week with **near‑zero daily marketing effort**. Everything below is pre‑loaded *before* launch week; only the launch‑day posts are gated on a manual "platform is healthy" go.
> **Channel assumption (adjust to your actual handles):** Instagram, Facebook, TikTok/Reels, LinkedIn, YouTube Shorts, X (optional), plus WhatsApp Business + Telegram community for DE & Arabic audiences, and email. Confirm/trim this list — content is written to be channel‑portable.

### 9★.1 The automation stack (tools + flow)

| Layer | Recommended tool | Role | Cost | Owner |
|---|---|---|---|---|
| **Content hub / calendar** | **Notion** (DB with date, channel, status, language, asset, copy) | Single source of truth + approval workflow | Free–$ | MKT |
| **Design at scale** | **Canva** (Brand Kit + per‑channel templates, "Bulk Create" from a sheet) | Ready‑made, on‑brand visuals in IG/FB/Story/Reel/LinkedIn sizes | Free–Pro | MKT |
| **Social scheduler + auto‑publisher** | **Postiz** ✅ *already deployed (self‑hosted)* | Schedules + auto‑posts to IG/FB/LinkedIn/X/TikTok/YT; native analytics; driven via its API from n8n | Self‑hosted | MKT |
| **Workflow / automation engine** | **n8n** ✅ *already deployed (self‑hosted)* | The cross‑app glue + trigger engine; native nodes for Postgres, Telegram, WhatsApp, Notion, Schedule, HTTP (→ Postiz/Resend) | Self‑hosted | ENG |
| **Email — lifecycle** | **Resend + the platform's built‑in `DripState` journeys** (ACTIVATION / PARENT_DIGEST / CART_ABANDONMENT / WIN_BACK) | Already in the codebase — reuse, don't rebuild | In stack | ENG+MKT |
| **Email — broadcasts** | **Resend Broadcasts** (or Audiences) for waitlist/invite/countdown blasts; orchestrated by n8n Schedule nodes | One‑to‑many announcements, consent‑aware (MARKETING_EMAIL) | In stack | MKT |
| **Community broadcast** | **WhatsApp Business** + **Telegram channel** — *both fully automatable via n8n's native WhatsApp Cloud & Telegram nodes* | High‑reach for DE & Arabic parents/learners | Free | OPS+ENG |
| **Attribution / analytics** | **GA4 + PostHog** (already configurable) + **UTM convention** + Postiz/Metricool social analytics | Close the loop: which post → which signup → which subscription | In stack | ENG+MKT |

> **Note — you've already deployed Postiz + n8n (self‑hosted).** That's the ideal backbone: both run in *your own infrastructure*, so marketing‑automation data (waitlist emails, signup events) **stays EU‑resident** — a real GDPR advantage for the DE market vs. US SaaS like Zapier. Canva and Notion are optional add‑ons (also available as connected integrations here); the engine works without them if you'd rather keep copy in n8n/Postiz directly. Claude Code can help author the n8n workflow JSON and the Postiz API calls as a follow‑up once approved.

**Content flow (write once → publish everywhere):**
```
Notion (or Postiz drafts)  →  Canva (visuals)  →  Postiz API  →  auto‑publish to IG/FB/LinkedIn/X/TikTok/YT
                                                  ↑
                              n8n  ── orchestrates everything ──┐
Resend Broadcasts (email blasts) ←──────────────────────────────┤
Telegram + WhatsApp (community)  ←──────────────────────────────┤  (n8n native nodes)
Platform DripState (lifecycle email)                            │
GA4/PostHog + UTMs  ── measure ─────────────────────────────────┘
```

**n8n workflows to build (one‑time setup, then hands‑off):**
1. **Waitlist → nurture:** app webhook *(or Postgres node on a read‑only role)* on new waitlist lead → Resend API (E1 confirmation) → add to audience → Telegram/Slack team ping.
2. **New paying subscriber:** trigger on new `Subscription` → founding‑member welcome email + internal notify + analytics tag.
3. **Certificate issued → share loop:** trigger on new `Certificate` → email the learner a pre‑filled "share your achievement" post (organic social proof).
4. **Content pipeline:** Notion status = *Approved* (or new course published) → HTTP node → **Postiz API** schedules the post (and mirrors it to Telegram/WhatsApp via native nodes).
5. **Countdown automation:** n8n **Schedule** nodes for Jun 18 / 22 / 24 / 25 fire the broadcast emails (E2–E4) *and* the matching Postiz/Telegram posts — the whole countdown runs itself.
6. **Daily 08:00 KPI digest:** Postgres node queries yesterday's signups/subscriptions + Postiz analytics → format → post to team Telegram/Slack.

> **n8n data hygiene:** give n8n a **read‑only, scoped Postgres role** (or, better, consume app‑emitted webhooks/`AnalyticsEvent`) rather than broad DB access; never log PII in execution history; keep it on the same private network as the app.

### 9★.2 Channel cadence & content pillars

**Pillars (rotate):** ① Trust/credibility · ② Interactivity/demo · ③ Tutor spotlight · ④ Parent value · ⑤ STEM inspiration · ⑥ Social proof · ⑦ Countdown/CTA.

| Channel | Audience | Pre‑launch cadence | Format | Language priority |
|---|---|---|---|---|
| Instagram + Facebook | Parents (DE + Arabic) | ~daily | Carousel, Reel, Story | de · ar · en |
| TikTok / Reels / Shorts | Students + young parents | 3–4×/wk | 15–30s demo/hook | en · de · ar |
| LinkedIn | Tutors, schools, credibility | 2×/wk | Text + image, founder voice | en · de |
| WhatsApp + Telegram | Warm community | 2–3×/wk | Short update + link | ar · de |
| X (optional) | Build‑in‑public, EdTech | 3×/wk | Short text/thread | en |
| Email | Waitlist → members | Per sequence (§9★.4) | Broadcast + drip | de · ar · en |

### 9★.3 Ready‑made content bank (pre‑load these now)

> Master copy in **EN**; conversion‑critical posts written out in **DE + AR** too. For the rest, localize from the EN master (Canva text variables + reviewed translation). Replace `[waitlist-link]` / `[app-link]` with UTM‑tagged URLs (§9★.5). Each post → schedule in Postiz on the listed date.

**— Phase: Tease & Waitlist (Jun 10–17) —**

- **P1 · Jun 10 · IG/FB/LinkedIn · Pillar ①+⑦ — Brand reveal**
  EN: "Something new is coming for curious minds. 🚀 *Schulab* — interactive STEM learning with **live tutors**, for ages 3–18, in English · Deutsch · العربية. Early access opens **June 25**. Join the waitlist → [waitlist-link]"
  Visual: brand hero + "Early Access · June 25". Tags: `#EdTech #STEM #Lernplattform #تعليم #OnlineLernen`

- **P2 · Jun 11 · TikTok/Reels · Pillar ② — Demo hook**
  EN: "What if STEM actually felt like play? 👀 A peek inside Schulab's interactive lessons. Early access June 25 — link in bio."
  Visual: 20s screen‑capture of the interactive lesson/Reveal deck. Tags: `#STEMeducation #learnontiktok #EdTech`

- **P3 · Jun 12 · IG/FB · Pillar ④ — Parent value**
  EN: "Worksheets are boring. 😴 Schulab blends **live tutoring + interactive lessons + real certificates** — in 3 languages. 🌍 Early access June 25 → [waitlist-link]"
  Visual: split "before/after" carousel.

- **P4 · Jun 14 · LinkedIn · Pillar ① — Founder credibility**
  EN: "We're building Schulab to make world‑class STEM learning **accessible, multilingual, and genuinely interactive** — with live tutors at its core. Early access opens June 25. Educators & schools: let's talk. [waitlist-link]"

- **P5 · Jun 16 · IG/FB/WhatsApp · Pillar ⑦ — Free first session (high‑converting)**
  EN: "🎁 Your **first live tutoring session is on us.** Join the Schulab waitlist before June 25 and lock in **founding‑member** perks. → [waitlist-link]"
  DE: "🎁 Deine **erste Live‑Nachhilfestunde ist gratis.** Trag dich vor dem 25. Juni in die Schulab‑Warteliste ein und sichere dir **Gründungsmitglied‑Vorteile.** → [waitlist-link]"
  AR: "🎁 **جلستك المباشرة الأولى مجانًا!** انضمّ إلى قائمة انتظار Schulab قبل ٢٥ يونيو واحصل على مزايا **الأعضاء المؤسّسين.** → [waitlist-link]"
  Tags: `#Nachhilfe #MINT #تعلم_عن_بعد #STEM`

**— Phase: Invite & Countdown (Jun 18–24) —**

- **P6 · Jun 18 · All · Pillar ⑦ — Invites rolling out**
  EN: "📨 Early‑access invites are going out. Check your inbox — or join the waitlist before the doors open **June 25.** → [waitlist-link]"

- **P7 · Jun 20 · TikTok/Reels/YT · Pillar ③ — Tutor spotlight**
  EN: "Meet the tutors who make STEM *click.* 👩‍🏫 Live classes start **June 25** on Schulab."
  Visual: 20–30s tutor intro clip (record in beta).

- **P8 · Jun 22 · IG/FB · Pillar ⑦ — Countdown T‑3 (trilingual)**
  EN: "**3 days.** ⏳ Interactive STEM + live tutors land **June 25.** Founding members get in first. → [waitlist-link]"
  DE: "**Nur noch 3 Tage.** ⏳ Interaktives MINT‑Lernen + Live‑Tutoren ab **25. Juni.** Gründungsmitglieder zuerst. → [waitlist-link]"
  AR: "**٣ أيام فقط.** ⏳ تعلّم STEM تفاعلي مع معلّمين مباشرين بدءًا من **٢٥ يونيو.** الأعضاء المؤسّسون أولًا. → [waitlist-link]"

- **P9 · Jun 24 · All · Pillar ⑦ — Countdown T‑1**
  EN: "**Tomorrow.** 🚀 Schulab opens its (virtual) doors. Early‑access members — you're first in."

**— Phase: Launch Day (Jun 25) — *gated on platform‑healthy go* —**

- **P10 · Jun 25 (AM, after ENG confirms healthy) · All · Pillar ⑦ — LAUNCH (trilingual core)**
  EN: "🚀 **Schulab is live!** Interactive STEM learning with **live tutors**, for ages 3–18 — in English · Deutsch · العربية. Your **first live session is free.** Get started → [app-link] `#EdTech #STEM #OnlineLearning`"
  DE: "🚀 **Schulab ist da!** Interaktives MINT‑Lernen mit **Live‑Tutoren** – für 3‑ bis 18‑Jährige. Die **erste Live‑Stunde ist gratis.** Jetzt starten → [app-link] `#MINT #Lernplattform #Nachhilfe #OnlineLernen`"
  AR: "🚀 **وصلت منصة Schulab!** تعلّم STEM تفاعلي مع **معلّمين مباشرين** — للأعمار من ٣ إلى ١٨. **جلستك المباشرة الأولى مجانًا.** ابدأ الآن → [app-link] `#تعليم #تعلم_عن_بعد #STEM`"

- **P11 · Jun 25 (PM) · IG Stories/Reels · Pillar ⑥ — "We're live" social proof**
  EN: "We're officially live — and the first learners are already in. 🎉 Don't miss the free first session → [app-link]" (overlay real signup count if comfortable).

**— Phase: Post‑launch week (Jun 26 – Jul 2) —**

- **P12 · Jun 26 · IG/FB · Pillar ⑥ — First certificates / social proof.**
- **P13 · Jun 28 · TikTok/Reels · Pillar ② — Live‑class highlight clip (from a real session, with consent).**
- **P14 · Jun 30 · LinkedIn · Pillar ① — Early traction + schools CTA** ("X learners in week one — schools, let's talk").
- **P15 · Jul 2 · All · Pillar ⑥+⑦ — Testimonial + "invites still open"** to keep the funnel warm.

### 9★.4 Automated email sequence (ready‑made, consent‑aware)

> Waitlist/announcement = **Resend Broadcasts**; post‑signup behavior = **platform `DripState` journeys** (already built — just enable/verify). All marketing email respects `MARKETING_EMAIL` consent.

| # | Trigger / timing | Channel | Subject (EN — localize de/ar) |
|---|---|---|---|
| E1 | On waitlist signup | Resend (Zapier) | "You're on the list 🎉 Early access opens June 25" |
| E2 | Jun 18 | Broadcast | "Your Schulab early‑access invite is here" |
| E3 | Jun 24 (T‑1) | Broadcast | "Doors open tomorrow — your free first session awaits" |
| E4 | Jun 25 launch | Broadcast | "Schulab is live — start learning (1st live session free)" |
| E5 | Signup, no first lesson in 48h | DripState **ACTIVATION** | "Your first interactive lesson is waiting" |
| E6 | Started checkout, didn't subscribe | DripState **CART_ABANDONMENT** | "Still thinking it over? Your free session is reserved" |
| E7 | Parent accounts, weekly | DripState **PARENT_DIGEST** | "This week in your child's learning" |
| E8 | Inactive 14–30 days | DripState **WIN_BACK** | "We saved your progress — come back to a free session" |

Body pattern for each: one clear value line → single CTA button → trust footer (Impressum/links, unsubscribe). Draft all three languages in Resend templates before launch.

### 9★.5 Setup & scheduling checklist (do in Phase 1–2 so launch week is hands‑off)

| Task | Pri | Owner | When |
|---|---|---|---|
| Confirm final channel list + connect all accounts to Postiz | H | MKT | Jun 13–15 |
| Build Canva Brand Kit + per‑channel templates | H | MKT | Jun 13–16 |
| Stand up Notion content calendar; load the P1–P15 bank | H | MKT | Jun 14–16 |
| Localize all posts/emails to de + ar (human‑reviewed) | H | MKT+OPS | Jun 15–18 |
| Define **UTM convention**: `utm_source={channel}&utm_medium=social|email&utm_campaign=softlaunch_jun2026` | H | ENG+MKT | Jun 14 |
| Connect Postiz ↔ n8n (API credential); confirm Postiz channels authorized | H | ENG | Jun 13–15 |
| Build the 6 n8n workflows (§9★.1) + scoped read‑only Postgres role / webhooks | M | ENG | Jun 16–20 |
| Set up Resend Broadcasts + verify DripState journeys fire | H | ENG+MKT | Jun 16–19 |
| Create WhatsApp Business + Telegram channel; wire n8n native nodes | M | OPS+ENG | Jun 17–20 |
| **Pre‑schedule the entire bank in Postiz** (P1–P9 auto; P10–P11 drafted + gated) | H | MKT | by Jun 21 |
| Verify GA4/PostHog receives UTM'd traffic end‑to‑end | M | ENG | Jun 18–20 |
| Launch‑day gate rule documented: **MKT releases P10/E4 only after ENG's "healthy" signal** | H | PM | Jun 22 |

**Guardrails:** (1) Nothing about deferred features — **no "recorded sessions," no student‑on‑camera, no Passkey** claims. (2) Launch‑day posts/emails are pre‑written but **held** until the platform is confirmed live and healthy. (3) Capacity guardrail: if signups outpace support/infra headroom, **pause the next invite wave** (soft‑launch safety valve) — the scheduled organic posts can keep running.

---

## 10. Section 7 — Launch Week Execution Plan

### Daily checklist (Mon 22 – Thu 25 Jun)
- **Mon 22 (T‑3):** land final S1/S2 fixes → **hotfix-only freeze** · re-run smoke runbook · confirm prod `.env` complete · team walkthrough of go-live + escalation runbooks.
- **Tue 23 (T‑2):** final rehearsal deploy + smoke + rollback drill · marketing schedules launch emails/social · confirm on-call rota incl. **weekend (27–28)** · verify backups fresh.
- **Wed 24 (T‑1):** **GO/NO‑GO 17:00** (§3.2) · freeze content · pre-stage invite emails · prep status/maintenance page · final backup verified.

### Launch day — Thu 25 Jun (go-live procedure)
1. **AM:** final backup; final smoke runbook on prod; confirm Sentry/analytics/health dashboards green.
2. **Deploy** the launch build via the standard pipeline; watch the `/api/health` poll + auto-rollback.
3. **Post-deploy smoke** (live): one real signup + one real subscription + join a live room.
4. **Open the doors:** send **invite wave 1** (smallest segment) → watch metrics 60–90 min → send wave 2, etc. Open the public waitlist page.
5. **Monitor live** (see below). **Marketing** posts go out *after* the platform is confirmed healthy, not before.

### Final QA & smoke testing
- The critical-journey smoke runbook (extended `scripts/smoke-prep.ts`) is the single source of truth: signup → verify → consent → subscribe (VAT) → enrol → learn → quiz → book → join live → complete → certificate. Must be green pre- and post-deploy.

### Team communication & escalation
- Single launch-day channel (e.g. Slack) + a short standup at open. Roles: **PM** = incident commander/comms, **ENG** = deploy + hotfix, **OPS** = support triage, **MKT** = comms gating.
- Escalation: Support → PM → ENG. S1 (revenue/auth/data down) = all-hands immediately; consider pausing invites; communicate via status page.

### Real-time monitoring during launch
- Watch: Sentry error rate, `/api/health`, signup→subscribe funnel (analytics), Stripe payments/failures, LiveKit room health, DB connections/latency, rate-limit hits, support inbox volume.
- Tripwires: error-rate spike → pause invites; payment failures → check Stripe/VAT config; DB saturation → throttle invite waves.

### Backup & rollback plan
- **Rollback:** pipeline auto-rolls back on failed health check; manual rollback = redeploy previous image SHA (digest pinned). Rollback runbook rehearsed in Phase 2/3.
- **Data:** a fresh backup verified launch morning; restore runbook on hand. If a data-affecting incident occurs, stop writes (maintenance page) before restoring.
- **Soft-launch safety valve:** because openness is invite-gated, the strongest mitigation for *any* issue is simply **pausing further invites** while fixing — no public-facing outage.

---

## 11. Section 8 — Post‑Launch Growth Plan (First 30 Days · 26 Jun – 25 Jul)

**Week 1 (26 Jun – 2 Jul) — Stabilize & weekend on-call**
- **Weekend on-call (27–28 Jun)** for the first post-launch weekend.
- Daily bug triage; ship hotfixes for S1/S2; monitor error rate trending down.
- **User feedback collection:** in-app feedback prompt, short onboarding survey, direct outreach to first cohort, watch support themes.
- Daily KPI standup (see metrics below).

**Week 2 (3–9 Jul) — Iterate & widen the gate**
- Bug-fix + small-UX iteration cadence (weekly release train now that freeze is lifted).
- **Open invite waves wider** as stability + support headroom allow; raise capacity guardrails deliberately.
- First retention look: activation rate (signup→first lesson), subscription conversion, early churn signals.

**Week 3 (10–16 Jul) — Engagement & retention**
- Activate engagement loops: gamification (badges/points/leaderboard), certificate sharing, drip journeys (ACTIVATION, PARENT_DIGEST, WIN_BACK), competitions as a community hook.
- Tutor utilization review; add availability where demand concentrates.
- Marketing optimization: double down on the best-converting channel/locale; cut what isn't working.

**Week 4 (17–25 Jul) — Scale toward public**
- If KPIs + stability hold: **transition from invite-gated to fully public** (the soft-launch graduation).
- Scale marketing spend on proven channels; begin seeding B2B/school conversations (deferred from day-1 scope).
- 30-day retro: what to build next (revisit deferred stubs — recording/egress, student A/V, Notes/Resources/Q&A — based on real demand).

**Analytics & KPIs to track from day 1**
- Acquisition: waitlist→invite→signup conversion; channel/locale attribution.
- Activation: signup→email-verify, →first lesson, →first quiz.
- Revenue: trial/subscribe conversion, MRR, plan mix (Solo/Family/Custom), refund/withdrawal rate, failed-payment rate.
- Engagement: WAU, lessons/learner, live-session attendance, certificates issued.
- Retention: D1/D7/D30, early subscription churn.
- Reliability: error rate, uptime, p95 latency, support tickets/100 users + resolution time.

**Bug-fixing & iteration process**
- Triage board with severity SLAs; weekly release train; Sentry-driven prioritization; regression checks via the smoke runbook on every deploy.

---

## 12. Critical Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Data loss (no backups today) | Med | Critical | CSF #1 — backups + tested restore before launch; EU-region storage. |
| Payment/VAT misconfig → bad invoices or lost revenue | Med | High | CSF #2 — live-mode charge/refund/cancel test + Stripe Tax/OSS before GO. |
| Minor served paid content without consent | Med | Critical (legal) | CSF #3 — verify `assertMinorConsent` end-to-end with minor test account. |
| German legal non-compliance (Abmahnung) | Med | High | CSF #4 — lawyer review of legal pack in Phase 1. |
| Blind to production errors | High (today) | High | CSF #6 — Sentry + analytics + extended health + alerts in Phase 0. |
| Bad deploy with no staging | Med | High | CSF #7 — rehearsal/shadow deploy + drilled rollback + auto-rollback pipeline. |
| Scope creep / missed freeze | Med | High | CSF #8 — hard freeze 12 Jun; deferred list signed off. |
| Launch-week overload on a 2–5 team | High | Med | Soft launch + staggered invites + capacity guardrails + weekend on-call. |
| Live session fails at concurrency | Med | High | Phase 2 real-concurrency test; LiveKit health monitored; classroom degrades gracefully. |
| Over-promising deferred features | Med | Med | Marketing review: no recordings / student-camera / Notes claims. |
| Domain cutover (schulab.com) breaks OAuth / Stripe / email / video | Med | High | Section 0 in Phase 0 (done by Jun 12); smoke runbook validates Google login + Stripe webhook + Mux/LiveKit + email links on the new domain; old domain keeps 301-ing. |

---

## 13. Parallelization summary (what runs at the same time)

- **Phase 0:** backups · Sentry · analytics · security headers · env audit — all ∥.
- **Phase 1:** revenue track (Stripe live/VAT/test) ∥ legal pack ∥ minor-consent verify ∥ smoke-runbook+tests ∥ content QA — converge on rehearsal deploy #1.
- **Phase 2:** beta + bug-fix loop ∥ load/live-room test ∥ device matrix ∥ marketing prep ∥ support prep — converge on go-live rehearsal.
- **Always parallel:** MKT (campaign build) and OPS (support/help/tutor onboarding) run continuously alongside ENG hardening.

---

## 14. Verification — how we know the plan worked

1. **Pre-launch gate (24 Jun):** all §3.2 GO criteria checked off in the launch tracker.
2. **Smoke runbook green** against production on launch morning (the extended `scripts/smoke-prep.ts` journey).
3. **Live revenue:** at least one real paid subscription with a correct VAT invoice in the first invite wave.
4. **Live class:** at least one tutor-led live session completed with the first cohort (tutor A/V + slides + chat/poll).
5. **Trust signals at 72h:** error rate flat/low in Sentry, uptime ≥ target, no S1 incidents unresolved, support backlog manageable in all three languages.
6. **30-day exit:** activation/retention/MRR KPIs trending positively → graduate from invite-gated to fully public.

> **Note on platform changes:** This is a strategy/PM artifact, not a code change. The few engineering items it implies (backups, Sentry, analytics, security headers, extended health check, smoke runbook) are tracked here as launch tasks; each would be implemented as a normal PR with its own migration/tests where applicable — none should be attempted after the 12 Jun feature freeze except as hardening.
