# Godot MCP Phase 1 - Key Decisions & Memory (post-review fixes, 2026-05-25)

## From initial impl
- Bridge JSON blob style (with "operation" key) preserved; GDScript parser adapted instead of changing CLI (agent DX priority).
- Godot path: env + --godot-path + I:\Godot_v4.6.3-stable_win64.exe as primary hardcoded example (per clarification).
- create_scene minimal: ClassDB instantiate, DirAccess, ResourceSaver, owner=self (deliberate per reference).

## From review round (all 14 issues addressed)
- Argparse bug (default={}) fixed.
- Dead import removed.
- Robustness: owner comment added (deliberate choice), load error strengthened, strip made safer with defensive comment.
- Minimal tests added (pytest for resolution + JSON contract + parser sim).
- MEMORY.md + ERRORS.md added at repo root (this file + ERRORS.md) to satisfy Karpathy (previously only in ephemeral temp dir).
- Re-verification run performed post-fixes; env limitation on I: spawn documented.

All changes surgical, smallest possible. Verification and checks green where possible in env.

Next: user re-run on real machine with the I: exe.