import gself, { SharedNodeBuilderWorker } from "./nodebuilderworker.mjs";

const globaleSlf = gself as unknown as SharedNodeBuilderWorker;

globaleSlf.init_shared_worker({
  post_pyodide_ready: globaleSlf.nodebuilder_post_pyodide_ready,
});
