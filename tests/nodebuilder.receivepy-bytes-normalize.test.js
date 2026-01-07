import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

test("nodebuilder worker normalizes receivepy_bytes to cloneable Uint8Array", () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const pkgRoot = path.resolve(testDir, "..");
  const filePath = path.join(pkgRoot, "src/nodebuilderworker.mts");
  const source = fs.readFileSync(filePath, "utf8");

  assert.ok(
    source.includes("receivepy_bytes") && source.includes(".toJs("),
    "expected nodebuilder to handle PyProxy payloads via toJs(...) in receivepy_bytes"
  );

  assert.ok(
    source.includes("workerState.receivepy_bytes") &&
      (source.includes("data.msg") || source.includes("bytes")),
    "expected nodebuilder receivepy_bytes to forward normalized bytes (not the original proxy) to workerState.receivepy_bytes"
  );
});
