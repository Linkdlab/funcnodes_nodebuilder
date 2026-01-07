import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

test("nodebuilder worker awaits post_pyodide_ready python bootstrap", () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const pkgRoot = path.resolve(testDir, "..");
  const filePath = path.join(pkgRoot, "src/nodebuilderworker.mts");
  const source = fs.readFileSync(filePath, "utf8");

  assert.ok(
    source.includes("nodebuilder_post_pyodide_ready") &&
      source.includes("await workerState.pyodide.runPythonAsync"),
    "expected nodebuilder_post_pyodide_ready to await workerState.pyodide.runPythonAsync(...)"
  );
});
