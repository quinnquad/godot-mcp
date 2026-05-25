#!/usr/bin/env python3
"""
Simple Direct Godot Bridge for Elderglow

This is the simplest possible bridge.
Your agents can call this script directly without needing MCP.

Usage:
    python bridge/direct_godot.py --help
    python bridge/direct_godot.py --operation create_scene --project ./Elderglow --scene_name TestScene
"""

import argparse
import subprocess
import sys
import json
from pathlib import Path

GODOT_PATH = "godot"  # Change this if Godot is not in PATH


def run_godot_operation(project_path: str, operation: str, params: dict = None):
    if params is None:
        params = {}

    cmd = [
        GODOT_PATH,
        "--headless",
        "--path", project_path,
        "--script", "res://scripts/godot_operations.gd",
        "--", json.dumps({"operation": operation, **params})
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
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

    args = parser.parse_args()

    success = run_godot_operation(args.project, args.operation, args.params)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()