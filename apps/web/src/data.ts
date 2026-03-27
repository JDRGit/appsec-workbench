export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Status =
  | "new"
  | "triaged"
  | "in_progress"
  | "risk_accepted"
  | "false_positive"
  | "suppressed"
  | "fixed"
  | "reopened";

export type Finding = {
  id: string;
  title: string;
  scanner: "Semgrep" | "Gitleaks" | "Trivy";
  severity: Severity;
  status: Status;
  owner: string;
  repo: string;
  path: string;
  age: string;
  chapter: string;
  summary: string;
  remediation: string;
};

export type FindingComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type FindingHistoryEvent = {
  id: string;
  type: "status_changed" | "assigned";
  actor: string;
  message: string;
  createdAt: string;
};

export type FindingDetail = Finding & {
  comments: FindingComment[];
  history: FindingHistoryEvent[];
};

export type ProjectSummary = {
  name: string;
  criticality: "critical" | "high" | "medium";
  owner: string;
  openFindings: number;
  criticalFindings: number;
  repos: number;
  sla: string;
  focus: string;
};

export type ScanRunSummary = {
  id: string;
  scanner: "Semgrep" | "Gitleaks" | "Trivy";
  mode: "sast" | "secrets" | "sca" | "misconfig";
  repository: string;
  branch: string;
  status: "completed" | "processing" | "failed" | "queued";
  artifact: string;
  duration: string;
  createdAt: string;
};

export const findings: Finding[] = [
  {
    id: "F-1021",
    title: "Unsanitized SQL query reaches tenant search path",
    scanner: "Semgrep",
    severity: "critical",
    status: "triaged",
    owner: "Maya Chen",
    repo: "platform/api-gateway",
    path: "src/modules/search/search.service.ts:148",
    age: "3d",
    chapter: "V5.0.0-1.2",
    summary:
      "User-controlled input is concatenated into a query builder path before tenant scoping is applied.",
    remediation:
      "Replace string interpolation with parameterized query bindings and add a regression test around tenant boundary enforcement."
  },
  {
    id: "F-1037",
    title: "Production AWS access key committed to deployment helper",
    scanner: "Gitleaks",
    severity: "high",
    status: "in_progress",
    owner: "Riley Gomez",
    repo: "platform/deployments",
    path: "scripts/release.sh:22",
    age: "1d",
    chapter: "V5.0.0-2.5",
    summary:
      "A long-lived access key appears in shell script history and has already been referenced by the release pipeline.",
    remediation:
      "Rotate the key immediately, purge it from history, and move the pipeline to federated credentials or a secrets manager."
  },
  {
    id: "F-1042",
    title: "Authentication service pulls vulnerable JWT dependency",
    scanner: "Trivy",
    severity: "high",
    status: "new",
    owner: "Unassigned",
    repo: "identity/auth-service",
    path: "package-lock.json",
    age: "6h",
    chapter: "V5.0.0-14.2",
    summary:
      "A transitive JWT library ships a known verification bypass in versions below the patched release.",
    remediation:
      "Upgrade the dependency chain, validate the lockfile diff, and rerun auth regression tests before rollout."
  },
  {
    id: "F-1014",
    title: "Terraform bucket policy allows broad public read",
    scanner: "Trivy",
    severity: "medium",
    status: "risk_accepted",
    owner: "Ivy Patel",
    repo: "infra/public-assets",
    path: "terraform/static_site.tf:89",
    age: "18d",
    chapter: "V5.0.0-9.1",
    summary:
      "The policy is intentionally public for a static assets bucket, but the acceptance needs a cleaner scope and expiration.",
    remediation:
      "Constrain the rule to the intended bucket pattern, document the business reason, and renew the exception with a 90-day review."
  },
  {
    id: "F-0998",
    title: "Weak hashing routine persists in account recovery flow",
    scanner: "Semgrep",
    severity: "medium",
    status: "suppressed",
    owner: "Jon Park",
    repo: "identity/legacy-portal",
    path: "src/security/reset-token.ts:47",
    age: "44d",
    chapter: "V5.0.0-6.3",
    summary:
      "The legacy code path is isolated behind a decommission plan and currently suppressed until the migration closes.",
    remediation:
      "Retire the legacy reset flow and remove the suppression before the expiration window closes."
  },
  {
    id: "F-0975",
    title: "Hardcoded Slack webhook removed from old test harness",
    scanner: "Gitleaks",
    severity: "low",
    status: "fixed",
    owner: "Maya Chen",
    repo: "platform/qa-tools",
    path: "fixtures/hooks/test-notifier.json",
    age: "2m",
    chapter: "V5.0.0-2.7",
    summary:
      "The credential was deleted, rotated, and the harness now pulls from ephemeral local configuration.",
    remediation:
      "Keep the post-fix verification note and ensure the fixture never re-enters the repository."
  }
];

