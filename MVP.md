# godot-mcp v0.1 Minimum Shippable MVP

**Goal (user priority — ease of use / zero-friction first)**: A minimal but delightful package so that a motivated Godot user (or their non-technical friend) + a Grok (or compatible) agent can have a powerful "the AI can directly see and control things inside my running Godot game" experience on a clean project, with almost no manual setup and **zero script editing required by the human**.

The hero experience: from a completely clean Godot 4 2D project → one or two commands → paste a starter prompt → Grok creates (and bakes) a real keyboard-controllable CharacterBody2D platformer player with proper coyote time, jump cut, acceleration, and a basic level (floor + platforms). The character persists in the user's local .tscn files. The user can keep iterating live (screenshots, live code execution, input simulation, inspections) while the game runs. Easy cleanup when desired.

## What Ships in v0.1 MVP (Strict Scope)

**Included (the public/general surface)**:
- Zero-footprint on-demand injection (temporary, self-cleaning bridge for clean projects — the primary "easy for friends / clean checkouts" mode).
- The full set of general, reusable Godot tools (~50+), with special emphasis on the high-ease-of-use superpowers:
  - `create_simple_player` (platformer or topdown, with coyote time + jump cut + sensible defaults).
  - Full runtime input action management (`add_input_action`, `list_input_actions`, etc.) so `simulate_input_batch` actually works for custom controls.
  - `simulate_input_batch` (action presses, delays, mouse moves).
  - `capture_screenshot` (so the agent can "see").
  - `execute_live_script` (arbitrary GDScript with full SceneTree access, safely scheduled + deferred).
  - All the standard general tools (get_tree, get/set properties, node lifecycle, signals, animation, UI, physics raycast, debug, resources, introspection, etc.).
- The hardened `mcp_bridge.gd` (the file that gets injected or used by the persistent plugin) containing the reliable implementations.
- A cross-platform `godot-mcp` launcher (after `npm install -g` or equivalent) that starts the server and prints clear status + next steps.
- Clean, beginner-first, path-agnostic documentation + the polished friend-starter prompt.
- A ready-to-use minimal "starter platformer" template project (already containing a baked controllable player + floor + camera so the first Play feels magical).
- Persistence story: changes made via the agent can be baked into the user's local scene files (so they survive stopping Play) using the provided patterns / helper.
- Clear registration instructions for common MCP hosts (Grok, Claude Desktop, etc.) that work after a standard install.
- Explicit, one-command cleanup for zero-footprint injections.
- Both modes documented (zero-footprint for clean/easy, persistent plugin for power users who want always-on), with zero-footprint as the recommended first path for most people.

**Explicitly NOT included in the public v0.1 MVP** (hard constraint):
- Any and all Elderglow-specific tools, data, handlers, examples, or branding. (Elderglow remains private and can be layered on later as an optional extension.)
- The full "private" tool surface.
- Any internal history docs (e.g. PUBLIC_PRIVATE_SPLIT.md is not part of the user-facing package).
- Complex installers, AssetLib submission, or fancy GUIs for v0.1.

## Two Modes

1. **Zero-Footprint / On-Demand (hero for ease of use + clean projects)**  
   Temporary injection only when needed. No permanent pollution of the user's project unless they choose to bake/save. Ideal for testing, friends, experimenting, or people who don't want addons committed.

2. **Persistent Plugin (power-user mode)**  
   One-click `addons/godot_mcp_runtime` plugin + autoload. Always available while the game is running. Good for deep daily work inside a long-lived project.

## Quickstart (What the End User Will Do)

(See the polished docs/getting-started-for-beginners.md and friend-starter-prompt.md for the exact copy-paste experience.)

Rough flow:
1. `npm install -g godot-mcp` (or equivalent one-line).
2. `grok mcp add godot-mcp` (or the equivalent for their client) — the launcher prints the exact command.
3. Create/open a clean Godot 4 2D project (or use the provided starter template).
4. Open a fresh Grok chat (MCP enabled), paste the starter prompt (pointing at their clean project path).
5. Follow the (very small) steps. Grok will tell them when to run the inject (if using zero-footprint), when to open the project and press Play, etc.
6. End result: a real controllable player that persists locally + the ability to keep working with the AI live.

## Success Criteria for v0.1

- A person who has never used this before can, by following *only* the published instructions + one starter prompt, reach a keyboard-controllable platformer character that survives stopping Play, in under ~30 minutes of wall time, with almost no manual node/script work in the Godot editor.
- Setup is path-agnostic (no "edit this /your-drive path").
- Both modes work and are documented, zero-footprint being the low-friction default for clean use.
- Cleanup is obvious and safe.
- The "give to a friend / non-technical person" path (via the starter prompt) is the primary happy path in the beginner docs.
- No Elderglow-specific content leaks into anything an end user or stranger would install or read as part of the public MVP.
- All changes in the godot-mcp repo itself were done surgically, with proper discipline.
- The Windows robustness, mandatory Play + watch Output, re-inject, fresh-chat, smoke checklist, and "extend for your own domain tools" lessons (generalized, Elderglow-free) have been incorporated into the public user-facing docs (README, getting-started, friend-starter, MVP, RELEASE).

## Current Status (as of plan approval)

The core engine (zero-footprint + rich general tools + create_simple_player + input system + safe live execution + baking for persistence + starter prompt) has already been built and end-to-end verified on clean projects (see prior E2E + /check-work PASS).

The remaining MVP work is primarily **packaging, launcher, docs polish, template, and release process** — exactly the "box and instructions" layer needed to hand this to people so they (and the community) can start using and improving it.

See the full phased plan in plan.md (in the session directory) for the detailed breakdown, verification steps, and open decisions.

This MVP is deliberately minimum while ruthlessly protecting the high ease-of-use bar the project has always demanded.

---

**Next**: Execute the phases in the full plan, starting with Phase 0 audit (already partially executed in the planning session — see the audit findings recorded in the plan.md). 

All public artifacts will be audited for (and must contain zero) Elderglow-specific content before any release.