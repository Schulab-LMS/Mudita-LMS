# Schulab Marketing Engine (Postiz + n8n + Resend)

Everything needed to run the launch campaign hands-off, built on the stack you already
self-host. Once wired (≈1 hour), the calendar runs itself; only the **launch-day posts
are gated** on a manual "platform healthy" release.

```
posts.json ──(schedule-marketing-posts.ts)──▶ Postiz ──▶ IG / FB / LinkedIn / TikTok / YT
n8n: drip-cron ───────────▶ GET /api/cron/drip (Bearer CRON_SECRET) → ACTIVATION / PARENT_DIGEST / WIN_BACK
n8n: countdown-broadcasts ▶ Postgres (consented users) → Resend  (E2 Jun 18 · E3 Jun 24 · E4 Jun 25)
n8n: kpi-digest ──────────▶ Postgres (KPIs) → Resend daily 08:00 to the team
```

## What's in here

| Path | What |
|---|---|
| `content/posts.json` | P1–P15 social calendar (Jun 12 → Jul 2), EN/DE/AR, payments-off copy, `{{link}}` + UTM placeholders |
| `../scripts/schedule-marketing-posts.ts` | Pushes the bank into Postiz via its Public API (`npm run marketing:schedule`) |
| `n8n/drip-cron.json` | Every 15 min → triggers the app's lifecycle-email engine |
| `n8n/countdown-broadcasts.json` | E2/E3/E4 launch emails to **consented users only** |
| `n8n/kpi-digest.json` | Daily 08:00 KPI email to the team |
| `emails/countdown-emails.json` | Editing reference for E2–E4 copy (running copy is in the workflow) |

## Setup — one time, on the server

### 1. Postiz: connect channels + schedule the bank
1. In the Postiz UI, connect every channel you'll use (Instagram, Facebook, LinkedIn, TikTok, YouTube). Unconnected channels are simply skipped by the script with a warning.
2. Settings → **Public API** → copy the API key.
3. From the repo clone (`/opt/projects/mudita-lms-src`, after `git pull`):
   ```bash
   export POSTIZ_API_URL="https://<your-postiz-host>/api/public/v1"   # backend URL + /public/v1
   export POSTIZ_API_KEY="<key>"
   npm run marketing:schedule                       # DRY RUN — verifies API + prints the plan
   npm run marketing:schedule -- --execute --limit 1   # schedule ONE post, check it in the calendar
   npm run marketing:schedule -- --execute          # schedule everything
   ```
   Notes: needs `npm ci` once in the clone. If the API 404s, your backend path differs —
   try `http://127.0.0.1:3040/public/v1` (the container port) from the server itself.
   Re-running `--execute` duplicates posts; clean up in the Postiz calendar.

### 2. n8n: credentials (3) then import the workflows
Create these credentials in n8n first (names must match what the workflows reference):

| Credential (type) | Name | Values |
|---|---|---|
| Header Auth | `Schulab Cron Secret` | Name: `Authorization` · Value: `Bearer <CRON_SECRET from app .env>` |
| Header Auth | `Resend API` | Name: `Authorization` · Value: `Bearer <RESEND_API_KEY>` |
| Postgres | `Schulab Postgres RO` | host/db/user below |

**Read-only Postgres role** (never give n8n the app's main credentials):
```bash
cd /opt/projects/mudita-lms
docker compose exec -T postgres psql -U "$(grep -E '^DB_USER=' .env|cut -d= -f2-)" -d "$(grep -E '^DB_NAME=' .env|cut -d= -f2-)" <<'SQL'
CREATE ROLE n8n_ro LOGIN PASSWORD 'CHANGE-ME-strong-password';
GRANT CONNECT ON DATABASE mudita_lms TO n8n_ro;
GRANT USAGE ON SCHEMA public TO n8n_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO n8n_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO n8n_ro;
SQL
# let the n8n container reach the LMS database network:
docker network connect mudita-lms_default n8n-n8n-1   # adjust container name (docker ps)
```
In the n8n Postgres credential use: Host `mudita-lms-postgres-1`, Port `5432`, Database `mudita_lms`, User `n8n_ro`, your password, SSL off.

Then: n8n → Workflows → **Import from file** → import all three JSONs from `marketing/n8n/`, open each, confirm the credential pickers resolved, **Activate**.

Also make sure `CRON_SECRET` is set in the app `.env` (else `/api/cron/drip` returns 503) and restart the web container after setting it.

### 3. Launch-day gate (the one manual step)
`P10`/`P11` (launch posts) are `gated: true` → **not** auto-scheduled. On June 25, after
the health check + smoke pass, release them either by re-running the script with
`--include-gated --execute` or by posting them manually in Postiz. The E4 launch email
fires automatically at 09:00 — if launch is delayed, **deactivate the countdown workflow
before 09:00**.

## Guardrails (do not skip)

- **Consent**: countdown emails go only to verified users whose *latest* `MARKETING_EMAIL`
  consent is granted — the SQL enforces it. Don't widen that query.
- **No paid claims**: copy says "free during early access" everywhere. No €-prices,
  no "first session free", no recordings/student-camera promises (deferred features).
- **Visuals**: every post lists a `visual` brief — produce in Canva (1080×1080 + story)
  and attach in the Postiz calendar before each post fires; posts publish text-only otherwise.
- **P13/P14/P15 need week-one artifacts** (consented clip, real numbers, real testimonial)
  — edit or delete them in the Postiz calendar if those don't exist.
- **Measurement gap**: all links carry UTMs, but `ANALYTICS_PROVIDER=NONE` right now —
  enable PostHog/GA4 before launch or the UTM data lands nowhere.

## UTM convention
`utm_source={channel|email} · utm_medium={social|email} · utm_campaign=earlyaccess_jun2026`
