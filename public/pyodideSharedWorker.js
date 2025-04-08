/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function e(e,r,o,t){return new(o||(o=Promise))((function(i,d){function n(e){try{a(t.next(e));}catch(e){d(e);}}function s(e){try{a(t.throw(e));}catch(e){d(e);}}function a(e){var r;e.done?i(e.value):(r=e.value,r instanceof o?r:new o((function(e){e(r);}))).then(n,s);}a((t=t.apply(e,[])).next());}))}"function"==typeof SuppressedError&&SuppressedError;const r=self;r.workerState={pyodide:null,pyodide_url:"https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.mjs",packages:[],micropip:null,worker:{},pyodideReady:false,pyodideReadyPromise:null,debug:false,interruptBuffer:null,receivepy:(e,r)=>{},receivepy_bytes:(e,r)=>{},handel_register:{},post_pyodide_ready:void 0},r.reset=()=>e(void 0,void 0,void 0,(function*(){var e;for(const o in r.list_workers())try{const t=yield r.get_worker(o);t.worker&&t.worker.stop(),null===(e=t.reject_promise)||void 0===e||e.call(t,"Worker reset");}catch(e){}r.workerState.pyodide&&r.interrupt(),r.workerState.pyodide=null,r.workerState.micropip=null,r.workerState.worker={},r.workerState.pyodideReady=false;try{r.workerState.interruptBuffer=new Uint8Array(new SharedArrayBuffer(1)),r.workerState.interruptBuffer[0]=0;}catch(e){}})),r.initializePyodide=()=>e(void 0,void 0,void 0,(function*(){var e,o;if(!r.workerState.pyodide){console.debug("Loading Pyodide..."),yield r.reset(),console.debug("Loading Pyodide module...");const e=yield import(r.workerState.pyodide_url);console.debug("Loading Pyodide instance...");const o=e.loadPyodide,t=r.workerState.pyodide_url.split("/").slice(0,-1).join("/");console.log(t),r.workerState.pyodide=yield o({packages:["micropip"],indexURL:t}),r.workerState.interruptBuffer&&r.workerState.pyodide.setInterruptBuffer(r.workerState.interruptBuffer);}r.workerState.micropip||(console.debug("Importing micropip..."),r.workerState.micropip=r.workerState.pyodide.pyimport("micropip")),console.debug("Pyodide ready. Installing funcnodes...");for(const e of r.workerState.packages)console.log("Installing package:",e),yield r.workerState.micropip.install(e);return yield r.workerState.micropip.install("funcnodes"),yield r.workerState.micropip.install("funcnodes-worker"),yield r.workerState.micropip.install("funcnodes-pyodide"),console.debug("Importing funcnodes..."),yield r.workerState.pyodide.runPythonAsync("import funcnodes_pyodide"),console.debug("Running post_pyodide_ready..."),yield null===(o=(e=r.workerState).post_pyodide_ready)||void 0===o?void 0:o.call(e,r.workerState),console.debug("Pyodide ready"),r.workerState.pyodideReady=true,{pyodide:r.workerState.pyodide,micropip:r.workerState.micropip}})),r.interrupt=()=>{r.workerState.interruptBuffer&&(r.workerState.interruptBuffer[0]=1);},r.list_workers=()=>Object.keys(r.workerState.worker),r.get_worker=o=>e(void 0,void 0,void 0,(function*(){if(!o)throw new Error("Worker id is required");if(!r.workerState.worker[o])throw new Error(`Worker with id ${o} not found`);return yield r.workerState.worker[o].make_promise,r.workerState.worker[o]})),r.has_worker=e=>{if(!e)throw new Error("Worker id is required");return !!r.workerState.worker[e]},r.get_or_create_worker=o=>e(void 0,void 0,void 0,(function*(){if(!o)throw new Error("Worker id is required");return r.workerState.worker[o]||(console.log("Creating worker with id",o),yield r.initializeFuncNodesWorker(o)),r.get_worker(o)})),r.initializeFuncNodesWorker=o=>e(void 0,void 0,void 0,(function*(){try{const{pyodide:t}=yield r.initializePyodide();if(!r.has_worker(o)){r.workerState.worker[o]={worker:null,make_promise:void 0};const i=new Promise(((i,d)=>e(void 0,void 0,void 0,(function*(){r.workerState.worker[o].reject_promise=d,console.debug(`Creating worker (${o})...`);const e=yield t.runPythonAsync(`funcnodes_pyodide.new_worker(debug=${r.workerState.debug?1:0}, uuid="${o}")`);if(console.debug("Worker created:",e),"function"!=typeof e.set_receiver)throw new Error("Worker does not expose a 'set_receiver' method.");e.set_receiver(self),r.workerState.worker[o].worker=e,console.debug("Worker ready"),i(e);}))));r.workerState.worker[o].make_promise=i;}return r.get_worker(o)}catch(e){throw console.error("Error during worker initialization:",e),e}})),r.receivepy=(e,o)=>{try{let t={};if("string"==typeof e?t.msg=e:t=e,void 0===t.msg)return;"string"!=typeof t.msg&&(t.msg=JSON.stringify(t.msg)),void 0!==o&&("string"==typeof o?t.worker_id||(t.worker_id=o):t=Object.assign(Object.assign({},o),t));const i=t.worker_id;if(!i)throw new Error(`Worker id not provided in receivepy(${JSON.stringify(t)})`);if(!r.workerState.worker[i])throw new Error(`Worker with id ${i} not found in receivepy(${JSON.stringify(t)})`);r.workerState.receivepy(e,i);}catch(e){return void console.error("Error during receivepy:",e)}},r.receivepy_bytes=(e,o)=>{e=e.toJs();try{let t={};if(e instanceof Uint8Array?t.msg=e:t=e,void 0===t.msg)return;void 0!==o&&("string"==typeof o?t.worker_id||(t.worker_id=o):t=Object.assign(Object.assign({},o),t));const i=t.worker_id;if(!i)throw new Error("Worker id not provided in receivepy_bytes");if(!r.workerState.worker[i])throw new Error(`Worker with id ${i} not found in receivepy_bytes`);r.workerState.receivepy_bytes(e,i);}catch(e){return void console.error("Error during receivepy_bytes:",e)}},r.startInitialization=({debug:e=false,receivepy:o,receivepy_bytes:t,pyodide_url:i,post_pyodide_ready:d,packages:n})=>(r.workerState.debug=e,r.workerState.pyodide_url=i||"https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.mjs",r.workerState.packages=n,r.workerState.receivepy=o,r.workerState.receivepy_bytes=t,r.workerState.pyodideReadyPromise=r.initializePyodide(),r.workerState.post_pyodide_ready=d,r.workerState),r.register_cmd_message=(e,o)=>{if(r.workerState.handel_register[e])throw new Error(`Command ${e} already registered`);r.workerState.handel_register[e]=o;},r.register_cmd_message("ping",(r=>e(void 0,void 0,void 0,(function*(){return "pong"})))),r.register_cmd_message("_eval",(o=>e(void 0,void 0,void 0,(function*(){var e;try{const t=yield null===(e=r.workerState.pyodide)||void 0===e?void 0:e.runPythonAsync(o.msg||"print('No code provided')");return console.log("Eval result:",t),t}catch(e){console.error("Error during _eval:",e);}})))),r.register_cmd_message("state",(o=>e(void 0,void 0,void 0,(function*(){return {state:{loaded:r.workerState.pyodideReady}}})))),r.register_cmd_message("worker:state",(o=>e(void 0,void 0,void 0,(function*(){return {state:{loaded:!!(yield r.get_or_create_worker(o.worker_id)).worker}}})))),r.register_cmd_message("worker:stop",(o=>e(void 0,void 0,void 0,(function*(){var e;if(!r.has_worker(o.worker_id))return;const t=yield r.get_or_create_worker(o.worker_id);return t.worker&&(t.worker.stop(),t.worker=null,null===(e=t.reject_promise)||void 0===e||e.call(t,"Worker stopped")),delete r.workerState.worker[o.worker_id],{state:{loaded:false}}})))),r.register_cmd_message("worker:send",(o=>e(void 0,void 0,void 0,(function*(){const e=yield r.get_or_create_worker(o.worker_id);if(!e.worker)throw new Error("Worker is not initialized");if("function"!=typeof e.worker.receivejs)throw new Error("Worker does not support receivejs: "+typeof e.worker.receivejs);e.worker.receivejs(o.msg);})))),r.handleMessage=o=>e(void 0,void 0,void 0,(function*(){const e={original:o};o.id&&(e.id=o.id),void 0===o.toJs&&(o.toJs=true);try{if(!o.cmd)throw new Error("Unknown message format: "+JSON.stringify(o));{const t=o;if(!r.workerState.handel_register[t.cmd])throw new Error("Unknown command: "+t.cmd);e.result=yield r.workerState.handel_register[t.cmd](t);}}catch(r){e.error=r.message;}return e})),r.read_url_params=()=>{var e,r;const o=new URLSearchParams(self.location.search),t="true"===(null===(e=o.get("debug"))||void 0===e?void 0:e.toLowerCase()),i=o.get("pyodide_url")||void 0,d=(null===(r=o.get("packages"))||void 0===r?void 0:r.split(","))||[];return console.log("Debug:",t,"Pyodide URL:",i,"Packages:",d),{debug:t,pyodide_url:i,packages:d}};const o=r;o.general_initalization=e=>{const r=o.read_url_params();o.startInitialization(Object.assign(Object.assign({},e),r));};const t=o;o.init_dedicated_worker=o=>{const t=r;t.onmessage=r=>e(void 0,void 0,void 0,(function*(){const e=r.data,o=yield t.handleMessage(e);t.postMessage(o);}));const i=Object.assign(Object.assign({},o),{receivepy:(e,r)=>{t.postMessage({cmd:"receive",msg:e,worker_id:r});},receivepy_bytes(e,r){t.postMessage({cmd:"receive_bytes",msg:e,worker_id:r});}});t.general_initalization(i);},t.init_shared_worker=o=>{const t=r;t.connectedPorts=[],t.onconnect=r=>{const o=r.ports[0];t.connectedPorts.push(o),o.start(),console.debug("Port connected in shared worker"),o.onmessage=r=>e(void 0,void 0,void 0,(function*(){const e=r.data,i=yield t.handleMessage(e);o.postMessage(i);}));};const i=Object.assign(Object.assign({},o),{receivepy:(e,r)=>{t.connectedPorts.forEach((o=>{o.postMessage({cmd:"receive",msg:e,worker_id:r});}));},receivepy_bytes(e,r){t.connectedPorts.forEach((o=>{o.postMessage({cmd:"receive_bytes",msg:e,worker_id:r});}));}});t.general_initalization(i);};

