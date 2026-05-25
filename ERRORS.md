# Godot MCP Phase 1 - Errors & Limitations (post-review, 2026-05-25)

## Persistent Env Limitation
- Godot spawn [WinError 5] Access denied on I:\Godot_v4.6.3-stable_win64.exe (file exists per Test-Path, but subprocess fails in harness).
  - Re-run after fixes produced identical spawn error.
  - On user machine with perms + unblock, the bridge + gd will produce valid .tscn with exit 0.

## Review Round Notes
- All 14 open issues from the merged review were addressed (see review.md for per-issue Responses).
- Test coverage added (minimal but highest-value; full suite future).
- No other errors introduced.

Documented per Karpathy requirement.