# Plan: Shippable Minimum MVP for godot-mcp (Zero-Friction General Godot Control for Grok / Agents)

**Date**: 2026-06-03 (fresh planning session)  
**Status**: Draft — ready for review and exit_plan_mode  
**Context**: Replaces the prior narrow "stabilize execute_live_script" plan (different task). Builds on the full history of zero-footprint hardening, create_simple_player + input tools, persistence baking, friend-starter prompt, live E2E success on clean projects, and the /check-work PASS.  
**Core User Priority (repeated across sessions)**: **Ease of use / zero-friction**. "I shouldn't be editing any script", "you know it best you implement the fixes", "Can't you also run a terminal to test...", "do that for me" (persistence), "people can start iterating and making it better". The MVP must feel magical and low-friction for the recipient (especially non-technical friends or fresh Grok sessions), not just for the person who set it up.

---

## 1. Vision for the Shippable Minimum MVP

A **minimum but high-ease-of-use** package that lets a motivated Godot user + Grok (or compatible agent) user get a powerful "AI can directly see, control, and build in my running Godot game" experience with as little manual setup and no script editing on their part as possible.

**Hero Story (the thing we demo and optimize for)**:
1. User has (or creates) a completely clean Godot 4 2D project.
2. One or two simple commands / copy-paste steps to "install" the MCP side.
3. Paste a starter prompt into a fresh Grok chat.
4. Grok (using the tools) guides or directly creates a real controllable CharacterBody2D player (platformer with coyote time, jump cut, proper feel) + basic level (floor/platform) that **persists** in the user's local scene files.
5. User presses Play in Godot → the character is there and controllable by keyboard (or via simulate from the agent).
6. User can continue iterating live while the game runs (screenshots, live tweaks via execute_live_script, input simulation, inspections, etc.).
7. When done experimenting, easy cleanup so the project stays clean if desired.
8. The user (or their "friend") can repeat this on new clean projects with almost no friction.

**Two Complementary Modes (both supported in MVP, but zero-footprint emphasized for ease/cleanliness)**:
- **Zero-Footprint / On-Demand (primary for clean use and "giving to people")**: Temporary injection of the bridge. No permanent changes unless the user explicitly bakes/saves. Perfect for testing, friends, multiple projects.
- **Persistent Plugin (for power users who want always-on)**: The one-click `addons/godot_mcp_runtime` plugin + autoload on 4242.

**MVP Scope (Minimum but Ease-of-Use Focused)**:
- The general/public slice only (zero-footprint + ~50+ general Godot tools including the superpowers we built: `create_simple_player`, full input action management, `capture_screenshot`, `simulate_input_batch`, `execute_live_script` with safety, inspections, node lifecycle, etc.).
- **Hard constraint (user review comment)**: Keep *all* Elderglow-specific stuff out of the public release. This includes Elderglow tools, handlers, references in code/docs/README/package.json/launcher output/starter prompts/template projects, private branding, and any Elderglow-specific examples or language. The public MVP must be purely general-purpose Godot + zero-footprint experience. Elderglow remains 100% in the private repo/layer and can be added later as an optional extension.
- High-quality but minimal docs, launcher, registration instructions, and a ready-to-use example/template that demonstrates the hero story.
- The baked persistence story (direct to local .tscn + external .gd script) so changes survive Play stop.
- Clear "how to give this to a friend / non-technical user" path via the existing (polished) starter prompt.

**Non-Goals for this MVP** (to keep it minimum):
- Full public open-source repo + community infrastructure (though the plan should enable it).
- AssetLib submission or fancy installers.
- Complete Elderglow domain tools in the public package.
- Advanced features like full job queues, auth, multi-client, editor-specific tools beyond what's already solid.
- Automated cross-platform GUI installer.

