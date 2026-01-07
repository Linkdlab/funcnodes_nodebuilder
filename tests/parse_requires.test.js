import test from "node:test";
import assert from "node:assert/strict";

import { parseRequires } from "../src/parse_requires.js";

test("parseRequires extracts all requires lines", () => {
  const code = [
    "# requires numpy",
    "# requires pandas",
    "import funcnodes as fn",
  ].join("\n");

  assert.deepEqual(parseRequires(code), ["numpy", "pandas"]);
});

test("parseRequires supports multiple modules per line", () => {
  const code = ["# requires numpy pandas", "print('x')"].join("\n");
  assert.deepEqual(parseRequires(code), ["numpy", "pandas"]);
});

test("parseRequires supports comma-separated modules", () => {
  const code = ["# requires numpy, pandas ,scipy", "print('x')"].join("\n");
  assert.deepEqual(parseRequires(code), ["numpy", "pandas", "scipy"]);
});

test("parseRequires ignores empty/whitespace-only requires lines", () => {
  const code = ["# requires   ", "# requires numpy", "# requires\t"].join("\n");
  assert.deepEqual(parseRequires(code), ["numpy"]);
});

test("parseRequires de-duplicates modules while preserving order", () => {
  const code = ["# requires numpy pandas", "# requires pandas numpy"].join("\n");
  assert.deepEqual(parseRequires(code), ["numpy", "pandas"]);
});

test("parseRequires tolerates whitespace and optional colon", () => {
  const code = ["  #requires:   numpy  ", "\t#   requires pandas"].join("\n");
  assert.deepEqual(parseRequires(code), ["numpy", "pandas"]);
});
