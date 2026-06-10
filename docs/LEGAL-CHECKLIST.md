# German Legal Pack — Pre-Launch Checklist

Status of the legal pages and **exactly** what must be done before the German-market
launch. Pages live under `src/app/[locale]/(public)/{impressum,agb,widerruf,privacy,terms}`.

> **Bottom line:** the page *structure* exists and is sound, but the *content* is
> placeholder/English in places and **none of it has been legally reviewed**. For a
> platform serving **minors** and (later) taking **payments**, a German lawyer or a
> reputable service (eRecht24, Trusted Shops, IT-Recht Kanzlei) must review the AGB,
> Widerruf, and Datenschutzerklärung. Filling the data below is necessary but **not
> sufficient** without that review.

Legend: 🟢 done in code · 🟡 needs your data (env) · 🔴 needs real content + legal review

---

## 1. Impressum (§5 TMG) — 🟡 needs data
Page is env-driven; fill these in `.env` (documented in `.env.example` → "Legal entity"):

| Env var | Field | Example |
|---|---|---|
| `COMPANY_LEGAL_NAME` | Full legal name | Mudita IT Solutions UG (haftungsbeschränkt) |
| `COMPANY_ADDRESS_LINE1` | Street + number | Musterstraße 12 |
| `COMPANY_ADDRESS_LINE2` | Postcode + city | 10115 Berlin |
| `COMPANY_EMAIL` | Contact email | hello@schulab.com |
| `COMPANY_PHONE` | Phone (required for Impressum) | +49 30 1234567 |
| `COMPANY_REGISTER_COURT` | Registergericht | Amtsgericht Charlottenburg |
| `COMPANY_REGISTER_NUMBER` | HRB number | HRB 123456 B |
| `COMPANY_MANAGING_DIRECTOR` | Geschäftsführung | Mark Wahba |
| `COMPANY_VAT_ID` | USt-IdNr. (§27a UStG) | DE123456789 |
| `COMPANY_RESPONSIBLE_EDITOR` | Content-responsible person (§18 MStV) + address | Mark Wahba, Musterstraße 12, 10115 Berlin |

After filling: set the same values in the server `.env` and restart. Remove the
"Platzhalter" note at the bottom of the page once finalized. **Verify VSBG line** —
the page currently says you will NOT participate in consumer-arbitration; confirm that
is your intended stance.

## 2. Widerrufsbelehrung — 🟡 data + 🔴 review
- Uses the same `COMPANY_*` env vars (recipient of the withdrawal notice).
- Has the standard 14-day text. **Two things to confirm with counsel:**
  - The **digital-content waiver**: for instant access to digital content/subscriptions
    you must obtain the customer's express consent to begin before the 14 days lapse
    **and** their acknowledgement that they thereby lose the right of withdrawal. This
    must be presented **at checkout** — it is **not built** (correctly deferred since
    payments are OFF; required before `PAYMENTS_ENABLED=true`).
  - Whether a **Muster-Widerrufsformular** (model withdrawal form) is included.

## 3. AGB (Terms of Service) — 🔴 content + review
- `lastUpdated="[Datum]"` placeholder → set a real date.
- German body text exists but is **unreviewed**. Must cover: contract formation,
  subscription terms + auto-renewal, prices/VAT, minors & parental authority,
  termination, liability, applicable law. **Lawyer review required.**

## 4. Datenschutzerklärung (Privacy) — 🔴 SUBSTANTIVE GAP
The biggest gap. Current page is **in English and names no data processors**. A
GDPR-compliant German Datenschutzerklärung must disclose, per processor: what data,
legal basis (Art. 6), retention, and any third-country transfer (Drittlandtransfer).
**Processors actually used by this app (disclose each):**

| Processor | Purpose | Note |
|---|---|---|
| Stripe | Payments (when live) | US — needs transfer basis |
| Mux | Video hosting/streaming | US |
| LiveKit | Live classroom A/V | check region |
| Resend | Transactional + marketing email | US |
| UploadThing | File uploads | US |
| PostHog / GA4 | Analytics (if enabled) | consent-gated |
| Google | OAuth sign-in | US |
| Hetzner | Hosting (DB + app) | EU ✅ |
| Cloudflare | CDN / proxy | check |

Plus: children's-data handling (links to the consent flow), data-subject rights
(access/deletion), DPO/contact, cookie categories matching the cookie banner.
**Rewrite in German + lawyer review required.**

## 5. Cookie consent — verify
Confirm the cookie banner's analytics/marketing toggles actually gate the corresponding
scripts (PostHog/GA4 only load after consent). Categories must match the
Datenschutzerklärung.

---

## Minor parental consent (GDPR-K) — 🟢 verified in code
Not a content task, but part of the same compliance gate — status for completeness:
- `CHILD_AGE_THRESHOLD=16` (DE). Logic in `src/lib/compliance.ts` (`assertMinorConsent`).
- **Enforced** at all self-serve gates: `enrollInCourse`, billing action, billing
  checkout route, parent-enroll, and the lesson-learn page.
- **Tested**: unit tests in `src/lib/compliance.test.ts` + enforcement tests in
  `src/actions/enrollment.actions.test.ts` (minor w/o consent is blocked; withdrawn is
  blocked; no-DOB is blocked; consented minor + adult pass).
- ⚠️ A **digital-content withdrawal-waiver** `ConsentType` is **not** in the enum — only
  needed once paid checkout ships (see Widerruf §2). Track for `PAYMENTS_ENABLED=true`.

## What only you can do
1. Provide the real company data (table §1).
2. Commission a **German legal review** of AGB + Widerruf + Datenschutzerklärung
   (and ideally Impressum). This is the launch-blocking item — budget a few hundred €
   and a few days turnaround.
