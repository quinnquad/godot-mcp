#!/usr/bin/env node
/**
 * Cross-platform launcher for godot-mcp.
 * After install from this repo (`npm install -g .`) or a GitHub Release tarball
 * (`npm install -g ./godot-mcp-*.tgz`), run `godot-mcp` to start the MCP server.
 * Do not use bare `npm install -g godot-mcp` from the public registry (different package).
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const buildEntry = path.join(root, 'build', 'index.js');

function printStatus() {
  console.error('=== godot-mcp ===');
  console.error('Live Godot control for AI agents (Grok, Claude, and other MCP hosts).');
  console.error('');
  console.error('Ports');
  console.error('  Zero-footprint bridge (MCPBridge):  127.0.0.1:4243');
  console.error('  Persistent plugin (runtime_server): 127.0.0.1:4242');
  console.error('  The server auto-detects which one is listening (no manual port flag).');
  console.error('');
  console.error('Zero-footprint (recommended for clean projects)');
  console.error('  1. Agent runs inject_zero_footprint_bridge with your project path.');
  console.error('  2. You open the project in Godot 4 and press Play (F5).');
  console.error('  3. Watch Output for: [MCPBridge] Zero-footprint bridge active on 127.0.0.1:4243');
  console.error('  4. If tools fail after a fresh chat or rebuild: ask the agent to re-inject.');
  console.error('');
  console.error('Persistent (optional, daily work)');
  console.error('  Copy addons/godot_mcp_runtime/ into your project, enable the plugin, Play.');
  console.error('  Tools use port 4242 while the game is running.');
  console.error('');
  console.error('Install (this project only — not bare registry name godot-mcp):');
  console.error('  git clone https://github.com/quinnquad/godot-mcp.git && cd godot-mcp');
  console.error('  npm install && npm run build && npm install -g .');
  console.error('  # or: npm install -g ./godot-mcp-0.1.2.tgz  (from GitHub Releases)');
  console.error('');
  console.error('Register with Grok (after the install above):');
  console.error('  grok mcp add godot-mcp -- godot-mcp');
  console.error('  grok mcp add --scope project godot-mcp -- godot-mcp');
  console.error('  grok mcp doctor godot-mcp');
  console.error('  In the TUI: /mcps  (or Ctrl+L) to enable and inspect tools.');
  console.error('');
  console.error('Claude Desktop: mcpServers entry with command "godot-mcp", args [].');
  console.error('Docs: README.md · docs/getting-started-for-beginners.md · docs/friend-starter-prompt.md');
  console.error('');
}

function spawnServer() {
  const server = spawn(process.execPath, [buildEntry], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  server.on('exit', (code) => process.exit(code == null ? 0 : code));
}

if (!fs.existsSync(buildEntry)) {
  console.error('Build not found. Running npm run build...');
  const build = spawn('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: true });
  build.on('close', (code) => {
    if (code !== 0) {
      console.error('Build failed. Run `npm run build` in the godot-mcp directory.');
      process.exit(code || 1);
    }
    printStatus();
    spawnServer();
  });
} else {
  printStatus();
  spawnServer();
}
