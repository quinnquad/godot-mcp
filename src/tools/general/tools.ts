// General (public) Godot tools
// This file contains all reusable, general (non-game-specific) tool definitions.
// This module (and its subfolders in the future) is what will form the core of the public/open-source version.

export const generalTools = [
  { name: "get_project_info", description: "Get basic project info", inputSchema: { type: "object", properties: {} } },
  { name: "get_tree", description: "Live: dump scene tree from running game (requires autoload on 4242)", inputSchema: { type: "object", properties: { root: { type: "string" } } } },
  { name: "set_property", description: "Live: set node property in running game", inputSchema: { type: "object", properties: { node_path: { type: "string" }, property: { type: "string" }, value: {} } } },
  { name: "call_method", description: "Live: call method on node in running game", inputSchema: { type: "object", properties: { node_path: { type: "string" }, method: { type: "string" }, args: { type: "array" } } } },
  { name: "get_node_signals", description: "2d power: list connected signals on node (from advanced forks)", inputSchema: { type: "object", properties: { node_path: { type: "string" } } } },
  { name: "ui_set_text", description: "2d power: set text on Control/UI node (from advanced forks)", inputSchema: { type: "object", properties: { node_path: { type: "string" }, text: { type: "string" } } } },
  { name: "get_all_properties", description: "2d power: dump all properties of a node (advanced runtime)", inputSchema: { type: "object", properties: { node_path: { type: "string" } } } },
  // General Godot tools (Phase 2 general focus - useful for any 2D/3D project)
  { name: "instantiate_scene", description: "General: instantiate a PackedScene at a node path (live runtime)", inputSchema: { type: "object", properties: { scene_path: { type: "string" }, parent_path: { type: "string" }, name: { type: "string" } } } },
  { name: "add_child", description: "General: add a child node to a parent (live)", inputSchema: { type: "object", properties: { parent_path: { type: "string" }, child_path: { type: "string" } } } },
  { name: "remove_node", description: "General: remove a node from the tree (live)", inputSchema: { type: "object", properties: { node_path: { type: "string" } } } },
  { name: "reparent_node", description: "General: reparent a node (live)", inputSchema: { type: "object", properties: { node_path: { type: "string" }, new_parent_path: { type: "string" } } } },
  { name: "duplicate_node", description: "General: duplicate a node (live)", inputSchema: { type: "object", properties: { node_path: { type: "string" }, new_name: { type: "string" } } } },
  { name: "load_scene", description: "General: load a scene (can be used headless or live)", inputSchema: { type: "object", properties: { scene_path: { type: "string" } } } },
  { name: "save_scene", description: "General: save current scene or node as .tscn (headless via bridge or live)", inputSchema: { type: "object", properties: { node_path: { type: "string" }, scene_path: { type: "string" } } } },
  // More general: properties & signals
  { name: "get_property", description: "General: get any node property (supports complex types)", inputSchema: { type: "object", properties: { node_path: { type: "string" }, property: { type: "string" } } } },
  { name: "get_node_properties", description: "General: dump multiple or all properties of a node", inputSchema: { type: "object", properties: { node_path: { type: "string" }, properties: { type: "array" } } } },
  { name: "get_signals", description: "General: list signals on a node (with connections)", inputSchema: { type: "object", properties: { node_path: { type: "string" } } } },
  { name: "connect_signal", description: "General: connect a signal (live)", inputSchema: { type: "object", properties: { emitter_path: { type: "string" }, signal: { type: "string" }, target_path: { type: "string" }, method: { type: "string" } } } },
  { name: "emit_signal", description: "General: emit a signal on a node (live)", inputSchema: { type: "object", properties: { node_path: { type: "string" }, signal: { type: "string" }, args: { type: "array" } } } },
  // Animation, UI, Resources, Project, Physics, Debug (general Godot)
  { name: "play_animation", description: "General: play/stop/seek AnimationPlayer (live; overlaps power stub)", inputSchema: { type: "object", properties: { player_path: { type: "string" }, anim_name: { type: "string" }, action: { type: "string" } } } },
  { name: "get_animation_list", description: "General: list animations on AnimationPlayer", inputSchema: { type: "object", properties: { player_path: { type: "string" } } } },
  { name: "get_ui_tree", description: "General: dump Control/UI subtree", inputSchema: { type: "object", properties: { root_path: { type: "string" } } } },
  { name: "set_control_text", description: "General: set text on Label/Button/etc (live)", inputSchema: { type: "object", properties: { node_path: { type: "string" }, text: { type: "string" } } } },
  { name: "load_resource", description: "General: load Resource (headless or live)", inputSchema: { type: "object", properties: { resource_path: { type: "string" } } } },
  { name: "get_autoloads", description: "General: list project autoloads/singletons", inputSchema: { type: "object", properties: {} } },
  { name: "raycast_2d", description: "General: 2D physics raycast (live runtime)", inputSchema: { type: "object", properties: { from: { type: "array" }, to: { type: "array" }, collision_mask: { type: "number" } } } },
  { name: "debug_print", description: "General: print to Godot console / push_error (live or bridge)", inputSchema: { type: "object", properties: { message: { type: "string" }, level: { type: "string" } } } },
  { name: "pause_game", description: "General: pause/step the game tree (live)", inputSchema: { type: "object", properties: { action: { type: "string" } } } },
  // Additional general Godot tools (editor/runtime useful for typical 2D projects)
  { name: "list_children", description: "General: list direct children of a node", inputSchema: { type: "object", properties: { node_path: { type: "string" } } } },
  { name: "get_node", description: "General: get basic info about a node", inputSchema: { type: "object", properties: { node_path: { type: "string" } } } },
  { name: "find_node_by_name", description: "General: find first descendant node by name (recursive)", inputSchema: { type: "object", properties: { root_path: { type: "string" }, name: { type: "string" } } } },
  { name: "capture_screenshot", description: "Live: capture viewport screenshot (path+size). Works on persistent 4242 or zero-footprint 4243 after injection.", inputSchema: { type: "object", properties: {} } },
  { name: "simulate_input_batch", description: "Live: batched input (steps: action/mouse_move/delay). Use to control characters or UI. Works on persistent 4242 or zero-footprint 4243 after injection.", inputSchema: { type: "object", properties: { steps: { type: "array" } } } },
  { name: "execute_live_script", description: "Live: execute arbitrary GDScript with full SceneTree access (great for rapid prototyping, creating objects, attaching scripts, etc.). Works on persistent 4242 or zero-footprint 4243 after injection. Use carefully.", inputSchema: { type: "object", properties: { code: { type: "string" } } } },
  // Input action management (critical for creating controllable characters via simulate_input_batch)
  { name: "list_input_actions", description: "Live: list current input actions and their bound events. Essential before using simulate_input_batch with custom actions. Works on both bridges.", inputSchema: { type: "object", properties: {} } },
  { name: "add_input_action", description: "Live: add a new input action at runtime so simulate_input_batch can use it (e.g. 'jump'). events can be array of key strings like ['KEY_SPACE', 'KEY_W']. Works on both 4242 and 4243. Note: changes are runtime only, not saved to project.godot.", inputSchema: { type: "object", properties: { name: { type: "string" }, events: { type: "array" }, deadzone: { type: "number" } } } },
  { name: "remove_input_action", description: "Live: remove a runtime-added input action. Works on both bridges.", inputSchema: { type: "object", properties: { name: { type: "string" } } } },
  { name: "has_input_action", description: "Live: check if an input action currently exists. Works on both bridges.", inputSchema: { type: "object", properties: { name: { type: "string" } } } },
  // High-level helper for the common "create something I can control" use case
  { name: "create_simple_player", description: "Live: create a ready-to-use controllable CharacterBody2D player. Supports 'platformer' (with coyote time + jump cut) or 'topdown'. Pass texture_path for a real sprite instead of placeholder. Works great on zero-footprint 4243.", inputSchema: { type: "object", properties: { parent_path: { type: "string" }, name: { type: "string" }, movement_type: { type: "string" }, speed: { type: "number" }, jump_velocity: { type: "number" }, left_action: { type: "string" }, right_action: { type: "string" }, jump_action: { type: "string" }, texture_path: { type: "string" } } } },
  // Zero-footprint infrastructure tools (general / public)
  { name: "inject_zero_footprint_bridge", description: "Zero-footprint: temporarily inject MCP bridge into project for clean testing (no main project pollution). Edits project.godot + copies bridge. Params: project_path, [port=4243]. Cleanup required after. WARNING: for testing only.", inputSchema: { type: "object", properties: { project_path: { type: "string" }, port: { type: "number" } } } },
  { name: "cleanup_zero_footprint_bridge", description: "Zero-footprint: cleanup injected bridge (restore project.godot, delete temp files). Param: project_path.", inputSchema: { type: "object", properties: { project_path: { type: "string" } } } },
  { name: "list_zero_footprint_injections", description: "Zero-footprint: list currently injected projects (for clean test management).", inputSchema: { type: "object", properties: {} } }
];
