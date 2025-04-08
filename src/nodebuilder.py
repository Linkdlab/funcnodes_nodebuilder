from __future__ import annotations
import funcnodes_core as fn

fn.node.ALLOW_REGISTERED_NODES_OVERRIDE = True


def eval_node_code(code: str):
    ns = {}  # dedicated namespace acting as globals
    exec(code, ns)
    _node = [
        cls
        for name, cls in ns.items()
        if isinstance(cls, type) and issubclass(cls, fn.Node)
    ][-1]
    return _node
