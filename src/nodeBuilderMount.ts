import { observeDisconnectByPolling } from "./observeDisconnect.ts";
import {
  createMountRegistry,
  type DisposableHandle,
  type MountRegistry,
} from "./mountRegistry.ts";

type RootLike = { unmount: () => void };

export type NodeBuilderMountHandle<W = any> = DisposableHandle & {
  worker: W;
};

export type NodeBuilderMountRegistry = MountRegistry<
  { isConnected: boolean },
  NodeBuilderMountHandle
>;

export const getNodeBuilderMountRegistry = (): NodeBuilderMountRegistry => {
  const g = globalThis as any;
  if (!g.__funcnodes_nodebuilder_mount_registry) {
    g.__funcnodes_nodebuilder_mount_registry =
      createMountRegistry<{ isConnected: boolean }, NodeBuilderMountHandle>();
  }
  return g.__funcnodes_nodebuilder_mount_registry as NodeBuilderMountRegistry;
};

export const mountNodeBuilderWithHandle = <W>({
  element,
  worker,
  createRootAndRender,
  registry = getNodeBuilderMountRegistry(),
  intervalMs = 250,
  disposeWorker = true,
}: {
  element: { isConnected: boolean };
  worker: W;
  createRootAndRender: () => RootLike;
  registry?: NodeBuilderMountRegistry;
  intervalMs?: number;
  disposeWorker?: boolean;
}): NodeBuilderMountHandle<W> => {
  let disposed = false;
  let root: RootLike | undefined;
  let unregister = () => {};
  let stopObserve = () => {};

  const handle: NodeBuilderMountHandle<W> = {
    worker,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      try {
        stopObserve();
      } catch {}
      try {
        root?.unmount();
      } catch {}
      try {
        if (disposeWorker) {
          const maybeDispose = (worker as any).dispose;
          if (typeof maybeDispose === "function") {
            maybeDispose.call(worker);
          }
        }
      } catch {}
      try {
        unregister();
      } catch {}
    },
  };

  unregister = registry.register(element, handle);
  root = createRootAndRender();
  stopObserve = observeDisconnectByPolling(element, handle.dispose, {
    intervalMs,
  });

  return handle;
};
