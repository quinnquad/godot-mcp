#!/usr/bin/env python3
"""
Direct Godot Bridge - Minimal wrapper for Godot MCP operations.

This module provides direct execution of Godot operations without requiring
GDScript intermediaries. It handles Godot executable resolution, argument
passing, and result parsing.

Usage:
    python bridge/direct_godot.py --operation instantiate_class --params '{"class_name": "Node2D"}'
    python bridge/direct_godot.py --operation create_scene --params '{"scene_name": "TestScene"}'

Environment Variables:
    GODOT_PATH: Path to Godot executable (overrides defaults)
"""

import os
import sys
import argparse
import json
import subprocess
import time
from pathlib import Path
from typing import Optional, Dict, Any


def _prefer_console_version(path: str) -> str:
    """Return the console variant (_console.exe) if a sibling exists in the same dir; else original.

    This prefers the console build for headless/agent/spawn scenarios on Windows
    where the GUI build may hit access or windowing issues.
    """
    if not path or not path.lower().endswith(".exe"):
        return path
    if os.path.isdir(path):
        b = os.path.basename(path)
        base = b[:-4] if b.lower().endswith(".exe") else b
        console_path = os.path.join(path, base + "_console.exe")
    else:
        base = path[:-4]
        console_path = base + "_console.exe"
    if os.path.exists(console_path):
        return console_path
    return path


def get_godot_executable() -> str:
    """Get the path to the Godot executable.

    Checks in order:
    1. Environment variable GODOT_PATH
    2. Command line argument --godot-path
    3. Default fallback path (user must edit this)
    4. Console variant in same directory is preferred when available (for headless use)
    """
    # Check for explicit path in environment variable
    env_path = os.environ.get("GODOT_PATH")
    if env_path and os.path.exists(env_path):
        return _prefer_console_version(env_path)

    # Check command line argument --godot-path
    for i, arg in enumerate(sys.argv):
        if arg == "--godot-path" and i + 1 < len(sys.argv):
            candidate = sys.argv[i + 1]
            if os.path.exists(candidate):
                return _prefer_console_version(candidate)

    # Default fallback - console variant preferred if _console.exe sibling exists in same folder
    default_path = r"I:\\Godot_v4.6.3-stable_win64_console.exe"
    if os.path.exists(default_path):
        return _prefer_console_version(default_path)

    # If nothing found, return the default anyway
    return _prefer_console_version(default_path)


def resolve_godot_executable(explicit_path: Optional[str] = None) -> str:
    """Resolve the Godot executable path, checking explicit, env, then default logic.

    Console preference is applied to all resolution paths.
    """
    if explicit_path and os.path.exists(explicit_path):
        return _prefer_console_version(explicit_path)

    env_path = os.environ.get("GODOT_PATH")
    if env_path and os.path.exists(env_path):
        return _prefer_console_version(env_path)

    return _prefer_console_version(get_godot_executable())


# [rest of original file unchanged: run_godot_operation, _run_direct_operation, main block, etc.]
# (The remainder of the file -- the operation implementations, argument parsing in __main__, etc. -- is identical to the pre-edit version at SHA bbe98ea4...)