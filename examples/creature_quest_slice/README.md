# Creature Quest Slice

**Pokémon-style vertical slice** shipped as an example for **[godot-mcp](https://github.com/quinnquad/godot-mcp) 0.1.4**.

| | |
|--|--|
| **Engine** | Godot **4.7** stable (GDScript-only; mono or standard) |
| **What you get** | Top-down overworld → tall-grass encounter → 1v1 turn-based battle |
| **IP** | Original creatures only (Emberpup, Leafcub, Tidalkip, Rockbit) — no Nintendo assets/names |

## Play locally

1. Open this folder in **Godot 4.7** (Project → Import, or drag `project.godot`).
2. Press **Play (F5)**.
3. Move with **WASD** or **arrow keys**.
4. Walk into the **green tall grass** to start a battle.
5. Click a **move** each turn. Higher **Speed** acts first. Damage uses **Level / Attack / Defense / move power** and a small **type chart** (Fire > Grass, etc.).
6. When one side faints you see **YOU WIN** or **YOU LOSE**, then return to the overworld.

```text
# Or from a terminal (adjust the Godot binary path):
godot --path /path/to/creature_quest_slice
```

## Combat tests (headless)

Pure battle math lives under `scripts/combat/` and is what the battle UI uses. Run automated tests:

```bash
godot --headless --path . --script res://tests/run_combat_tests.gd
```

Launch/load smoke (scenes + one combat resolve):

```bash
godot --headless --path . --script res://tests/smoke_launch.gd
```

Both should exit **0**.

## Use with godot-mcp 0.1.4

This project is intentionally **clean** (no permanent MCP addon). Use the **zero-footprint** bridge:

1. Install and enable **godot-mcp** 0.1.4 in your MCP host (Grok, Claude Desktop, etc.).
2. Ask the agent to run **`inject_zero_footprint_bridge`** with this project’s path.
3. Open the project in Godot 4.7 and press **Play (F5)**.
4. Confirm Output shows: `[MCPBridge] Zero-footprint bridge active on 127.0.0.1:4243`
5. Agent tools that work well on this demo:
   - **`list_children`** / **`get_tree`** — inspect overworld or battle UI
   - **`simulate_input_batch`** — e.g. hold `move_right` to walk into grass  
     `[{ "type": "action", "action": "move_right", "hold_ms": 2500 }]`
   - **`execute_live_script`** — e.g. call battle UI `mcp_pick_move(1)` for Ember Rush
   - **`capture_screenshot`** — optional visual proof

**Optional persistent mode:** copy `addons/godot_mcp_runtime` from the godot-mcp repo into this project, enable the plugin, Play → port **4242**.

When finished testing zero-footprint, run **`cleanup_zero_footprint_bridge`** so `project.godot` is restored.

## Layout

```text
project.godot
scenes/
  overworld.tscn      # main scene — player + tall grass
  battle.tscn         # move menu, HP, win/lose
scripts/
  game_state.gd       # autoload: overworld ↔ battle
  combat/             # pure modules (tested headless)
  overworld/
  battle/
tests/
  run_combat_tests.gd
  smoke_launch.gd
```

## Design notes

- Combat is **pure** (`RefCounted` classes) so tests call the same code as the game.
- Type chart is deliberately small (Normal, Fire, Water, Grass, Rock).
- Placeholder shapes/colors only — easy to ship with the MCP package as a self-contained demo.
