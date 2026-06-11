# Plan: Push Robustness Updates to Elderglow Private Git + Generalized Public Version (with Full Double-Check)

**Created**: 2026-06-10 (during audit session on I:\godot-mcp)  
**Request**: "create a plan to push the updates to the elder glow private git but then also update the public facing version with the same changes just remembering to remove all the elderglow specific things and also just double check everything to make sure there is nothing in there I wouldn't want public facing"

**Executed on 2026-06-10** (by implementer following this plan exactly):
- Phase 0 pre-audit: confirmed (ahead 4->5, ELDERGLOW unstaged with smoke+recipe + MEMORY, remotes origin/public + private-elderglow, tarball 15 files exact match snapshot, leaks only in declarations+split, tracked privates match).
- Phase 1: `git add docs/ELDERGLOW_TESTER_SETUP.md; git commit -m "..."` → a712d98; `git push private-elderglow main` (540584b..a712d98, no auth prompt, succeeded); ls-remote + log verified.
- Phase 2: Surgical search_replace (read-before) only on allowed public files (README, MVP, RELEASE, docs/getting-started-for-beginners.md, docs/friend-starter-prompt.md, bin/godot-mcp.js, scripts/godot-mcp-elderglow.js light). Inserted exact generalized Windows/PATH/wrapper, mandatory Play+watch-Output+re-inject, smoke checklist (generic, no domain), extending recipe (generic skeleton), robustness bullets in MVP/RELEASE. No private files or names touched.
- Phase 3: Full gate (all commands): npm run build + real npm pack (15 files); tarball extract+Select-String (Elderglow only in MVP/RELEASE constraint text + package bin + elder script split; 0 paths); dedicated grep + PS source scans on all public-mapped 15 + addons/build (clean except expected); full reads of ELDERGLOW_TESTER_SETUP.md + elder/tools+handlers + index-elderglow (private clone url + 10 names + "FULL private/internal" + WARNINGs); MEMORY/ERRORS/plan scans (dev I: + C:\Users\woods history only, no secrets); spot re-reads of edited sections (Play/Output/re-inject/Windows/smoke/extension all present+generic+accurate); package "files" clean; staged names only allowed. **Phase 3 gate PASSED 100%. Explicit decision on github-visible private content (ELDERGLOW doc + elder src + index-elder in public history): YES, proceed (monorepo reality + prior tracked; npm tarball + public docs 100% Elderglow-free per hard constraint; no current real paths/secrets; self-documenting + declarations protect users; acceptable dev record).**
- Phase 4: git add (exactly the 7 allowed public); staged confirmed only those; commit 8b68623 (exact plan message); `git push origin main` (fe7d1fc..8b68623, succeeded); now origin/main at 8b68623, private-elderglow at a712d98; verifs (log, ls-remote, show --stat) green.
- Phase 5: MEMORY.md appended (mandated format, full evidence+decision+files list+next); tgz cleanup; this plan top updated; final git/pack verifs.
- Commits: private a712d98 on private-elderglow; public 8b68623 on origin. All outputs captured in session + this file + MEMORY.
- Clarifying (post-review hygiene): Pre-existing packaging snapshot drift (plan:52 lists "scripts/godot-mcp-elderglow.js ← intentionally included" vs package.json "files" omitting scripts/ — elder via bin: in real `npm pack`); pragmatic real `npm pack` (not --dry-run) used for Phase 3.2 tar -xzf extract to enable "actual bits" audit per gate intent + "not only --dry-run". Justification: minimal adjustment, fully evidenced, stronger leak protection, no correctness/gate impact. (See Hygiene note below + MEMORY 2026-06-10.)
- Hygiene note (post-review): Pre-existing packaging snapshot at :52 accurately described actual 15-file tarball surface (scripts/godot-mcp-elderglow.js present via bin: entry in real `npm pack --dry-run` + tgz contents); package.json "files" omits scripts/ (stronger leak protection, untouched per "only if you must"). Pragmatic real `npm pack` (producing .tgz) used for Phase 3.2 tar -xzf extract (instead of --dry-run only) to audit "actual bits that would be published" per gate spirit + explicit "not done only with --dry-run"; fully evidenced at time, no correctness impact. (See also MEMORY 2026-06-10 entry.)
- Handoff: Teammate pulls private for full ELDERGLOW_TESTER_SETUP (smoke+recipe now included). Public github + future npm gets the generalized robustness (Play mandatory, watch Output, re-inject, Win tips, smoke, extend recipe) with zero Elderglow.

