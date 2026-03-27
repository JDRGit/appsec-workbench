import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import initSqlJs from "sql.js";

const repositories = [
  { id: "repo-platform-api-gateway", fullName: "platform/api-gateway" },
  { id: "repo-platform-deployments", fullName: "platform/deployments" },
  { id: "repo-identity-auth-service", fullName: "identity/auth-service" },
  { id: "repo-infra-public-assets", fullName: "infra/public-assets" },
  { id: "repo-identity-legacy-portal", fullName: "identity/legacy-portal" },
  { id: "repo-platform-qa-tools", fullName: "platform/qa-tools" }
];

const findings = [
  {
    id: "F-1021",
    scanner: "SEMGREP",
    severityNormalized: "CRITICAL",
    currentStatus: "TRIAGED",
    title: "Unsanitized SQL query reaches tenant search path",
    description:
      "User-controlled input is concatenated into a query builder path before tenant scoping is applied.",
    canonicalFilePath: "src/modules/search/search.service.ts:148",
    firstSeenAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    remediationText:
      "Replace string interpolation with parameterized query bindings and add a regression test around tenant boundary enforcement.",
    ownerName: "Maya Chen",
    asvsRequirementKey: "V5.0.0-1.2",
    repositoryId: "repo-platform-api-gateway"
  },
  {
    id: "F-1037",
    scanner: "GITLEAKS",
    severityNormalized: "HIGH",
    currentStatus: "IN_PROGRESS",
    title: "Production AWS access key committed to deployment helper",
    description:
      "A long-lived access key appears in shell script history and has already been referenced by the release pipeline.",
    canonicalFilePath: "scripts/release.sh:22",
    firstSeenAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    remediationText:
      "Rotate the key immediately, purge it from history, and move the pipeline to federated credentials or a secrets manager.",
    ownerName: "Riley Gomez",
    asvsRequirementKey: "V5.0.0-2.5",
    repositoryId: "repo-platform-deployments"
  },
  {
    id: "F-1042",
    scanner: "TRIVY",
    severityNormalized: "HIGH",
    currentStatus: "NEW",
    title: "Authentication service pulls vulnerable JWT dependency",
    description:
      "A transitive JWT library ships a known verification bypass in versions below the patched release.",
    canonicalFilePath: "package-lock.json",
    firstSeenAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    remediationText:
      "Upgrade the dependency chain, validate the lockfile diff, and rerun auth regression tests before rollout.",
    ownerName: "Unassigned",
    asvsRequirementKey: "V5.0.0-14.2",
    repositoryId: "repo-identity-auth-service"
  },
  {
    id: "F-1014",
    scanner: "TRIVY",
    severityNormalized: "MEDIUM",
    currentStatus: "RISK_ACCEPTED",
    title: "Terraform bucket policy allows broad public read",
    description:
      "The policy is intentionally public for a static assets bucket, but the acceptance needs a cleaner scope and expiration.",
    canonicalFilePath: "terraform/static_site.tf:89",
    firstSeenAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    remediationText:
      "Constrain the rule to the intended bucket pattern, document the business reason, and renew the exception with a 90-day review.",
    ownerName: "Ivy Patel",
    asvsRequirementKey: "V5.0.0-9.1",
    repositoryId: "repo-infra-public-assets"
  },
  {
    id: "F-0998",
    scanner: "SEMGREP",
    severityNormalized: "MEDIUM",
    currentStatus: "SUPPRESSED",
    title: "Weak hashing routine persists in account recovery flow",
    description:
      "The legacy code path is isolated behind a decommission plan and currently suppressed until the migration closes.",
    canonicalFilePath: "src/security/reset-token.ts:47",
    firstSeenAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000),
    remediationText:
      "Retire the legacy reset flow and remove the suppression before the expiration window closes.",
    ownerName: "Jon Park",
    asvsRequirementKey: "V5.0.0-6.3",
    repositoryId: "repo-identity-legacy-portal"
  },
  {
    id: "F-0975",
    scanner: "GITLEAKS",
    severityNormalized: "LOW",
    currentStatus: "FIXED",
    title: "Hardcoded Slack webhook removed from old test harness",
    description:
      "The credential was deleted, rotated, and the harness now pulls from ephemeral local configuration.",
    canonicalFilePath: "fixtures/hooks/test-notifier.json",
    firstSeenAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    remediationText:
      "Keep the post-fix verification note and ensure the fixture never re-enters the repository.",
    ownerName: "Maya Chen",
    asvsRequirementKey: "V5.0.0-2.7",
    repositoryId: "repo-platform-qa-tools"
  }
];

