# AppSec Workbench

AppSec Workbench is an internal application security operations platform for ingesting Semgrep, Gitleaks, and Trivy scan artifacts, normalizing them into one workflow, mapping findings to OWASP ASVS 5.0.0, and helping teams triage, assign, suppress, remediate, and report on security work.

This repository is the foundation for an MVP-first monorepo. The initial commit focuses on the product's hardest part first: a durable domain model, a Prisma schema that preserves scan history cleanly, and planning docs that keep the implementation grounded in a real AppSec operating model.

## Why this project exists

Most scanner demos stop at "run a tool, print a report." Real AppSec work starts after that:

- ingesting heterogeneous scanner outputs
- normalizing them into a stable contract
- deduplicating repeated findings without losing occurrence history
- mapping issues to a recognized control framework
- giving engineering and security teams a workflow they can actually use

AppSec Workbench is designed to demonstrate all of those concerns in one product.

## Product scope

The MVP centers on:

- manual upload of Semgrep, Gitleaks, and Trivy reports in JSON or SARIF
- scan run tracking and raw artifact preservation
- finding normalization into a shared schema
- ASVS 5.0.0 requirement mapping
- triage, assignment, comments, and due dates
- suppression rules with expiration and auditability
- dashboards for severity, aging, status, scanner mix, and ASVS coverage
- CSV export and a sample GitHub Actions ingestion path

## Architecture at a glance

```text
CI / User Upload
        |
        v
  API ingest endpoint
        |
        v
  raw artifact storage (S3/MinIO)
        |
        v
  queue-backed parsing worker
        |
        v
  normalization + fingerprinting + ASVS mapping
        |
        v
  PostgreSQL findings, occurrences, workflow state
        |
        v
  dashboards, repo views, triage workflows, exports
```

The most important modeling decision is separating:

- scan runs
- raw artifacts
- canonical findings
- finding occurrences
- workflow state and history
- ASVS reference data and mapping links

That keeps remediation history intact while still letting the product deduplicate noisy re-detections.

## Tech stack

- Frontend: React, Vite, TypeScript, TanStack Query, Tailwind CSS, shadcn/ui
- Backend: NestJS, Prisma, PostgreSQL, Redis, BullMQ
- Storage: S3-compatible artifacts via MinIO in local development
- Testing: Vitest and Playwright
- Tooling: pnpm workspaces and Turborepo

## Current repository contents

- [`apps/api`](./apps/api): NestJS + Prisma API slice with a live `GET /api/findings` endpoint
- [`apps/web`](./apps/web): local React + Vite prototype for the product direction
- [`docs/cloudflare-pages.md`](./docs/cloudflare-pages.md): Cloudflare Pages setup for the frontend prototype
- [`render.yaml`](./render.yaml): Render Blueprint for the current hosted prototype shape
- [`prisma/schema.prisma`](./prisma/schema.prisma): core database schema for the MVP domain
- [`docs/architecture.md`](./docs/architecture.md): system boundaries, lifecycle, and modeling notes
- [`docs/mvp-plan.md`](./docs/mvp-plan.md): practical week-by-week delivery plan
- [`docs/render-deploy.md`](./docs/render-deploy.md): Render deployment notes for the current prototype
- [`docker-compose.yml`](./docker-compose.yml): local Postgres, Redis, and MinIO services

## Local product preview

The repository now includes a browser preview of the product direction under `apps/web`.

1. Install web dependencies with `cd apps/web && npm install`.
2. Install API dependencies with `cd apps/api && npm install`.
3. Create the local API demo database with `npm run db:setup` inside `apps/api`.
4. Start the API with `npm run dev` inside `apps/api`, or run `npm run dev:api` from the repo root.
5. Start the preview with `npm run dev` inside `apps/web`, or run `npm run dev:web` from the repo root.
6. Open the local URL printed by Vite, usually `http://127.0.0.1:5173` in dev mode.

The preview is still product-focused, but the `Findings` screen now attempts a live call to the NestJS API and falls back to local demo data if the API is not running.

## Cloudflare Pages deployment

For a no-credit-card hosting path, the frontend can be deployed from [`apps/web`](./apps/web) to Cloudflare Pages.

- Git integration settings are documented in [`docs/cloudflare-pages.md`](./docs/cloudflare-pages.md).
- The frontend now includes a Cloudflare-specific direct-upload script:

```bash
CLOUDFLARE_PAGES_PROJECT_NAME=appsec-workbench-web npm run deploy:cloudflare:web
```

- React Router fallback is handled by [`apps/web/public/_redirects`](./apps/web/public/_redirects).

## Render deployment

The repo includes a Render Blueprint in [`render.yaml`](./render.yaml) for the current prototype:

- static site for `apps/web`
- Node web service for `apps/api`
- persistent disk-backed seeded SQLite demo database for the API

Deployment notes and caveats are documented in [`docs/render-deploy.md`](./docs/render-deploy.md).

## Domain model highlights

The schema is built around a few deliberate choices:

- `findings` store the canonical identity of a recurring issue
- `finding_occurrences` preserve every detection event from every scan run
- `scan_artifacts` keep raw evidence so parsers can be improved without losing source data
- `finding_status_history`, `finding_assignments`, and `finding_comments` capture the human workflow
- `suppression_rules` support both exact and rule/path-based exceptions
- `asvs_requirements` and `finding_asvs_links` keep reference data separate from scanner-specific logic

## Local development foundation

1. Copy `.env.example` to `.env`.
2. Start local dependencies with `docker compose up -d`.
3. Install root dependencies with your preferred package manager once the full monorepo apps are scaffolded.
4. For the current UI prototype, install only the web preview dependencies with `cd apps/web && npm install`.
5. Validate the schema with `npx prisma@6.6.0 validate --schema prisma/schema.prisma`.
6. Generate Prisma client with `npx prisma@6.6.0 generate --schema prisma/schema.prisma`.

The web app, API, worker, and seed scripts are intentionally not scaffolded yet in this initial foundation commit. The next implementation pass should create the NestJS API, the React frontend, and the parser adapters on top of the schema in this repo.

## Recommended next build sequence

1. Scaffold the monorepo apps and shared packages.
2. Add local auth, sessions, and RBAC middleware.
3. Build project and repository CRUD on top of Prisma.
4. Implement scan upload and artifact storage.
5. Add Semgrep, Gitleaks, and Trivy parser adapters.
6. Build findings list, finding detail, and triage workflow UI.
7. Add ASVS seeding plus rule-to-requirement mapping logic.
8. Finish dashboards, exports, demo data, and GitHub Actions ingestion.

## Product qualities this repo is aiming for

- realistic AppSec workflow instead of a scanner wrapper
- clean, typed contracts between ingest, normalization, and reporting
- operational history that survives repeated scans and status changes
- portfolio-ready product framing with room for production-style polish

## Supporting docs

- [`docs/architecture.md`](./docs/architecture.md)
- [`docs/mvp-plan.md`](./docs/mvp-plan.md)
