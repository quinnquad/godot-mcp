# godot-mcp Release Process (public MVP)

Current public version: **0.1.3** (JOS-15 non-blocking hold_ms, hardened list_children, Godot 4.6/4.7/4.8-dev1 tested notes).

Repeatable process for a consumable public release so strangers can install from GitHub.

**Hard constraint**: Public artifacts must contain **zero** private game-specific tools, domain branding, or personal machine paths. Ship only general Godot + zero-footprint.

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
   - Primary user docs: root README, `MVP.md`, `docs/friend-starter-prompt.md`, `docs/getting-started-for-beginners.md`.
   - Path-agnostic and beginner-friendly.
   - Ports: zero-footprint **4243**, persistent **4242**, auto-detect documented.
   - Install hero must **not** be bare `npm install -g godot-mcp` until this project owns that registry name — use clone or release tarball.

5. **Version**
   - Bump semver in `package.json`.

## Release Steps

1. Commit with a clear message (e.g. `chore(release): vX.Y.Z public surface`).
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
