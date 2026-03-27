import { adminQueues, systemChecks } from "../data";

export function AdminPage() {
  return (
    <div className="page-stack">
      <section className="permission-grid">
        {adminQueues.map((item) => (
          <article className="surface-panel permission-card" key={item.title}>
            <p className="eyebrow">Admin area</p>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="surface-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Environment readiness</p>
            <h3>Platform health checks</h3>
          </div>
        </div>

        <div className="system-list">
          {systemChecks.map((check) => (
            <article className="system-row" key={check.label}>
              <div>
                <strong>{check.label}</strong>
                <p>{check.detail}</p>
              </div>
              <span className="status-pill ready">{check.status}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
