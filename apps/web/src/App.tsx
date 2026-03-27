import { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";

import { AdminPage } from "./pages/AdminPage";
import { AsvsPage } from "./pages/AsvsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FindingsPage } from "./pages/FindingsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ScanRunsPage } from "./pages/ScanRunsPage";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "appsec-workbench-theme";

const navigation = [
  { to: "/", label: "Dashboard" },
  { to: "/findings", label: "Findings" },
  { to: "/projects", label: "Projects" },
  { to: "/scan-runs", label: "Scan Runs" },
  { to: "/asvs", label: "ASVS" },
  { to: "/admin", label: "Admin" }
];

const routeMeta: Record<string, { eyebrow: string; title: string; summary: string }> = {
  "/": {
    eyebrow: "Operational snapshot",
    title: "Monday 09:42 ET",
    summary: "One place for scanner signal, ownership, due dates, and coverage evidence."
  },
  "/findings": {
    eyebrow: "Findings workflow",
    title: "Backlog, detail, and triage",
    summary: "Filter by severity, inspect evidence, and move issues through the lifecycle."
  },
  "/projects": {
    eyebrow: "Project portfolio",
    title: "Repository risk at a glance",
    summary: "Compare business criticality, owner coverage, and open exposure across teams."
  },
  "/scan-runs": {
    eyebrow: "Ingestion operations",
    title: "Recent parser activity",
    summary: "Track uploaded artifacts, parser results, and queue health across scanners."
  },
  "/asvs": {
    eyebrow: "Control mapping",
    title: "ASVS 5.0.0 coverage",
    summary: "See where findings land in the standard and where mapping quality still needs work."
  },
  "/admin": {
    eyebrow: "Platform administration",
    title: "Policy, approvals, and system health",
    summary: "Manage suppressions, review role boundaries, and monitor platform readiness."
  }
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function AppLayout({
  theme,
  onToggleTheme
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const location = useLocation();

  const currentMeta = useMemo(() => {
    return routeMeta[location.pathname] ?? routeMeta["/"];
  }, [location.pathname]);

  return (
    <div className="shell" data-theme={theme}>
      <aside className="sidebar">
        <div>
          <div className="brand-block">
            <div className="brand-mark">AW</div>
            <div>
              <p className="eyebrow">Internal security operations</p>
              <h1>AppSec Workbench</h1>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  classNames("nav-link", isActive && "active")
                }
                end={item.to === "/"}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-note">
          <p className="note-label">Multi-page preview</p>
          <p>
            This local prototype now mirrors the eventual product IA with dedicated
            screens for findings, projects, scan runs, ASVS, and admin workflows.
          </p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-copy">
            <p className="eyebrow">{currentMeta.eyebrow}</p>
            <h2>{currentMeta.title}</h2>
            <p className="topbar-summary">{currentMeta.summary}</p>
          </div>

          <div className="topbar-meta">
            <span className="live-pill">Local preview</span>
            <button
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              aria-pressed={theme === "dark"}
              className="theme-toggle"
              data-state={theme}
              onClick={onToggleTheme}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              type="button"
            >
              <span className="visually-hidden">
                {theme === "light" ? "Enable dark mode" : "Enable light mode"}
              </span>
              <span aria-hidden="true" className="theme-toggle-track">
                <span className="theme-toggle-knob" />
              </span>
            </button>
            <button className="action-button" type="button">
              Upload artifact
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <Routes>
      <Route
        element={
          <AppLayout
            onToggleTheme={() =>
              setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"))
            }
            theme={theme}
          />
        }
        path="/"
      >
        <Route element={<DashboardPage />} index />
        <Route element={<FindingsPage />} path="findings" />
        <Route element={<ProjectsPage />} path="projects" />
        <Route element={<ScanRunsPage />} path="scan-runs" />
        <Route element={<AsvsPage />} path="asvs" />
        <Route element={<AdminPage />} path="admin" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
