#!/usr/bin/env python3
"""
demo_agent_call.py

This is a minimal demo of the *real* workflow your agents (Grok, Hermes, etc.) will use.

It:
1. Launches the Godot MCP server (node build/index.js) as a subprocess over stdio.
2. Does the basic MCP handshake (initialize).
3. Calls a live runtime tool (get_tree by default).
4. Prints the result coming back from your running Godot game.

Requirements:
- Godot game running with the Godot MCP Runtime plugin enabled (so the autoload is active on 4242).
- Node.js + the built server (npm run build if needed).

This is for demonstration. Real agents use a proper MCP client library.
"""

import subprocess
import json
import sys
import time
from typing import Any, Dict, Optional

SERVER_CMD = ["node", "build/index.js"]


def send_request(proc: subprocess.Popen, request: Dict[str, Any]) -> None:
    """Send a JSON-RPC request (one line, newline terminated)."""
    line = json.dumps(request) + "\n"
    proc.stdin.write(line)
    proc.stdin.flush()


def read_response(proc: subprocess.Popen, timeout: float = 15.0) -> Optional[Dict[str, Any]]:
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


def main():
    print("[Demo] Starting Godot MCP server...")
    proc = subprocess.Popen(
        SERVER_CMD,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        cwd=".",  # assumes you run this from I:\godot-mcp
    )

    try:
        # 1. Send initialize
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "demo-agent", "version": "0.1"}
            }
        }
        send_request(proc, init_request)

        init_response = read_response(proc)
        print("[Demo] Initialize response received.")

        # 2. Send initialized notification
        send_request(proc, {
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
            "params": {}
        })

        # 3. Call a live runtime tool (get_tree is a good first test)
        print("[Demo] Calling get_tree on the running Godot game...")
        tool_request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {
                "name": "get_tree",
                "arguments": {"root": "/root"}
            }
        }
        send_request(proc, tool_request)

        tool_response = read_response(proc, timeout=20.0)

        print("\n=== Tool Result ===")
        if tool_response:
            print(json.dumps(tool_response, indent=2))
        else:
            print("No response received (timeout or error).")

        print("\n[Demo] Done. You can now integrate this MCP server into Grok/Hermes for real use.")
        print("[Demo] Keep Godot running with the plugin enabled when you want live runtime tools.")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            proc.kill()


if __name__ == "__main__":
    main()