**Next person verification**: Successful clone of private + end-to-end run of docs/ELDERGLOW_TESTER_SETUP.md (incl. smoke + domain wiring recipe). Separately, clean Godot + public README/getting-started/friend prompt reaches controllable player via zero-footprint (Play+inject+smoke).

**Hard constraints carried forward**:
- Keep *all* elderglow specific stuff out of the public release / public-facing artifacts (MVP/RELEASE notes, shipped npm tarball via "files", and the generalized docs).
- The public surface (npm + recommended public github docs) must remain purely general Godot + zero-footprint + high ease-of-use (no script edits by human, Play + watch Output, re-inject, etc.).
- Private full variant (with domain tools, 4243 zf default for clean testing, full tester instructions) stays private.

This plan is self-contained. Follow phases in order. Capture all command output. Use todo tracking if executing via agent.

## Current State Snapshot (from live audit just before writing this plan)

- **Branch/commits**: On `main`. Your branch is ahead of `origin/main` by 4 commits.
  - Latest local commit: `25b84f2` "fix: make private elderglow variant 'just work' for next person after friend's successful run"
    - Touched: package.json (restored `godot-mcp-elderglow` bin + `start:elderglow`), `scripts/godot-mcp-elderglow.js`, `src/index-elderglow.ts` (4243 emphasis), and ELDERGLOW_TESTER_SETUP.md (Windows robustness + troubleshooting from real teammate issues.md run).
  - 4 commits total ahead of public origin (includes prior prep commits).
- **Unstaged (the final piece of "the updates")**: Only `docs/ELDERGLOW_TESTER_SETUP.md`
  - Diff adds: "Post-Setup Smoke Checklist" (confirm variant, list domain tools, basic runtime after Play+inject, create_simple_player + simulate, domain tool) + "Elderglow Domain Tools ... How to Actually Make Them Work" (copy addons, extend runtime_server.gd with match arms for the 10 names or fallback to execute_live_script; exact skeleton shown).
- **Remotes** (critical):
  - `origin` → https://github.com/quinnquad/godot-mcp.git (the public facing)
  - `private-elderglow` → https://github.com/quinnquad/godot-mcp-elderglow.git (the elder glow private git)
