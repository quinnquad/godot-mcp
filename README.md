# godot-mcp

Control Godot from Grok (and other agents) with **almost no setup** and **zero script editing** on your part.

The zero-footprint workflow lets an AI temporarily connect to your running Godot game on a completely clean project, take screenshots, run live code, simulate input, create and modify nodes, etc. — without permanently polluting your project.

When you're happy with something, the AI (or the provided helpers) can bake the results into your local `.tscn` and `.gd` files so they persist after you stop Play.

## The Hero Experience (What Most People Want First)

1. Clean Godot 4 2D project.
2. One or two commands to get the MCP side working.
3. Paste a starter prompt into a fresh Grok chat.
4. Grok creates a real keyboard-controllable CharacterBody2D platformer (with coyote time, jump cut, proper acceleration/friction) + basic level.
5. The character is baked into your local scene files and survives stopping Play.
6. You keep iterating live (screenshots, live tweaks, input simulation) while the game runs.
7. Easy cleanup when you want the project clean again.

This is deliberately designed so a non-technical friend (or a fresh Grok session) can have a productive time without you editing any scripts.

## Quick Start (Zero-Footprint — Recommended for Clean Projects)

See the full beginner guide: `docs/getting-started-for-beginners.md`

See the exact "paste this into a brand new chat" prompt for a friend or yourself: `docs/friend-starter-prompt.md`

**High-level**:
- Install the server (e.g. `npm install -g godot-mcp` or the equivalent for your setup).
- Register it with your agent (`grok mcp add ...` or the Claude Desktop equivalent — the launcher will print the exact command).
- Create/open a clean Godot 4 project (or use the provided starter template that already has a baked controllable player).
- Open a fresh chat, paste the starter prompt (pointing at your clean project path).
- Follow the tiny steps Grok gives you. It will tell you exactly when to inject (if needed) and when to open Godot + press Play.

The first time you Play after the AI works, you should have a real controllable character.

## Two Modes

- **Zero-Footprint (the easy/clean one)**: Temporary bridge injected only when needed. Perfect for testing, friends, or anyone who hates committing addons. This is the primary mode highlighted for beginners.
- **Persistent (power users)**: One-click plugin (`addons/godot_mcp_runtime`) + autoload. Always on while your game is running. Good for deep daily work inside a long-lived project.

Both are supported. The docs default to zero-footprint for the lowest friction.

## Key Superpowers (Why This Feels Magical)

- `create_simple_player` — high-level helper that gives you a real platformer (or top-down) CharacterBody2D with coyote time, variable jump, proper accel/friction, and optional sprite. Works great via zero-footprint.
- Full runtime input action management — add the exact actions your player needs at runtime so simulation and keyboard control just work.
- `simulate_input_batch` — drive the character (or UI) from the agent.
- `capture_screenshot` — the agent can actually *see* your game.
- `execute_live_script` — run arbitrary GDScript safely inside the live scene (with proper deferred scheduling so it doesn't block the bridge).
- All the usual Godot power tools (tree inspection, properties, node lifecycle, signals, animation, raycasts, etc.) plus complex type support.

## Persistence (Changes That Survive Play Stop)

Runtime changes (nodes created while the game is running) are normally ephemeral.

This project includes a simple, reliable "bake" story:
- The AI (or you via the provided `create_persistent_player.gd` helper) can serialize the current useful state into your local `.tscn` + supporting `.gd` files.
- After baking, the player + level exist in the editor and survive stopping/ restarting Play.
- You can keep using the live tools to iterate, then bake again.

See the starter template and the friend prompt for the exact workflow.

## Cleanup

Zero-footprint injections are designed to be temporary. Use the `cleanup_zero_footprint_bridge` tool (or the equivalent command the agent will give you) when you're done experimenting on a clean project. Your project.godot and addons folder go back to their previous state.

## For Complete Beginners / Giving This to a Friend

Start here: `docs/getting-started-for-beginners.md`

Exact paste-in prompt for a fresh Grok chat: `docs/friend-starter-prompt.md`

The experience is deliberately written so the human does almost no technical work — Grok drives using the tools, you just do the tiny Godot editor steps it tells you (or let it do even more via live execution + bake).

## Installation & Registration Details

See the full docs for the current one-line / copy-paste instructions for your agent host.

After installation you will have a `godot-mcp` command (or equivalent) that starts the server and prints the exact registration command + status for both modes.

## Project Structure (for contributors / the curious)

- `src/` — TypeScript MCP server.
- `bin/` — the user-facing launcher (cross-platform).
- `addons/godot_mcp_runtime/` — the persistent plugin (copy this folder into a Godot project and enable it in Plugins for always-on 4242 mode).
- The zero-footprint path copies `mcp_bridge.gd` (the actual bridge that runs inside Godot) on demand.
- `docs/` — beginner guides + the friend handoff prompt (these are the most important user-facing docs).

## Contributing & Iterating

This MVP is intentionally small so that other people (and the community) can start using it and making it better.

See the plan (in the development session) and the `MVP.md` for the current scope and what "minimum but high ease-of-use" means.

Improvements to the general Godot tools, the zero-footprint experience, the launcher, docs, or the starter template are all very welcome.

## License

MIT (see package.json).

---

**This is the v0.1 public/general surface.** The goal is a reliable, low-friction way for anyone to have an AI that can truly help build and test inside Godot — especially on clean projects — without the human having to become a bridge expert or edit scripts by hand.

See `MVP.md` for the exact definition of what ships (and what explicitly does *not* ship) in this minimum release.

Start with the beginner docs or the friend prompt. Have fun building.