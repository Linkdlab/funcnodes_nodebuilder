import gself, {
  ExtendetSharedWorkerGlobalScope,
  ExtendetWorkerGlobalScope,
} from "@linkdlab/funcnodes_pyodide_react_flow/dist/worker/pyodideWorkerLayout";
import { WorkerMessage } from "@linkdlab/funcnodes_pyodide_react_flow/dist/worker/pyodideWorkerLogic";

declare const __PYCODE__: string;

interface NodeBuilderSharedWorker {
  nodebuilder_post_pyodide_ready: (workerState: any) => Promise<void>;
}

interface DedicatedNodeBuilderdWorker
  extends ExtendetWorkerGlobalScope,
    NodeBuilderSharedWorker {}

interface SharedNodeBuilderWorker
  extends ExtendetSharedWorkerGlobalScope,
    NodeBuilderSharedWorker {}

const nodebuilderself = gself as unknown as
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
    const node = await nodebuilderself.workerState.pyodide?.runPythonAsync(
      `eval_node_code(${JSON.stringify(msg.msg)})`
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

export default nodebuilderself;
export type {
  NodeBuilderSharedWorker,
  ExtendetSharedWorkerGlobalScope,
  ExtendetWorkerGlobalScope,
  DedicatedNodeBuilderdWorker,
  SharedNodeBuilderWorker,
};
