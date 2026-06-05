# Godot MCP Integration Plan: Incorporating Strengths from Other Projects

**Date**: 2026-06-01  
**Goal**: Evolve the current godot-mcp system into the strongest overall offering by deliberately adopting the best ideas from:
- Erodenn/godot-mcp-runtime (zero-footprint + excellent runtime observability & interaction)
- tomyud1/godot-mcp (simple, accessible plugin experience)
- youichi-uda/godot-mcp-pro (extreme tool breadth and completeness)

While preserving our core advantages:
- Persistent one-click always-on experience
- Strong depth in general, reusable Godot tools (especially 2D + complex type marshaling)
- Clean Phase 1 (headless bridge) + Phase 2 (live runtime) separation
- Surgical, high-quality development practices

---

## Vision

A single, cohesive Godot MCP system that can be used in two complementary modes:

1. **Persistent Mode** (current strength, enhanced)
   - One-click plugin enables a permanent, always-available runtime autoload.
   - Best for daily deep work inside a long-lived project (e.g. Elderglow).
   - Rich general Godot tool surface + strong inspection/control capabilities.

2. **Zero-Footprint / On-Demand Mode** (new, inspired by Erodenn)
   - No permanent changes to the user's Godot project.
   - The MCP server can temporarily inject a lightweight runtime bridge only when needed.
   - Excellent for "agent builds → tests → iterates" workflows, multi-project use, or users who hate committing addons.
   - Brings powerful observability features (screenshots, input simulation, live script execution).

The same MCP server and tool surface should support both modes cleanly, with the user/agent choosing the mode per session or per tool call.

---

## Key Strengths to Incorporate (Prioritized)

### High Priority (High User Value + Differentiator)

| Strength | Source | Why It Matters | Current Status in Our Project |
|----------|--------|----------------|-------------------------------|
| **Screenshots / Viewport Capture** | Erodenn (strong) + Pro | Agent can literally "see" what it built and debug visually | Not present |
| **Input Simulation** (batched keys, mouse, UI clicks by name, actions) | Erodenn (excellent) + Pro | Agent can playtest and interact with the running game | Very limited (only ui_set_text) |
| **Zero-Footprint / Self-Cleaning Bridge** | Erodenn | Huge for users who don't want permanent project changes | Opposite (persistent plugin) |
| **Live Arbitrary GDScript Execution** | Erodenn | Ultimate power tool for runtime debugging and testing | Not present |
| **Advanced UI Discovery** (rich Control tree with positions, states, etc.) | Erodenn | Critical for UI-heavy games and testing | Basic `get_ui_tree` + `set_control_text` |
| **Massive Tool Breadth** (3D, shaders, particles, audio, TileMap, navigation, etc.) | youichi-uda Pro | Completeness; users expect "it can do everything" | Strong general 2D/core, lighter on advanced 3D/specialized |

### Medium Priority

- Simpler "just install the plugin" onboarding experience (tomyud1 style discoverability)
- Better runtime analysis / profiling hooks
- More robust project attachment modes (manual attach when Godot is launched externally)

### Lower Priority (for later)

- Extremely high tool count as a marketing/positioning feature (we will grow breadth deliberately, not chase raw numbers)

---

## Proposed Architecture: Dual-Mode Runtime

We will support **two runtime backends** behind the same MCP tool surface:

### 1. Persistent Autoload (Current - `GodotMCPRuntime`)
- Installed via our existing one-click plugin.
- Always present when the plugin is enabled.
- Fixed or configurable TCP port (4242).
- Excellent for deep, frequent interaction.

### 2. On-Demand Zero-Footprint Bridge (New - Inspired by Erodenn)
- The MCP server (Node) can, on demand:
  - Copy a lightweight bridge script into the project temporarily.
  - Register it as an autoload in `project.godot`.
  - Launch or attach to Godot.
  - On shutdown, remove the script and autoload entry.
- Uses length-prefixed framed protocol (more robust than simple `\n`).
- Can support advanced features like screenshots and input simulation more easily in some cases.
- Completely optional — users who prefer the persistent model never have to use it.

**MCP Server Changes**
- Add mode selection (or automatic detection) for tools that need runtime.
- Many tools (get_tree, set_property, etc.) can work against either backend.
- New tools that are especially powerful in the zero-footprint mode (screenshots, input sequences) can be added.

This gives users the best of both worlds without forcing a choice at setup time.

---

## Phased Implementation Roadmap

### Phase 0: Planning & Decisions (Now)
- Finalize dual-mode architecture.
- Decide on protocol unification (or clean abstraction between the two bridges).
- Prioritize the first 4-6 high-value runtime features to implement (recommendation below).

### Phase 1: Foundation for Zero-Footprint Mode + Core Observability (High Impact)
**Goal**: Deliver the "Erodenn killer features" on top of our existing strengths.

