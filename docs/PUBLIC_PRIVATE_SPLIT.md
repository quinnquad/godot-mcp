# Public vs Private Repository Strategy (Elderglow + General Godot MCP)

**Date**: 2026-06-01  
**Status**: Reorganization started (Phase 1 complete)

---

## Current Progress

The first major step of the separation has been completed:

- Created the folder structure:
  - `src/tools/general/` — contains all reusable/public Godot tools
  - `src/tools/elderglow/` — contains all Elderglow-specific tools and logic (private only)

- `src/index.ts` has been dramatically slimmed down. It is now a thin orchestrator that simply:
  - Imports `generalTools`
  - Imports `elderglowTools` + the Elderglow handler
  - Spreads them into the MCP tool list

- All Elderglow domain tool definitions and their active handlers now live cleanly under `src/tools/elderglow/`.

- `tsc --noEmit` remains green after the changes.

The codebase is now structurally ready for a clean public/private GitHub split.

---

## Current Folder Structure (after this step)

```
src/
├── index.ts                          ← Very thin now (orchestrator only)
├── tools/
│   ├── general/
│   │   └── tools.ts                  ← All public/general Godot tools live here
│   └── elderglow/
│       ├── tools.ts                  ← Elderglow tool definitions (private)
│       └── handlers.ts               ← Elderglow tool handlers (private)
│
├── bridge/                           ← Phase 1 (general)
└── ...
```

---

## Next Possible Micro-Steps

1. **Further slim `src/index.ts`** — Move the zero-footprint bridge injection logic into its own small module (`src/bridge/zero-footprint.ts` or similar).
2. **Improve the zero-footprint bridge** so it can actually run the new runtime features (screenshots, input, live script, Elderglow tools).
3. **Start the actual public repo** on GitHub (extract `src/tools/general/`, the runtime addon, bridge, etc.).
4. **Clean up legacy comments/stubs** still referencing old "Phase 2c" Elderglow stubs.

---

**Important note**: Nothing was lost or broken during this reorganization. All previously working functionality (general tools + the full set of Elderglow tools + the new runtime powers) continues to work exactly as before.

We can keep iterating on the separation in small, safe steps whenever you're ready. Just say the word for the next micro-move.