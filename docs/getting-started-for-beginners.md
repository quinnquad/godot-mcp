# Getting Started with Grok + Godot MCP (For Complete Beginners)

This guide is for someone who has **never made a game before** and wants to use Grok (with the Godot MCP tools) to build their first game.

**Tested Godot versions:** **4.6**, **4.7**, and **4.8-dev1** (including mono editor builds for 4.7/4.8 smokes). Use a matching Godot 4.x editor for best results.

**Important:** Live tools only work while your game is **in Play** and the Output panel shows the MCP bridge line (4243 for zero-footprint). If tools say they cannot connect, press Play again.

**Discover the scene** with `list_children` on `/root` or `/root/Main` (lightweight). Prefer that over dumping the entire tree with `get_tree` on big projects.

**Make a character walk** (not just twitch) using a hold:

```
simulate_input_batch steps: [{ "type": "action", "action": "move_right", "hold_ms": 500 }]
```

That keeps the action pressed across physics frames so the character actually moves.

## The Big Idea

Normally, to work with Godot you need to install plugins, edit project settings by hand, and know a lot of technical stuff.

With this setup, you mostly don't have to do any of that.

You will:
1. Have a **clean copy** of a Godot project.
2. Use Grok to do almost everything (create scenes, write code, test things, take screenshots, simulate clicks, etc.).
3. Grok will temporarily "connect" to your running game using a special tool (zero-footprint mode). This means your main project stays clean.
4. You watch what happens in Godot while Grok works.

This is called the **zero-footprint** workflow.

---

## Step 1: One-Time Setup (You Only Do This Once)

### 1.1 Get Godot
- Download Godot 4 from https://godotengine.org/download
- Use the standard version (not the .NET one unless you know you need it).

### 1.2 Get the Godot MCP Tools Working in Grok
Follow the **main README** install steps (clone this repo or use a GitHub Release tarball). Summary:

```bash
git clone https://github.com/quinnquad/godot-mcp.git
cd godot-mcp
npm install && npm run build
npm install -g .
```

