import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

test("NodeBuilder passes worker_url for FuncNodes worker initialization", () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const pkgRoot = path.resolve(testDir, "..");
  const filePath = path.join(pkgRoot, "src/index.tsx");
  const source = fs.readFileSync(filePath, "utf8");

  assert.ok(
    source.includes("<FuncNodes") && source.includes("worker_url"),
    "expected NodeBuilder to pass worker_url to <FuncNodes .../> to allow worker setup"
  );
});
