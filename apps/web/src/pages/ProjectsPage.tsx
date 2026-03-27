import { projects } from "../data";

export function ProjectsPage() {
  return (
    <div className="page-stack">
      <section className="project-grid">
        {projects.map((project) => (
          <article className="surface-panel project-card" key={project.name}>
            <div className="project-header">
              <div>
                <p className="eyebrow">Project</p>
                <h3>{project.name}</h3>
              </div>
              <span className={`severity-badge ${project.criticality}`}>
                {project.criticality}
              </span>
            </div>

            <div className="project-stats">
              <div>
                <span>Owner</span>
                <strong>{project.owner}</strong>
              </div>
              <div>
                <span>Open findings</span>
                <strong>{project.openFindings}</strong>
              </div>
              <div>
                <span>Repos</span>
                <strong>{project.repos}</strong>
              </div>
              <div>
                <span>SLA</span>
                <strong>{project.sla}</strong>
              </div>
            </div>

            <p className="project-focus">{project.focus}</p>
          </article>
        ))}
      </section>

      <section className="surface-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Repository profile</p>
            <h3>What this page would own in the full product</h3>
          </div>
        </div>

        <div className="repo-list">
          <article className="repo-row">
            <strong>platform/api-gateway</strong>
            <span>Default owner: Maya Chen</span>
            <span>Language: TypeScript</span>
            <span>Business context: customer-facing traffic entrypoint</span>
          </article>
          <article className="repo-row">
            <strong>identity/auth-service</strong>
            <span>Default owner: Riley Gomez</span>
            <span>Language: Node.js</span>
            <span>Business context: authentication and session enforcement</span>
          </article>
          <article className="repo-row">
            <strong>infra/public-assets</strong>
            <span>Default owner: Ivy Patel</span>
            <span>Language: Terraform</span>
            <span>Business context: static delivery and CDN posture</span>
          </article>
        </div>
      </section>
    </div>
  );
}