1. Implement the on-demand bridge injection/cleanup system in the MCP server (Node side).
2. Create a new lightweight GDScript bridge (`mcp_bridge.gd` or similar) optimized for the advanced runtime features.
3. Add **screenshot / viewport capture** tool (with preview/full/path_only modes like Erodenn).
4. Add **batched input simulation** (key, mouse, action, UI click by name/path, with timing).
5. Add **rich UI discovery** (better than current `get_ui_tree` — positions, states, hierarchy for Controls).
6. Add **live GDScript execution** tool (compile and run arbitrary code against the live SceneTree).

**Why first?** These features provide the biggest qualitative leap ("my agent can now see and interact with the game").

### Phase 2: Tool Surface Expansion (Breadth)
Systematically expand the general tool catalog toward the breadth shown in godot-mcp-pro, while staying focused on high-value, frequently useful operations.

Priority order (suggested):
- TileMap / TileSet tools
- 3D scene & node tools (transform, mesh, camera)
- Shader / Material inspection & basic editing
- Particle system control
- Audio playback & bus control
- Navigation / AStar / pathfinding queries
- AnimationTree / StateMachine advanced control
- More robust resource & import tools

We do **not** need to match the raw 160+ count immediately. Focus on quality and usefulness first.

### Phase 3: Polish, DX, and Distribution
- Improve onboarding (clear "Persistent vs Zero-Footprint" choice in docs and helper script).
- Enhance the `start-godot-mcp.ps1` (and add cross-platform versions) to support both modes.
- Add better error messages and recovery when the wrong mode is used.
- Consider publishing a lightweight npm package (like Erodenn) for easier consumption.
- Update marketing/docs to clearly communicate the dual-mode advantage.

### Phase 4: Advanced / Differentiating Features (Future)
- Background / headless runtime testing mode.
- Multi-project / session management.
- Richer runtime analysis (performance metrics, signal tracing, etc.).
- Elderglow-specific tools (only after the general foundation is world-class).

---

## Key Technical Decisions & Trade-offs

**Protocol**
- Keep the current simple line-delimited JSON for the persistent autoload (easy to debug).
- Use length-prefixed framing for the zero-footprint bridge (more robust, matches Erodenn's approach).
- Abstract the differences behind a clean interface in the MCP server.

**Injection Model (Zero-Footprint)**
- Follow Erodenn's pattern closely for the bridge script + temporary autoload registration.
- Be extremely careful with cleanup (we must never leave junk in the user's project).
- Support both "let the server launch Godot" and "attach to externally launched game".

**Tool Naming & Compatibility**
- Keep existing tool names stable for current users.
- New advanced runtime tools can live alongside (e.g. `take_screenshot`, `simulate_input_sequence`, `execute_live_script`).

**Performance & Reliability**
- The persistent autoload is great for low-latency repeated calls.
- The injected bridge can be optimized for one-shot heavy operations (screenshots, complex input sequences).

---

## Risks & Mitigations

- **Complexity creep**: Dual modes + more features could make the system harder to maintain. → Mitigate by keeping a very clean abstraction layer between the two runtime backends and being ruthless about tool prioritization.
- **User confusion**: "Which mode should I use?" → Excellent documentation + smart defaults + clear error messages.
- **Maintenance burden**: Supporting two runtime paths. → The zero-footprint path can initially be a thinner feature set; we only expand it for the highest-value capabilities.
- **Scope**: Chasing 170 tools like the Pro version could dilute quality. → We will define our own "high-signal general Godot tool" bar instead of raw count.

---

## Success Criteria

- A user can choose (or the agent can recommend) between persistent always-on mode and zero-footprint on-demand mode.
- The system has best-in-class support for both "deep live editing" and "agent can see + interact with the running game."
- Tool surface is noticeably broader and more complete than our current state, while remaining focused and high-quality.
- Documentation makes the strengths and trade-offs extremely clear.
- Existing users of our persistent system experience zero breakage.

---

## Immediate Next Steps (Recommended)

1. **Decision Alignment** (with user)
   - Confirm dual-mode direction.
   - Prioritize the first runtime features (screenshots + input simulation are strong candidates for Phase 1).

2. **Architecture Spike**
   - Prototype the bridge injection/cleanup logic in the Node MCP server.
   - Design the protocol abstraction.

3. **Feature Implementation**
   - Start with screenshot capture + basic input simulation against the new (or existing) bridge.

4. **Documentation Refresh**
   - Update ARCHITECTURE.md and README to clearly describe the two modes and when to use each.

---

This plan is deliberately phased and pragmatic. We do not need to implement everything from the other projects — only the capabilities that deliver clear, outsized value to users who want powerful AI assistance for Godot development.

Would you like me to expand any section (e.g. detailed spec for the first runtime features, proposed tool names, or a more granular phased breakdown with effort estimates)? Or shall we start executing Phase 0 / early architecture work?