const fallbackDetailContent: Record<
  string,
  Pick<FindingDetail, "comments" | "history">
> = {
  "F-1021": {
    comments: [
      {
        id: "local-comment-1021",
        author: "Maya Chen",
        body: "Reproduced the sink against the tenant search path and confirmed the query builder is reachable.",
        createdAt: "2026-03-26T14:30:00.000Z"
      }
    ],
    history: [
      {
        id: "local-history-1021",
        type: "status_changed",
        actor: "Maya Chen",
        message: "Status changed from new to triaged after the initial validation pass.",
        createdAt: "2026-03-25T18:00:00.000Z"
      }
    ]
  },
  "F-1037": {
    comments: [
      {
        id: "local-comment-1037",
        author: "Riley Gomez",
        body: "Credential rotation is underway and the release helper is being updated to use federated access.",
        createdAt: "2026-03-27T11:10:00.000Z"
      }
    ],
    history: [
      {
        id: "local-history-1037",
        type: "assigned",
        actor: "Riley Gomez",
        message: "Owner updated from Unassigned to Riley Gomez.",
        createdAt: "2026-03-27T09:45:00.000Z"
      }
    ]
  }
};

export const localFindingDetails: Record<string, FindingDetail> = Object.fromEntries(
  findings.map((finding) => [
    finding.id,
    {
      ...finding,
      comments: fallbackDetailContent[finding.id]?.comments ?? [],
      history: fallbackDetailContent[finding.id]?.history ?? []
    }
  ])
) as Record<string, FindingDetail>;

export const activity = [
  {
    label: "Semgrep",
    detail: "214 rules evaluated across 9 repositories",
    change: "+18 new findings in the last 24h"
  },
  {
    label: "Gitleaks",
    detail: "3 secret exposures need owner confirmation",
    change: "1 key rotated, 2 under review"
  },
  {
    label: "Trivy",
    detail: "12 package and IaC findings parsed this morning",
    change: "4 tied to internet-facing services"
  }
];

export const chapters = [
  { code: "1", title: "Architecture, Design, and Threat Modeling", coverage: 78 },
  { code: "2", title: "Authentication and Credential Handling", coverage: 64 },
  { code: "6", title: "Cryptography and Sensitive Data", coverage: 56 },
  { code: "9", title: "API and Configuration", coverage: 71 },
  { code: "14", title: "Dependencies, Build, and Supply Chain", coverage: 83 }
];

export const severityFilters: Array<Severity | "all"> = [
  "all",
  "critical",
  "high",
  "medium",
  "low"
];

export const metrics = [
  { label: "Open critical", value: "04", note: "1 repo needs immediate owner confirmation" },
  { label: "Median age", value: "11d", note: "Across all unresolved findings" },
  { label: "Expiring suppressions", value: "07", note: "3 exceptions expire this week" },
  { label: "ASVS linked", value: "86%", note: "Rule catalog and heuristic coverage combined" }
];

