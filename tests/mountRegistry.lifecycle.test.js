import test from "node:test";
import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";

import { createMountRegistry } from "../src/mountRegistry.ts";
import { mountNodeBuilderWithHandle } from "../src/nodeBuilderMount.ts";

test("mountNodeBuilderWithHandle replaces and disposes previous handle for same element", async () => {
  const registry = createMountRegistry();
  const element = { isConnected: true };

  let disposed1 = 0;
  let unmounted1 = 0;
  const handle1 = mountNodeBuilderWithHandle({
    element,
    worker: { dispose: () => disposed1++ },
    createRootAndRender: () => ({ unmount: () => unmounted1++ }),
    registry,
    intervalMs: 1_000,
  });

  let disposed2 = 0;
  let unmounted2 = 0;
  const handle2 = mountNodeBuilderWithHandle({
    element,
    worker: { dispose: () => disposed2++ },
    createRootAndRender: () => ({ unmount: () => unmounted2++ }),
    registry,
    intervalMs: 1_000,
  });

  await sleep(0);
  assert.equal(disposed1, 1);
  assert.equal(unmounted1, 1);
  assert.equal(disposed2, 0);
  assert.equal(unmounted2, 0);

  handle2.dispose();
  assert.equal(disposed2, 1);
  assert.equal(unmounted2, 1);

  // Disposing the replaced handle should be idempotent.
  handle1.dispose();
  assert.equal(disposed1, 1);
  assert.equal(unmounted1, 1);
});

test("mountNodeBuilderWithHandle auto-disposes when element disconnects", async () => {
  const registry = createMountRegistry();
  const element = { isConnected: true };

  let disposed = 0;
  let unmounted = 0;
  mountNodeBuilderWithHandle({
    element,
    worker: { dispose: () => disposed++ },
    createRootAndRender: () => ({ unmount: () => unmounted++ }),
    registry,
    intervalMs: 25,
  });

  await sleep(60);
  element.isConnected = false;

  await sleep(100);
  assert.equal(disposed, 1);
  assert.equal(unmounted, 1);
});
