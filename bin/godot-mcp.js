#!/usr/bin/env node
/**
 * Minimal cross-platform launcher for godot-mcp (MVP).
 * After `npm install -g godot-mcp`, users can just run `godot-mcp`.
 *
 * Prints status for both zero-footprint (clean projects) and persistent modes,
 * ensures the build is present, and execs the server.
 *
 * This is deliberately tiny for v0.1. More features (init, bake subcommand, etc.)
 * can be added later.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const buildEntry = path.join(root, 'build', 'index.js');

function printStatus() {
  console.error('=== godot-mcp (zero-friction Godot control for agents) ===');
  console.error('');
  console.error('Zero-footprint mode (recommended for clean projects / friends):');
  console.error('  - Temporary bridge, no permanent changes to your Godot project.');
  console.error('  - Great for rapid prototyping and "the AI can literally play in my game".');
  console.error('  - Use the inject tool from your agent, then open the project in Godot and press Play.');
  console.error('');
  console.error('Persistent mode (power users):');
  console.error('  - Copy addons/godot_mcp_runtime/ into your project and enable the plugin.');
  console.error('  - Run your game — tools available on 4242 while playing.');
  console.error('');
  console.error('After this server is registered with your agent (grok mcp add, Claude Desktop, etc.),');
  console.error('just open a fresh chat and use a starter prompt (see the docs).');
  console.error('');
  console.error('Registration examples (run `npm install -g godot-mcp` first):');
  console.error('  Grok:    grok mcp add godot-mcp --command godot-mcp');
  console.error('  Claude:  edit claude_desktop_config.json mcpServers:');
  console.error('           "godot-mcp": { "command": "godot-mcp", "args": [] }');
  console.error('');
}

if (!fs.existsSync(buildEntry)) {
  console.error('Build not found. Running build...');
  const build = spawn('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: true });
  build.on('close', (code) => {
    if (code !== 0) {
      console.error('Build failed. Please run `npm run build` manually in the godot-mcp directory.');
      process.exit(code);
    }
    printStatus();
    spawnServer();
  });
} else {
  printStatus();
  spawnServer();
}

function spawnServer() {
  const server = spawn(process.execPath, [buildEntry], {
    cwd: root,
    stdio: 'inherit',
    env: process.env
  });
  server.on('exit', (code) => process.exit(code));
}
