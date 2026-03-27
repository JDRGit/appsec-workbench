# MVP Plan

## Delivery assumptions

- solo developer or small team
- eight-week build focused on a portfolio-quality MVP
- manual upload first, CI-assisted upload second
- one organization model with multi-project support from day one

## Week 1: Repository foundation and schema

Goals:

- lock the product scope for the MVP
- create the monorepo foundation
- model the core security workflow in Prisma

Deliverables:

- root workspace files and local development dependencies
- Prisma schema for orgs, repos, scan runs, findings, occurrences, workflow history, suppressions, and ASVS links
- architecture notes and initial README

Exit criteria:

- schema validates
- core entities can support the ingestion and triage workflow without redesign

## Week 2: Auth, RBAC, and project management

Goals:

- enable secure access to the platform
- give the product enough tenant and repository structure to attach findings to real codebases

Deliverables:

- NestJS API scaffold
- local auth and session handling
- RBAC guards for admin, AppSec, analyst, developer, and viewer roles
- CRUD for organizations, projects, and repositories

Exit criteria:

- a user can sign in and only see permitted routes
- repositories can be created and linked to projects

## Week 3: Ingestion pipeline and artifact storage

Goals:

- accept real scanner artifacts from the UI or CI
- decouple artifact upload from parsing work

Deliverables:

- upload endpoint for JSON and SARIF artifacts
- `scan_runs` and `scan_artifacts` creation flow
- MinIO or S3-compatible storage integration
- BullMQ queue and worker skeleton

Exit criteria:

- the system accepts an upload, stores the artifact, and enqueues a parse job

## Week 4: Parser adapters and normalization engine

Goals:

- turn raw scanner reports into one internal contract
- compute stable fingerprints and create canonical findings

Deliverables:

- Semgrep JSON and SARIF parser
- Gitleaks JSON and SARIF parser
- Trivy JSON and SARIF parser
- shared severity normalization and fingerprint helpers
- upsert logic for findings and finding occurrences

Exit criteria:

- sample artifacts from all three scanners produce normalized findings in the database
- repeat uploads create occurrences instead of duplicate findings

## Week 5: Findings workflow UI

Goals:

- make findings usable for engineering and AppSec users
- expose enough context to support real triage

Deliverables:

- findings list with filters
- finding detail page
- comments, assignment, and status update flows
- status history timeline and occurrence view

Exit criteria:

- a user can open a finding, assign it, comment on it, and move it through the lifecycle

## Week 6: Suppressions and ASVS mapping

Goals:

- support exception handling
- anchor technical findings to a recognized security standard

Deliverables:

- exact and rule/path suppression rules
- suppression expiration and approval workflow
- ASVS reference loader
- initial rule catalog and mapping engine

Exit criteria:

- findings can be linked to ASVS requirements
- noisy findings can be suppressed with justification and auditability

## Week 7: Dashboards, exports, and reporting

Goals:

- make the platform valuable to leads and managers, not just analysts
- prove the data model supports reporting use cases

Deliverables:

- overview dashboard widgets
- severity, status, scanner, and aging metrics
- ASVS chapter coverage charts
- CSV export for findings

Exit criteria:

- managers can answer backlog and trend questions from the dashboard without querying the database directly

## Week 8: Demo readiness and CI integration

Goals:

- make the project portfolio-ready
- show the product working in a realistic delivery path

Deliverables:

- sample GitHub Actions ingestion workflow
- seeded demo data
- screenshots and walkthrough docs
- polished README and architecture narrative

Exit criteria:

- a reviewer can clone the repo, start services, load sample data, and understand the product quickly

## Stretch goals after MVP

- GitHub OAuth
- Jira or ServiceNow synchronization
- webhook-based ingestion
- SLA breach notifications
- PR annotation support
- CycloneDX or SBOM views for Trivy artifacts
- custom mapping editor for analysts
- fix verification workflow
