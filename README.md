@linkdlab/funcnodes_nodebuilder
==============================

Interactive “node builder” UI for FuncNodes: write Python code in the browser,
execute it in a Pyodide worker, and preview the resulting Node inside a
FuncNodes React Flow canvas.

This package is meant for development/prototyping: it executes user-provided
Python via `exec(...)` in Pyodide and extracts the last defined `funcnodes_core.Node`
subclass.

## Features

- Split view: FuncNodes canvas + Monaco Python editor
- Runs Python in Pyodide (dedicated or shared worker)
- Supports lightweight dependency installation via `# requires ...` directives
- Persists editor content in `localStorage` (optional)

## Installation

This is a React/Vite library with peer dependencies. Install it together with
its peers:

```sh
yarn add @linkdlab/funcnodes_nodebuilder \
  @linkdlab/funcnodes_pyodide_react_flow \
  @linkdlab/funcnodes_react_flow \
  pyodide react react-dom
```

## Usage (React)

```tsx
import NodeBuilder from "@linkdlab/funcnodes_nodebuilder";
import "@linkdlab/funcnodes_react_flow/dist/funcnodes_react_flow.css";

export function App() {
  return (
    <div style={{ height: "100vh" }}>
      <NodeBuilder id="nodebuilder" show_python_editor={true} />
    </div>
  );
}
```

### `# requires ...`

At the top of your Python code you can add one or more lines like:

```py
# requires numpy
# requires pandas, scipy
```

Each module spec is passed to `micropip.install(...)` before evaluation.

## Usage (Browser entry)

The browser entry mounts into a DOM element and also exposes globals:

```ts
import "@linkdlab/funcnodes_nodebuilder/src/browser_index";

window.NodeBuilder("app", { show_python_editor: true });
```

## Development

```sh
yarn install
yarn watch
```

### Tests / typecheck

```sh
node --test tests/*.test.js
./node_modules/.bin/tsc --noEmit
```
