import type { WorkerFactoryProps } from "./workerFactory.ts";
import { shouldPreferInlineWorkers } from "./workerFactory.ts";

import InlineDedicatedWorker from "./pyodideDedicatedWorker.mts?worker&inline";
import InlineSharedWorker from "./pyodideSharedWorker.mts?sharedworker&inline";

export const createWorkerFromData = (
  data: WorkerFactoryProps
): Worker | SharedWorker => {
  if (data.worker) return data.worker;

  const name = data.uuid;
  const shared = !!data.shared_worker;

  const preferInline = shouldPreferInlineWorkers({
    pageOrigin:
      typeof window !== "undefined" && window.location
        ? window.location.origin
        : undefined,
    scriptUrl: typeof import.meta !== "undefined" ? import.meta.url : undefined,
  });

  if (shared) {
    if (typeof SharedWorker === "undefined") {
      throw new Error("SharedWorker is not available");
    }
    if (preferInline) return new InlineSharedWorker({ name });
    try {
      return new SharedWorker(
        new URL("./pyodideSharedWorker.mts", import.meta.url),
        { name, type: "module" }
      );
    } catch {
      return new InlineSharedWorker({ name });
    }
  }

  if (typeof Worker === "undefined") {
    throw new Error("Worker is not available");
  }
  if (preferInline) return new InlineDedicatedWorker({ name });
  try {
    return new Worker(
      new URL("./pyodideDedicatedWorker.mts", import.meta.url),
      {
        name,
        type: "module",
      }
    );
  } catch {
    return new InlineDedicatedWorker({ name });
  }
};
