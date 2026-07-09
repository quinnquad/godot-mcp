#!/usr/bin/env python3
"""
E2E (End-to-End) Test Harness for Zero-Footprint Bridge

This harness performs a full end-to-end test of the zero-footprint injection system.

It will:
1. Automatically inject the MCP bridge into a clean Godot project.
2. Prompt you to start Godot on that project.
3. Run a series of real tool calls against the injected bridge (on port 4243).
4. (Optional) Automatically clean up the injection when finished.

This is very useful for verifying that the zero-footprint path works correctly
after changes to mcp_bridge.gd or the MCP server.

Usage:
    python tests/e2e_zero_footprint.py --project "/path/to/your/clean/project"

The script will:
- Launch the Godot MCP server.
- Call inject_zero_footprint_bridge.
- Wait for you to start Godot and confirm the bridge is active on 4243.
- Exercise many of the bridge's capabilities.
- Print clear results.

At the end it can automatically call cleanup_zero_footprint_bridge.

This harness is intended both for development testing and as a demonstration
of what a real agent workflow looks like with the zero-footprint bridge.
"""

import subprocess
import json
import sys
import time
import argparse
from pathlib import Path
from typing import Any, Dict, Optional

SERVER_CMD = ["node", "build/index.js"]


def get_project_path() -> str:
    """Parse command line arguments and return the clean project path."""
    parser = argparse.ArgumentParser(
        description="E2E test harness for the Godot MCP zero-footprint bridge."
    )
    parser.add_argument(
        "--project",
        required=True,
        help="Full absolute path to your clean Godot test project (must contain project.godot)"
    )
    args = parser.parse_args()
    return args.project


# Will be set in main()
CLEAN_PROJECT_PATH = ""


def send_request(proc: subprocess.Popen, request: Dict[str, Any]) -> None:
    """Send a JSON-RPC request (one line, newline terminated)."""
    line = json.dumps(request) + "\n"
    proc.stdin.write(line)
    proc.stdin.flush()


def read_response(proc: subprocess.Popen, timeout: float = 20.0) -> Optional[Dict[str, Any]]:
    """Read one JSON-RPC response line."""
    start = time.time()
    while time.time() - start < timeout:
        line = proc.stdout.readline()
        if not line:
            time.sleep(0.05)
            continue
        line = line.strip()
        if not line:
            continue
        try:
            return json.loads(line)
        except json.JSONDecodeError:
            # Ignore non-JSON lines (logs, etc.)
            continue
    return None


