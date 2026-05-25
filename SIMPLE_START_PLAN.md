# Simple Start Plan for Godot MCP + Elderglow + Your Agents

**Goal**: Get Godot + AI agent integration working for Elderglow development as quickly and simply as possible.

## Phase 1: Minimal Viable Integration (Start Here - Recommended)

**Objective**: Let your agents (Grok, Hermes) control Godot without needing a full MCP client.

### Approach
Use **direct Godot CLI + GDScript operations** first. This is the simplest path.

**What you get**:
- Run Godot headless
- Execute operations (create scenes, add nodes, save, etc.)
- Capture output and errors
- No MCP server complexity initially

**Implementation**:
1. Improve `scripts/godot_operations.gd` to accept JSON commands via command line.
2. Create a thin wrapper script (`bridge/direct_godot.py` or `.js`).
3. Your agents call the wrapper with simple commands.

**Example flow**:
```bash
python bridge/direct_godot.py --operation create_scene --project /path/to/elderglow --name TestScene
```

## Phase 2: Add MCP Layer + Simple Bridge

Once Phase 1 is working, add the full MCP server and a lightweight bridge.

### Simple Bridge Concept
A small script that:
- Spawns the Godot MCP server as a subprocess
- Exposes tools via simple JSON over stdio or HTTP
- Your custom agents (Hermes, Grok Build) can call it without implementing full MCP

**Recommended Bridge Type**: Node.js or Python stdio JSON bridge.

## Phase 3: Full Integration & Custom Tools

- Runtime TCP interaction (from advanced forks)
- Elderglow-specific tools (leyline patterns, creatures, etc.)
- Deep integration with OpenClaw / Hermes

## Immediate Next Actions

1. [ ] Improve `godot_operations.gd` to handle JSON operations properly
2. [ ] Create `bridge/direct_godot.py` (Phase 1 bridge)
3. [ ] Test with a simple Elderglow scene creation command
4. [ ] Add MCP server functionality
5. [ ] Build MCP-to-simple bridge

## Files to Create / Improve
- `bridge/direct_godot.py` (or .js)
- `bridge/mcp_bridge.py`
- Expand `scripts/godot_operations.gd`

## Notes for Quinn
This plan prioritizes speed and simplicity while keeping a path open to the more powerful MCP approach later.