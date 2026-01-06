import {
  gself,
  ExtendetSharedWorkerGlobalScope,
  ExtendetDedicatedWorkerGlobalScope,
  WorkerMessage,
} from "@linkdlab/funcnodes_pyodide_react_flow/pyodideWebWorker";
export * from "@linkdlab/funcnodes_pyodide_react_flow/pyodideWebWorker";
// import { WorkerMessage } from "@linkdlab/funcnodes_pyodide_react_flow/dist/worker/pyodideWorkerLogic";
import __PYCODE__ from "./nodebuilder.py?raw";
import { parseRequires } from "./parse_requires.js";

interface NodeBuilderCommonWorker {
  nodebuilder_post_pyodide_ready: (workerState: any) => Promise<void>;
}

interface DedicatedNodeBuilderdWorker
  extends ExtendetDedicatedWorkerGlobalScope,
    NodeBuilderCommonWorker {}

interface SharedNodeBuilderWorker
  extends ExtendetSharedWorkerGlobalScope,
    NodeBuilderCommonWorker {}

const nodebuilderself = gself as
  | DedicatedNodeBuilderdWorker
  | SharedNodeBuilderWorker;
nodebuilderself.nodebuilder_post_pyodide_ready = async (workerState: any) => {
  await workerState.pyodide.runPythonAsync(__PYCODE__);
};

nodebuilderself.receivepy_bytes = (msg: any, kwargs: any) => {
  let normalizedMsg: unknown = msg;
  const maybeProxy = msg as { toJs?: (opts?: any) => unknown };
  if (maybeProxy && typeof maybeProxy.toJs === "function") {
    try {
      normalizedMsg = maybeProxy.toJs({ dict_converter: Object.fromEntries });
    } catch {
      normalizedMsg = maybeProxy.toJs();
    }
  }
  if (normalizedMsg instanceof Map) {
    normalizedMsg = Object.fromEntries(normalizedMsg.entries());
  }

  try {
    let data: { msg?: unknown; worker_id?: string } = {};
    if (normalizedMsg instanceof Uint8Array) {
      data.msg = normalizedMsg;
    } else {
      data = normalizedMsg as { msg?: unknown; worker_id?: string };
    }

    if (data.msg === undefined) return;

    let bytes: unknown = data.msg;
    const bytesProxy = bytes as { toJs?: (opts?: any) => unknown };
    if (bytesProxy && typeof bytesProxy.toJs === "function") {
      try {
        bytes = bytesProxy.toJs({ dict_converter: Object.fromEntries });
      } catch {
        bytes = bytesProxy.toJs();
      }
    }
    if (bytes instanceof ArrayBuffer) {
      bytes = new Uint8Array(bytes);
    }
    if (Array.isArray(bytes)) {
      bytes = Uint8Array.from(bytes as number[]);
    }
    if (!(bytes instanceof Uint8Array)) {
      throw new Error(
        `receivepy_bytes expected Uint8Array payload, got ${typeof bytes}`
      );
    }
    data.msg = bytes;

    if (kwargs !== undefined) {
      if (typeof kwargs === "string") {
        if (!data.worker_id) data.worker_id = kwargs;
      } else {
        data = { ...(kwargs as any), ...data };
      }
    }

    const worker_id = data.worker_id;
    if (!worker_id) {
      throw new Error("Worker id not provided in receivepy_bytes");
    }
    if (!nodebuilderself.workerState.worker[worker_id]) {
      throw new Error(
        `Worker with id ${worker_id} not found in receivepy_bytes`
      );
    }

    nodebuilderself.workerState.receivepy_bytes(
      data.msg as Uint8Array,
      worker_id
    );
  } catch (e) {
    console.error("Error during receivepy_bytes:", e);
  }
};

interface EvalNodeMessage extends WorkerMessage {
  cmd: "worker:evalnode";
  msg: string;
}

nodebuilderself.register_cmd_message(
  "worker:evalnode",
  async (msg: EvalNodeMessage) => {
    const code = msg.msg;
    // find all "# requires" lines and extract the module names
    console.log("evalnode", code);
    const modules = parseRequires(code);
    console.log("requires", modules);
    for (const mod of modules) {
      await nodebuilderself.workerState.micropip.install(mod);
    }
    const node = await nodebuilderself.workerState.pyodide?.runPythonAsync(
      `eval_node_code(${JSON.stringify(code)})`
    );
    if (!node) {
      return;
    }
    const workerstate = await nodebuilderself.get_or_create_worker(
      msg.worker_id
    );
    workerstate.worker.clear();
    workerstate.worker.nodespace.lib.add_node(node, "demo");
    workerstate.worker.add_node(node.node_id);
  }
);

export { nodebuilderself };

export type {
  NodeBuilderCommonWorker as NodeBuilderSharedWorker,
  ExtendetSharedWorkerGlobalScope,
  ExtendetDedicatedWorkerGlobalScope,
  DedicatedNodeBuilderdWorker,
  SharedNodeBuilderWorker,
};
