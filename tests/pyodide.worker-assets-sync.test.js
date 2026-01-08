import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import { syncPyodideWorkerAssets } from "../scripts/sync_pyodide_workers.mjs";

test("syncPyodideWorkerAssets copies worker assets into target assets dir", async () => {
  const tmpRoot = path.join("tests", ".tmp", `sync-${Date.now()}`);
  const srcDir = path.join(tmpRoot, "src");
  const dstDir = path.join(tmpRoot, "dst");

  try {
    await fs.mkdir(srcDir, { recursive: true });
    await fs.mkdir(dstDir, { recursive: true });

    const dedicated = "pyodideDedicatedWorker-ABC123.js";
    const shared = "pyodideSharedWorker-XYZ789.js";
    await fs.writeFile(path.join(srcDir, dedicated), "// dedicated\n");
    await fs.writeFile(path.join(srcDir, shared), "// shared\n");

    await syncPyodideWorkerAssets({
      sourceAssetsDir: srcDir,
      targetDir: dstDir,
    });

    const outDedicated = await fs.readFile(
      path.join(dstDir, dedicated),
      "utf8"
    );
    const outShared = await fs.readFile(path.join(dstDir, shared), "utf8");
    assert.equal(outDedicated, "// dedicated\n");
    assert.equal(outShared, "// shared\n");
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});

test("syncPyodideWorkerAssets errors when source dir is missing", async () => {
  const tmpRoot = path.join("tests", ".tmp", `sync-missing-${Date.now()}`);
  const srcDir = path.join(tmpRoot, "does-not-exist");
  const dstDir = path.join(tmpRoot, "dst");
  try {
    await fs.mkdir(dstDir, { recursive: true });

    await assert.rejects(
      () =>
        syncPyodideWorkerAssets({ sourceAssetsDir: srcDir, targetDir: dstDir }),
      /sourceAssetsDir does not exist/
    );
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});
