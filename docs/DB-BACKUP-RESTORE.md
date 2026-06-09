# Postgres Backup & Restore Runbook (Schulab)

> Closes the launch-critical "no backups" gap. The platform's Postgres runs as the
> `postgres` docker-compose service on the Hetzner host. This runbook covers automated
> logical backups, offsite copies, and a **tested** restore.

## Targets

| Metric | Target |
|---|---|
| **RPO** (max data loss) | ≤ 24h at launch (nightly dump); tighten to ≤ 1h post-launch with WAL archiving |
| **RTO** (max time to restore) | ≤ 1h |
| Local retention | 14 days (`BACKUP_RETENTION_DAYS`) |
| Offsite retention | Set a lifecycle policy on the bucket (e.g. 30–90 days) |

## What runs

[`scripts/backup-db.sh`](../scripts/backup-db.sh) dumps the DB via `docker compose exec -T postgres pg_dump` (gzipped, `--clean --if-exists --no-owner`), validates the dump size, optionally uploads offsite via `rclone`, and prunes old local dumps.

## 1. Schedule nightly backups (cron on the host)

From the deploy directory (where `docker-compose.yml` + `.env` live):

```bash
chmod +x scripts/backup-db.sh
crontab -e
```

Add (03:17 UTC nightly, logged):

```cron
17 3 * * * cd /opt/schulab && BACKUP_S3_DEST="hetzner:schulab-backups" ./scripts/backup-db.sh >> /var/log/schulab-backup.log 2>&1
```

> Replace `/opt/schulab` with the actual deploy path. `DB_USER` / `DB_NAME` are read from `.env`.

## 2. Configure offsite storage (rclone)

Backups on the same VPS disk do **not** survive a VPS/volume loss — offsite is mandatory.

```bash
apt-get install -y rclone        # or the static binary
rclone config                    # create a remote, e.g. "hetzner" (S3-compatible / Storage Box)
```

Set `BACKUP_S3_DEST` (e.g. `hetzner:schulab-backups`) in the cron line or `.env`. Verify:

```bash
BACKUP_S3_DEST="hetzner:schulab-backups" ./scripts/backup-db.sh
rclone ls hetzner:schulab-backups        # confirm the dump landed offsite
```

> **EU data residency:** choose an EU region/location for the bucket (GDPR — the DE market).

## 3. Restore procedure

> ⚠️ A restore **overwrites** current data. For production, stop the web container first
> (serve a maintenance page) so no writes race the restore.

```bash
# 0. (prod) stop writes
docker compose stop web

# 1. fetch the dump (offsite or local ./backups)
rclone copy hetzner:schulab-backups/schulab-<DB_NAME>-<TIMESTAMP>.sql.gz ./backups/

# 2. restore into the running postgres container
gunzip -c ./backups/schulab-<DB_NAME>-<TIMESTAMP>.sql.gz \
  | docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME"

# 3. bring the app back
docker compose start web

# 4. confirm health
curl -fsS http://127.0.0.1:3020/api/health
```

The dump uses `--clean --if-exists`, so it drops and recreates objects — restoring over an existing database is safe and idempotent.

## 4. Test-restore drill (do this BEFORE launch, then monthly)

A backup you haven't restored is not a backup. Validate against a throwaway DB:

```bash
# spin a temp postgres, restore the latest dump into it, sanity-check row counts
docker run --rm -d --name pg-restore-test -e POSTGRES_PASSWORD=test -p 55432:5432 postgres:15-alpine
sleep 5
gunzip -c ./backups/schulab-<DB_NAME>-<TIMESTAMP>.sql.gz \
  | PGPASSWORD=test psql -h localhost -p 55432 -U postgres -d postgres
PGPASSWORD=test psql -h localhost -p 55432 -U postgres -d postgres \
  -c 'SELECT count(*) FROM "User";'   # expect a sane number
docker rm -f pg-restore-test
```

Record the date of each successful test restore in the launch tracker (Go/No-Go criterion).

## Post-launch hardening (not blocking)

- **WAL archiving / PITR** for sub-hour RPO (e.g. `wal-g` to the same bucket).
- Alert if no fresh backup object appears within 26h (wire into the n8n daily KPI digest or uptime monitor).
- Encrypt dumps at rest (rclone crypt remote or bucket-side SSE).
