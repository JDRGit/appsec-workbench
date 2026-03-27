import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function resolveDatabaseFilePath() {
  const databaseUrl = process.env.API_DATABASE_URL ?? "file:./dev.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error(`Unsupported API_DATABASE_URL for prototype startup: ${databaseUrl}`);
  }

  const filePath = databaseUrl.slice("file:".length);

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return path.resolve(process.cwd(), "prisma", filePath);
}

const databaseFile = resolveDatabaseFilePath();

if (fs.existsSync(databaseFile)) {
  process.exit(0);
}

fs.mkdirSync(path.dirname(databaseFile), { recursive: true });

const result = spawnSync(process.execPath, ["prisma/seed.mjs"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit"
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
