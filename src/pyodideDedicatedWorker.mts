import {
  nodebuilderself,
  initDedicatedWorker,
} from "./nodebuilderworker.mjs";

initDedicatedWorker({
  post_pyodide_ready: nodebuilderself.nodebuilder_post_pyodide_ready,
});