const nodebuilderself = o;
nodebuilderself.nodebuilder_post_pyodide_ready = (workerState) => __awaiter(void 0, void 0, void 0, function* () {
    workerState.pyodide.runPythonAsync("from __future__ import annotations\nimport funcnodes_core as fn\n\nfn.node.ALLOW_REGISTERED_NODES_OVERRIDE = True\n\n\ndef eval_node_code(code: str):\n    ns = {}  # dedicated namespace acting as globals\n    exec(code, ns)\n    _node = [\n        cls\n        for name, cls in ns.items()\n        if isinstance(cls, type) and issubclass(cls, fn.Node)\n    ][-1]\n    return _node\n");
});
nodebuilderself.register_cmd_message("worker:evalnode", (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const node = yield ((_a = nodebuilderself.workerState.pyodide) === null || _a === void 0 ? void 0 : _a.runPythonAsync(`eval_node_code(${JSON.stringify(msg.msg)})`));
    if (!node) {
        return;
    }
    const workerstate = yield nodebuilderself.get_or_create_worker(msg.worker_id);
    workerstate.worker.clear();
    workerstate.worker.nodespace.lib.add_node(node, "demo");
    workerstate.worker.add_node(node.node_id);
}));

const globaleSlf = nodebuilderself;
globaleSlf.init_shared_worker({
    post_pyodide_ready: globaleSlf.nodebuilder_post_pyodide_ready,
});
//# sourceMappingURL=pyodideSharedWorker.js.map
