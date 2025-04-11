import {
  gself,
  ExtendetSharedWorkerGlobalScope,
  ExtendetDedicatedWorkerGlobalScope,
  WorkerMessage,
} from "@linkdlab/funcnodes_pyodide_react_flow/pyodideWebWorker";
export * from "@linkdlab/funcnodes_pyodide_react_flow/pyodideWebWorker";
// import { WorkerMessage } from "@linkdlab/funcnodes_pyodide_react_flow/dist/worker/pyodideWorkerLogic";
import __PYCODE__ from "./nodebuilder.py?raw";

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
  workerState.pyodide.runPythonAsync(__PYCODE__);
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
    const requires = code.match(/#\s*requires\s*(.*)/);
    if (requires) {
      const modules = requires[1]
        .split(" ")
        .map((mod) => mod.trim())
        .filter((mod) => mod.length > 0);
      for (const mod of modules) {
        // load the module
        await nodebuilderself.workerState.micropip.install(mod);
      }
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
