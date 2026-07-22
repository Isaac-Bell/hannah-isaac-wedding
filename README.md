# Hannah & Isaac Wedding Website

A private, self-hosted wedding portal combining a polished public wedding site with database-backed invitation sessions protecting RSVP, travel, details, and optional gift information.

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
npm run invite:create -- --environment development --party-name "Test Household" --guest "Guest One" --guest "Guest Two"
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

| Variable                  | Purpose                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`    | Canonical application URL                                                                                |
| `DATABASE_URL`            | PostgreSQL connection string                                                                             |
| `INVITATION_CODE_PEPPER`  | Required keyed hashing secret for invitation codes, sessions, and privacy-preserving attempt identifiers |
| `TRUST_PROXY_HEADERS`     | Set to `true` only when direct origin access is blocked and Cloudflare owns forwarding headers           |
| `ADMIN_AUTH_SECRET`       | Reserved for future separate admin authentication                                                        |
| `TRAVEL_AIRPORT_INFO_URL` | Optional HTTPS airport-information link                                                                  |
| `GIFT_ZELLE_*`            | Optional server-only recipient display values                                                            |
| `GIFT_PAYPAL_ME_URL`      | Optional HTTPS `paypal.me` external-payment URL                                                          |

Public configuration is validated when read. Database configuration is validated only when a database operation is requested, so linting and static builds do not open a database connection.

## Commands

```bash
npm run dev           # Start the development server
npm run build         # Create a production build
npm start             # Run the production build
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript without emitting files
npm test              # Run component, utility, security, and configuration tests
npm run format        # Format tracked project files
npm run format:check  # Check formatting without changing files
npm run db:generate   # Generate SQL migrations from src/db/schema.ts
npm run db:migrate    # Apply generated migrations
npm run db:studio     # Open Drizzle Studio
npm run invite:create -- --environment development --party-name "Test Household" --guest "Guest One"
```

Generate a development secret with:

```bash
openssl rand -base64 48
```

Place it in `.env.local` as `INVITATION_CODE_PEPPER`. The invitation creation command requires an explicit `--environment development|production` mode and refuses production use unless `--confirm-production` is supplied. It retries code-hash collisions, inserts the party and guests in one transaction, stores only a keyed hash, and prints the plaintext code once. Do not paste that code into logs or URLs.

## Guest login and protected routes

Start PostgreSQL, apply migrations, create a demo invitation, and visit `/invite`. A valid code creates a 30-day opaque session in an HttpOnly, SameSite=Lax cookie and redirects to `/details`; the code never appears in the URL or cookie. `/details`, `/rsvp`, `/travel`, and `/gifts` redirect unauthenticated visitors to `/invite`. “Forget this device” revokes the database session and deletes the cookie.

Attempts are throttled using persistent PostgreSQL records keyed by privacy-preserving hashes. Public errors are deliberately generic for invalid, disabled, expired, and rate-limited invitations.

## Travel and gifts

General travel copy is maintained in `src/content/travel.ts` and includes a last-reviewed date. Recheck external guidance before launch. Keep venue addresses, booking codes, private phone numbers, and unconfirmed transport outside this module.

Gift options are optional external personal-payment methods only. The app does not collect amounts, store bank/card details, run PayPal checkout, or record payment completion. Unconfigured providers are hidden. Never commit real recipient details; provide them only through server environment configuration.

> Do not commit real invitation codes, private venue information, personal payment details, booking codes, or production secrets.

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

All pages opt out of search indexing. Guest routes require a valid database-backed invitation session; the admin route remains a placeholder for a later sprint.

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
