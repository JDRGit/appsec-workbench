import { chapters, findings, mappingPrinciples } from "../data";

export function AsvsPage() {
  return (
    <div className="page-stack">
      <section className="content-grid">
        <section className="coverage-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ASVS explorer</p>
              <h3>Mapped chapters</h3>
            </div>
          </div>

          <div className="coverage-list">
            {chapters.map((chapter) => (
              <div className="coverage-row" key={chapter.code}>
                <div className="coverage-copy">
                  <strong>Chapter {chapter.code}</strong>
                  <span>{chapter.title}</span>
                </div>
                <div className="coverage-bar">
                  <div style={{ width: `${chapter.coverage}%` }} />
                </div>
                <span className="mono">{chapter.coverage}%</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="detail-rail">
          <section className="surface-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Mapping strategy</p>
                <h3>Priority order</h3>
              </div>
            </div>

            <div className="summary-list">
              {mappingPrinciples.map((principle) => (
                <article className="summary-item" key={principle.title}>
                  <strong>{principle.title}</strong>
                  <p>{principle.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="detail-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Linked findings</p>
                <h3>Sample evidence</h3>
              </div>
            </div>

            <div className="summary-list">
              {findings.slice(0, 3).map((finding) => (
                <article className="summary-item" key={finding.id}>
                  <div className="summary-row">
                    <strong>{finding.id}</strong>
                    <span className="mono">{finding.chapter}</span>
                  </div>
                  <p>{finding.title}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
