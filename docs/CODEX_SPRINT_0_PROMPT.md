# Codex Prompt: Sprint 0 Foundation

You are working on a new repository named `hannah-isaac-wedding`.

Read `README.md` and `docs/PROJECT_BLUEPRINT.md` before changing files.

## Objective

Create the production-minded foundation for an original, self-hosted wedding portal. This sprint is infrastructure and application scaffolding only. Do not build the full RSVP or payment system yet.

## Technical requirements

1. Initialize a current stable Next.js application using:
   - App Router
   - TypeScript
   - `src/` directory
   - ESLint
   - CSS Modules or a small global token system
   - No large UI component framework

2. Add dependencies:
   - Drizzle ORM
   - PostgreSQL driver
   - Zod
   - `server-only`
   - A lightweight class-name utility only if needed

3. Add:
   - `.editorconfig`
   - `.env.example`
   - `.gitignore`
   - Prettier configuration
   - `npm` scripts for lint, typecheck, test placeholder, build, and database commands
   - Environment validation
   - A reusable database client that does not connect during static linting
   - Initial Drizzle schema matching the blueprint
   - A migration-generation workflow
   - Docker Compose development PostgreSQL service
   - Production-ready multi-stage Dockerfile
   - `/api/health` route that checks application health and optionally database readiness
   - GitHub Actions workflow for install, lint, typecheck, and build

4. Create placeholder routes:
   - `/`
   - `/invite`
   - `/invite/[code]`
   - `/rsvp/[code]`
   - `/details/[code]`
   - `/gifts/[code]`
   - `/admin`

5. Create an original visual foundation:
   - CSS custom properties for colors, spacing, typography, radii, shadows, and content widths
   - Accessible focus styles
   - Responsive page container
   - Serif display heading with a system-safe fallback
   - Sans-serif body stack
   - Warm cream, charcoal, and muted botanical placeholder palette
   - No copied The Knot code, marks, assets, class names, or layout implementation

6. Homepage placeholder:
   - “Hannah & Isaac”
   - “September 12, 2026” marked in source comments as provisional
   - A restrained hero layout
   - A link to `/invite`
   - No external stock imagery yet

7. Security groundwork:
   - Add `noindex, nofollow` metadata
   - Add secure response headers through Next.js configuration where appropriate
   - Add utilities or interfaces for future invitation hashing and rate limiting, but do not invent a complete auth system in this sprint
   - Never log secrets
   - Do not add live payment keys or payment processing

## Code quality

- Prefer server components.
- Add client components only where browser interactivity is required.
- Keep modules small and typed.
- Do not use `any`.
- Add comments only where intent is not obvious.
- Avoid speculative abstractions.
- Ensure `npm run lint`, `npm run typecheck`, and `npm run build` pass.
- Document every setup command in the README.

## Deliverables

At completion:

1. Show the resulting file tree.
2. Summarize important architectural decisions.
3. List every command that was run.
4. Report lint, typecheck, and build results.
5. Call out anything unfinished or blocked.
6. Do not commit or push unless explicitly instructed.
