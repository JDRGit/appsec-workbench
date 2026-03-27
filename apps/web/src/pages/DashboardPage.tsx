import { activity, findings, metrics, projects } from "../data";

const urgentFindings = findings.filter((finding) => finding.severity !== "low").slice(0, 3);

export function DashboardPage() {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Working surface</p>
          <h3>Scanner output becomes ownership, deadlines, and ASVS evidence.</h3>
          <p className="hero-summary">
            The MVP is shaped around the real AppSec handoff: queue-backed ingest,
            one durable finding identity, and triage views that engineering can
            actually work from.
          </p>
        </div>

        <div className="hero-signal">
          <div className="signal-frame">
            <span className="signal-label">Primary repo at risk</span>
            <strong>platform/api-gateway</strong>
            <p>Critical injection issue triaged, owner assigned, SLA due in 4 days.</p>
          </div>
        </div>
      </section>

      <section className="metric-strip" aria-label="Selected KPIs">
        {metrics.map((metric, index) => (
          <article
            className="metric"
            key={metric.label}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.note}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <section className="surface-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Hot queue</p>
              <h3>Issues that need action today</h3>
            </div>
          </div>

          <div className="insight-list">
            {urgentFindings.map((finding) => (
              <article className="insight-card" key={finding.id}>
                <div className="insight-header">
                  <span className={`severity-badge ${finding.severity}`}>{finding.severity}</span>
                  <span className="mono">{finding.id}</span>
                </div>
                <h4>{finding.title}</h4>
                <p>{finding.summary}</p>
                <div className="insight-meta">
                  <span>{finding.repo}</span>
                  <span>{finding.owner}</span>
                  <span>{finding.chapter}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="detail-rail">
          <section className="activity-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Scanner activity</p>
                <h3>Latest signal</h3>
              </div>
            </div>

            <div className="activity-list">
              {activity.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                  <span>{item.change}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="detail-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Portfolio focus</p>
                <h3>Project pressure</h3>
              </div>
            </div>

            <div className="summary-list">
              {projects.map((project) => (
                <article className="summary-item" key={project.name}>
                  <div className="summary-row">
                    <strong>{project.name}</strong>
                    <span className={`severity-badge ${project.criticality}`}>
                      {project.criticality}
                    </span>
                  </div>
                  <p>{project.focus}</p>
                  <span className="summary-footnote">
                    {project.openFindings} open findings across {project.repos} repos
                  </span>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
