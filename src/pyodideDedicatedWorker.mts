import gself, { DedicatedNodeBuilderdWorker } from "./nodebuilderworker.mjs";

const globaleSlf = gself as unknown as DedicatedNodeBuilderdWorker;

globaleSlf.init_dedicated_worker({
  post_pyodide_ready: globaleSlf.nodebuilder_post_pyodide_ready,
});
