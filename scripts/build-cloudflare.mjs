import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const tempRoot = path.join(projectRoot, ".open-next-tmp");

rmSync(tempRoot, { recursive: true, force: true });
mkdirSync(tempRoot, { recursive: true });

const cliPath = path.join(
  projectRoot,
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "index.js"
);
const fsPatchPath = path.join(projectRoot, "scripts", "open-next-fs-patch.mjs");

const result = spawnSync(process.execPath, [
  "--import",
  pathToFileURL(fsPatchPath).href,
  cliPath,
  "build",
], {
  cwd: projectRoot,
  env: {
    ...process.env,
    TEMP: tempRoot,
    TMP: tempRoot,
    TMPDIR: tempRoot,
  },
  shell: false,
  stdio: "inherit",
});

rmSync(tempRoot, { recursive: true, force: true });

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(
    `OpenNext Cloudflare build exited with status ${result.status ?? "null"}` +
      (result.signal ? ` and signal ${result.signal}` : "")
  );
}

process.exit(result.status ?? 1);