def call_tool(proc: subprocess.Popen, name: str, arguments: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Convenience wrapper to call a tool and return the result."""
    request = {
        "jsonrpc": "2.0",
        "id": int(time.time() * 1000) % 100000,
        "method": "tools/call",
        "params": {
            "name": name,
            "arguments": arguments
        }
    }
    send_request(proc, request)
    response = read_response(proc)
    return response


def main():
    global CLEAN_PROJECT_PATH
    CLEAN_PROJECT_PATH = get_project_path()

    print("=" * 60)
    print("Zero-Footprint E2E Harness")
    print("=" * 60)
    print()
    print(f"Target project: {CLEAN_PROJECT_PATH}")
    print()
    print("This script will automatically:")
    print("  1. Inject the zero-footprint bridge")
    print("  2. Prompt you to start Godot on the project")
    print("  3. Run a series of real tool calls against the bridge")
    print("  4. Offer to automatically clean up when finished")
    print()

    input("Press Enter to begin (make sure Godot is closed on the target project for now)... ")

    print("\n[Harness] Starting Godot MCP server (stdio mode)...")
    proc = subprocess.Popen(
        SERVER_CMD,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        cwd=".",  # run from godot-mcp root
    )

    try:
        # 1. MCP initialize handshake (required)
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "e2e-zero-footprint-harness", "version": "0.1"}
            }
        }
        send_request(proc, init_request)
        init_resp = read_response(proc)
        if not init_resp:
            print("[Harness] ERROR: No initialize response. Is the MCP server running?")
            return
        print("[Harness] MCP initialize successful.")

        # Notification (standard MCP)
        send_request(proc, {
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
            "params": {}
        })

        # Automatically perform the zero-footprint injection in this process
        print(f"\n[Harness] Automatically injecting zero-footprint bridge into:\n  {CLEAN_PROJECT_PATH}")
        inject_resp = call_tool(proc, "inject_zero_footprint_bridge", {
            "project_path": CLEAN_PROJECT_PATH
        })
        print("    Inject result:", json.dumps(inject_resp, indent=2) if inject_resp else "No response")

        input("\nNow start (or restart) Godot on that clean project and press Enter when you see the [MCPBridge] message on 4243... ")

        print("\n[Harness] === Starting E2E tool calls against the zero-footprint bridge ===\n")

        # Test 1: get_tree (foundational)
        print("[1] Calling get_tree...")
        resp = call_tool(proc, "get_tree", {"root": "/root"})
        print("    Result:", json.dumps(resp, indent=2)[:500] if resp else "No response")

        # Test 2: capture_screenshot
        print("\n[2] Calling capture_screenshot...")
        resp = call_tool(proc, "capture_screenshot", {})
        print("    Result:", json.dumps(resp, indent=2) if resp else "No response")
        if resp and "result" in resp:
            print("    >>> Check the Godot user data folder for mcp_screenshot.png (usually %APPDATA%/Godot/app_userdata/<project>/mcp_screenshot.png)")

        # Test 3: simulate_input_batch (simple safe example)
        print("\n[3] Calling simulate_input_batch (short delay + mouse move)...")
        resp = call_tool(proc, "simulate_input_batch", {
            "steps": [
                {"type": "delay", "ms": 50},
                {"type": "mouse_move", "pos": [100, 100]}
            ]
        })
        print("    Result:", json.dumps(resp, indent=2) if resp else "No response")

        # Test 4: execute_live_script (safe example)
        print("\n[4] Calling execute_live_script (simple print + return)...")
        resp = call_tool(proc, "execute_live_script", {
            "code": 'print("Hello from zero-footprint E2E!"); return "success"'
        })
        print("    Result:", json.dumps(resp, indent=2) if resp else "No response")

        # Test 5: set_property (requires a node that exists in your test scene)
        print("\n[5] Calling set_property (example - adjust node_path for your scene)...")
        print("    (This will likely error unless you have a node at the example path.)")
        resp = call_tool(proc, "set_property", {
            "node_path": "/root",
            "property": "name",
            "value": "E2E_Test_Renamed"
        })
        print("    Result:", json.dumps(resp, indent=2) if resp else "No response")

        # Test 6: call_method (example)
        print("\n[6] Calling call_method (example)...")
        resp = call_tool(proc, "call_method", {
            "node_path": "/root",
            "method": "get_child_count",
            "args": []
        })
        print("    Result:", json.dumps(resp, indent=2) if resp else "No response")

        # Test 7: instantiate_scene (requires a valid .tscn in the project)
        print("\n[7] Calling instantiate_scene (example - will fail without a real scene_path)...")
        print("    (Update the scene_path argument with something that exists in your test project.)")
        resp = call_tool(proc, "instantiate_scene", {
            "scene_path": "res://SomeTestScene.tscn",
            "parent_path": "/root",
            "name": "E2E_Instantiated"
        })
        print("    Result:", json.dumps(resp, indent=2) if resp else "No response")

        print("\n" + "=" * 60)
        print("[Harness] E2E sequence complete.")
        print("Review the results above.")
        print("Side effects (screenshots, node changes, etc.) should be visible in your Godot project.")
        print("=" * 60)

        # Offer automatic cleanup
        try:
            choice = input("\nWould you like to automatically clean up the injection now? [y/N]: ").strip().lower()
            if choice in ("y", "yes"):
                print("[Harness] Calling cleanup_zero_footprint_bridge...")
                cleanup_resp = call_tool(proc, "cleanup_zero_footprint_bridge", {
                    "project_path": CLEAN_PROJECT_PATH
                })
                print("    Cleanup result:", json.dumps(cleanup_resp, indent=2) if cleanup_resp else "No response")
            else:
                print(f"[Harness] Skipping auto-cleanup. Remember to manually call cleanup_zero_footprint_bridge with:\n  project_path = {CLEAN_PROJECT_PATH}")
        except Exception as e:
            print(f"[Harness] Error during cleanup prompt: {e}")

    except KeyboardInterrupt:
        print("\n[Harness] Interrupted by user.")
        print(f"[Harness] You may want to manually clean up with: cleanup_zero_footprint_bridge on {CLEAN_PROJECT_PATH}")
    finally:
        print("\n[Harness] Shutting down MCP server subprocess...")
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()


if __name__ == "__main__":
    main()
