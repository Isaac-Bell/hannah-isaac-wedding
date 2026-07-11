# Hannah & Isaac Wedding Website

A private, self-hosted wedding portal built with Next.js, TypeScript, PostgreSQL, and Drizzle ORM. Sprint 0 provides the production-minded application foundation; invitation lookup, RSVP, gifting, and administration are intentionally placeholders for later sprints.

## Requirements

- Node.js 22
- npm 10 or newer
- Docker with Docker Compose (for local PostgreSQL)

## Local setup

Copy the repository and run:

```bash
npm install
cp .env.example .env.local
docker compose up -d database
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). PostgreSQL is exposed locally on port `5433` to avoid colliding with a default installation on `5432`.

Stop the development database with:

```bash
docker compose down
```

To also remove its local data volume, explicitly run `docker compose down --volumes`.

## Environment

`.env.example` documents local-safe placeholder values. Copy it to `.env.local` and replace secrets before using the features that require them. Never commit `.env.local` or production credentials.

| Variable                 | Purpose                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | Canonical application URL                                            |
| `DATABASE_URL`           | PostgreSQL connection string                                         |
| `INVITATION_CODE_PEPPER` | Reserved for future invitation-code hashing                          |
| `ADMIN_AUTH_SECRET`      | Reserved for future separate admin authentication                    |
| Payment variables        | Reserved placeholders only; no payment processing exists in Sprint 0 |

Public configuration is validated when read. Database configuration is validated only when a database operation is requested, so linting and static builds do not open a database connection.

## Commands

```bash
npm run dev           # Start the development server
npm run build         # Create a production build
npm start             # Run the production build
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript without emitting files
npm test              # Run the placeholder Node test suite
npm run format        # Format tracked project files
npm run format:check  # Check formatting without changing files
npm run db:generate   # Generate SQL migrations from src/db/schema.ts
npm run db:migrate    # Apply generated migrations
npm run db:studio     # Open Drizzle Studio
```

After changing the schema, generate and inspect a migration before applying it:

```bash
npm run db:generate
npm run db:migrate
```

## Health check

`GET /api/health` verifies the application process without requiring PostgreSQL. Use `GET /api/health?database=true` when database readiness is also required. The latter returns HTTP 503 with a deliberately generic response if PostgreSQL is unavailable.

## Containers

Build and run the multi-stage production image with:

```bash
docker build -t hannah-isaac-wedding .
docker run --rm -p 3000:3000 --env-file .env.local hannah-isaac-wedding
```

The final image runs the Next.js standalone server as an unprivileged user. The Compose file is development-only and currently supplies PostgreSQL.

## Project layout

Application routes live in `src/app`, shared UI in `src/components`, database schema and client code in `src/db`, and server utilities in `src/lib`. Generated, reviewable SQL migrations live in `drizzle`. GitHub Actions runs install, lint, typecheck, tests, and build for pull requests and pushes to `main` or `develop`.

All pages opt out of search indexing. Private routes are placeholders only and must not contain private wedding details until invitation and admin protections are implemented.

## Branch flow

- `main`: production
- `develop`: integration
- `feat/site-shell`
- `feat/invitations`
- `feat/rsvp`
- `feat/gifts`
- `feat/admin`
- `feat/deployment`

See `docs/PROJECT_BLUEPRINT.md` for the product and sprint plan.
