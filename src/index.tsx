// declare global {
//   interface Window {
//     ace: any;
//   }
// }
import * as React from "react";
import { useEffect } from "react";
import { latest_types, deep_update } from "@linkdlab/funcnodes_react_flow";
import FuncNodes from "@linkdlab/funcnodes_react_flow";
import { create, UseBoundStore, StoreApi } from "zustand";
import FuncnodesPyodideWorker from "@linkdlab/funcnodes_pyodide_react_flow";

if (typeof global === "undefined" && typeof window !== "undefined") {
  (window as any).global = window;
}

import Editor from "@monaco-editor/react";

interface NodeBuilderOptions {
  id: string;
  ser_node?: latest_types.PartialNodeType;
  python_code?: string;
  python_code_error?: string;
  show_python_editor: boolean;
  worker?: FuncnodesPyodideWorker;
  webworker?: Worker | SharedWorker;
  index_url: string;
  onload?: () => Promise<void>;
}

const PyEditor = ({
  state,
}: {
  state: UseBoundStore<StoreApi<NodeBuilderOptions>>;
}) => {
  // Destructure necessary values from the store.
  const python_code = state.getState().python_code;
  const python_code_error = state((s) => s.python_code_error);

  const handleChange = (value?: string) => {
    state.setState({ python_code: value || "" });
  };

  return (
    <div
      style={{
        minWidth: "300px",
        maxWidth: "50%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          language="python"
          theme="vs-dark"
          //   name={`python_editor_${id}`} // A unique name for the editor instance.
          onChange={handleChange}
          value={python_code || ""}
          //   editorProps={{ $blockScrolling: true }}
          //   setOptions={{ useWorker: false }} // Disables Ace's built-in worker if not needed.
          //   width="100%"
          //   height="400px"
        />
      </div>

      <code style={{ maxHeight: "50%", overflowY: "auto" }}>
        {python_code_error}
      </code>
    </div>
  );
};

const DEFAULTPROPS: NodeBuilderOptions = {
  //@ts-ignore
  id: undefined,
  show_python_editor: true,
  index_url: "",
};
const NodeBuilder = (props: Partial<NodeBuilderOptions>) => {
  const { new_obj: fullprops } = deep_update(props, DEFAULTPROPS);

  const has_node = fullprops.ser_node || fullprops.python_code;

  const has_editor = fullprops.show_python_editor;

  if (!has_node && !has_editor) {
    throw new Error("no Node and no editor");
  }

  if (fullprops.id === undefined) {
    throw new Error("id must be defined");
  }

  if (!fullprops.worker) {
    fullprops.worker = new FuncnodesPyodideWorker({
      worker_url: fullprops.index_url + "pyodideDedicatedWorker.js",
      shared_worker: false,
      uuid: fullprops.id + "_worker",
      worker: fullprops.webworker,
    });
  }

  const state = create<NodeBuilderOptions>(() => ({
    ...fullprops,
  }));

  const evalnode = async () => {
    fullprops.worker?.postMessage({
      cmd: "worker:evalnode",
      msg: state.getState().python_code,
      worker_id: fullprops.worker?.uuid,
      id: "evalnode",
    });
  };

  useEffect(() => {
    const remover1 = fullprops.worker?.add_hook("starting", async () => {
      await evalnode();
      await fullprops.onload?.();
    });

    const remover2 = fullprops.worker?.add_hook(
      "node_mounted",
      async ({ worker, data }) => {
        console.log("node_mounted", data);
        worker._zustand?.center_node(data);
        await new Promise((resolve) => setTimeout(resolve, 0));
        worker._zustand?.center_node(data);
        await new Promise((resolve) => setTimeout(resolve, 10));
        worker._zustand?.center_node(data);
        await new Promise((resolve) => setTimeout(resolve, 100));
        worker._zustand?.center_node(data);
      }
    );

    const remover3 = fullprops.worker?.add_ns_event_intercept(
      "node_added",
      async (event) => {
        const node = event.data.node as latest_types.PartialNodeType;
        if (!node) return event;
        if (!node.frontend) {
          node.frontend = {};
        }
        node.frontend.pos = [0, 0];

        return event;
      }
    );

    const remover4 = fullprops.worker?.registerMessageHook(async (data) => {
      if (!fullprops.worker) return;
      if (
        data.id === "evalnode" &&
        data.original.worker_id === fullprops.worker.uuid
      ) {
        if (data.error) {
          state.setState({ python_code_error: data.error });
        } else {
          state.setState({ python_code_error: "" });
        }
      }
    });

    return () => {
      remover1?.();
      remover2?.();
      remover3?.();
      remover4?.();
    };
  });

  // subscripbe to the python code changes
  state.subscribe((newstate, oldstate) => {
    if (newstate.python_code !== oldstate.python_code) {
      evalnode();
    }
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
      }}
    >
      <FuncNodes
        worker={fullprops.worker}
        id={fullprops.id}
        useWorkerManager={false}
        show_library={false}
        header={{ show: false, showmenu: false }}
        library={{ show: false }}
        flow={{
          minimap: false,
          allowFullScreen: false,
          allowExpand: false,
          showNodeSettings: false,
        }}
      />
      {fullprops.show_python_editor && <PyEditor state={state}></PyEditor>}
    </div>
  );
};

export default NodeBuilder;
export type { NodeBuilderOptions };
