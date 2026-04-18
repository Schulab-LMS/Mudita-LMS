# Schulab — Launch Young Minds

Schulab is a modern STEM Learning Management System for children ages 3–18. It combines interactive courses, live expert tutoring, and hands-on science kits to launch young minds into the future of learning.

## Brand

- **Name:** Schulab (from *schola* — school — and *lab* — laboratory)
- **Tagline:** Launch Young Minds.
- **Logo:** LaunchMind — rocket + book + brain + spark
- **Palette:** Electric Indigo `#4F3FF0` · Sunburst Orange `#FF8A3D` · Royal Purple `#8B5CF6` · Fresh Green `#34D399`
- **Typography:** Space Grotesk (display) · Inter (body) · Nunito (kids accent)

## Stack

- Next.js (App Router) + React 19
- TypeScript, Tailwind CSS 4
- Prisma + PostgreSQL
- Auth.js (NextAuth v5)
- next-intl (EN / DE / AR)
- Stripe, Resend, UploadThing

## Getting started

```bash
npm install
cp .env.example .env          # fill in secrets
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Lint the project |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:seed` | Seed the database |
