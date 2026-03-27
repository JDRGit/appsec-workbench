import { randomUUID } from "node:crypto";

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FindingEventType, FindingStatus } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

const allowedStatuses = [
  "new",
  "triaged",
  "in_progress",
  "fixed",
  "risk_accepted",
  "false_positive",
  "suppressed",
  "reopened"
] as const;

type ApiStatus = (typeof allowedStatuses)[number];

function formatScanner(scanner: string) {
  const normalized = scanner.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatStatus(status: string) {
  return status.toLowerCase();
}

function formatSeverity(severity: string) {
  return severity.toLowerCase();
}

function formatAge(firstSeenAt: Date) {
  const diffMs = Date.now() - firstSeenAt.getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d`;
  }

  return `${diffHours}h`;
}

function titleCaseStatus(status: string) {
  return status.split("_").join(" ");
}

function parseStatus(status: string | undefined): FindingStatus {
  if (!status) {
    throw new BadRequestException("status is required");
  }

  if (!(allowedStatuses as readonly string[]).includes(status)) {
    throw new BadRequestException("status is invalid");
  }

  return status.toUpperCase() as FindingStatus;
}

function normalizeOwner(owner: string | undefined) {
  const trimmed = owner?.trim();

  if (!trimmed) {
    return "Unassigned";
  }

  return trimmed;
}

function normalizeActor(actor: string | undefined) {
  const trimmed = actor?.trim();

  if (!trimmed) {
    return "Local AppSec User";
  }

  return trimmed;
}

@Injectable()
export class FindingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getFindingOrThrow(id: string) {
    const finding = await this.prisma.finding.findUnique({
      where: { id },
      include: {
        repository: true,
        events: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    if (!finding) {
      throw new NotFoundException(`Finding ${id} was not found`);
    }

    return finding;
  }

  private serializeFindingListItem(
    finding: Awaited<ReturnType<FindingsService["getFindingOrThrow"]>>
  ) {
    return {
      id: finding.id,
      title: finding.title,
      scanner: formatScanner(finding.scanner),
      severity: formatSeverity(finding.severityNormalized),
      status: formatStatus(finding.currentStatus),
      owner: finding.ownerName ?? "Unassigned",
      repo: finding.repository.fullName,
      path: finding.canonicalFilePath ?? "Unknown location",
      age: formatAge(finding.firstSeenAt),
      chapter: finding.asvsRequirementKey ?? "Unmapped",
      summary: finding.description ?? "No summary yet.",
      remediation: finding.remediationText ?? "No remediation guidance yet."
    };
  }

  private serializeFindingDetail(
    finding: Awaited<ReturnType<FindingsService["getFindingOrThrow"]>>
  ) {
    const comments = finding.events
      .filter((event) => event.eventType === FindingEventType.COMMENT)
      .map((event) => ({
        id: event.id,
        author: event.actorName,
        body: event.body,
        createdAt: event.createdAt
      }));

    const history = finding.events
      .filter((event) => event.eventType !== FindingEventType.COMMENT)
      .map((event) => ({
        id: event.id,
        type:
          event.eventType === FindingEventType.STATUS_CHANGE
            ? "status_changed"
            : "assigned",
        actor: event.actorName,
        message: event.body,
        createdAt: event.createdAt
      }));

    return {
      ...this.serializeFindingListItem(finding),
      comments,
      history
    };
  }

  async listFindings() {
    const findings = await this.prisma.finding.findMany({
      include: {
        repository: true,
        events: {
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: [
        {
          firstSeenAt: "desc"
        }
      ]
    });

    return findings.map((finding) => this.serializeFindingListItem(finding));
  }

  async getFindingDetail(id: string) {
    const finding = await this.getFindingOrThrow(id);
    return this.serializeFindingDetail(finding);
  }

  async getFindingHistory(id: string) {
    const finding = await this.getFindingOrThrow(id);
    return this.serializeFindingDetail(finding).history;
  }

  async updateFindingStatus(
    id: string,
    input: { status?: string; author?: string; note?: string }
  ) {
    const nextStatus = parseStatus(input.status);
    const actor = normalizeActor(input.author);
    const currentFinding = await this.getFindingOrThrow(id);
    const previousStatus = currentFinding.currentStatus;

    await this.prisma.$transaction(async (tx) => {
      await tx.finding.update({
        where: { id },
        data: {
          currentStatus: nextStatus
        }
      });

      await tx.findingEvent.create({
        data: {
          id: randomUUID(),
          findingId: id,
          eventType: FindingEventType.STATUS_CHANGE,
          actorName: actor,
          body: `Status changed from ${titleCaseStatus(
            previousStatus.toLowerCase()
          )} to ${titleCaseStatus(nextStatus.toLowerCase())}${
            input.note?.trim() ? `. ${input.note.trim()}` : "."
          }`,
          oldValue: previousStatus,
          newValue: nextStatus,
          createdAt: new Date().toISOString()
        }
      });
    });

    return this.getFindingDetail(id);
  }

  async assignFinding(
    id: string,
    input: { owner?: string; author?: string }
  ) {
    const actor = normalizeActor(input.author);
    const owner = normalizeOwner(input.owner);
    const currentFinding = await this.getFindingOrThrow(id);
    const previousOwner = currentFinding.ownerName ?? "Unassigned";

    await this.prisma.$transaction(async (tx) => {
      await tx.finding.update({
        where: { id },
        data: {
          ownerName: owner
        }
      });

      await tx.findingEvent.create({
        data: {
          id: randomUUID(),
          findingId: id,
          eventType: FindingEventType.ASSIGNMENT,
          actorName: actor,
          body: `Owner updated from ${previousOwner} to ${owner}.`,
          oldValue: previousOwner,
          newValue: owner,
          createdAt: new Date().toISOString()
        }
      });
    });

    return this.getFindingDetail(id);
  }

  async addFindingComment(
    id: string,
    input: { body?: string; author?: string }
  ) {
    const actor = normalizeActor(input.author);
    const body = input.body?.trim();

    if (!body) {
      throw new BadRequestException("comment body is required");
    }

    await this.getFindingOrThrow(id);

    await this.prisma.findingEvent.create({
      data: {
        id: randomUUID(),
        findingId: id,
        eventType: FindingEventType.COMMENT,
        actorName: actor,
        body,
        createdAt: new Date().toISOString()
      }
    });

    return this.getFindingDetail(id);
  }
}
