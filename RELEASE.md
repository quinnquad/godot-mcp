# godot-mcp Release Process (public MVP)

Current public version: **0.1.5** — JOS-18 bounded `get_tree` (safe defaults on large scenes).

## 0.1.5 release notes

- **JOS-18:** Default `get_tree` is bounded (`max_depth=4`, `max_nodes=150`, skip Godot auto-names `@Sprite2D@N`). Response includes `truncated` / `node_count` metadata. Optional `include_anonymous`, higher depth/nodes when needed.
- **Surfaces:** pure util + tests; both GDScript bridges (`mcp_bridge.gd`, `runtime_server.gd`); MCP tool schema updated.
- **Live verified** on Elderglow farm slice (~thousands of decor/trees): default dump ~38ms / ~5KB instead of multi‑MB timeouts.
- Prefer `list_children` for shallow discovery; `get_tree` is now safe for first-contact.

Prior **0.1.4**: Creature Quest example slice (Godot 4.7) + packaging.

Prior **0.1.3**: JOS-15 non-blocking `hold_ms`, hardened `list_children`, Godot 4.6 / 4.7 / 4.8-dev1 tested notes.

Repeatable process for a consumable public release so strangers can install from GitHub.

**Hard constraint**: Public artifacts must contain **zero** private game-specific tools, domain branding, or personal machine paths. Ship only general Godot + zero-footprint + the public example.

## Pre-Release Checklist

1. **Private-content audit**
   - Search the tree for private domain tool names and game brand strings.
   - Confirm zero hits in the npm tarball, release assets, and linked public docs.

2. **Path audit**
   - No hard-coded personal machine paths (absolute home directories, local drive roots) in README, docs, package.json, bin/ output, starter prompts, bridge defaults, or tests.

3. **Build**
   - `npm run build`
   - Confirm `build/index.js` and `bin/godot-mcp.js` are current.

4. **Docs**
   - Primary user docs: root README, `MVP.md`, `docs/friend-starter-prompt.md`, `docs/getting-started-for-beginners.md`, example README under `examples/`.
   - Path-agnostic and beginner-friendly.
   - Ports: zero-footprint **4243**, persistent **4242**, auto-detect documented.
   - Install hero must **not** be bare `npm install -g godot-mcp` until this project owns that registry name — use clone or release tarball.

5. **Version**
   - Bump semver in `package.json` (and matching launcher / `get_project_info` strings).

## Release Steps

1. Commit with a clear message (e.g. `chore(release): vX.Y.Z …`).
2. Tag: `git tag vX.Y.Z` and push the tag.
3. Build + pack:
   - `npm run build`
   - `npm test`
   - `npm pack`
4. GitHub Release from the tag; attach the tarball + optional `addons/godot_mcp_runtime` zip.
5. Optional: `npm publish` only after the package name on the registry is owned by this project.

## Registration snippets (after local install)

```bash
# After: git clone … && npm install && npm run build && npm install -g .
grok mcp add godot-mcp -- godot-mcp
grok mcp doctor godot-mcp
```

Claude Desktop:

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

## Ports reminder

| Mode | Port |
|------|------|
| Zero-footprint `MCPBridge` | 4243 |
| Persistent plugin | 4242 |

Live tools probe 4242 then 4243 (or use an in-process inject port).
