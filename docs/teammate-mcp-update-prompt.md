# Teammate MCP update — notification + Grok Build prompt

Use this whenever **public godot-mcp** (or the private Elderglow MCP variant) ships a change that collaborators need.

## Woods workflow (after you ship)

1. Merge/tag the public release (or push the private repo tip).
2. Update the **“Current release”** block at the bottom of this file.
3. Copy the **Message to teammate** section into:
   - Linear comment on the related issue / Godot MCP project, **and/or**
   - Chat/DM to the teammate (Draco).
4. Teammate pastes the **Grok Build prompt** into a new Grok session.

No extra infrastructure required: Linear + a pasteable prompt is the notification channel.

---

## Message to teammate (copy/paste)

```
Hey — godot-mcp update is live.

What changed (0.1.5 / JOS-18):
- get_tree is now bounded by default (max_depth=4, max_nodes=150, skips @Sprite2D@N-style names)
- Response includes truncated/node_count so agents know the dump is incomplete
- Prefer list_children for discovery; raise max_depth/max_nodes only when needed

Please update your local MCP so Grok Build uses the new code. Paste the prompt below into a new Grok Build chat (or run the shell steps yourself).

Release: https://github.com/quinnquad/godot-mcp/releases/tag/v0.1.5
Repo: https://github.com/quinnquad/godot-mcp
```

---

## Grok Build prompt (teammate pastes this)

```
Goal: Update my local godot-mcp install to the latest public release so Grok tools use bounded get_tree (v0.1.5 / JOS-18).

Do this safely on my machine:

1. Locate my existing godot-mcp checkout (common: a folder named godot-mcp). If missing, clone:
   git clone https://github.com/quinnquad/godot-mcp.git
   cd godot-mcp

2. Fetch and check out the release:
   git fetch --tags origin
   git checkout main
   git pull origin main
   # confirm tag if present:
   git checkout v0.1.5
   # or stay on main if it already includes 0.1.5

3. Install deps and build:
   npm install
   npm run build
   npm test

4. Register / refresh for Grok Build (pick what matches my setup):
   # If Grok points at this repo's build entry (recommended for devs):
   # ensure ~/.grok/config.toml has something like:
   #   [mcp_servers.godot-mcp]
   #   command = "node"
   #   args = ["FULL/PATH/TO/godot-mcp/build/index.js"]
   # Then restart Grok or reload MCP.
   #
   # Optional global CLI:
   npm install -g .
   grok mcp add godot-mcp -- godot-mcp
   grok mcp doctor godot-mcp

5. Smoke check:
   - Call get_project_info — should mention 0.1.5 or "JOS-18" / bounded get_tree.
   - Prefer list_children for discovery.
   - get_tree defaults should return truncated/node_count metadata on large scenes.

Report: git rev-parse HEAD, package.json version, npm test result, and whether grok mcp doctor is clean.
```

---

## Current release (maintain this block)

| Field | Value |
|--------|--------|
| **Version** | **0.1.5** |
| **Tag** | `v0.1.5` |
| **Highlight** | JOS-18 bounded `get_tree` |
| **Public repo** | https://github.com/quinnquad/godot-mcp |
| **Release URL** | https://github.com/quinnquad/godot-mcp/releases/tag/v0.1.5 |
| **Linear** | JOS-18 |
| **Updated** | 2026-07-11 |

### Future updates

When you ship 0.1.6+:

1. Bump this table.
2. Edit the “Message to teammate” and prompt version/tag lines.
3. Post to Linear + send the message block to Draco.
