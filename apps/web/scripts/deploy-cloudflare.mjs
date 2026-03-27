import { spawnSync } from "node:child_process";

const projectName = process.env.CLOUDFLARE_PAGES_PROJECT_NAME?.trim();
const branchName = process.env.CLOUDFLARE_PAGES_BRANCH?.trim();

if (!projectName) {
  console.error(
    "CLOUDFLARE_PAGES_PROJECT_NAME is required. Example: CLOUDFLARE_PAGES_PROJECT_NAME=appsec-workbench-web npm run deploy:cloudflare"
  );
  process.exit(1);
}

const args = ["wrangler", "pages", "deploy", "dist", "--project-name", projectName];

if (branchName) {
  args.push("--branch", branchName);
}

const result = spawnSync("npx", args, {
  stdio: "inherit",
  shell: process.platform === "win32"
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
