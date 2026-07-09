#!/usr/bin/env python3
"""
Direct Godot Bridge - Thin CLI wrapper for Godot MCP operations.

This module provides direct CLI invocation of Godot operations (via a
GDScript operations script for actual execution: scripts/godot_operations.gd).
It handles Godot executable resolution, argument passing (with tolerance for
PowerShell-mangled params), and result parsing.

Usage:
    python bridge/direct_godot.py --project "/path/to/godot/project" --operation create_scene --params '{"scene_path":"res://Test.tscn","root_node_type":"Node2D"}'

Environment Variables:
    GODOT_PATH: Path to Godot executable (required unless --godot-path is set)
"""

import os
import sys
import argparse
import json
import re
import subprocess
from typing import Optional, Dict, Any


def _prefer_console_version(path: str) -> str:
    """Return the console variant if it exists in the same folder (handles both file and folder cases)."""
    if not path:
        return path

    # If it's a directory, look inside it for the console exe
    if os.path.isdir(path):
        for f in os.listdir(path):
            if "console" in f.lower() and f.lower().endswith(".exe"):
                return os.path.join(path, f)
        return path

    # Normal file case
    if not path.lower().endswith(".exe"):
        return path

    base = path[:-4]
    console_path = base + "_console.exe"
    if os.path.exists(console_path):
        return console_path

    # Also check if the parent folder contains a console build
    parent = os.path.dirname(path)
    if parent and os.path.isdir(parent):
        for f in os.listdir(parent):
            if "console" in f.lower() and f.lower().endswith(".exe"):
                return os.path.join(parent, f)

    return path


def get_godot_executable() -> str:
    """Get the path to the Godot executable, preferring the console version when available."""
    env_path = os.environ.get("GODOT_PATH")
    if env_path and os.path.exists(env_path):
        return env_path

    # Check command line
    for i, arg in enumerate(sys.argv):
        if arg == "--godot-path" and i + 1 < len(sys.argv):
            candidate = sys.argv[i + 1]
            if os.path.exists(candidate):
                return candidate

    # No machine-specific defaults — require GODOT_PATH or --godot-path
    raise FileNotFoundError(
        "Godot executable not found. Set GODOT_PATH to your Godot binary "
        "(prefer the *_console.exe build on Windows) or pass --godot-path."
    )


def resolve_godot_executable(explicit_path: Optional[str] = None) -> str:
    if explicit_path and os.path.exists(explicit_path):
        return explicit_path

    env_path = os.environ.get("GODOT_PATH")
    if env_path and os.path.exists(env_path):
        return env_path

    return get_godot_executable()


def run_godot_operation(project_path: str, operation: str, params: dict = None) -> bool:
    if params is None:
        params = {}

    godot_exe = resolve_godot_executable()

    print(f"[BRIDGE] Using Godot: {godot_exe}")
    print(f"[BRIDGE] Project: {project_path}")
    print(f"[BRIDGE] Operation: {operation}")
    print(f"[BRIDGE] Params: {params}")

    # Portable script path (relative to this bridge module) so it works from any
    # repo location and for projects without a local scripts/ dir.
    bridge_dir = os.path.dirname(os.path.abspath(__file__))
    script_path = os.path.abspath(os.path.join(bridge_dir, "..", "scripts", "godot_operations.gd"))

    blob = {"operation": operation, **params}
    cmd = [
        godot_exe,
        "--headless",
        "--display-driver", "headless",
        "--audio-driver", "Dummy",
        "--path", project_path,
        "--script", script_path
    ]

    print(f"[BRIDGE] Full command: {' '.join(cmd)} (JSON via GODOT_MCP_JSON env)")

    run_env = os.environ.copy()
    if "GODOT_MCP_JSON" not in run_env or not run_env.get("GODOT_MCP_JSON"):
        run_env["GODOT_MCP_JSON"] = json.dumps(blob)

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180, env=run_env)
        print("=== GODOT STDOUT ===")
        print(result.stdout)
        if result.stderr:
            print("=== GODOT STDERR ===")
            print(result.stderr)
        print(f"=== Return code: {result.returncode} ===")
        return result.returncode == 0
    except subprocess.TimeoutExpired as e:
        print("=== GODOT STDOUT (partial, before timeout) ===")
        print(e.stdout or "")
        if e.stderr:
            print("=== GODOT STDERR (partial) ===")
            print(e.stderr)
        print(f"[BRIDGE] Error running Godot: {e}")
        return False
    except Exception as e:
        print(f"[BRIDGE] Error running Godot: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Direct Godot Bridge")
    parser.add_argument("--project", required=True, help="Path to Godot project")
    parser.add_argument("--operation", required=True, help="Operation to perform")
    parser.add_argument("--params", default="{}", help="JSON params")
    parser.add_argument("--godot-path", default=None, help="Optional explicit Godot path")

    args, unknown = parser.parse_known_args()
    if unknown:
        print(f"[BRIDGE] Warning: ignored unknown arguments: {unknown}")

    try:
        raw = args.params if isinstance(args.params, str) else "{}"
        if not raw.strip().startswith('{'):
            for a in sys.argv:
                if a.strip().startswith('{') and ('scene_path' in a or 'operation' in a): raw = a; break
        if not raw.strip().startswith('{'):
            joined = ' '.join(sys.argv)
            m = re.search(r'(\{[^{}]*"scene_path"[^{}]*\})', joined)
            if m:
                raw = m.group(1)
            else:
                m2 = re.search(r'(\{[^{}]*"operation"[^{}]*\})', joined)
                if m2: raw = m2.group(1)
        # Repair common PS mangling of quotes/commas around keys and string values
        # (e.g. {scene_path:res://...,root_node_type:Node2D} -> valid JSON)
        repaired = re.sub(r'([{,]\s*)([a-zA-Z_]\w*)(\s*:)', r'\1"\2"\3', raw)
        repaired = re.sub(r':\s*([^"\s,\]}][^,\]}]*)', r': "\1"', repaired)
        params = json.loads(repaired) if repaired.strip() else {}
        if not isinstance(params, dict):
            params = {}
    except (json.JSONDecodeError, TypeError, ValueError, AttributeError):
        params = {}

    success = run_godot_operation(args.project, args.operation, params)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
