import {
  nodebuilderself,
  DedicatedWorkerInitParams,
  DedicatedNodeBuilderdWorker,
  SharedWorkerInitParams,
  SharedNodeBuilderWorker,
} from "./nodebuilderworker.mjs";

export * from "./nodebuilderworker.mjs";

const initDedicatedWorker = (params: DedicatedWorkerInitParams) => {
  (nodebuilderself as DedicatedNodeBuilderdWorker).init_dedicated_worker(
    params
  );
};

const initSharedWorker = (params: SharedWorkerInitParams) => {
  (nodebuilderself as SharedNodeBuilderWorker).init_shared_worker(params);
};
export { initDedicatedWorker, initSharedWorker };

//export all export   from pyodideWorkerLogic
