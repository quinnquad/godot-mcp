# godot-mcp v0.1 Release Process (MVP)

This is the repeatable process for producing a consumable v0.1 release so that strangers can install and use the tool (and so the community can start iterating on the general/ public slice).

**Hard constraint (from user review)**: The public release must contain **zero** Elderglow-specific content, tools, references, or branding. All public artifacts (package, README, docs that ship, launcher output, starter prompts, template projects, release notes) must be purely general Godot + zero-footprint.

## Pre-Release Checklist (Run Every Time)

1. **Full Elderglow audit**
   - `grep -r Elderglow --include="*.md" --include="package.json" --include="*.js" .` (exclude node_modules, .git, any private docs you don't intend to ship).
   - Confirm zero hits in anything that will be in the published tarball, release zips, or linked from the public README.
   - Fix any that remain (especially user-visible strings in the bin/ launcher or tool responses).

2. **Path audit**
   - No hard-coded personal paths (I:\ etc.) in README, docs, package.json, bin/ output, starter prompts, or template files.

3. **Build**
   - `npm run build`
   - Confirm `build/index.js` and the bin/ launcher are up to date.

4. **Template / example**
   - The `newclean` example (or its generalized equivalent) + `GODOT_MCP_NOTES.md` + `create_persistent_player.gd` + `player.gd` + the baked `test.tscn` is the canonical "starter platformer" template.
   - Make sure the template has a clean .gitignore and no personal notes.

5. **Docs**
   - Root README, `MVP.md`, `docs/friend-starter-prompt.md`, `docs/getting-started-for-beginners.md` are the primary user-facing docs.
   - They must be path-agnostic and beginner-friendly.
   - Technical docs (ARCHITECTURE etc.) may stay more detailed but should not be the first thing a beginner sees, and any Elderglow content must be clearly labeled as "future/private extension".

6. **Version**
   - Bump version in package.json (semver, starting from 0.1.0 for this MVP).

## Release Steps

1. Commit the above changes with a clear message ("chore(release): vX.Y.Z MVP — general Godot + zero-footprint, Elderglow-free public surface").

2. Tag: `git tag v0.1.0` (or the current version).

3. Build + pack:
   - `npm run build`
   - `npm pack` (produces the tarball).

4. GitHub Release (recommended for v0.1):
   - Create a release from the tag.
   - Attach:
     - The npm tarball from `npm pack`.
     - A zip of the `addons/godot_mcp_runtime/` folder (for the persistent plugin).
     - A zip of the starter template project (the generalized newclean structure + NOTES + baker).
     - Optional: a CHANGELOG entry for this version.
   - In the release body, include the copy-paste registration instructions (see below).

5. Publish (optional but nice for discoverability):
   - `npm publish` (after the above).

## Registration Snippets (copy-paste for users after install)

After `npm install -g godot-mcp` (or equivalent), the `godot-mcp` command is available.

**For Grok (example — the launcher will print the exact current form):**
```
grok mcp add godot-mcp --command godot-mcp
```

**For Claude Desktop (claude_desktop_config.json example):**
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

(Adjust if using the direct node path to the installed build/index.js.)

## Post-Release

- Update the root README "Current version" or "Install" section if it has a pinned version.
- Announce (wherever this is being shared) with a link to the release + the friend-starter prompt.
- The community can now clone, fork, improve the general tools, the launcher, the docs, the bridge, the template, etc.

## Notes for v0.1

- The process is intentionally manual/small so we can ship the first usable thing quickly.
- Future versions can add GitHub Actions for automated build + attach, more platforms, etc.
- Always re-run the full Elderglow + path audit before producing artifacts.

This process + the artifacts it produces (tarballs, zips, updated docs) is what lets people start using and iterating without needing the original author in the room.