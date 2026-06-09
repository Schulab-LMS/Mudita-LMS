#!/usr/bin/env bash
#
# backup-db.sh — Postgres logical backup for Schulab (Mudita LMS).
#
# Dumps the database running as the `postgres` docker-compose service to a
# timestamped, gzipped file, optionally ships it to offsite object storage, then
# prunes old local copies. Designed to run from the deploy directory on the
# Hetzner host via cron. See docs/DB-BACKUP-RESTORE.md for setup + restore.
#
# Usage:
#   ./scripts/backup-db.sh
#
# Required env (read from ./.env via docker compose, or the current shell):
#   DB_USER, DB_NAME            — Postgres credentials (same vars docker-compose uses)
# Optional env:
#   BACKUP_DIR                  — local backup target        (default: ./backups)
#   BACKUP_RETENTION_DAYS       — prune local dumps older than N days (default: 14)
#   BACKUP_S3_DEST              — rclone/S3 destination, e.g. "s3:schulab-backups"
#                                 or an rclone remote "hetzner:schulab-backups".
#                                 If set, the dump is uploaded with `rclone copy`.
#   COMPOSE_CMD                 — override compose binary     (default: "docker compose")
#
set -euo pipefail

cd "$(dirname "$0")/.."

# --- config ---------------------------------------------------------------
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"

# Read ONLY the two vars we need from .env — do NOT `source` it. Docker-style .env
# files contain unquoted values with spaces (e.g. a single-line PEM key), which bash
# `source` tries to execute ("RSA: command not found"). Grep extracts just these keys.
if [[ -f .env ]]; then
  # \042 = double-quote, \047 = single-quote (strip them if the value is quoted).
  : "${DB_USER:=$(grep -E '^DB_USER=' .env | head -n1 | cut -d= -f2- | tr -d '\042\047')}"
  : "${DB_NAME:=$(grep -E '^DB_NAME=' .env | head -n1 | cut -d= -f2- | tr -d '\042\047')}"
fi

: "${DB_USER:?DB_USER is required (set it in .env or the environment)}"
: "${DB_NAME:?DB_NAME is required (set it in .env or the environment)}"

timestamp="$(date -u +%Y%m%d-%H%M%S)"
outfile="${BACKUP_DIR}/schulab-${DB_NAME}-${timestamp}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[backup] dumping database '${DB_NAME}' -> ${outfile}"

# Run pg_dump *inside* the postgres container (-T = no TTY) so we don't depend on
# a host-side pg client and the dump tool matches the server version. --clean adds
# DROP statements so a restore is idempotent; --no-owner avoids role-mismatch noise.
${COMPOSE_CMD} exec -T postgres \
  pg_dump --clean --if-exists --no-owner -U "${DB_USER}" "${DB_NAME}" \
  | gzip -9 > "${outfile}"

# Fail loudly if the dump is suspiciously small (e.g. container down / auth error).
size_bytes="$(wc -c < "${outfile}" | tr -d ' ')"
if [[ "${size_bytes}" -lt 1000 ]]; then
  echo "[backup] ERROR: dump is only ${size_bytes} bytes — treating as failure" >&2
  rm -f "${outfile}"
  exit 1
fi
echo "[backup] wrote ${size_bytes} bytes"

# --- offsite upload (optional) --------------------------------------------
if [[ -n "${BACKUP_S3_DEST:-}" ]]; then
  if command -v rclone >/dev/null 2>&1; then
    echo "[backup] uploading to ${BACKUP_S3_DEST}"
    rclone copy "${outfile}" "${BACKUP_S3_DEST}/"
  else
    echo "[backup] WARNING: BACKUP_S3_DEST set but rclone not installed — skipping upload" >&2
  fi
fi

# --- prune old local dumps ------------------------------------------------
echo "[backup] pruning local dumps older than ${RETENTION_DAYS} days"
find "${BACKUP_DIR}" -name 'schulab-*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -print -delete || true

echo "[backup] done."