Or download `godot-mcp-*.tgz` from the [Releases](https://github.com/quinnquad/godot-mcp/releases) page and run `npm install -g ./godot-mcp-*.tgz`.

> **Do not** run bare `npm install -g godot-mcp` from the public npm registry — that name is currently a different package, not this project.

Then register it with your agent (the launcher prints the exact `grok mcp add ...` command, or use the Claude Desktop JSON from the README).

Once it's set up, every time you open a new Grok chat with the MCP enabled, you should see tools related to Godot.

### 1.3 Make a "Clean Test Project"
- Create a brand new 2D Godot project (or use the one your friend gave you).
- **Important**: Work in a *copy* of any important project. Never use your only copy.
- Name it something like `MyFirstGame-Experiments`.

### 1.4 Windows / PATH tips (PowerShell + registration)
After `npm install -g .` (from a clone) or `npm install -g ./godot-mcp-*.tgz` (from a Release), fully close and reopen your terminal / Grok session (or explicitly refresh PATH in the current PowerShell):

```
$env:Path = "C:\Program Files\nodejs;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

Grok now auto-resolves bare launcher names like `godot-mcp` (npm's .cmd shim) on Windows for most cases, so the simple registration often works:

```
grok mcp add godot-mcp -- godot-mcp
```

(Team/shared project: add `--scope project` to write a `.grok/config.toml` that can be committed in your Godot repo.)

A small `.cmd` wrapper is still a robust option if you have quoting issues, multiple Node installs, or need a fixed path (see older template in git history or create one that auto-detects node + points at the build/index.js or the global shim). Use `cmd /c "npm ..."` if PowerShell execution policy blocks npm.

Always test registration in a fresh chat with the server enabled/selected. Run `grok mcp doctor godot-mcp` to verify.

---

## Step 2: How to Talk to Grok Effectively

When you start a new chat with Grok (make sure the Godot MCP is enabled), paste something like this as your first message (you can customize the game idea):

---

**Copy-paste starter prompt (example):**

```
I'm a complete beginner who has never made a game before. I want to make a simple 2D platformer where a character can run and jump, collect coins, and reach a goal.

I have a clean Godot 4 project at this path:
~/MyCleanGodotTestProject

We are using the zero-footprint Godot MCP setup. This means you can temporarily connect to my running Godot game to inspect it, take screenshots, run code, simulate input, create nodes, etc., without permanently changing my project.

Please guide me step by step. Start by:
1. Making sure the zero-footprint bridge is injected into my project.
2. Asking me to open the project in Godot and press Play (F5 or the Play button). The bridge only listens while the game is actually running. Watch the Godot Output panel for "[MCPBridge] Zero-footprint bridge active on 127.0.0.1:4243". (Persistent plugin mode uses 4242 instead.) If missing, tools fail to connect. Re-inject after a fresh MCP process if needed.
3. Then walking me through creating a basic player that can move left/right and jump.

Explain things simply. Give me one small task at a time. After each step, ask me to test it in Godot and tell you what happened (or take a screenshot if needed).

Let's begin.
```

---

## Step 3: The Normal Workflow

A typical loop with Grok will look like this:

1. You tell Grok what you want to build next.
2. Grok may ask you to inject the bridge (if it's not already active).
3. You open your Godot project and press **Play** (F5 or the Play button). The bridge only starts listening while the game is actually running.
4. Watch the Godot Output panel (bottom of the editor) for: `[MCPBridge] Zero-footprint bridge active on 127.0.0.1:4243`. Persistent mode shows the runtime on **4242** instead. If you don't see a bridge/runtime line, tools will time out or say "cannot connect".
5. Grok uses tools to look at your game (takes screenshots, inspects nodes, runs small pieces of code, etc.).
6. Grok tells you exactly what to do in the Godot editor (create nodes, attach scripts, change properties, etc.).
7. You do the small steps Grok gives you.
8. You test it, tell Grok what happened (or send a screenshot), and repeat.

If tools fail after the first Play: ask Grok to re-run the inject (the zero-footprint bridge state is per-process; a fresh server or fresh Play often needs a re-inject).

Grok can:
- Take pictures of what your game currently looks like.
- Simulate button presses or mouse movement.
- Run small test scripts live in your game.
- Create and organize nodes/scenes for you (it will give you the exact steps).
- Help debug when something is broken.

---

## Important Rules for Beginners

- Always work in a **copy** of your project when experimenting.
- Save often.
- Tell Grok the truth about what you see. If something didn't work, say so.
- You can say things like:
  - "That didn't work, here's what happened..."
  - "Can you take a screenshot so I can show you?"
  - "I don't understand what you mean by X, can you explain it more simply?"
  - "Let's start over on this part."

- It's okay (and normal) to go slowly and do one tiny thing at a time.

---

## Example First Projects (Good for Beginners)

Good starter ideas:
- Simple platformer (run + jump + collect coins)
- Top-down collector game
- Flappy Bird style game
- Breakout / Pong clone

Start small. A game with one mechanic that feels good is better than a huge unfinished project.

---

## When You're Done Experimenting

When you want to stop using the temporary bridge:

Just ask Grok to run the cleanup command:
- `cleanup_zero_footprint_bridge` with your project path.

This removes the temporary files and restores your project to a clean state.

---

This setup is still somewhat experimental, but the goal is to make it possible for people who have never coded or used Godot to still make progress with strong AI help.

If you get stuck, just tell Grok exactly what you see (or send screenshots). It can usually figure it out.

## Post-Setup Smoke / Verification Checklist
In a fresh chat with the godot-mcp server:

1. "Confirm you are using the general public godot-mcp (zero-footprint + general tools). List a few tool names."
2. "List available tools that include create_simple_player, simulate_input_batch, capture_screenshot, execute_live_script, inject_zero_footprint_bridge, cleanup_zero_footprint_bridge."
3. (After open project + Play + inject on a clean test scene): Call get_tree or get_project_info. Expect success.
4. Call create_simple_player (platformer or topdown, with movement actions that match your inputs or the defaults). Then simulate_input_batch with a few steps. Watch Godot.
5. (Optional) capture_screenshot + describe what you see.

If 3-4 pass, the base "just works" chain is solid.

## Extending with your own domain / game-specific tools
The distributed `addons/godot_mcp_runtime/runtime_server.gd` (and the zero-footprint `mcp_bridge.gd`) implement only the general/public command set.

For your own custom tools: copy the addons folder into your project (or use zero-footprint + the bridge), then in your local runtime_server.gd (or equivalent) add match arms in `_handle_cmd`, or simply use the general `execute_live_script` tool to call your existing game code.

Example skeleton (generic):

```
"my_custom_action":
    var data := cmd.get("data", {})
    # your game logic here (or call into an autoload)
    return {"status": "ok", "result": "did the thing"}
```

The agent can also drive everything via `execute_live_script` + the other general powers (screenshot, input sim, tree inspection) without any custom tool registration.

## Troubleshooting & Management (New Grok MCP Features)
These Grok Build features make godot-mcp much easier to support and use:

- `grok mcp doctor godot-mcp` — checks that the command is found and resolved, that the server starts and handshakes (protocol 2024-11-05), and reports the exact number of tools (42 for the public set). Use this first when things feel broken.
- `grok mcp list` (or `grok mcp list --json`) — shows all configured servers and their scopes.
- `/mcps` (or Ctrl+L then switch to the MCP Servers tab) — in the interactive TUI you can:
  - See if godot-mcp is enabled and how many tools it exposes.
  - Press Space to toggle it on/off live.
  - Expand to browse the actual tool list.
  - Press `r` to refresh after editing config.
  - Add or remove servers.
- Logs: Grok captures server stderr to `~/.grok/logs/mcp/godot-mcp.stderr.log` (and .jsonl etc.). Tail it when investigating startup or protocol issues.
- Project scope: Put a `.grok/config.toml` in your Godot game repository root (or subdir) with the mcp entry. Commit it. Teammates get the server configured automatically (they still need the `godot-mcp` launcher on PATH via `npm install -g .` from a clone, or install of a Release tarball — not bare registry `godot-mcp`).

Example minimal project-scoped entry (bare name works after local global install + PATH refresh):

```toml
[mcp_servers.godot-mcp]
command = "godot-mcp"
args = []
enabled = true
```

Grok walks up to the git root for `.grok/config.toml` files and merges with user config (project wins for same name).

If you have many MCP servers, the built-in `search_tool` and `use_tool` let the agent discover and call godot-mcp tools dynamically (fully-qualified names are `godot-mcp__create_simple_player` etc.).
