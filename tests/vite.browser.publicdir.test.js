import test from "node:test";
import assert from "node:assert/strict";

test("vite.browser.config sets publicDir to static (for /assets worker stubs)", async () => {
  const mod = await import("../vite.browser.config.js");
  const configFactory = mod.default;
  assert.equal(typeof configFactory, "function");

  const config = configFactory({ mode: "production" });
  assert.equal(config.publicDir, "static");
});