const events = [
  {
    id: "EV-1021-1",
    findingId: "F-1021",
    eventType: "STATUS_CHANGE",
    actorName: "Maya Chen",
    body: "Status changed from new to triaged after initial validation of the query path.",
    oldValue: "NEW",
    newValue: "TRIAGED",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: "EV-1021-2",
    findingId: "F-1021",
    eventType: "COMMENT",
    actorName: "Maya Chen",
    body: "Reproduced against the tenant search endpoint and confirmed the sink is reachable.",
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000)
  },
  {
    id: "EV-1037-1",
    findingId: "F-1037",
    eventType: "ASSIGNMENT",
    actorName: "Riley Gomez",
    body: "Owner updated from Unassigned to Riley Gomez.",
    oldValue: "Unassigned",
    newValue: "Riley Gomez",
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
  },
  {
    id: "EV-1037-2",
    findingId: "F-1037",
    eventType: "COMMENT",
    actorName: "Riley Gomez",
    body: "Key rotation is in progress and the release helper is being moved to federated credentials.",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: "EV-1042-1",
    findingId: "F-1042",
    eventType: "COMMENT",
    actorName: "AppSec Bot",
    body: "Dependency introduced in the last auth-service lockfile update. Needs service owner confirmation.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: "EV-1014-1",
    findingId: "F-1014",
    eventType: "STATUS_CHANGE",
    actorName: "Ivy Patel",
    body: "Status changed from triaged to risk accepted with a 90-day review note.",
    oldValue: "TRIAGED",
    newValue: "RISK_ACCEPTED",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  }
];

function resolveDatabaseFilePath() {
  const prismaDirectory = path.dirname(fileURLToPath(import.meta.url));
  const databaseUrl = process.env.API_DATABASE_URL ?? "file:./dev.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error(`Unsupported API_DATABASE_URL for seed script: ${databaseUrl}`);
  }

  const filePath = databaseUrl.slice("file:".length);

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return path.resolve(prismaDirectory, filePath);
}

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE "Repository" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "fullName" TEXT NOT NULL
    );

    CREATE UNIQUE INDEX "Repository_fullName_key" ON "Repository"("fullName");

    CREATE TABLE "Finding" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "scanner" TEXT NOT NULL,
      "severityNormalized" TEXT NOT NULL,
      "currentStatus" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "canonicalFilePath" TEXT,
      "firstSeenAt" TEXT NOT NULL,
      "remediationText" TEXT,
      "ownerName" TEXT,
      "asvsRequirementKey" TEXT,
      "repositoryId" TEXT NOT NULL,
      CONSTRAINT "Finding_repositoryId_fkey"
        FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX "Finding_severityNormalized_idx" ON "Finding"("severityNormalized");
    CREATE INDEX "Finding_currentStatus_idx" ON "Finding"("currentStatus");

    CREATE TABLE "FindingEvent" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "findingId" TEXT NOT NULL,
      "eventType" TEXT NOT NULL,
      "actorName" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "oldValue" TEXT,
      "newValue" TEXT,
      "createdAt" TEXT NOT NULL,
      CONSTRAINT "FindingEvent_findingId_fkey"
        FOREIGN KEY ("findingId") REFERENCES "Finding"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX "FindingEvent_findingId_createdAt_idx" ON "FindingEvent"("findingId", "createdAt");
  `);

  const repositoryStatement = db.prepare(`
    INSERT INTO "Repository" ("id", "fullName")
    VALUES (?, ?)
  `);

  for (const repository of repositories) {
    repositoryStatement.run([repository.id, repository.fullName]);
  }
  repositoryStatement.free();

  const findingStatement = db.prepare(`
    INSERT INTO "Finding" (
      "id",
      "scanner",
      "severityNormalized",
      "currentStatus",
      "title",
      "description",
      "canonicalFilePath",
      "firstSeenAt",
      "remediationText",
      "ownerName",
      "asvsRequirementKey",
      "repositoryId"
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const finding of findings) {
    findingStatement.run([
      finding.id,
      finding.scanner,
      finding.severityNormalized,
      finding.currentStatus,
      finding.title,
      finding.description,
      finding.canonicalFilePath,
      finding.firstSeenAt.toISOString(),
      finding.remediationText,
      finding.ownerName,
      finding.asvsRequirementKey,
      finding.repositoryId
    ]);
  }
  findingStatement.free();

  const eventStatement = db.prepare(`
    INSERT INTO "FindingEvent" (
      "id",
      "findingId",
      "eventType",
      "actorName",
      "body",
      "oldValue",
      "newValue",
      "createdAt"
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const event of events) {
    eventStatement.run([
      event.id,
      event.findingId,
      event.eventType,
      event.actorName,
      event.body,
      event.oldValue ?? null,
      event.newValue ?? null,
      event.createdAt.toISOString()
    ]);
  }
  eventStatement.free();

  const databaseFile = resolveDatabaseFilePath();
  fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
  fs.writeFileSync(databaseFile, Buffer.from(db.export()));
  db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
