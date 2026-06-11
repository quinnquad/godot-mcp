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
const buildEntry = path.join(root, 'build', 'index-elderglow.js');

function printStatus() {
  console.error('=== godot-mcp-elderglow (FULL private / extended variant) ===');
  console.error('');
  console.error('This is the complete internal version with all domain-specific tools.');
  console.error('For the public general-only version, use the regular godot-mcp package.');
  console.error('');
  console.error('Zero-footprint mode (recommended for clean testing of extended/private builds):');
  console.error('  - Temporary bridge, no permanent changes to your Godot project.');
  console.error('  - Use the inject tool, then open project in Godot and press Play.');
  console.error('');
  console.error('Zero-footprint (default for this variant, port 4243):');
  console.error('  - Recommended for clean testing of Elderglow builds.');
  console.error('  - Use the inject tool from your agent, then open the project in Godot and press Play.');
  console.error('  - The server defaults to routing to 4243 for zf injections.');
  console.error('');
  console.error('Persistent mode (4242):');
  console.error('  - Use your project\'s runtime autoload on 4242 (with full Elderglow handlers in your local runtime_server.gd).');
  console.error('');
  console.error('After registering (see examples below), open a fresh Grok chat and use your normal Elderglow prompts.');
  console.error('');
  console.error('Registration (example - adjust path if not global):');
  console.error('  Grok:    grok mcp add godot-mcp-elderglow --command "node /path/to/this/bin/godot-mcp-elderglow.js"');
  console.error('  Or after npm link / global install of the private package.');
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
