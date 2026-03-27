# Architecture Notes

## Product boundary

AppSec Workbench is a workflow platform, not a scanner. Its responsibility starts when a report artifact arrives and continues through normalization, correlation, ASVS mapping, triage, remediation tracking, and reporting.

## Core services

### Web application

- dashboard views for managers and analysts
- findings list and finding detail workflows
- project and repository administration
- suppression and mapping administration

### API

- authentication and RBAC
- project and repository CRUD
- scan ingestion endpoints
- finding workflow endpoints
- ASVS reference and coverage endpoints
- metrics and export endpoints

### Worker

- artifact parsing
- normalization
- fingerprint generation
- ASVS mapping recomputation
- aggregate metric refresh jobs

## Canonical data flow

1. A user or CI pipeline uploads a Semgrep, Gitleaks, or Trivy artifact.
2. The API creates a `scan_run` and persists artifact metadata.
3. The raw file is stored in S3-compatible object storage.
4. A queue-backed worker fetches the artifact and selects the correct parser.
5. Tool-specific findings are normalized into one internal contract.
6. The worker computes fingerprints and matches suppressions.
7. Existing canonical findings are updated or new ones are created.
8. Occurrences are appended for every detection event in the scan.
9. ASVS mappings are applied using explicit catalog rules first, then heuristics.
10. Metrics and dashboard aggregates are refreshed asynchronously.

## Normalized finding contract

The internal finding contract is the seam between parsers and the rest of the system.

```ts
type NormalizedFinding = {
  scanner: "semgrep" | "gitleaks" | "trivy";
  scannerType: "sast" | "secrets" | "sca" | "misconfig" | "license";
  externalRuleId: string;
  title: string;
  description?: string;
  severityRaw?: string;
  severityNormalized: "critical" | "high" | "medium" | "low" | "info";
  confidence?: "high" | "medium" | "low";
  cweIds?: string[];
  cveIds?: string[];
  references?: string[];
  repoPath?: string;
  filePath?: string;
  startLine?: number;
  endLine?: number;
  commitSha?: string;
  branch?: string;
  fingerprint: string;
  remediationText?: string;
  rawPayload: unknown;
};
```

## Dedupe and history strategy

Canonical findings and occurrences are modeled separately on purpose:

- a `finding` represents the durable identity of an issue in a repository
- a `finding_occurrence` represents one appearance of that issue in one scan run

This gives the product stable ownership, status, and SLA tracking while preserving raw evidence for every run.

Recommended fingerprint input:

```text
sha256(
  scanner + "|" +
  external_rule_id + "|" +
  normalized_file_path + "|" +
  normalized_location_bucket + "|" +
  primary_code_snippet_or_secret_hash
)
```

## ASVS mapping strategy

Mapping order should be deterministic:

1. explicit manual override
2. rule catalog mapping by scanner and rule ID
3. heuristics using CWE, CVE, category, or scanner subtype
4. analyst override if the default mapping is wrong

Mappings must be stored outside the raw finding payload so the team can improve rule quality over time without re-ingesting artifacts.

## Workflow model

The system supports these finding states:

- `new`
- `triaged`
- `in_progress`
- `fixed`
- `risk_accepted`
- `false_positive`
- `suppressed`
- `reopened`

Every state change should create a status history row and an audit log entry.

## MVP infrastructure

Local development uses:

- PostgreSQL for relational data
- Redis for queues and caching
- MinIO for raw scan artifact storage

Production-ready concerns to add after MVP:

- signed upload URLs or short-lived ingest tokens
- structured audit logging and retention
- background job observability
- object storage lifecycle policies
- per-organization rate limits and quotas
