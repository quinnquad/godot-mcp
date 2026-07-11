# Friend Handoff Starter Prompt

**Purpose**:  
Give this to a complete beginner (your friend) so they can paste it into a **brand new Grok chat** (with the godot-mcp MCP enabled) and start building a game with strong guidance, using the zero-footprint workflow.

---

## Instructions for Your Friend

1. Make sure you have the Godot MCP tools set up in your Grok environment (follow the instructions from the person who gave you this, or the getting-started guide).
2. Open a **completely new** chat with Grok.
3. Copy everything below the line and paste it as your first message.
4. Replace the project path with the one you're using.
5. Follow along step by step.

---

## Copy Everything Below This Line

```
Hi! I'm a complete beginner who has never made a game before and has almost no coding experience. I want to learn by actually building a small 2D platformer game with your help.

I have a clean Godot 4 project ready at this path:
~/MyCleanGodotTestProject

We are using a special "zero-footprint" Godot MCP setup. This means you can temporarily connect to my running Godot project to look at it, take screenshots, run code live inside the game, simulate button presses, create and modify nodes, etc. — without permanently installing anything into my project.

### Important Rules for Working With Me

- Please treat me like someone who knows almost nothing. Explain every concept simply the first time you use it.
- Give me **one very small task at a time**. After I do it, I'll tell you what happened (or send you a screenshot).
- You have powerful tools available through the Godot MCP. Use them a lot:
  - Take screenshots of the game so you can actually "see" what's happening.
  - Use live script execution to test small pieces of code quickly.
  - Use input simulation when we want to test player controls.
  - Inspect the scene tree, properties, and UI whenever you're unsure about the current state.
- Always work in this clean test project (never my "real" projects until we're confident).
- When you want to connect to my running game, tell me exactly what to do: run inject_zero_footprint_bridge with my project path if needed, then open the project in Godot and press Play (F5). The bridge only listens while the game is running. Watch Output for "[MCPBridge] Zero-footprint bridge active on 127.0.0.1:4243". Persistent plugin mode uses port 4242. Live tools auto-detect 4242/4243. If tools fail after a fresh chat, re-run inject (per-process state).
- Prefer list_children for discovery (not full get_tree on huge scenes). get_tree is bounded by default (max_depth=4, max_nodes=150, skips @Sprite2D@N-style names; response sets truncated when incomplete). Raise max_depth/max_nodes or set include_anonymous only when needed. To walk a character, use simulate_input_batch with hold_ms (e.g. move_right hold_ms 500) so movement is sustained across frames.
- This MCP has been smoke-tested on Godot 4.6, 4.7, and 4.8-dev1.
- If you or I need to check the MCP server status: ask me to run `grok mcp doctor godot-mcp` or open `/mcps` in the Grok TUI.
- When we're done experimenting for the day, remind me to clean up the temporary bridge so my project stays clean.

### Our First Project

Let's make a simple 2D platformer:
- A character that can run left and right
- The character can jump
- Basic gravity and floor collision
- At least one platform to stand on
- Collectible coins that disappear when touched
- A simple goal or win condition

Start by checking the current state of my project (use your tools to look at the scene). Then give me the very first tiny step.

Let's begin!
```

---

## Tips for the Person Giving This to Their Friend

- Update the project path in the prompt to whatever clean project you're giving them.
- Consider starting with an even simpler game first (e.g. a top-down collector or Flappy Bird style) if the friend has zero experience.
- After they paste it, stay available for the first 10–15 minutes in case they get confused about the setup.
- The quality of the experience depends heavily on how well the zero-footprint bridge + tool descriptions work for a fresh agent. This is why we did all the previous work on making the bridge rich.
- Once the first controllable player works, have them (or you via the agent) run the Post-Setup Smoke / Verification Checklist from the getting-started guide in a fresh chat to confirm the full chain (list tools, Play+inject, create_simple_player + simulate, get_tree, optional screenshot).
- For extending with your own domain/game-specific tools later: the base runtime implements only the general set. Copy addons/godot_mcp_runtime/ into the project and extend runtime_server.gd's _handle_cmd (or use execute_live_script to drive existing code). See getting-started for the generic skeleton. The agent can achieve most things with the built-in general tools + live scripts without custom registration.

---

## Optional: Even More Guided Version

If your friend is extremely non-technical, you can add this paragraph right after the "Let's begin!" line:

```
If at any point I say I'm confused or don't understand something, please slow down, explain the concept in the simplest possible terms, and give me even smaller steps.
```

You can also pre-inject the bridge for them the first time and just tell them "the connection is already active, just open the project and press Play."

---

This prompt + the getting-started guide should give a non-technical person a fighting chance at having a productive session with a fresh Grok instance.