export const projects: ProjectSummary[] = [
  {
    name: "Identity Platform",
    criticality: "critical",
    owner: "Maya Chen",
    openFindings: 19,
    criticalFindings: 2,
    repos: 4,
    sla: "1 breach risk this week",
    focus: "JWT and credential-handling fixes are concentrated in auth-service and legacy-portal."
  },
  {
    name: "Core Platform",
    criticality: "high",
    owner: "Riley Gomez",
    openFindings: 27,
    criticalFindings: 1,
    repos: 6,
    sla: "Within target",
    focus: "API gateway and deployment repos carry the highest density per KLOC this sprint."
  },
  {
    name: "Infrastructure Delivery",
    criticality: "medium",
    owner: "Ivy Patel",
    openFindings: 11,
    criticalFindings: 0,
    repos: 3,
    sla: "2 exceptions expiring",
    focus: "Most remaining issues are IaC misconfigurations with pending exception cleanup."
  }
];

export const scanRuns: ScanRunSummary[] = [
  {
    id: "SR-2208",
    scanner: "Semgrep",
    mode: "sast",
    repository: "platform/api-gateway",
    branch: "main",
    status: "completed",
    artifact: "semgrep.sarif",
    duration: "1m 18s",
    createdAt: "09:31 ET"
  },
  {
    id: "SR-2207",
    scanner: "Trivy",
    mode: "sca",
    repository: "identity/auth-service",
    branch: "main",
    status: "completed",
    artifact: "trivy.json",
    duration: "53s",
    createdAt: "09:28 ET"
  },
  {
    id: "SR-2206",
    scanner: "Gitleaks",
    mode: "secrets",
    repository: "platform/deployments",
    branch: "release/2026.03",
    status: "processing",
    artifact: "gitleaks.json",
    duration: "Running",
    createdAt: "09:22 ET"
  },
  {
    id: "SR-2205",
    scanner: "Trivy",
    mode: "misconfig",
    repository: "infra/public-assets",
    branch: "main",
    status: "failed",
    artifact: "trivy-misconfig.sarif",
    duration: "14s",
    createdAt: "08:57 ET"
  }
];

export const backlogMoments = [
  {
    label: "New",
    detail: "Dependency issue entered from the morning Trivy run and still needs an owner."
  },
  {
    label: "In progress",
    detail: "Credential rotation work is underway with release engineering and platform support."
  },
  {
    label: "Suppressed",
    detail: "Legacy reset flow stays muted temporarily, but its exception expires in 16 days."
  }
];

export const mappingPrinciples = [
  {
    title: "Rule catalog first",
    body: "Stable mappings from scanner rule IDs to ASVS requirements keep recurring findings predictable and explainable."
  },
  {
    title: "Heuristics second",
    body: "When a rule has no explicit mapping yet, the platform can fall back to CWE, category, and scanner subtype signals."
  },
  {
    title: "Analyst override always",
    body: "AppSec engineers can override a mapping without touching the original raw artifact or parser output."
  }
];

export const adminQueues = [
  {
    title: "Suppressions pending approval",
    detail: "3 rule/path suppressions need AppSec sign-off before they can mute findings in production views."
  },
  {
    title: "Role review",
    detail: "2 developers have broader analyst privileges in the demo tenant and should be narrowed before launch."
  },
  {
    title: "System health",
    detail: "Parser workers are healthy, but MinIO retention and alerting policies are still unconfigured."
  }
];

export const systemChecks = [
  { label: "API", status: "Healthy", detail: "Auth, findings, and metrics routes responding within target." },
  { label: "Worker", status: "Healthy", detail: "BullMQ jobs processing with no backlog spikes." },
  { label: "Storage", status: "Needs setup", detail: "Lifecycle retention and signed upload tokens still pending." },
  { label: "Audit trail", status: "Healthy", detail: "Status changes and suppressions are modeled and ready to persist." }
];
