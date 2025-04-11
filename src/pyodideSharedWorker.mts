import { nodebuilderself, initSharedWorker } from "./nodebuilderworker.mjs";

initSharedWorker({
  post_pyodide_ready: nodebuilderself.nodebuilder_post_pyodide_ready,
});
