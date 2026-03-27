import { useEffect, useMemo, useState } from "react";

import {
  backlogMoments,
  findings as localFindings,
  localFindingDetails,
  severityFilters,
  type Finding,
  type FindingDetail,
  type Severity,
  type Status
} from "../data";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:3000";

const statusOptions: Status[] = [
  "new",
  "triaged",
  "in_progress",
  "fixed",
  "risk_accepted",
  "false_positive",
  "suppressed",
  "reopened"
];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function normalizeOwnerDraft(owner: string) {
  if (owner === "Unassigned") {
    return "";
  }

  return owner;
}

export function FindingsPage() {
  const [items, setItems] = useState<Finding[]>(localFindings);
  const [selectedId, setSelectedId] = useState(localFindings[0].id);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [source, setSource] = useState<"api" | "local">("local");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detail, setDetail] = useState<FindingDetail | null>(localFindingDetails[localFindings[0].id]);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [statusDraft, setStatusDraft] = useState<Status>("triaged");
  const [ownerDraft, setOwnerDraft] = useState("Maya Chen");
  const [commentDraft, setCommentDraft] = useState("");
  const [mutationNotice, setMutationNotice] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingOwner, setIsSavingOwner] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  async function loadFindings(signal?: AbortSignal) {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/findings`, {
        signal
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as Finding[];
      setItems(payload);
      setSource("api");
      setLoadError(null);
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setItems(localFindings);
      setSource("local");
      setLoadError("API unavailable, showing local demo data for now.");
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }

  function applyDetailToList(nextDetail: FindingDetail) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === nextDetail.id
          ? {
              ...item,
              status: nextDetail.status,
              owner: nextDetail.owner,
              summary: nextDetail.summary,
              remediation: nextDetail.remediation
            }
          : item
      )
    );
  }

  async function loadDetail(id: string, currentSource: "api" | "local", signal?: AbortSignal) {
    if (currentSource === "local") {
      setDetail(localFindingDetails[id] ?? null);
      setDetailError(null);
      return;
    }

    try {
      setIsDetailLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/findings/${id}`, {
        signal
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as FindingDetail;
      setDetail(payload);
      setDetailError(null);
      applyDetailToList(payload);
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setDetail(localFindingDetails[id] ?? null);
      setDetailError("Could not refresh finding detail from the API.");
    } finally {
      if (!signal?.aborted) {
        setIsDetailLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    void loadFindings(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (items.length > 0 && !items.some((finding) => finding.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const controller = new AbortController();
    void loadDetail(selectedId, source, controller.signal);

    return () => {
      controller.abort();
    };
  }, [selectedId, source]);

  useEffect(() => {
    if (!detail) {
      return;
    }

    setStatusDraft(detail.status);
    setOwnerDraft(normalizeOwnerDraft(detail.owner));
  }, [detail]);

  const filteredFindings = useMemo(() => {
    if (severityFilter === "all") {
      return items;
    }

    return items.filter((finding) => finding.severity === severityFilter);
  }, [items, severityFilter]);

  useEffect(() => {
    if (
      filteredFindings.length > 0 &&
      !filteredFindings.some((finding) => finding.id === selectedId)
    ) {
      setSelectedId(filteredFindings[0].id);
    }
  }, [filteredFindings, selectedId]);

  const selectedFinding =
    filteredFindings.find((finding) => finding.id === selectedId) ?? filteredFindings[0] ?? null;

  const interactionsDisabled = source !== "api" || !detail;

  useEffect(() => {
    setMutationNotice(null);
    setMutationError(null);
  }, [selectedId]);

  async function handleStatusUpdate() {
    if (!detail || interactionsDisabled) {
      return;
    }

    try {
      setIsSavingStatus(true);
      setMutationError(null);

      const response = await fetch(`${API_BASE_URL}/api/findings/${detail.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: statusDraft,
          author: "Local AppSec User",
          note: "Updated from the local prototype workflow."
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as FindingDetail;
      setDetail(payload);
      applyDetailToList(payload);
      setMutationNotice("Status saved.");
    } catch (error) {
      setMutationError("Could not update the finding status.");
    } finally {
      setIsSavingStatus(false);
    }
  }

  async function handleOwnerUpdate() {
    if (!detail || interactionsDisabled) {
      return;
    }

    try {
      setIsSavingOwner(true);
      setMutationError(null);

      const response = await fetch(`${API_BASE_URL}/api/findings/${detail.id}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          owner: ownerDraft,
          author: "Local AppSec User"
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as FindingDetail;
      setDetail(payload);
      applyDetailToList(payload);
      setMutationNotice("Owner updated.");
    } catch (error) {
      setMutationError("Could not update the owner.");
    } finally {
      setIsSavingOwner(false);
    }
  }

  async function handleCommentSubmit() {
    if (!detail || interactionsDisabled || !commentDraft.trim()) {
      return;
    }

    try {
      setIsPostingComment(true);
      setMutationError(null);

      const response = await fetch(`${API_BASE_URL}/api/findings/${detail.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          body: commentDraft,
          author: "Local AppSec User"
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as FindingDetail;
      setDetail(payload);
      applyDetailToList(payload);
      setCommentDraft("");
      setMutationNotice("Comment added.");
    } catch (error) {
      setMutationError("Could not add the comment.");
    } finally {
      setIsPostingComment(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="content-grid">
        <section className="finding-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Findings queue</p>
              <h3>Current remediation backlog</h3>
            </div>

            <div className="panel-status">
              <span
                className={classNames("status-pill", source === "api" ? "completed" : "queued")}
              >
                {source === "api" ? "API live" : "Local fallback"}
              </span>
              {isLoading ? <span className="section-subtle">Refreshing findings...</span> : null}
            </div>
          </div>

          {loadError ? <p className="status-banner">{loadError}</p> : null}

          <div className="section-heading compact">
            <div className="filter-row">
              {severityFilters.map((filter) => (
                <button
                  key={filter}
                  className={classNames(
                    "filter-chip",
                    severityFilter === filter && "selected"
                  )}
                  onClick={() => setSeverityFilter(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="finding-table" role="table" aria-label="Findings">
            <div className="table-head" role="row">
              <span>ID</span>
              <span>Scanner</span>
              <span>Issue</span>
              <span>Owner</span>
              <span>ASVS</span>
              <span>Age</span>
            </div>

            {filteredFindings.map((finding) => (
              <button
                key={finding.id}
                className={classNames(
                  "table-row",
                  selectedFinding?.id === finding.id && "active"
                )}
                onClick={() => {
                  setSelectedId(finding.id);
                  setMutationNotice(null);
                  setMutationError(null);
                }}
                type="button"
              >
                <span className="mono">{finding.id}</span>
                <span className={`severity-badge ${finding.severity}`}>
                  {finding.scanner}
                </span>
                <span className="issue-cell">
                  <strong>{finding.title}</strong>
                  <small>
                    {finding.repo} · {finding.path}
                  </small>
                </span>
                <span>{finding.owner}</span>
                <span className="mono">{finding.chapter}</span>
                <span>{finding.age}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="detail-rail">
          <section className="detail-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Selected finding</p>
                <h3>{detail?.id ?? selectedFinding?.id}</h3>
              </div>
              <span className={`severity-badge ${detail?.severity ?? selectedFinding?.severity}`}>
                {detail?.severity ?? selectedFinding?.severity}
              </span>
            </div>

            {isDetailLoading ? <p className="section-subtle">Refreshing detail...</p> : null}
            {detailError ? <p className="status-banner">{detailError}</p> : null}

            <h4>{detail?.title ?? selectedFinding?.title}</h4>
            <p>{detail?.summary ?? selectedFinding?.summary}</p>

            <dl className="detail-list">
              <div>
                <dt>Status</dt>
                <dd>{(detail?.status ?? selectedFinding?.status)?.replace("_", " ")}</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{detail?.owner ?? selectedFinding?.owner}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd className="mono">{detail?.path ?? selectedFinding?.path}</dd>
              </div>
              <div>
                <dt>Recommended fix</dt>
                <dd>{detail?.remediation ?? selectedFinding?.remediation}</dd>
              </div>
            </dl>
          </section>

          <section className="surface-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Workflow actions</p>
                <h3>Triage this finding</h3>
              </div>
            </div>

            {mutationNotice ? <p className="status-banner success">{mutationNotice}</p> : null}
            {mutationError ? <p className="status-banner error">{mutationError}</p> : null}
            {interactionsDisabled ? (
              <p className="status-banner">
                Start the local API to save status, owner, and comments from this screen.
              </p>
            ) : null}

            <div className="form-grid">
              <label className="field">
                <span>Status</span>
                <select
                  className="field-input"
                  disabled={interactionsDisabled || isSavingStatus}
                  onChange={(event) => setStatusDraft(event.target.value as Status)}
                  value={statusDraft}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="secondary-button"
                disabled={interactionsDisabled || isSavingStatus}
                onClick={() => void handleStatusUpdate()}
                type="button"
              >
                {isSavingStatus ? "Saving..." : "Save status"}
              </button>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Owner</span>
                <input
                  className="field-input"
                  disabled={interactionsDisabled || isSavingOwner}
                  onChange={(event) => setOwnerDraft(event.target.value)}
                  placeholder="Assign an owner"
                  value={ownerDraft}
                />
              </label>
              <button
                className="secondary-button"
                disabled={interactionsDisabled || isSavingOwner}
                onClick={() => void handleOwnerUpdate()}
                type="button"
              >
                {isSavingOwner ? "Saving..." : "Update owner"}
              </button>
            </div>
          </section>

          <section className="activity-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Comments</p>
                <h3>Remediation notes</h3>
              </div>
            </div>

            <div className="comment-form">
              <label className="field">
                <span>Add comment</span>
                <textarea
                  className="field-input field-textarea"
                  disabled={interactionsDisabled || isPostingComment}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Share validation notes, remediation context, or verification steps."
                  rows={4}
                  value={commentDraft}
                />
              </label>
              <button
                className="secondary-button"
                disabled={interactionsDisabled || isPostingComment || !commentDraft.trim()}
                onClick={() => void handleCommentSubmit()}
                type="button"
              >
                {isPostingComment ? "Posting..." : "Post comment"}
              </button>
            </div>

            <div className="event-list">
              {(detail?.comments ?? []).length > 0 ? (
                detail?.comments.map((comment) => (
                  <article className="event-item" key={comment.id}>
                    <div className="event-meta">
                      <strong>{comment.author}</strong>
                      <span>{formatTimestamp(comment.createdAt)}</span>
                    </div>
                    <p>{comment.body}</p>
                  </article>
                ))
              ) : (
                <p className="section-subtle">No comments yet.</p>
              )}
            </div>
          </section>

          <section className="surface-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">History</p>
                <h3>Assignment and status timeline</h3>
              </div>
            </div>

            <div className="event-list">
              {(detail?.history ?? []).length > 0 ? (
                detail?.history.map((event) => (
                  <article className="event-item" key={event.id}>
                    <div className="event-meta">
                      <strong>{event.actor}</strong>
                      <span>{formatTimestamp(event.createdAt)}</span>
                    </div>
                    <p>{event.message}</p>
                  </article>
                ))
              ) : (
                <p className="section-subtle">No history entries yet.</p>
              )}
            </div>
          </section>

          <section className="activity-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Workflow states</p>
                <h3>Backlog motion</h3>
              </div>
            </div>

            <div className="activity-list">
              {backlogMoments.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
