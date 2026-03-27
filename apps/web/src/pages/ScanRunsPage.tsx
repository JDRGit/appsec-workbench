import { scanRuns } from "../data";

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ScanRunsPage() {
  return (
    <div className="page-stack">
      <section className="run-grid">
        <section className="surface-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Recent runs</p>
              <h3>Artifact ingestion timeline</h3>
            </div>
          </div>

          <div className="run-list">
            {scanRuns.map((run) => (
              <article className="run-row" key={run.id}>
                <div className="run-primary">
                  <div className="run-id">
                    <strong>{run.id}</strong>
                    <span>{run.repository}</span>
                  </div>

                  <div className="run-context">
                    <span className="run-token mono">{run.branch}</span>
                    <span className="run-token">{run.scanner}</span>
                    <span className="run-token subtle">{run.mode}</span>
                  </div>
                </div>

                <div className="run-artifact-block">
                  <span className="run-label">Artifact</span>
                  <span className="mono run-artifact-name">{run.artifact}</span>
                </div>

                <div className="run-meta">
                  <span className={classNames("status-pill", run.status)}>{run.status}</span>
                  <span className="run-duration">{run.duration}</span>
                  <span className="run-time">{run.createdAt}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="detail-rail">
          <section className="detail-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Accepted formats</p>
                <h3>Scanner contracts</h3>
              </div>
            </div>

            <div className="summary-list">
              <article className="summary-item">
                <strong>Semgrep</strong>
                <p>JSON and SARIF, parsed against documented stable fields only.</p>
              </article>
              <article className="summary-item">
                <strong>Gitleaks</strong>
                <p>JSON and SARIF, normalized into secret exposure findings with auditability.</p>
              </article>
              <article className="summary-item">
                <strong>Trivy</strong>
                <p>JSON and SARIF across vulnerability, misconfiguration, secret, and license modes.</p>
              </article>
            </div>
          </section>

          <section className="pipeline-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Queue-backed flow</p>
                <h3>Request to finding lifecycle</h3>
              </div>
            </div>

            <div className="pipeline-grid compact">
              <article>
                <span>01</span>
                <h4>Store artifact</h4>
                <p>Persist metadata and raw payload to object storage.</p>
              </article>
              <article>
                <span>02</span>
                <h4>Parse off-thread</h4>
                <p>Use workers so heavy Trivy payloads do not block the API thread.</p>
              </article>
              <article>
                <span>03</span>
                <h4>Upsert findings</h4>
                <p>Deduplicate on fingerprint and append a new occurrence for every re-detection.</p>
              </article>
              <article>
                <span>04</span>
                <h4>Refresh metrics</h4>
                <p>Update dashboards and ASVS coverage views asynchronously.</p>
              </article>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
