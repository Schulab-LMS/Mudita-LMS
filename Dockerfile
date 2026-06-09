# syntax=docker/dockerfile:1.7
# ---------- deps: install all dependencies (including dev) for the build ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- builder: generate prisma client + build next ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma v7 needs a DATABASE_URL to generate the client (no actual connection).
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* values are inlined into the bundle at BUILD time, so the canonical
# app URL must be present here (not just in the runtime .env) for the static
# sitemap.xml / robots.txt / metadata to emit production URLs instead of localhost.
# Overridable via --build-arg (deploy.yml passes it); defaults to the prod domain.
ARG NEXT_PUBLIC_APP_URL=https://schulab.com
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
RUN npx prisma generate
RUN npm run build

# ---------- prod-deps: install ONLY production dependencies for the runtime ----------
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
# `prisma` CLI is in dependencies, so it survives `--omit=dev` and is
# available at runtime for `prisma migrate deploy`.
RUN npm ci --omit=dev

# ---------- runner: minimal runtime image ----------
FROM node:20-alpine AS runner
WORKDIR /app
# Prisma requires openssl at runtime on Alpine (musl libc).
RUN apk add --no-cache openssl tini
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Run as the unprivileged `node` user that the official image already provides.
RUN chown -R node:node /app
USER node

# Standalone Next.js output bundles a minimal node_modules under .next/standalone.
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static
COPY --chown=node:node --from=builder /app/public ./public

# next-intl reads message files at runtime.
COPY --chown=node:node --from=builder /app/messages ./messages

# Generated Prisma client lives under src/generated.
COPY --chown=node:node --from=builder /app/src/generated ./src/generated

# Prisma schema + plain-JS config so `prisma migrate deploy` can run on the box.
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/prisma.config.runner.js ./prisma.config.js

# Production-only node_modules (includes `prisma` CLI but no dev deps / tsx).
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
