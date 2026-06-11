// Godot MCP Server - General public surface (zero-footprint + general Godot tools)
// Private game-specific tools are excluded from this public MVP package (per hard constraint during packaging).

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Public / General tools
import { generalTools } from './tools/general/tools';

// General bridge infrastructure (zero-footprint on-demand injection - public / reusable)
import { zeroFootprintToolNames, handleZeroFootprintTool, getActiveZeroFootprintPort } from './bridge/zero-footprint';

const server = new Server(
  {
    name: 'godot-mcp',
    version: '0.1.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const fs = require('fs');
const path = require('path');

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    ...generalTools,
  ]
}));

// Note: For stdio MCP usage (Grok Build TUI, Claude Desktop, etc.), we avoid
// printing to stdout because it interferes with the JSON-RPC protocol.
// Use stderr for startup messages.
console.error('Godot MCP server initialized (stdio mode) - general public surface');

// Minimal TCP client helper for Phase 2b runtime.
// Supports both the persistent runtime (default 4242) and zero-footprint injected bridges (e.g. 4243).
// The optional targetPort lets us route general tools to the correct runtime when a zero-footprint
// injection is active (Option B architectural improvement).
function sendRuntimeCmd(cmd: any, targetPort?: number): Promise<any> {
  const port = targetPort ?? 4242;
  return new Promise((resolve) => {
    const net = require('net');
    const client = net.createConnection({ port, host: '127.0.0.1' }, () => {
      client.write(JSON.stringify(cmd) + '\n');
    });
    client.setTimeout(5000);
    let buf = '';
    client.on('data', (d: any) => {
      buf += d.toString();
      const idx = buf.indexOf('\n');
      if (idx !== -1) {
        let line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        client.end();
        if (line) {
          line = line.replace(/^[^\{\[]+/, '');
          try { resolve(JSON.parse(line)); } catch (e) { resolve({ status: 'error', error_type: 'parse', message: 'parse error' }); }
        }
      }
    });
    client.on('error', () => resolve({ status: 'error', error_type: 'connection', message: `Cannot connect to runtime on ${port} — start Godot game with autoload stub registered` }));
    client.on('timeout', () => { client.end(); resolve({ status: 'error', error_type: 'timeout', message: 'runtime timeout (is Godot running with autoload?)' }); });
    client.on('close', () => { /* future retry hook */ });
  });
}

// Lightweight routing support for Option B (zero-footprint):
// When a zero-footprint bridge has been injected, general tools should talk to its port
// instead of always defaulting to the persistent runtime on 4242.
function getTargetRuntimePort(): number | undefined {
  const zfPort = getActiveZeroFootprintPort();
  return zfPort ?? undefined;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params || {};
  if (name === 'get_project_info') {
    return { content: [{ type: 'text', text: 'Godot MCP 0.2 (Phase 2) | Bridge for headless ops | Runtime tools for live editing (autoload on 4242 when game running)' }] };
  }
  // Phase 2b live runtime tools (connect to Godot autoload per protocol in ARCHITECTURE.md)
  const targetPort = getTargetRuntimePort();

  if (name === 'get_tree') {
    const resp = await sendRuntimeCmd({ cmd: 'get_tree', root: (args && args.root) || '/root' }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp, null, 2) }] };
  }
  if (name === 'set_property') {
    const resp = await sendRuntimeCmd({ cmd: 'set_property', node_path: (args && args.node_path) || '', property: (args && args.property) || '', value: (args && args.value) }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'call_method') {
    const resp = await sendRuntimeCmd({ cmd: 'call_method', node_path: (args && args.node_path) || '', method: (args && args.method) || '', args: (args && args.args) || [] }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  // General Godot tools (Phase 2 general focus - node lifecycle, etc.)
  if (name === 'instantiate_scene') {
    const resp = await sendRuntimeCmd({ cmd: 'instantiate_scene', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'add_child') {
    const resp = await sendRuntimeCmd({ cmd: 'add_child', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'remove_node') {
    const resp = await sendRuntimeCmd({ cmd: 'remove_node', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'reparent_node') {
    const resp = await sendRuntimeCmd({ cmd: 'reparent_node', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'duplicate_node') {
    const resp = await sendRuntimeCmd({ cmd: 'duplicate_node', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'load_scene') {
    return { content: [{ type: 'text', text: 'load_scene general stub - implement via bridge for headless or runtime cmd' }] };
  }
  if (name === 'save_scene') {
    return { content: [{ type: 'text', text: 'save_scene general stub - implement via bridge for headless or runtime cmd' }] };
  }
  // More general: properties & signals
  if (name === 'get_property') {
    const resp = await sendRuntimeCmd({ cmd: 'get_property', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'get_node_properties') {
    const resp = await sendRuntimeCmd({ cmd: 'get_node_properties', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'get_signals') {
    const resp = await sendRuntimeCmd({ cmd: 'get_signals', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'connect_signal') {
    const resp = await sendRuntimeCmd({ cmd: 'connect_signal', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'emit_signal') {
    const resp = await sendRuntimeCmd({ cmd: 'emit_signal', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  // Animation, UI, Resources, Project, Physics, Debug (general)
  if (name === 'play_animation') {
    const resp = await sendRuntimeCmd({ cmd: 'play_animation', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'get_animation_list') {
    const resp = await sendRuntimeCmd({ cmd: 'get_animation_list', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'get_ui_tree') {
    const resp = await sendRuntimeCmd({ cmd: 'get_ui_tree', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'set_control_text') {
    const resp = await sendRuntimeCmd({ cmd: 'set_control_text', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'load_resource') {
    return { content: [{ type: 'text', text: 'load_resource general stub - bridge or runtime' }] };
  }
  if (name === 'get_autoloads') {
    const resp = await sendRuntimeCmd({ cmd: 'get_autoloads', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'raycast_2d') {
    const resp = await sendRuntimeCmd({ cmd: 'raycast_2d', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'debug_print') {
    const resp = await sendRuntimeCmd({ cmd: 'debug_print', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'pause_game') {
    const resp = await sendRuntimeCmd({ cmd: 'pause_game', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  // Runtime routing for the 3 tools that had GD handlers (batch 7/8) but missing TS dispatch (verifier dispatch bug)
  if (name === 'get_node_signals') {
    const resp = await sendRuntimeCmd({ cmd: 'get_node_signals', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'ui_set_text') {
    const resp = await sendRuntimeCmd({ cmd: 'ui_set_text', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'get_all_properties') {
    const resp = await sendRuntimeCmd({ cmd: 'get_all_properties', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  // Additional general Godot tools handlers
  if (name === 'list_children') {
    const resp = await sendRuntimeCmd({ cmd: 'list_children', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'get_node') {
    const resp = await sendRuntimeCmd({ cmd: 'get_node', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'find_node_by_name') {
    const resp = await sendRuntimeCmd({ cmd: 'find_node_by_name', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'capture_screenshot') {
    const resp = await sendRuntimeCmd({ cmd: 'capture_screenshot', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'simulate_input_batch') {
    const resp = await sendRuntimeCmd({ cmd: 'simulate_input_batch', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'execute_live_script') {
    const resp = await sendRuntimeCmd({ cmd: 'execute_live_script', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }

  // New input action management tools (for controllable characters)
  if (name === 'list_input_actions') {
    const resp = await sendRuntimeCmd({ cmd: 'list_input_actions', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'add_input_action') {
    const resp = await sendRuntimeCmd({ cmd: 'add_input_action', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'remove_input_action') {
    const resp = await sendRuntimeCmd({ cmd: 'remove_input_action', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }
  if (name === 'has_input_action') {
    const resp = await sendRuntimeCmd({ cmd: 'has_input_action', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }

  // High-level helper for creating controllable characters
  if (name === 'create_simple_player') {
    const resp = await sendRuntimeCmd({ cmd: 'create_simple_player', ...args }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
  }

  // Delegate zero-footprint (general / public on-demand bridge injection) to its dedicated module
  if (zeroFootprintToolNames.includes(name)) {
    return handleZeroFootprintTool(name, args);
  }

  return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
});

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const transport = new StdioServerTransport();
server.connect(transport);