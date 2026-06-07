import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import path from "node:path";

const originalCpSync = fs.cpSync.bind(fs);
const originalSymlinkSync = fs.symlinkSync.bind(fs);

function resolveLinkTarget(target, linkPath) {
  return path.isAbsolute(target) ? target : path.resolve(path.dirname(linkPath), target);
}

function copyPath(src, dest) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    copyDirectoryContents(src, dest);
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function copyDirectoryContents(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcEntry = path.join(src, entry);
    const destEntry = path.join(dest, entry);
    copyPath(srcEntry, destEntry);
  }
}

function ensureDirectoryCopy(src, dest) {
  if (!fs.existsSync(src) || !fs.existsSync(dest)) return;
  if (!fs.statSync(src).isDirectory() || !fs.statSync(dest).isDirectory()) return;

  for (const entry of fs.readdirSync(src)) {
    const srcEntry = path.join(src, entry);
    const destEntry = path.join(dest, entry);
    if (!fs.existsSync(destEntry)) {
      copyPath(srcEntry, destEntry);
    }
  }
}

fs.cpSync = function patchedCpSync(src, dest, options) {
  if (
    options?.recursive &&
    fs.existsSync(src) &&
    fs.statSync(src).isDirectory()
  ) {
    copyDirectoryContents(src, dest);
    return;
  }

  let result;

  try {
    result = originalCpSync(src, dest, options);
  } catch (error) {
    if (
      options?.recursive &&
      fs.existsSync(src) &&
      fs.statSync(src).isDirectory()
    ) {
      copyDirectoryContents(src, dest);
      return;
    }

    throw error;
  }

  if (options?.recursive) {
    ensureDirectoryCopy(src, dest);
  }

  return result;
};

fs.symlinkSync = function patchedSymlinkSync(target, pathLike, type) {
  try {
    return originalSymlinkSync(target, pathLike, type);
  } catch (error) {
    if (error?.code === "EPERM" || error?.code === "EACCES") {
      const resolvedTarget = resolveLinkTarget(String(target), String(pathLike));

      if (fs.existsSync(resolvedTarget)) {
        copyPath(resolvedTarget, String(pathLike));
        return;
      }
    }

    throw error;
  }
};

syncBuiltinESMExports();
