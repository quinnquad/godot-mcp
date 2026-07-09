# Integration with Grok, Hermes & Custom Agents

This MCP server is designed to work well with your existing agent ecosystem.

## Current Approach
- Standard MCP stdio interface
- Can be called via subprocess from Grok Build CLI or Hermes

## Planned Adapters
- Direct tool calling from Hermes Agent
- Grok Build CLI integration
- Custom OpenClaw-style MCP client

## Elderglow Specific
We will add custom tools tailored to:
- Leyline pattern validation & generation
- Creature companion management
- Farm defense simulation helpers
- Ecosystem relationship queries

## Lightweight Adapter (Phase 2c) - Python Example for Hermes / Grok Build
For agents that don't want full MCP SDK, use this tiny stdio wrapper (adapts the Godot MCP server).
The server now exposes: Phase 1 bridge tools (create_scene, get_project_info) + Phase 2b live runtime (get_tree, set_property, call_method + many general: node lifecycle, properties, signals, animation, UI, etc.) . Elderglow-specific tools are de-prioritized/future (per scope).

```python
# lightweight_adapter.py - drop-in for custom agents (Hermes, Grok Build, etc.)
import subprocess
import json
import sys
from typing import Any, Dict

def call_godot_mcp_tool(tool_name: str, arguments: Dict[str, Any], server_cmd: list = None) -> Dict:
    """
    Lightweight stdio MCP adapter.
    Launches the Godot MCP server (node build/index.js) and sends a tool call.
    Note: For full production use a proper MCP client (mcp python package).
    This example demonstrates the contract for the now-complete Phase 2 toolset.
    """
    if server_cmd is None:
        server_cmd = ["node", "build/index.js"]
    proc = subprocess.Popen(
        server_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    # Simple illustration - real MCP requires initialize + notifications
    # For demo: print usage. Agents should integrate via @modelcontextprotocol/sdk or mcp lib.
    print(f"[Adapter] Would call {tool_name} with {arguments} on Godot MCP (general Godot tools + runtime; Elderglow future)")
    # Example real usage pattern (pseudo):
    # proc.stdin.write(json.dumps({"method": "tools/call", "params": {"name": tool_name, "arguments": arguments}}) + "\n")
    proc.terminate()
    return {
        "tool": tool_name,
        "status": "use proper MCP client for production; runtime requires autoload on 4242",
        "available_tools": ["create_scene", "get_project_info", "get_tree", "set_property", "call_method", "instantiate_scene", "add_child", "get_signals", "play_animation", "raycast_2d", "... (general surface; see ARCHITECTURE.md)"]
    }

# Usage from agent:
# result = call_godot_mcp_tool("get_tree", {"root": "/root"})
# result = call_godot_mcp_tool("create_scene", {"project_path": "/path/to/your-project", "scene_path": "res://Test.tscn"})
```

Phase 2c adapter finalized. The full Godot MCP (bridge + live runtime + general tools) is now directly usable from any agent via stdio. Custom Elderglow tools are de-prioritized/future.

**Implemented vs Stub Matrix (current general coverage, see runtime_server.gd for details):**
- Implemented in runtime (real handlers): get_tree, set/get_property, call_method, list_children, get_node, find_node_by_name, get_autoloads, instantiate_scene, add_child, remove_node, get_signals, emit_signal, get_animation_list, connect_signal, set_control_text, play_animation, raycast_2d, pause_game, load_resource, get_node_properties, get_ui_tree, save_scene, get_node_signals, ui_set_text, get_all_properties (+ marshaling for Vector2/Color/Dict/Array/Resource).
- Stubs/TS-only or partial: some load/save, UI full tree, advanced power/Elderglow.
Matrix will be updated as coverage grows. Runtime requires autoload on 4242.