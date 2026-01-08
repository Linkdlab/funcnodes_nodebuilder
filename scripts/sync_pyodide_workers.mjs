import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WORKER_ASSET_RE = /^pyodide(?:Dedicated|Shared)Worker-.*\.js$/;

export const syncPyodideWorkerAssets = async ({
  sourceAssetsDir,
  targetDir,
} = {}) => {
  if (!sourceAssetsDir || !targetDir) {
    throw new Error("sourceAssetsDir and targetDir are required");
  }

  try {
    const stat = await fs.stat(sourceAssetsDir);
    if (!stat.isDirectory()) {
      throw new Error("sourceAssetsDir is not a directory");
    }
  } catch {
    throw new Error(`sourceAssetsDir does not exist: ${sourceAssetsDir}`);
  }

  await fs.mkdir(targetDir, { recursive: true });

  const entries = await fs.readdir(sourceAssetsDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && WORKER_ASSET_RE.test(e.name))
    .map((e) => e.name);

  if (!files.length) {
    throw new Error(
      `No pyodide worker assets found in: ${sourceAssetsDir} (expected ${WORKER_ASSET_RE})`
    );
  }

  await Promise.all(
    files.map(async (name) => {
      await fs.copyFile(
        path.join(sourceAssetsDir, name),
        path.join(targetDir, name)
      );
    })
  );

  return { copied: files };
};

const runAsCli = async () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const pkgRoot = path.resolve(here, "..");

  const sourceAssetsDir = path.join(
    pkgRoot,
    "node_modules",
    "@linkdlab",
    "funcnodes_pyodide_react_flow",
    "dist",
    "assets"
  );

  const targetDir = path.join(pkgRoot, "static", "assets");

  const { copied } = await syncPyodideWorkerAssets({
    sourceAssetsDir,
    targetDir,
  });

  process.stdout.write(
    `synced pyodide worker assets -> ${path.relative(pkgRoot, targetDir)}: ${copied.join(
      ", "
    )}\n`
  );
};

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  runAsCli().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
