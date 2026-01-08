// declare global {
//   interface Window {
//     ace: any;
//   }
// }
import * as React from "react";
import { useEffect } from "react";

import {
  FuncNodes,
  object_factory_maker,
} from "@linkdlab/funcnodes_react_flow";
import { create, UseBoundStore, StoreApi } from "zustand";
import FuncnodesPyodideWorker from "@linkdlab/funcnodes_pyodide_react_flow";
import { createWorkerFromData } from "./workerFactory.browser.ts";
import { Editor } from "@monaco-editor/react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

import {
  faCirclePlay,
  faCirclePause,
  faGears,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./style.css";
import type {
  LimitedDeepPartial,
  PartialSerializedNodeType,
} from "@linkdlab/funcnodes_react_flow";

interface NodeBuilderOptions {
  id: string;
  ser_node?: PartialSerializedNodeType;
  python_code?: string;
  python_code_error?: string;
  show_python_editor: boolean;
  worker?: FuncnodesPyodideWorker;
  webworker?: Worker | SharedWorker;
  index_url: string;
  store_code: boolean;
  onload?: () => Promise<void>;
  storage_object?: Record<string, any>;
}

const PyEditor = ({
  state,
}: {
  state: UseBoundStore<StoreApi<NodeBuilderOptions>>;
}) => {
  // Destructure necessary values from the store.
  const [code, setCode] = React.useState<string>(
    state.getState().python_code || ""
  );

  const [continuous, setContinuous] = React.useState<boolean>(false);

  const python_code_error = state((s) => s.python_code_error);
  const handleChange = (value?: string) => {
    setCode(value || "");
    if (continuous) {
      state.setState({ python_code: value || "" });
    }
  };

  return (
    <div
      style={{
        // minWidth: "300px",
        // maxWidth: "50%",
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
          value={code}
          //   editorProps={{ $blockScrolling: true }}
          //   setOptions={{ useWorker: false }} // Disables Ace's built-in worker if not needed.
          //   width="100%"
          //   height="400px"
        />
        <div className="controll_icons">
          {!continuous ? (
            <>
              <FontAwesomeIcon
                className="controll_icon"
                icon={faGears}
                onClick={async () => {
                  state.setState({ python_code: code });
                }}
                title="Run"
              />
              <FontAwesomeIcon
                className="controll_icon"
                icon={faCirclePlay}
                onClick={async () => {
                  setContinuous(true);
                  state.setState({ python_code: code });
                }}
                title="Continuous run"
              />
            </>
          ) : (
            <FontAwesomeIcon
              className="controll_icon"
              icon={faCirclePause}
              style={{ color: "orange" }}
              onClick={async () => {
                setContinuous(false);
              }}
              title="Pause continuous run"
            />
          )}
        </div>
      </div>

      <code style={{ maxHeight: "50%", overflowY: "auto" }}>
        {python_code_error}
      </code>
    </div>
  );
};

type NodeBuilderDefaultOptions = Omit<NodeBuilderOptions, "id"> & {
  id?: string;
};

const DEFAULTPROPS: NodeBuilderDefaultOptions = {
  show_python_editor: true,
  index_url: "",
  store_code: true,
};

const default_nodebuilder_options_factory: (
  obj?: LimitedDeepPartial<NodeBuilderDefaultOptions>
) => NodeBuilderDefaultOptions = object_factory_maker(DEFAULTPROPS);

const NodeBuilder = (props: Partial<NodeBuilderOptions>) => {
  const fullprops: NodeBuilderDefaultOptions = default_nodebuilder_options_factory(props);
  const storage_object = props.storage_object;
  if (storage_object !== undefined) {
    storage_object["fullprops"] = fullprops;
  }

  const has_node = fullprops.ser_node || fullprops.python_code;

  const has_editor = fullprops.show_python_editor;

  if (!has_node && !has_editor) {
    throw new Error("no Node and no editor");
  }

  if (fullprops.id === undefined) {
    throw new Error("id must be defined");
  }
  const id = fullprops.id;

  const workerRef = React.useRef<FuncnodesPyodideWorker | undefined>(
    fullprops.worker
  );
  const ownsWorkerRef = React.useRef<boolean>(fullprops.worker === undefined);

  if (!workerRef.current) {
    const webworker = createWorkerFromData({
      uuid: id + "_worker",
      shared_worker: false,
    });
    workerRef.current = new FuncnodesPyodideWorker({
      shared_worker: false,
      uuid: id + "_worker",
      worker: webworker,
    });
    ownsWorkerRef.current = true;
  }

  const worker = workerRef.current;

  const initialPythonCodeRef = React.useRef<string | undefined>(undefined);
  if (initialPythonCodeRef.current === undefined) {
    // load python code from localstorage (one-time init)
    let pythonCode = fullprops.python_code || "";
    if (fullprops.store_code) {
      const code = localStorage.getItem(id + "_python_code");
      if (code) {
        pythonCode = code;
      }
    }
    initialPythonCodeRef.current = pythonCode;
  }

  const stateRef = React.useRef<UseBoundStore<StoreApi<NodeBuilderOptions>> | null>(
    null
  );
  if (!stateRef.current) {
    stateRef.current = create<NodeBuilderOptions>(() => ({
      ...(fullprops as NodeBuilderOptions),
      id,
      worker,
      python_code: initialPythonCodeRef.current || "",
    }));
  }
  const state = stateRef.current;

  useEffect(() => {
    const evalnode = async () => {
      const code = state.getState().python_code;
      if (!code) return;

      if (state.getState().store_code) {
        localStorage.setItem(id + "_python_code", code);
      }

      worker.postMessage({
        cmd: "worker:evalnode",
        msg: code,
        worker_id: worker.uuid,
        id: "evalnode",
      });
      worker.getSyncManager().stepwise_fullsync();
    };

    const remover1 = worker.getHookManager().add_hook("starting", async () => {
      await evalnode();
      await state.getState().onload?.();
    });

    const timeout1 = setInterval(async () => {
      if (worker.ready) {
        await evalnode();
        await state.getState().onload?.();
        clearInterval(timeout1);
      }
    }, 500);

    const remover2 = worker.getHookManager().add_hook(
      "node_mounted",
      async ({ worker: w, data }: { worker: any; data: any }) => {
        w._zustand?.center_node(data);
        await new Promise((resolve) => setTimeout(resolve, 0));
        w._zustand?.center_node(data);
        await new Promise((resolve) => setTimeout(resolve, 10));
        w._zustand?.center_node(data);
        await new Promise((resolve) => setTimeout(resolve, 100));
        w._zustand?.center_node(data);
      }
    );

    const remover3 = worker
      .getEventManager()
      .add_ns_event_intercept("node_added", async (event: any) => {
        const node = event.data.node as any;
        if (!node) return event;
        if (!node.frontend) {
          node.frontend = {};
        }
        node.frontend.pos = [0, 0];

        return event;
      });

    const remover4 = worker.registerMessageHook(async (data) => {
      if (data.id === "evalnode" && data.original.worker_id === worker.uuid) {
        if (data.error) {
          state.setState({ python_code_error: data.error });
        } else {
          state.setState({ python_code_error: "" });
        }
      }
    });

    const unsubscribe = state.subscribe((newstate, oldstate) => {
      if (newstate.python_code !== oldstate.python_code) {
        evalnode();
      }
    });

    return () => {
      unsubscribe();
      remover1?.();
      remover2?.();
      remover3?.();
      remover4?.();
      clearInterval(timeout1);
      if (ownsWorkerRef.current) {
        (worker as any).dispose?.();
      }
    };
  }, [id, state, worker]);

  const funcnodes = (
    <FuncNodes
      worker={worker}
      id={id}
      useWorkerManager={false}
      worker_url="dummy" // dummy url as the current implementation requires one (will be removed in the next release of funcnodes_react_flow)
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
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
      }}
    >
      {fullprops.show_python_editor ? (
        <Allotment
          vertical={false}
          defaultSizes={[50, 50]}
          onDragEnd={() => {
            worker?._zustand?.center_all();
          }}
        >
          {funcnodes}
          <PyEditor state={state}></PyEditor>
        </Allotment>
      ) : (
        funcnodes
      )}
    </div>
  );
};

export default NodeBuilder;
export type { NodeBuilderOptions };
