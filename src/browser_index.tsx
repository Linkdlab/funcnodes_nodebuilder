declare global {
  interface Window {
    NodeBuilder: any;
    FuncnodesPyodideWorker: any;
  }
}

import * as React from "react";
import { createRoot } from "react-dom/client";
import "@linkdlab/funcnodes_react_flow/dist/style.css";
import FuncnodesPyodideWorker from "@linkdlab/funcnodes_pyodide_react_flow";
import NodeBuilder, { NodeBuilderOptions } from ".";

const NodeBuilderRenderer = (
  id_or_element: string | HTMLElement,
  options?: Partial<NodeBuilderOptions>
) => {
  if (options === undefined) {
    options = {};
  }

  const { element, eleid } =
    typeof id_or_element === "string"
      ? {
          element: document.getElementById(id_or_element) as HTMLElement,
          eleid: id_or_element,
        }
      : { element: id_or_element, eleid: id_or_element.id };

  const content = <NodeBuilder {...{ id: eleid, ...options }} />;
  const root = createRoot(element);
  root.render(content);
  return {
    root,
    content,
  };
};

window.NodeBuilder = NodeBuilderRenderer;
window.FuncnodesPyodideWorker = FuncnodesPyodideWorker;
export default NodeBuilderRenderer;