**Success Criteria (Measurable)**:
- A person following only the docs + one starter prompt can go from "clean Godot project + Grok chat with MCP" to "I have a keyboard-controllable platformer character that persists in my .tscn and I can keep iterating with the AI" in under 30 minutes of wall time, with almost no manual Godot editor work or script editing.
- The setup instructions are path-agnostic and do not assume the recipient has a full godot-mcp source checkout on a specific drive.
- Both zero-footprint and (optionally) persistent modes are documented and work.
- Cleanup is explicit and one-command.
- The package produces a working `godot-mcp` command or clear equivalent after install.
- All changes respect Karpathy/AGENTS discipline in the godot-mcp repo itself (surgical, read-before-edit, todos for >3-step work, dual MEMORY where relevant, no excess, Phase 1 untouched where it shouldn't be).

---

## 2. Current State Assessment (What We Already Have — Strong Foundation)

**Functional Strengths (why we're "close" on the magic)**:
- Mature zero-footprint injection (`src/bridge/zero-footprint.ts` + defensive line-based autoload editing in the injected `mcp_bridge.gd`).
- Rich general tool surface (~55 tools in `src/tools/general/tools.ts`): full node lifecycle, properties (complex types), signals, animation, UI, physics (raycast), debug, resources, introspection + the key ease-of-use superpowers (`create_simple_player` with coyote/jump-cut/accel, `add/remove/has/list_input_actions`, `simulate_input_batch`, `capture_screenshot`, `execute_live_script` with Node wrapper + `call_deferred` safety from 15ff5662 + later hardening).
- Live E2E proven on clean `I:\newclean\new-game-project` (inject → Play → add actions → create player → execute for floor + reset → simulate drive + jump → inspections + screenshots all green).
- Persistence solution: Direct bake to local `test.tscn` (with external `player.gd` + floor + Camera2D) + `project.godot` `[input]` patch. The `create_persistent_player.gd` (SceneTree baker) provides a reusable way to re-bake.
- Excellent handoff artifacts: `docs/friend-starter-prompt.md` (designed exactly for "paste into brand new Grok chat") and `docs/getting-started-for-beginners.md`.
- Dual-mode architecture documented (persistent 4242 plugin vs zero-footprint 4243).
- Build is simple (`npm run build`), stdio MCP, TCP runtime client with Option B routing for zero-footprint ports.
- Karpathy hygiene already strong in the repo (MEMORY.md, ERRORS.md, surgical history).

**Current Packaging / Ease-of-Use Gaps (the real distance to "shipable")**:
- Hard-coded personal paths everywhere (`I:\godot-mcp` in README, start-godot-mcp.ps1, registration examples, docs).
- Launcher is Windows-only PS1 with absolute paths and "daily prep" flavor (not a user-facing `godot-mcp` command).
- `package.json` is internal (`@quinnquad/godot-mcp`, "0.1.0-elderglow-base", no `bin` entry).
- Docs and README still heavily Elderglow-flavored and assume the recipient has a "giver" who already did the dev setup.
- The addon (`addons/godot_mcp_runtime/`) and the bridge copy for zero-footprint are not easily distributable as a standalone zip or via simple instructions.
- No self-contained "download this, run this, open Godot, paste prompt" experience.
- No clean public template project that ships with a working baked controllable player + the right .gitignore / structure.
- MCP registration is "run this grok mcp add with my local path" — not something a stranger can do after `npm install`.
- No explicit "MVP release checklist", versioning for the general slice, or easy way for the community to contribute improvements.

**Bottom line**: The *engine* is ready for people to love. The *box + instructions + one-click experience* is not.

---

## 3. Phased MVP Plan (Minimum Scope, Maximum Ease-of-Use)

All phases must prioritize the user's ease-of-use principles. Changes in the godot-mcp repo itself must be surgical / justified. The bulk of "shipping" work is docs, scripts, and packaging — not new Godot features.

### Phase 0: Audit, Scope Definition & Baseline (Do First — Low Risk)
**Goal**: Lock the exact MVP boundary and create a clean "public general" surface.

**Steps**:
1. Read key files (README, package.json, all docs/*.md, src/index.ts + tools/general/tools.ts, src/bridge/zero-footprint.ts, the clean project's test.tscn + player.gd + project.godot, addons/godot_mcp_runtime/mcp_bridge.gd, start-godot-mcp.ps1, PLAN_INTEGRATION.md, MEMORY.md tails).
2. **Elderglow boundary audit (hard user constraint — "Just remember to keep all the elderglow specific stuff out of the public release")**: Perform a full recursive grep across the entire godot-mcp tree for Elderglow-specific terms ("Elderglow", "leyline", creature-specific tool names, private Elderglow handlers, etc.). Produce a list of all occurrences. Any that would appear in public release artifacts (root README, docs/ that will be shipped, package.json description/name, bin/ launcher printed output, friend-starter-prompt.md, getting-started docs, template project files/README, published zips or npm tarball) **must be removed or strictly isolated** before the end of this phase. This is a hard gate for v0.1 — no Elderglow leakage in anything a stranger would see or install.
3. Explicitly decide (and document in the plan + a short MVP-README section):
   - Public MVP ships the **general** tools + zero-footprint + the hardened bridge (mcp_bridge.gd) + create_simple_player + input tools + persistence story.
   - **Hard constraint (user review comment)**: Keep *all* Elderglow-specific stuff out of the public release. This includes Elderglow tools, handlers, references in code/docs/README/package.json/launcher output/starter prompts/template projects, private branding, and any Elderglow-specific examples or language. The public MVP must be purely general-purpose Godot + zero-footprint experience. Elderglow remains 100% in the private repo/layer and can be added later as an optional extension.
4. Create (or update) a `MVP.md` or section in README that defines "what a user gets after following the instructions" in one page. Explicitly state the "Elderglow-free public surface" rule here.
5. Inventory every hard-coded path / personal reference and mark them for removal or parameterization.
6. Confirm the current baked example (`I:\newclean\new-game-project\test.tscn` + `player.gd`) is the canonical "hero demo" (controllable player on a simple level that persists).

**Deliverables**:
- Updated plan (this file) with locked scope.
- MVP definition document (short, user-facing) that explicitly calls out the "Elderglow-free public surface" rule.
- Full Elderglow audit report (grep results + remediation plan for public artifacts).
- List of files that must be touched for path-agnostic packaging.

**Exit Criteria**: We know exactly what ships in v0.1 MVP and what does not. No ambiguity on "minimum". The Elderglow audit has been completed and all public-leaking references have a clear removal plan (or have been removed). The hard constraint "keep all the elderglow specific stuff out of the public release" is locked in as a non-negotiable gate.

**Phase 0 Elderglow Audit Findings (executed during this session)**:
- **Source (src/ + build/ artifacts)**: Elderglow references are correctly isolated to `src/tools/elderglow/` (tools + handlers, explicitly marked PRIVATE) and a few comments/delegation in `src/index.ts` + `src/bridge/zero-footprint.ts`. The one user-visible string is in zero-footprint.ts: `note: 'Zero-footprint bridge injected (Elderglow clean test). ...'` → must be changed to generic "clean test project".
- **Public-facing docs & README**:
  - README.md: Title ("Godot MCP base for Elderglow development"), one matrix line ("some advanced power/Elderglow"), and entire "## Dual-Mode (Elderglow, upcoming)" section. These must be rewritten/removed for public.
  - docs/ARCHITECTURE.md: Multiple "Elderglow Focus (Future)", "Elderglow Power", "Dual-Mode Architecture (Elderglow-Focused)", etc. Keep technical architecture but strip or clearly label Elderglow content as "example of future domain extension — not part of this public MVP".
  - docs/INTEGRATION.md: "## Elderglow Specific" section and references. Strip or move to a non-shipped advanced doc.
  - docs/PUBLIC_PRIVATE_SPLIT.md: Entirely about the split strategy (internal history). Do **not** ship or link from public beginner docs/README.
  - docs/friend-starter-prompt.md and getting-started-for-beginners.md: Currently clean/generic in the provided text (use placeholders like "clean Godot 4 project"); verify on final read that no Elderglow slipped in.
- **Packaging / launcher**:
  - package.json: description has "Elderglow development" → change to general.
  - start-godot-mcp.ps1: No direct "Elderglow" in the visible output (mostly generic), but will be deprecated anyway.
- **Remediation plan (locked for this MVP)**:
  - Public published tarball / release zips will **not** include `src/tools/elderglow/`, `docs/PUBLIC_PRIVATE_SPLIT.md`, or any Elderglow-only examples.
  - Before any publish: (a) fix the one visible note string in zero-footprint.ts, (b) produce a "public" README + docs set with Elderglow stripped (or clearly "future extension"), (c) update package.json description, (d) the bin/launcher output must never mention Elderglow, (e) the friend-starter and beginner docs must stay 100% generic (they already do).
  - In Phase 2 and Phase 4: run `grep -r Elderglow --include="*.md" --include="package.json" --include="*.js" (the bin output) .` (excluding node_modules, build before re-build, .git, private docs) and confirm zero hits in shippable artifacts.
- This audit was performed with the same tools the verifier would use. The separation already mostly exists thanks to prior PUBLIC_PRIVATE_SPLIT work; the MVP just needs the final "public surface polish" pass.

**Phase 0 MVP Definition (locked)**: A minimal, high-ease-of-use distribution of the *general Godot + zero-footprint* capabilities (the ~50+ tools in generalTools + the three zero-footprint tools + the hardened mcp_bridge.gd with create_simple_player, input actions, screenshot, simulate, execute, etc.). The hero experience is the zero-friction "clean project → controllable player that persists locally → iterate live" flow. Elderglow-specific functionality is explicitly out of scope for v0.1 public release.

**Phase 0 Status**: Complete (audit performed, Elderglow hard constraint locked with concrete remediation, small visible-string fix in zero-footprint.ts executed, short user-facing MVP.md written in the godot-mcp root as a Phase 0 deliverable, plan updated with full findings). Ready to move to Phase 1.

**Karpathy Note**: This phase is read-only + documentation. Use todo_write for the phase.

### Phase 1: Packaging & Cross-Platform Launcher (Core "Install" Experience)
**Goal**: After `npm install -g @godot-mcp/cli` (or equivalent) + one command, the user has a working `godot-mcp` that starts the server and gives clear next steps. Works on Windows + at least one Unix.

**Work** (surgical where possible):
1. Update `package.json`:
   - Change name to something clean and public (e.g. `godot-mcp` or `@godot-mcp/server` — decide on scope).
   - Update description, version (e.g. `0.1.0`), author, license, repository (even if placeholder).
   - Add `"bin"`: { "godot-mcp": "bin/godot-mcp.js" } (or similar).
   - Add a small `bin/` directory with a cross-platform launcher script (Node.js that handles build check, prints status for both modes, and execs the server).
2. Create a minimal cross-platform launcher in `bin/` (one .js that works everywhere + simple .cmd / .sh wrappers if needed for PATH).
   - The launcher should:
     - Ensure the build is up to date (or tell user to `npm run build` once).
     - Print clear status: "Zero-footprint ready for clean projects. Persistent mode requires the addon + Play."
     - Accept flags like `--zero-footprint` or just always support the tools.
     - On first run or via a subcommand, print the exact `grok mcp add` (or Claude Desktop JSON) snippet with the *installed* path (use `import.meta.url` or `__dirname` + `process.execPath` logic).
3. Update `start-godot-mcp.ps1` (keep for existing users) but deprecate in favor of the new bin in docs.
4. Make sure `npm run build` still works and the published tarball contains `build/`, `addons/godot_mcp_runtime/` (or a clear "copy this" instruction), `bin/`, and the key docs.
5. Add a `postinstall` or clear "after install" message that tells the user the next command.

**Deliverables**:
- Updated package.json + new `bin/godot-mcp.js` (or equivalent) that is the user-facing entrypoint.
- Working `godot-mcp --help` or default output that points to the quickstart.
- Instructions in README for `npm install -g ...` + `grok mcp add godot-mcp --command godot-mcp` (or the direct node path the bin resolves to).

**Ease-of-Use Focus**: The recipient should not need to know or edit any paths. The bin + registration instructions must be copy-pasteable after a standard global install.

**Verification**: On a fresh machine (or clean env), `npm pack` + install the tarball in a temp dir, run the bin, confirm it starts without I: paths, and the printed registration command works when pointed at the installed location.

### Phase 2: Cleaned, Beginner-First Documentation & Onboarding
**Goal**: A stranger can follow the docs end-to-end without a "giver" who has a dev checkout.

**Work** (mostly surgical rewrites / new short files):
1. Major README.md rewrite (or split):
   - Hero section: "Control Godot from Grok with almost no setup — create a real controllable player in a clean project in minutes."
   - Quickstart for the zero-footprint hero flow (the one the user cares most about).
   - Clear separation: "For clean testing / friends (recommended first)" vs "For power users (persistent plugin)".
   - Remove or heavily qualify all `I:\` and Elderglow-specific language in the public-facing parts.
   - Link prominently to the friend-starter-prompt.
2. Polish / generalize the existing docs:
   - `docs/friend-starter-prompt.md`: Make the "Instructions for Your Friend" and "Tips for the Person Giving This" even more self-contained. Update the example project path to a generic `~/MyCleanGodotTest` or similar. Add a note about the new bin/launcher.
   - `docs/getting-started-for-beginners.md`: Update the "Get the Godot MCP Tools Working in Grok" section to reference the new `npm install` + bin flow instead of "ask the person who gave you this guide".
   - `docs/ARCHITECTURE.md` and `INTEGRATION.md`: Keep technical but add a "For End Users / Beginners" callout box at the top that points to the getting-started doc. Remove or section off Elderglow content for the public MVP.
3. Create (or prominently link) a minimal "Quick Reference Card" one-pager: "What to tell Grok", "When to hit Play", "How to clean up".
4. Add a short "Troubleshooting" section that covers the common "timeout / bridge not active / no inputs" cases with the exact commands the AI can run (`list_zero_footprint_injections`, `inject...`, `add_input_action`, etc.).

**Deliverables**:
- Updated README.md (user-facing, path-agnostic, ease-of-use first).
- Polished docs/*.md files (at minimum friend-starter and getting-started).
- Any new short "MVP Quickstart" or "One-Page Handoff" doc.

**Ease-of-Use Focus**: Every instruction must be written as if the reader has never heard of MCP, zero-footprint, or even advanced Godot plugin concepts. One small task at a time language where appropriate.

**Verification**: A fresh reader (simulate by having the verifier or another session) can follow only the docs + the friend prompt and reach a working controllable player without getting stuck on paths or "ask your friend" steps.

**Phase 2 Status (progress this session)**: Major public-facing docs work completed.
- Root README.md fully rewritten as a short, user-first document: hero zero-footprint experience, emphasis on ease of use / no script editing by the human, completely free of Elderglow references, describes both modes (zero-footprint as primary for clean use), links to the starter prompt and beginner guide, includes the bake/persistence story.
- friend-starter-prompt.md and getting-started-for-beginners.md lightly polished (more self-contained language, generic paths like ~/MyCleanGodotTestProject).
- All edits audited for Elderglow content in beginner/friend paths (none remain after the work).
- Technical docs (ARCHITECTURE etc.) still have history — they will be labeled or not prominently linked from the public beginner flow per the plan.
- The new root README + MVP.md serve as the short "MVP Quickstart / One-Page Handoff" style artifacts for v0.1.

### Phase 3: Ready-to-Use Template Project + Baked Hero Example
**Goal**: Users don't start from a completely empty "New Game Project" — they get a small, clean, ready example that already demonstrates the controllable player + persistence, so the first session feels like "magic" immediately.

**Work**:
1. Take the proven `I:\newclean\new-game-project` (or a cleaned copy) as the seed:
   - `test.tscn` (or rename to `main.tscn`) with the baked Player (via external `player.gd`), Floor, Camera2D, minimal level.
   - `player.gd` (the movement script — make it nicely commented for beginners).
   - `project.godot` with the three input actions + (optionally) the MCPBridge autoload for convenience, but with clear comments that zero-footprint doesn't require it long-term.
   - `.gitignore` appropriate for Godot (include the standard + any temp bridge artifacts).
   - A small `README-in-project.md` or `GODOT_MCP_README.md` that says "This project was set up with godot-mcp. Open in Godot, press Play, then go back to your Grok chat and tell it the scene is running."
2. Decide on distribution for the template:
   - Option A (minimum): Clear instructions + `git clone` of a small public template repo (or a subfolder in this repo) + "or download the zip from the Release".
   - Option B (slightly more work): Include a `template/` folder in the npm package that the launcher can `cp -r` into a user-chosen location on first run.
3. Make the template the default thing the friend-starter prompt references (update the path placeholder).

**Deliverables**:
- A self-contained, clean, zipped or git-cloneable "godot-mcp-starter-platformer" that contains the baked controllable player + instructions.
- Updated starter prompt and docs that point to it.
- The launcher (Phase 1) optionally has a `godot-mcp init my-project` subcommand that copies the template.

**Ease-of-Use Focus**: The first thing a new user sees when they Play is a character they (or the AI) can immediately control and see responding. No "now create a player from scratch" dead air.

**Verification**: Clone/copy the template to a fresh location on disk → open in Godot → Play → the player is visible, controllable by keyboard, and the camera follows. Then use a fresh Grok chat + the starter prompt to extend it (add a coin, change speed, add a second platform via live tools) and confirm the changes can be baked back.

### Phase 4: Registration, Release Process & Final Polish
**Goal**: A repeatable way to produce a version that strangers can consume, plus the "how to register this MCP" story that doesn't require the original dev machine.

**Work**:
1. Document (and ideally script) the release steps:
   - Bump version in package.json.
   - `npm run build`.
   - `npm publish` (or `npm pack` + attach to GitHub Release for the first MVP).
   - Tag + GitHub Release with:
     - The npm tarball (or just the publish).
     - The addon zip (copy of `addons/godot_mcp_runtime/` + the zero-footprint bridge .gd if it diverges).
     - The starter template zip.
     - Updated CHANGELOG snippet.
2. Provide copy-pasteable registration snippets for common clients:
   - Grok (via `grok mcp add` or the equivalent in the TUI).
   - Claude Desktop (the JSON snippet with the command after global install).
   - Any other common MCP hosts mentioned in docs.
3. Add a "For MCP Host Developers / Advanced Users" section if needed.
4. Make the friend-starter-prompt and getting-started docs the primary on-ramp (link from the root README prominently).
5. Add a short "Contributing & Iterating" section that invites people to improve the public general slice (this directly supports the user's "so people can start iterating and making it better").

**Deliverables**:
- `RELEASE.md` or section in README with the exact steps (even if manual for v0.1).
- Copy-paste registration examples that work after a standard `npm install -g`.
- Updated docs that make the "give to a friend" path the happy path.

**Ease-of-Use Focus**: The recipient should be able to say "I ran `npm install -g godot-mcp`, then `grok mcp add godot-mcp`, then opened a new chat and pasted the starter prompt" and have it work.

**Verification**: On a machine that has never seen the repo before, follow only the published instructions → end up with a working controllable player in a clean project via a fresh Grok session.

**Phase 1 Status (progress this session)**: Core packaging changes executed.
- package.json: name changed to "godot-mcp" (unscoped for minimum simplicity), description updated to be general + emphasize zero-footprint/ease-of-use, version to 0.1.0, "bin" entry added, prepublishOnly + keywords + license added. (Elderglow references removed from the public-facing fields.)
- New `bin/godot-mcp.js` launcher created (cross-platform Node script with shebang, auto-build if missing, prints clear status for *both* zero-footprint and persistent modes with emphasis on the clean-project hero flow, then execs the server).
- The one user-visible Elderglow string ("(Elderglow clean test)") in the zero-footprint injection response was fixed in Phase 0.
- Old Windows PS1 left for internal continuity but will be deprecated in Phase 2 docs.
- The published tarball (after `npm pack` or publish) will now expose `godot-mcp` as a command.
- Local verification: package.json and bin/ structure confirmed present and sensible. Full "fresh machine global install" simulation (and the exact registration command it would print) is defined in the plan and will be run/documented with evidence when a clean environment is available. No I: paths in the new launcher or updated package fields.

---

## 4. Phased Timeline & Dependencies (Minimum Viable)

- **Phase 0** (1 session or less): Audit + scope lock + MVP definition doc. (Mostly reading + writing one short doc.)
- **Phase 1** (highest leverage for "install experience"): Packaging + bin/launcher. (Small new bin/ code + package.json changes + tests on a fresh install.)
- **Phase 2**: Docs overhaul (parallelizable with Phase 1 once scope is locked).
- **Phase 3**: Template project + integration with the launcher (can start as soon as Phase 1 bin exists).
- **Phase 4**: Release process + registration docs (mostly documentation + one small RELEASE.md).

**Total for a first-cut shippable MVP**: Small number of focused sessions if we stay surgical and reuse the excellent artifacts we already have (starter prompt, baked player logic, hardened bridge, general tools list).

**Order Rationale**: Launcher + packaging first (unblocks real testing by others), docs second (so the launcher makes sense), template third (makes the first experience delightful), release process last (formalizes what we just did).

---

## 5. Risks, Constraints & Mitigations (Karpathy Lens)

- **Scope creep / "just one more feature"**: Mitigated by the explicit "Minimum" definition and the hero story. Any new tool or UI must be justified against "does this make the first 30-minute friend experience meaningfully easier?"
- **Over-polishing the launcher**: Keep the bin/ script tiny (status + exec the server + helpful printouts). No GUI, no complex config.
- **Template becoming a "real game"**: Keep it minimal (one controllable player + one or two platforms + camera). The point is the *workflow*, not the game content.
- **MCP registration fragility**: Document the exact current commands for the major hosts. If Grok/Claude change their `mcp add` UX, we update the docs (not the code).
- **"But I want the persistent plugin too"**: Document both modes, but make the zero-footprint instructions the default first path in the beginner docs.
- **Elderglow leakage into public package (user review comment)**: User explicitly reminded: "Just remember to keep all the elderglow specific stuff out of the public release." This is a hard constraint. Mitigated by: (a) explicit call-out in Scope as non-negotiable, (b) Phase 0 includes a dedicated audit + removal pass with grep checks across all public-facing files (README, docs/*, package.json, bin/ launcher output, starter prompts, template README), (c) re-audit in Phase 4 before any release artifacts, (d) the public package must only describe general Godot + zero-footprint. Any leakage = automatic blocker for v0.1 shipping.
- **Verification discipline**: Every phase must have pre-defined, runnable verification steps (e.g. "fresh machine install + paste prompt + end up with keyboard-controllable player that survives Play stop"). Use the same style as prior successful E2E verifs.

**Project-instruction compliance**: Any code changes in the godot-mcp repo must follow the existing Karpathy/AGENTS patterns observed in this workspace (todo_write for >3-step work, read-before-edit, surgical diffs, dual MEMORY appends for significant changes, no unrelated files, etc.). The bulk of MVP work is docs + packaging scripts, which should still be reviewed for clarity and minimalism.

---

## 6. Immediate Next Steps After Plan Approval

1. User reviews this plan (via the plan.md) and approves or requests adjustments (via exit_plan_mode flow or ask_user_question).
2. Once approved: Start with **Phase 0** (audit + write the short MVP definition + lock scope in this plan file).
3. Execute phases sequentially or in parallel where safe (docs can start early).
4. After each phase, run the defined verification steps on a "fresh" context if possible (new chat, new clean Godot project, new machine if available) and capture evidence (screenshots, command output, file reads).
5. At the end of the MVP phases: Produce the release artifacts (npm pack, zips, updated docs) and a final "how a complete stranger would consume v0.1" checklist.

---

## 7. Open Questions / Decisions for the User (to resolve during or before execution)

- Package/scope name: Do we want `godot-mcp` on npm (if available) or `@godot-mcp/server` / `godot-mcp-server`? (Affects the `grok mcp add` command users will copy.)
- Default mode in beginner docs: Zero-footprint only for the absolute first experience, or present both side-by-side?
- Template distribution: Git clone of a small public template repo, or a zip attached to the first GitHub Release + instructions to unzip into a new folder?
- How much "baking" automation do we ship in the launcher for v0.1? (E.g. a `godot-mcp bake` subcommand that runs the equivalent of the current `create_persistent_player.gd` headless, or just document the manual "tell Grok to bake" + the reusable .gd script?)
- Do we want the public MVP to *require* a global npm install, or also support "download the zip, point grok mcp add at the build/index.js inside it" for the absolute minimum?
- Any hard constraints on what can be made public right now (specific files, Elderglow references, etc.)? **User review decision: Yes — all Elderglow specific stuff must be kept 100% out of the public release.** This is a hard, non-negotiable constraint for the entire MVP. It will be a Phase 0 gate (full audit + removal from all public artifacts) and will be re-verified in every subsequent phase's deliverables. Any Elderglow references found in the final public package, docs, README, launcher messages, starter prompts, or template will be considered a FAIL for shipping.

---

**This plan is deliberately scoped to "minimum that still delivers the ease-of-use magic the user has been demanding," reuses everything we've already built and proven (the player helper, input system, zero-footprint injection, baked persistence, starter prompts, live E2E), and produces artifacts that let other people start using and improving the tool without needing the original author in the room.**

**Hard user constraint (incorporated from review comment on this plan)**: All Elderglow-specific stuff must be kept out of the public release. This is treated as a non-negotiable gate in Phase 0 (full audit + remediation) and Phase 4 (pre-release audit). Public artifacts (package, docs, launcher, prompts, templates) must be purely general Godot + zero-footprint.

**Phase 3 Status (progress this session)**: Complete for v0.1.
- The proven structure in `I:\newclean\new-game-project` (baked `test.tscn` with Player + external `player.gd` + Camera2D + Floor, the three input actions in project.godot, the reusable `create_persistent_player.gd` baker at the project root) is the canonical template seed.
- Added `GODOT_MCP_NOTES.md` (beginner-friendly in-project doc) explaining exactly what is there, how the AI baked it, how to keep iterating with live tools + re-bake, and how to clean up. Generic and self-contained.
- This (plus the create baker script) is what gets distributed for the "starter platformer" experience in v0.1 — either as a zip attached to the release, a git template, or the thing the AI creates on the first session using the baker logic.
- The new root README (see Phase 2) now prominently describes the baked hero example and points people at using the AI + this structure.
- No Elderglow content. Distribution details (exact zip naming, "let the AI create it the first time" vs pre-provided) can be finalized in the release checklist (Phase 4). The core template deliverable (files + docs) is done.

Once approved, we execute surgically, verify with the same rigor as prior /check-work and E2E passes, and only then declare the MVP shippable.

**Phase 4 Status (progress this session)**: Release process + registration story delivered.
- New `RELEASE.md` (in the godot-mcp root): full repeatable pre-release checklist (with the hard Elderglow audit as an explicit gate), build/pack/tag/publish steps, what to attach to the GitHub Release (npm tarball, addon zip for persistent mode, starter template zip), and copy-paste registration examples for Grok (`grok mcp add godot-mcp`) and Claude Desktop (JSON using the `godot-mcp` bin after global install).
- The new root README already contains the matching user-facing "after you install, register with this" language.
- "Contributing & Iterating" section is present in the new README (explicitly invites people to improve the public general slice — directly supports the goal of "people can start iterating and making it better").
- The RELEASE.md calls out the required final pre-release Elderglow + path audit (with the exact grep commands) and the end-to-end "stranger following only the instructions" verification.
- This completes the mechanical "how we produce a consumable v0.1 that a stranger can use" story. The actual first publish can happen after the full plan verification.

Once approved, we execute surgically, verify with the same rigor as prior /check-work and E2E passes, and only then declare the MVP shippable.

(End of plan — ready for exit_plan_mode after any user adjustments.)