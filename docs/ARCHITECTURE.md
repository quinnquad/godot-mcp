# Architecture

## Current Base
- TypeScript MCP server (stdio)
- Godot CLI + GDScript helper for operations

## Planned (from advanced forks like 149-tool versions)
- TCP-based runtime interaction server (autoload in running game)
- Much richer set of tools for live editing, signals, animation, UI, etc.

## Elderglow Focus (Future)
- Custom tools for leyline pattern validation, creature companions, ecosystem, defense (de-prioritized until project setup; see general tools below for current focus)
- These will be added later on top of the general Godot foundation.

## Phase 2b Minimal Runtime TCP Protocol (MVP)
**Transport**: TCP localhost:4242 (hardcoded for MVP; Godot autoload listens, MCP tools connect as client).
**Format**: One JSON object per line (terminated by \n). No framing beyond that. UTF-8.
**Commands (minimal set for live control)**:
- `{"cmd": "get_tree", "root": "/root"}` → `{"status": "ok", "data": {"name": "...", "children": [...]}}` (simple tree dump)
- `{"cmd": "set_property", "node_path": "/root/Node2D/Child", "property": "position", "value": [10, 20]}` → `{"status": "ok"}`
- `{"cmd": "call_method", "node_path": "/root/Node2D", "method": "queue_free", "args": []}` → `{"status": "ok"}`
- Additional implemented general: get_property, add_child, remove_node, instantiate_scene, get_signals, emit_signal, get_animation_list, etc. (see runtime_server.gd for full; basic Vector2 marshaling supported via helpers)
**Responses**: Always `{"status": "ok", "data": ...}` or `{"status": "error", "message": "reason"}`.
**Notes**: No auth, no TLS for MVP. Godot side uses TCPServer + JSON.parse. Client in TS MCP uses net.Socket. This enables live editing while game runs (complements Phase 1 headless bridge). Extract autoload stub from scripts/godot_operations.gd comments for registration as Godot autoload.

## Phase 2d Optional Power Features (Advanced)
From advanced forks (e.g. 149-tool versions) and Elderglow needs:
- Animation: play_animation, stop_animation, get_animation_list
- Signals: get_node_signals, connect_signal, emit_signal
- UI/Controls: ui_set_text, ui_click, get_focused_control
- Advanced Runtime: get_all_properties, set_script_variable, call_deferred, inspect_node (full dump)
- Elderglow Power: full leyline solver, creature AI step, ecosystem tick with pests, defense wave simulation
These are stubbed in the MCP server (see src/index.ts) and can be wired to the runtime autoload or bridge in future increments.
The current Phase 2 server (2a foundation + 2b live + 2c adapter/Elderglow) provides the base for these power features.

## General Godot Tool Categories (Phase 2 Adjusted Focus)
Per scope: prioritize general, reusable Godot capabilities for any 2D/3D project before Elderglow specifics.

**Current / Stubbed General Tools (MCP + Runtime):**
- Scene/Node Lifecycle: create_scene (Phase 1), instantiate_scene, add_child, remove_node, reparent_node, duplicate_node, load_scene, save_scene
- Properties: get_property, set_property, get_node_properties, get_all_properties (supports complex types)
- Methods & Core: call_method
- Signals: get_signals, connect_signal, emit_signal
- Animation: play_animation (and stubs for stop/seek/list)
- UI/Controls: ui_set_text (and stubs for tree/click)
- Tree Introspection: get_tree
- Project/Resources: get_project_info, load/save resources (stubs)
- Physics/Debug (stubs): raycast_2d, overlaps, debug_print, pause/step
- Power/Advanced (from forks): get_node_signals, etc.

**Runtime Protocol Extension (in autoload stub):**
Extend beyond MVP with cmds for above (e.g. "instantiate_scene", "get_property", "get_signals", "play_animation", "raycast_2d", project queries).
See scripts/godot_operations.gd comment block for full list and implementation skeletons.

This gives a rich, general-purpose Godot MCP for scene editing, live debugging, UI work, etc., usable with any Godot project. Elderglow tools can layer on top later.

**Current Implemented vs Stub Status (as of latest fixes):**
- Fully implemented in runtime autoload (real _handle_cmd): get_tree, set_property, call_method, get_property, list_children, get_node, find_node_by_name, get_autoloads, instantiate_scene, add_child, remove_node, get_signals, emit_signal, get_animation_list, connect_signal, set_control_text, play_animation, raycast_2d, pause_game, load_resource, get_node_signals, ui_set_text, get_all_properties (dispatch routing + GD handlers complete post-verifier fix).
- Stubs or TS-only (need runtime extension or bridge): load_scene, save_scene, get_node_properties, get_ui_tree, load_resource (partial), many power/Elderglow future.
See runtime_server.gd for exact match cases. Matrix will be expanded as coverage grows.

## Dual-Mode Architecture (Elderglow-Focused - Phase 0 Alignment)
**Persistent Daily Mode** (existing, 100% preserved): One-click plugin enables GodotMCPRuntime autoload on TCP 127.0.0.1:4242 (line-delimited JSON). Primary for Elderglow iteration. All current general + future domain tools (leyline/creature/ecosystem/defense) here for speed.
**Zero-Footprint On-Demand Mode** (new): MCP TS server temporarily injects lightweight bridge script (Elderglow-optimized, modeled on required screenshot/input/live-exec needs) + edits project.godot (with backup+guaranteed cleanup/repair). Length-prefixed framed protocol (robust for images/bin). Self-clean on detach. Ideal for testing new Elderglow builds clean.
**Protocol Abstraction**: Unified MCP tools surface. Persistent uses current \n-JSON; zero-footprint uses framed (esp. for viewport PNGs). Handlers route intelligently (general/Elderglow on both; heavy like screenshots prefer zero-footprint).
**Injection Strategy (high-level)**: Server copies minimal bridge to target, temp-patches autoloads in project.godot (atomic restore), attaches, monitors, cleans on stop/error. Robust detection/repair for edge cases.
**Elderglow Prototypes (next spike priority)**: Screenshot/viewport capture (Viewport texture -> PNG/base64; Elderglow glow options) + batched input sim (keys/mouse/actions/UI by path; sequences for leyline UIs/defense tests). Wire first to persistent (fast Elderglow value), then zero-footprint. Unlocks "see + act + verify" agent loops on gameplay systems.
Existing TCP 4242 + plugin untouched. No breaking changes.