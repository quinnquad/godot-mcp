#!/usr/bin/env python3
"""
Simple Direct Godot Bridge for Elderglow

This is the simplest possible bridge.
Your agents can call this script directly without needing MCP.

Usage:
    python bridge/direct_godot.py --help
    python bridge/direct_godot.py --operation create_scene --project ./Elderglow --params '{"scene_path":"res://scenes/TestScene.tscn","root_node_type":"Node2D"}'
    # With explicit Godot (primary example):
    python bridge/direct_godot.py --project ./test_project --operation create_scene --params '{"scene_path":"res://scenes/test_scene.tscn","root_node_type":"Node2D"}' --godot-path "I:\\Godot_v4.6.3-stable_win64.exe"
"""

import argparse
import subprocess
import sys
import json
import os
from pathlib import Path

def get_godot_executable(cli_path: str = None) -> str:
    """Resolve Godot executable.
    Priority: --godot-path CLI > GODOT_PATH env var > I:\Godot_v4.6.3-stable_win64.exe (primary Windows example per clarification).
    """
    if cli_path:
        return cli_path
    env_path = os.environ.get("GODOT_PATH")
    if env_path:
        return env_path
    return r"I:\Godot_v4.6.3-stable_win64.exe"

def run_godot_operation(project_path: str, operation: str, params: dict = None, godot_exe: str = None):
    if params is None:
        params = {}
    if godot_exe is None:
        godot_exe = get_godot_executable()

    cmd = [
        godot_exe,
        "--headless",
        "--path", project_path,
        "--script", "res://scripts/godot_operations.gd",
        "--", json.dumps({"operation": operation, **params})
    ]

    print(f"[BRIDGE] Invoking Godot: {godot_exe} (project={project_path}, operation={operation})")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr, file=sys.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"Error running Godot: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Direct Godot Bridge for Elderglow")
    parser.add_argument("--project", required=True, help="Path to Godot project")
    parser.add_argument("--operation", required=True, help="Operation to perform")
    parser.add_argument("--params", type=json.loads, default="{}", help="JSON params for the operation")
    parser.add_argument("--godot-path", default=None, help="Path to Godot executable (overrides GODOT_PATH env and default I: drive example)")

    args = parser.parse_args()

    godot_exe = get_godot_executable(args.godot_path)
    success = run_godot_operation(args.project, args.operation, args.params, godot_exe)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