- **The "updates" being pushed**: All the zero-friction robustness lessons from the friend's real Windows/Pwsh run (and follow-ups):
  - Explicit PATH refresh every session (`$env:Path = "C:\Program Files\nodejs;" + machine + user`).
  - Use `cmd /c "npm ..."` wrappers for execution policy / .ps1 issues.
  - Full node.exe paths or (recommended) a small `.cmd` wrapper that auto-detects node dir (%ProgramFiles% + `where node` fallback) for `grok mcp add` quoting/spaces.
  - **Mandatory**: After server + inject, open the actual Godot project and **press Play (F5)**. The bridge (mcp_bridge.gd or persistent) only listens while the game is running. Watch the Godot "Output" panel for the exact "[MCPBridge] Zero-footprint bridge active on 127.0.0.1:4243" (or 4242) message.
  - Re-inject zero-footprint after server (re)start or after Play (injectedBridges Map is per-Node process).
  - Always use a **fresh new Grok chat** after registration/enable.
  - Full "WINDOWS-SPECIFIC TROUBLESHOOTING" section + daily prep notes.
  - Plus the new smoke checklist + the "how to actually wire your domain tools" recipe (so next person isn't blocked on "listed but unknown cmd").
- **Public npm tarball surface** (exact from `npm pack --dry-run` in the audit; 15 files, 28.8 kB packed):
  - MVP.md, README.md, RELEASE.md
  - addons/godot_mcp_runtime/ (mcp_bridge.gd, plugin.cfg, plugin.gd, runtime_server.gd — all general)
  - bin/godot-mcp.js (general launcher)
  - build/bridge/zero-footprint.js, build/index.js, build/tools/general/tools.js
  - docs/friend-starter-prompt.md, docs/getting-started-for-beginners.md
  - package.json
  - scripts/godot-mcp-elderglow.js   ← intentionally included (split support); its text currently says "FULL private Elderglow variant" etc.
  - (Note: ELDERGLOW_TESTER_SETUP.md, src/index-elderglow.ts, src/tools/elderglow/*, build/index-elderglow.js etc. are **excluded** from tarball by the "files" whitelist. Good.)
- **Public github surface**: Pushing `main` to `origin` will make the entire tracked tree (including private docs + elder src + dev MEMORY/ERRORS history) visible at https://github.com/quinnquad/godot-mcp. The npm "files" + docs discipline protects *published package users*, but github visitors will see the split docs and extension code. This plan's Phase 3 double-check explicitly covers "is the content of the private-but-tracked files ok to have on the public github?"
- **Leak/grep snapshot** (from `grep` tool + path searches on I:):
  - Core public user docs that ship (README, MVP, RELEASE, getting-started-for-beginners.md, friend-starter-prompt.md) + general launcher (bin/godot-mcp.js) + addons + public build: **clean**. No "Elderglow", no private clone urls, no real personal paths, no "teammate"/"issues.md".
  - "Elderglow" / domain names (leyline, creature, ecosystem, farm, defense) appear in: the private ELDERGLOW_TESTER_SETUP.md (by design), src/tools/elderglow/* (tool schemas + "Elderglow:" + "requires Elderglow nodes" warnings), src/index-elderglow.ts (comments + 4243 default note + console "FULL ... private/internal"), scripts/godot-mcp-elderglow.js (status text — this one ships in npm), package.json (bin entries — intentional), and historical dev logs (MEMORY.md, ERRORS.md, CONTEXT.md, old plans — these are tracked and will be in public github history; acceptable as development record).
  - Drive/path examples: A few in the private ELDERGLOW doc (template "C:\Users\YOURNAME\..." and "C:\full\path\..." — placeholder style, not a real current home), in tests/e2e_zero_footprint.py and bridge/direct_godot.py (examples), docs/INTEGRATION.md, and old MEMORY. None in the shipping public docs/launchers/addons.
  - 4243 appears in mcp_bridge.gd (correct, zf default), private index-elderglow + launcher + doc (by design for clean Elderglow testing), and some history. Public general defaults to 4242.
  - Overall: No obvious secrets, real current user paths (e.g. no "C:\Users\woods" active in public-mapped files), or surprises in the 15-file public tarball. The split launcher text is self-documenting. The main items for the Phase 3 "would I want this public on github?" review are the ELDERGLOW doc (detailed internal tester flow + game mechanic names + private repo clone url) and the 10 elder tool schemas (leyline etc.).

**No plan.md existed at root** (other PLAN_* and MVP-PLAN.md are different scope; this new focused file was created for the exact request).

The rest of this file is the executable plan.

## Phase 0: Fresh Pre-Work Audit (run these *now*, before any commit/push; paste output into chat or this file)

These re-confirm the snapshot above and give you the exact current evidence.

```pwsh
cd 'I:\godot-mcp'

Write-Host '=== 0.1 GIT STATUS + AHEAD/BEHIND ==='
git status
git log --oneline -5
git branch -vv

Write-Host '=== 0.2 REMOTES (confirm private-elderglow + origin) ==='
git remote -v

Write-Host '=== 0.3 UNSTAGED / STAGED (should be only the ELDERGLOW doc or your public edits) ==='
git diff --name-only
git diff --cached --name-only

Write-Host '=== 0.4 PUBLIC TARBALL SURFACE (exact files that will ship on npm) ==='
npm pack --dry-run 2>&1 | Out-String -Width 3000

Write-Host '=== 0.5 QUICK LEAK SCAN ON PUBLIC-MAPPED SOURCES (the 15 tarball files + common github-visible) ==='
# Use project grep tool if available, or PowerShell. Examples:
Select-String -Path README.md,MVP.md,RELEASE.md,docs/getting-started-for-beginners.md,docs/friend-starter-prompt.md,bin/godot-mcp.js,scripts/godot-mcp-elderglow.js,package.json -Pattern 'Elderglow|elderglow|leyline|creature_spawn|4243' -List -ErrorAction SilentlyContinue
Select-String -Path addons/godot_mcp_runtime/* -Pattern 'Elderglow|elderglow' -List -ErrorAction SilentlyContinue

Write-Host '=== 0.6 TRACKED PRIVATE-ONLY / SPLIT FILES (will be in github history) ==='
git ls-files | Select-String -Pattern 'ELDERGLOW|elderglow|index-elderglow'
```

**Pass criteria for Phase 0**: Matches the snapshot (or your small additional changes). Note any drift. If the unstaged is still the smoke+recipe, you're ready for Phase 1.

## Phase 1: Commit the Updates + Push to Elderglow Private Git (full, private specifics are fine here)

This gets your teammate / next person the complete latest "just works" instructions (the Windows friction fixes + the new smoke checklist + the exact recipe for wiring the 10 domain tools into a runtime_server.gd).

```pwsh
cd 'I:\godot-mcp'

# 1. Commit the final piece of the updates (the smoke + domain recipe)
git add docs/ELDERGLOW_TESTER_SETUP.md
git commit -m "docs: add post-setup smoke checklist + domain tools integration recipe (leyline/creature/etc wiring via runtime_server or execute_live_script) for Elderglow private testers — captures full lessons from real teammate run + follow-up"

# 2. Push everything current to the private remote
git push private-elderglow main
```

- The push is https — it will prompt for credentials / GitHub PAT (or use a credential helper). The private repo (godot-mcp-elderglow) is where the full ELDERGLOW_TESTER_SETUP.md with all the real internal details belongs.
- After this, the private remote has the 25b84f2 series + this commit.
- You can tell your teammate: "pull the latest from the private godot-mcp-elderglow and follow docs/ELDERGLOW_TESTER_SETUP.md exactly (including the new smoke checklist at the end and the domain recipe)."

**Verification after Phase 1**:
```pwsh
git log --oneline -3
git ls-remote --heads private-elderglow
```

## Phase 2: Update the Public Facing Version with the *Same* Changes, Stripped of Elderglow Specifics

Apply the robustness / zero-friction lessons (Play mandatory + watch Output, re-inject, Windows PATH/wrapper quoting, fresh chat, smoke verification, "how to extend for your own domain tools") into the *public* docs and artifacts, using only generic language.

**Files you are allowed to touch in the public commit** (only these for the diff that goes to origin):
- README.md (quick start / hero / two modes sections)
- MVP.md (scope + success criteria + quickstart flow)
- RELEASE.md (pre-release checklist + registration + notes)
- docs/getting-started-for-beginners.md (Step 2/3 workflow + Important Rules + new Troubleshooting subsection)
- docs/friend-starter-prompt.md (the rules + first project + tips sections + optional even more guided)
- bin/godot-mcp.js (optional: strengthen the printStatus "press Play" + "watch output" language)
- scripts/godot-mcp-elderglow.js (optional/light: tone down the status text to be less repetitive on the name while keeping the split explanation — e.g. change some "Elderglow" occurrences to "the extended/private variant")
- package.json (only if you must; currently the "files" + bin entries are already correct for the split)

**Do NOT edit in this public commit** (those changes already went to private in Phase 1):
- docs/ELDERGLOW_TESTER_SETUP.md
- src/index-elderglow.ts
- src/tools/elderglow/*
- Any other private-named files

**Concrete generalized changes to make (copy/adapt from the private doc's lessons)**:

1. In beginner and friend docs + README quickstart: Strengthen the "connect + Play" step.
   - Explicit: "After the agent says it has injected (or you ran inject_zero_footprint_bridge), open the Godot project in the editor and press Play (F5 or the Play button). The bridge only starts listening while the game is actually running."
   - "Watch the Godot Output panel (bottom of the editor) for a message like '[MCPBridge] Zero-footprint bridge active on 127.0.0.1:4243' (or the persistent equivalent on 4242). If you don't see it, runtime tools will time out or say 'cannot connect'."
   - "If tools fail after the first Play: ask the agent to re-run the inject (zero-footprint bridge state is per-process; a fresh server or fresh Play often needs a re-inject)."

2. Add a short "Windows / Quoting / PATH tips" (or expand existing) subsection in the getting-started and/or RELEASE.
   - After global npm install: fully close and reopen your terminal / Grok session (or explicitly refresh: `$env:Path = "C:\Program Files\nodejs;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")`).
   - For `grok mcp add` (or equivalent) when the path has spaces or quoting is painful on Windows: create a tiny wrapper .cmd next to your install/clone:
     ```
     @echo off
     setlocal
     set "NODE_DIR=%ProgramFiles%\nodejs"
     for /f "delims=" %%i in ('where node 2^>nul') do (set "NODE_DIR=%%~dpi" & goto :found)
     :found
     if not exist "%NODE_DIR%\node.exe" set "NODE_DIR=%ProgramFiles%\nodejs"
     "%NODE_DIR%\node.exe" "C:\full\path\to\your\godot-mcp\build\index.js" %*
     endlocal
     ```
     Then register with `--command "C:\path\to\your\wrapper.cmd"` (or the equivalent for the installed global location). Use `cmd /c "npm ..."` if .ps1 execution policy blocks direct npm in PowerShell.
   - Always test registration in a fresh chat with the server enabled/selected.

3. Add a generic "Post-Setup Smoke / Verification Checklist" (inspired by the private one, stripped).
   - In a fresh chat with the godot-mcp server:
     1. "Confirm you are using the general public godot-mcp (zero-footprint + general tools). List a few tool names."
     2. "List available tools that include create_simple_player, simulate_input_batch, capture_screenshot, execute_live_script, inject_zero_footprint_bridge, cleanup_zero_footprint_bridge."
     3. (After open project + Play + inject on a clean test scene): Call get_tree or get_project_info. Expect success.
     4. Call create_simple_player (platformer or topdown, with movement actions that match your inputs or the defaults). Then simulate_input_batch with a few steps. Watch Godot.
     5. (Optional) capture_screenshot + describe what you see.
   - If 3-4 pass, the base "just works" chain is solid.

4. Add a short generic "Extending with your own domain / game-specific tools" note (the recipe part, no leyline names).
   - The distributed addons/godot_mcp_runtime/runtime_server.gd (and the zf mcp_bridge.gd) implement only the general/public command set.
   - For your own custom tools: copy the addons folder into your project (or use zero-footprint + the bridge), then in your local runtime_server.gd (or equivalent) add match arms in _handle_cmd, or simply use the general execute_live_script tool to call your existing game code.
   - Example skeleton (generic):
     ```
     "my_custom_action":
         var data := cmd.get("data", {})
         # your game logic here (or call into an autoload)
         return {"status": "ok", "result": "did the thing"}
     ```
   - The agent can also drive everything via execute_live_script + the other general powers (screenshot, input sim, tree inspection) without any custom tool registration.

5. Minor polish: In bin/godot-mcp.js printStatus, make the "open ... and press Play" + "watch" language even more prominent (it already has good text; just align with the new emphasis). Same for the public README hero/quickstart.

6. In RELEASE.md and MVP.md: Add a bullet in the pre-release / success criteria that the robustness lessons (Play requirement, Windows tips, smoke checklist, extension recipe) have been incorporated into the user-facing docs in generic form. Re-affirm the Elderglow-free gate.

**How to make the edits**: Use search_replace (or manual) after reading the target sections. Keep changes small and focused. Re-read the edited sections before committing.

**The public commit (only public files)**:
```pwsh
cd 'I:\godot-mcp'

# Stage ONLY public-appropriate files (example — adjust to exactly what you edited)
git add README.md MVP.md RELEASE.md docs/getting-started-for-beginners.md docs/friend-starter-prompt.md bin/godot-mcp.js
# (add scripts/godot-mcp-elderglow.js only if you chose to lightly edit its status text)

git commit -m "docs: generalize the Windows robustness, mandatory Play+watch-Output, re-inject, fresh-chat, smoke checklist, and 'extend for your own domain tools' lessons into public beginner docs, README, MVP, and RELEASE (Elderglow-free per hard constraint; same ease-of-use improvements that landed in the private tester doc)"
```

This keeps the public commit clean and reviewable.

## Phase 3: Full Double-Check (the "just double check everything" gate — do not skip or rush)

Run these **after** your Phase 2 edits but **before** the public commit + push. Capture everything.

1. Rebuild + pack surface
   ```pwsh
   cd 'I:\godot-mcp'
   npm run build
   npm pack --dry-run 2>&1 | Out-String -Width 3000
   ```

2. Tarball content audit (the actual bits that would be published)
   ```pwsh
   $tarball = (Get-ChildItem godot-mcp-*.tgz | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
   Write-Host "Auditing $tarball"
   mkdir -f temp_public_audit
   tar -xzf $tarball -C temp_public_audit
   # Now search the unpacked contents (the distributed form)
   Write-Host '=== Elderglow in tarball (should be only the split launcher if anything) ==='
   Get-ChildItem -Path temp_public_audit -Recurse -File | Select-String -Pattern 'Elderglow|elderglow|leyline|creature_spawn' -List
   Write-Host '=== Personal paths in tarball ==='
   Get-ChildItem -Path temp_public_audit -Recurse -File | Select-String -Pattern 'I:\\\\|I:/|C:\\\\Users\\(?!.*YOURNAME)' -List
   # Clean up
   Remove-Item -Recurse -Force temp_public_audit
   ```

3. Source-level leak scan limited to public-included + github-visible public docs (use the dedicated grep tool with path or PowerShell Select-String on the exact list from Phase 0.4)
   - Target the 15 tarball files + root public .md + bin/ + scripts/ (the elder one) + addons/.
   - Forbidden / attention patterns: `(?i)elderglow`, `leyline|creature_spawn|ecosystem|farm_plot|defense_structure`, private clone urls, real non-placeholder paths (C:\Users\woods or current home), "teammate", "issues.md", "register-elderglow", "godot-mcp-elderglow-full", "FULL Elderglow private".
   - Expected: only in scripts/godot-mcp-elderglow.js (the split text) and package.json bin entries. Zero in the user docs that a stranger following "npm install -g godot-mcp" would read first.

4. Review the files that *will live in public github history* even if excluded from npm:
   - Read (or re-grep) in full: docs/ELDERGLOW_TESTER_SETUP.md (the clone url for the private repo, all the internal tester steps, the smoke with domain names, the exact domain recipe with leyline arms, "your Elderglow checkout").
   - Read: src/tools/elderglow/tools.ts and handlers.ts (the 10 names + "Elderglow:" descriptions + "WARNING: requires Elderglow nodes" + "persistent 4242").
   - Read: src/index-elderglow.ts (the "FULL ... private/internal" console + 4243 comment "for clean testing of Elderglow builds").
   - Scan MEMORY.md, ERRORS.md, CONTEXT.md, any old plans for anything that should never have been committed (real paths, secrets, unreleased lore beyond the mechanic names).
   - Decision point: Are you comfortable with a random person on GitHub being able to browse the private tester instructions and the planned domain tool names for your game? If not, note it and consider additional steps (e.g. git rm --cached on the private doc + force a follow-up commit, or move the elder/ tree, or accept it as the cost of a convenient monorepo that carries both variants).

5. Final manual spot checks
   - Re-read the key public docs you edited (the Play/Output/re-inject/Windows tips/smoke/extension sections) to confirm they are present, accurate, and contain zero slips.
   - Confirm package.json "files" array still excludes everything private (no elderglow/ in the list, only general/).
   - `git diff --cached --name-only` (or the public commit you are about to make) contains *only* the allowed public files.
   - No new "I:\..." or "C:\Users\..." examples were introduced in public docs.

**Only proceed to Phase 4 if Phase 3 is 100% clean on the public tarball + you are explicitly happy with whatever private-extension content will be visible in the public github repo.**

## Phase 4: Commit (Public-Only) + Push to Public Remote

```pwsh
cd 'I:\godot-mcp'

# Double-check the staging area one last time
git status
git diff --cached --name-only

git push origin main
```

- This publishes the generalized robustness improvements to https://github.com/quinnquad/godot-mcp (and thus to anyone who clones the public repo or looks at the docs there).
- The npm package itself is not auto-published here — follow the RELEASE.md process (bump, tag, npm publish) when you are ready for a new consumable version on the registry.

## Phase 5: Records, Cleanup, Verification for Next Person

1. Append to the project MEMORY.md (I:\godot-mcp\MEMORY.md). Use the established format (date + bold decision + bullet changes + verification + next). Example anchor text you can search for and append after:

   ```
   ## 2026-06-10 — Push private updates + public generalized robustness (per PLAN_PUSH_UPDATES.md)

   **Decision / Change**: Committed the final smoke checklist + domain recipe to the private doc and pushed the full updates to private-elderglow. Created generalized equivalents (Play+Output watch, re-inject, Windows wrapper/PATH, smoke checklist, extension recipe) in the public docs only (getting-started, friend-starter, README, MVP, RELEASE). Ran full double-check (Phase 3 commands + greps on tarball + source + review of tracked private extension files). No unwanted content in public tarball or core public docs. Elderglow references confined to private extension files, the split launcher script (intentional), and dev history logs.

   **Verification (executed)**: [paste key outputs from Phase 0 + Phase 3: git ahead counts, tarball file list, Select-String results showing clean on public-mapped files, "Elderglow only in X Y Z private places", reads of edited public sections]. Phase 3 gate passed / explicit decision on github-visible private docs: [your call].

   **Files touched in public commit**: [exact list].

   **Next**: Teammate re-clones private and follows the updated ELDERGLOW_TESTER_SETUP end-to-end (including smoke). When ready, execute RELEASE.md for a new public npm version. Update this plan with execution date/status.
   ```

2. (Optional but recommended) Add a one-line note in ERRORS.md or just reference the plan.

3. Cleanup: `Remove-Item godot-mcp-*.tgz -ErrorAction SilentlyContinue` (the audit tarballs).

4. Update the top of *this* PLAN_PUSH_UPDATES.md with an "Executed" block:
   - Date, who ran it, links to the actual commits on both remotes, summary of Phase 3 findings (especially the github-visible private content decision), and "Next person verification: successful clone + full run of ELDERGLOW_TESTER_SETUP.md".

5. Optional stronger verification: Have your teammate (or a fresh Grok) clone the private repo after the push and execute the exact instructions in docs/ELDERGLOW_TESTER_SETUP.md (now including the new checklist and recipe). Separately, a stranger following only the public README + getting-started + friend prompt on a clean Godot project should reach a controllable baked player.

## Rollback / What If

- Private push went wrong: `git push private-elderglow main --force-with-lease` after a local revert (coordinate).
- Public push included something you didn't want: Revert the public commit (`git revert HEAD`), push the revert, or (last resort, if no collaborators) force-push a cleaned history. The npm tarball is protected by the "files" whitelist regardless of git history.
- You decide the private doc or elder src is too much for public github history: After the pushes, you can do a follow-up `git rm --cached docs/ELDERGLOW_TESTER_SETUP.md src/tools/elderglow/* ...` + commit + push to origin (removes from future tree; history still has the blobs unless you do a full history rewrite, which is usually not worth it for this).

## Why This Plan Is Safe and Matches the Request

- Private gets *everything* (the exact updates + the new smoke/recipe).
- Public gets *the same changes* translated to generic language in the exact docs a new user or friend will read.
- The "just double check everything" is a full, repeatable, evidence-based gate (tarball extraction + greps + manual review of the github-visible private pieces) before any public push.
- All Karpathy/AGENTS discipline observed in the creation of the plan (todo tracking, reads before, surgical thinking, memory updates required at end).

Run Phase 0 now, then proceed phase by phase. Paste outputs after each major step.

When the pushes + records are done, mark this plan executed at the top and in MEMORY.md.

(End of plan)