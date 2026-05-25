# Context for Godot MCP + Elderglow Development

**Last Updated:** May 24, 2026
**Purpose:** Full context dump for Grok Build TUI / Hermes / future agents working on this project.

## Project Overview

We are building **Elderglow**, a cozy magical farming sim inspired by Stardew Valley, Sun Haven, and Travelers Rest.

Key features:
- Top-down 2D pixel art
- Leyline pattern-based farming magic
- Creature companions (elemental + legendary)
- Farm defense system
- Village relationships with fantasy NPCs
- Ecosystem simulation (crops ↔ creatures ↔ pests)

**Team size:** 2-3 people
**Primary Engine Decision:** Godot 4 (chosen over Unity and Phaser for 2D pixel strengths, iteration speed, and alignment with existing Grok agent workflows).

## Why Godot?

- Excellent native 2D tools (TileMap, shaders for leyline glows)
- Fast iteration for small team
- GDScript is very AI-friendly
- Strong external AI coding support (Cursor + Claude/Grok)
- Lightweight compared to Unity for this scope
- Open source + easy to extend

Unity has better built-in AI (Unity AI 2026), but Godot + external agents (especially our Grok setup) was deemed stronger overall.

## Godot MCP Initiative

Goal: Allow AI agents (Grok Build, Grok Web, Hermes Agent, OpenClaw) to directly interact with Godot projects for development assistance.

### Repo Created
**https://github.com/quinnquad/godot-mcp**

This is our working base. It starts from the popular Coding-Solo/godot-mcp and is designed to selectively incorporate features from more advanced forks (e.g. the 149-tool version by tugcantopaloglu).

### Current Files in Repo

- `SIMPLE_START_PLAN.md` — Phased plan for getting started simply
- `bridge/direct_godot.py` — Simple Python bridge (Phase 1) so agents can control Godot without full MCP
- `src/index.ts` — MCP server skeleton
- `scripts/godot_operations.gd` — Headless GDScript operations
- `docs/ARCHITECTURE.md`
- `docs/INTEGRATION.md` — Notes on Grok/Hermes integration
- `CONTEXT.md` (this file)

## Phased Approach (Prioritizing Simplicity)

### Phase 1: Minimal Viable (Current Focus)
- Use direct Godot CLI + Python bridge (`bridge/direct_godot.py`)
- No full MCP server required yet
- Fastest way to get agent ↔ Godot feedback loop

### Phase 2: MCP + Bridge
- Activate full MCP server
- Build lightweight adapter so custom agents (Hermes, Grok Build) can use MCP tools easily

### Phase 3: Advanced + Elderglow Specific
- Integrate runtime interaction (TCP) from advanced forks
- Add custom tools for leyline patterns, creatures, ecosystem, defense
- Deep integration with existing agent stack

## Integration Goals

We want the Godot MCP system to work well with:
- Grok Build CLI / Grok Web
- Hermes Agent (Ollama-based)
- Future OpenClaw-style agents

The simple Python bridge was created specifically so agents don't need to implement full MCP protocol immediately.

## Node.js Requirements

- Needed for Phase 2+ (MCP server is TypeScript)
- Recommend Node.js v20+ LTS
- Can be installed via fnm or official installer
- Not required for current Phase 1 work

## Key Decisions & Rationale

- Chose Godot over Unity primarily for 2D pixel quality + better fit with existing Grok-heavy workflow.
- Started with simplest possible bridge instead of jumping straight to full MCP.
- Repo is intentionally a "base + extension" rather than a full fork of any single project.
- Planning to cherry-pick powerful features (especially runtime control) from advanced Godot MCP implementations.

## Open Items / Next Steps

- Improve `godot_operations.gd` to properly handle JSON operations
- Test `bridge/direct_godot.py` with actual Elderglow project
- Decide when to move from Phase 1 → Phase 2
- Expand MCP server implementation
- Add Elderglow-specific custom tools

## Relevant Links

- Main Repo: https://github.com/quinnquad/godot-mcp
- Original base: https://github.com/Coding-Solo/godot-mcp
- Advanced fork (149 tools): https://github.com/tugcantopaloglu/godot-mcp

---

This file should give any agent (especially Grok Build) full context on decisions, current state, and direction.