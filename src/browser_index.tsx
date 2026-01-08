declare global {
  interface Window {
    NodeBuilder: any;
    FuncnodesPyodideWorker: any;
  }
}

import * as React from "react";
import { createRoot } from "react-dom/client";
import "@linkdlab/funcnodes_react_flow/dist/funcnodes_react_flow.css";
import FuncnodesPyodideWorker from "@linkdlab/funcnodes_pyodide_react_flow";
import NodeBuilder, { NodeBuilderOptions } from ".";
import { mountNodeBuilderWithHandle } from "./nodeBuilderMount";
import { createWorkerFromData } from "./workerFactory.browser.ts";

const NodeBuilderRenderer = (
  id_or_element: string | HTMLElement,
  options?: Partial<NodeBuilderOptions>
) => {
  if (options === undefined) {
    options = {};
  }
  options.storage_object = options.storage_object || {};

  const { element, eleid } =
    typeof id_or_element === "string"
      ? {
          element: document.getElementById(id_or_element) as HTMLElement,
          eleid: id_or_element,
        }
      : { element: id_or_element, eleid: id_or_element.id };

  if (!element) {
    throw new Error(`Element with id '${eleid}' not found`);
  }

  const ownsWorker = options.worker === undefined;
  const worker =
    options.worker ||
    (() => {
      const webworker = createWorkerFromData({
        uuid: eleid + "_worker",
        shared_worker: false,
      });
      return new FuncnodesPyodideWorker({
        shared_worker: false,
        uuid: eleid + "_worker",
        worker: webworker,
      });
    })();

  const content = <NodeBuilder {...{ id: eleid, ...options, worker }} />;
  let root: ReturnType<typeof createRoot> | undefined;

  const handle = mountNodeBuilderWithHandle({
    element,
    worker,
    disposeWorker: ownsWorker,
    createRootAndRender: () => {
      root = createRoot(element);
      root.render(content);
      return root;
    },
    intervalMs: 250,
  });

  return {
    ...handle,
    root,
    content,
    storage_object: options.storage_object,
  };
};

window.NodeBuilder = NodeBuilderRenderer;
window.FuncnodesPyodideWorker = FuncnodesPyodideWorker;
export default NodeBuilderRenderer;
