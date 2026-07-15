# E2E QA harness (Playwright)

Reusable browser‑driven smoke/regression harness used to produce
`../E2E-Launch-Readiness-Report.md`. It drives the app as a real user across all
five roles and captures screenshots + structured logs as evidence.

## Why this isn't wired into CI
The project's unit tests use **Vitest** (node env). This harness needs a real
browser (Playwright/Chromium) and a running app + seeded DB, so it's kept as an
opt‑in script set rather than a CI dependency. It intentionally has **no**
package.json entry — run it against a locally running instance.

## Prerequisites
- App running locally (`npm run dev`) with a seeded DB (`npm run db:seed`).
  Seeded accounts (all password `password123`): `admin@schulab.com`,
  `marcus@example.com`, `aisha@example.com`, `liam@example.com`,
  `sara@example.com`.
- Playwright + Chromium available. If not a project dep, use a global install
  and point `NODE_PATH` at it, e.g.
  `NODE_PATH=$(npm root -g) node docs/qa/harness/example-permission-matrix.mjs`.

## Config (env vars)
| Var | Default | Meaning |
|---|---|---|
| `QA_BASE` | `http://localhost:3000` | App base URL |
| `QA_OUT`  | `./qa-out` | Directory for screenshots + saved auth state |

## Usage
```bash
# 1. save an authenticated storageState per role
NODE_PATH=$(npm root -g) node docs/qa/harness/save-states.mjs
# 2. run the role permission matrix (direct-URL restrictions)
NODE_PATH=$(npm root -g) node docs/qa/harness/example-permission-matrix.mjs
```

`harness.mjs` exports the reusable helpers (`makeSession`, `login`,
`dismissCookies`, `shot`, `probe`, `summarize`, `ACCOUNTS`). Compose new
journeys from those.
