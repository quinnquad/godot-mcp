# godot-mcp

**Control a running Godot 4 game from Grok, Claude, or any MCP-compatible agent** — without hand-editing scripts for every experiment.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

Repository: **https://github.com/quinnquad/godot-mcp**

---

## What you get

| Capability | Tool examples |
|------------|----------------|
| Temporary bridge on a clean project | `inject_zero_footprint_bridge`, `cleanup_zero_footprint_bridge` |
| Controllable player helper | `create_simple_player` (platformer / top-down, coyote time, jump cut) |
| Live inspection | `get_tree`, `list_children`, `get_all_properties`, `capture_screenshot` |
| Drive the game | `add_input_action`, `simulate_input_batch` |
| Live GDScript | `execute_live_script` |

Two connection modes, one auto-detecting client:

| Mode | Godot side | Port | When to use |
|------|------------|------|-------------|
| **Zero-footprint** (recommended) | Temporary `MCPBridge` autoload | **4243** | Clean projects, demos, friends |
| **Persistent** | Plugin `addons/godot_mcp_runtime` | **4242** | Daily work in a long-lived project |

Live tools **probe 4242 then 4243** (or use an in-process inject registration). You do not need a manual port flag.

---

## Install (5 minutes)

**Requirements:** Node.js 18+, Godot 4, and an MCP host (Grok Build, Claude Desktop, etc.).

> **Important:** Do **not** run bare `npm install -g godot-mcp` from the public npm registry.
> That name is currently an unrelated third-party package, not this project.
> Install from **this GitHub repo** or a **GitHub Release tarball** only.

### Option A — Clone (recommended)

```bash
git clone https://github.com/quinnquad/godot-mcp.git
cd godot-mcp
npm install
npm run build
npm install -g .
godot-mcp
# Launcher prints status on stderr, then runs the MCP server on stdio.
```

### Option B — Release tarball

1. Download `godot-mcp-0.1.2.tgz` from  
   https://github.com/quinnquad/godot-mcp/releases/tag/v0.1.2  
2. Install it:

```bash
npm install -g ./godot-mcp-0.1.2.tgz
godot-mcp
```

### Register with Grok

```bash
grok mcp add godot-mcp -- godot-mcp
grok mcp doctor godot-mcp
```

Team / game repo (commit shared config):

```bash
grok mcp add --scope project godot-mcp -- godot-mcp
```

In the Grok TUI: `/mcps` or `Ctrl+L` → enable **godot-mcp**.

### Claude Desktop

```json
{
  "mcpServers": {
    "godot-mcp": {
      "command": "godot-mcp",
      "args": []
    }
  }
}
```

**Windows PATH:** After global install, reopen the terminal (or refresh PATH). Prefer the bare command `godot-mcp` — Grok resolves npm’s `.cmd` shim on Windows in most setups. If `grok` itself is missing, add your Grok install’s `bin` directory to PATH for that shell (often under the user profile `.grok` folder).

---

## First run (zero-footprint)

1. Create a **new Godot 4 2D** project (or use a disposable copy).
2. Open a **fresh** agent chat with `godot-mcp` enabled.
3. Paste the prompt from [`docs/friend-starter-prompt.md`](docs/friend-starter-prompt.md) (set your real project path).
4. When the agent injects the bridge, **open the project in Godot and press Play (F5)**.
5. In the **Output** panel, confirm:

   ```text
   [MCPBridge] Zero-footprint bridge active on 127.0.0.1:4243
   ```

6. Let the agent call `get_tree`, `create_simple_player`, etc.

If tools fail after a new chat or rebuild: ask the agent to **re-run inject** (injection state is per MCP process). The server still auto-detects port **4243** if the bridge is already running.

Full walkthrough: [`docs/getting-started-for-beginners.md`](docs/getting-started-for-beginners.md).

---

## Persistent mode (optional)

1. Copy `addons/godot_mcp_runtime/` into your Godot project.
2. Project → Project Settings → Plugins → enable **Godot MCP Runtime**.
3. Press Play — tools talk to **4242**.

---

## Design goals

- **Human does almost no scripting** for the first controllable character.
- **Clean projects stay clean** unless you choose to save/bake nodes into `.tscn` files.
- **Public package is general Godot only** — no private game-specific tools or branding.

See [`MVP.md`](MVP.md) for scope and [`RELEASE.md`](RELEASE.md) for release checks.

---

## Project layout

```text
bin/godot-mcp.js          # User-facing launcher
src/index.ts               # Public MCP server (general tools)
src/bridge/                # Zero-footprint inject + runtime port selection
addons/godot_mcp_runtime/ # Persistent plugin + mcp_bridge.gd source
docs/                      # Beginner guide + friend starter prompt
```

---

## Development

```bash
git clone https://github.com/quinnquad/godot-mcp.git
cd godot-mcp
npm install
npm run build
npm test                  # runtime port selection tests
node build/index.js       # Public surface on stdio
```

---

## License

MIT — as declared in `package.json`.

## Contributing

Improvements to general tools, zero-footprint reliability, docs, and the launcher are welcome via pull request. Keep the public surface free of private game-specific tools and personal machine paths.
