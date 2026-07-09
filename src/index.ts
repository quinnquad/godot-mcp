// Godot MCP Server - General public surface (zero-footprint + general Godot tools)
// Private game-specific tools are excluded from this public MVP package (per hard constraint during packaging).

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Public / General tools
import { generalTools } from './tools/general/tools';

// General bridge infrastructure (zero-footprint on-demand injection - public / reusable)
import { zeroFootprintToolNames, handleZeroFootprintTool, getActiveZeroFootprintPort } from './bridge/zero-footprint';
import {
  PERSISTENT_RUNTIME_PORT,
  resolveRuntimePort,
} from './bridge/runtime-port';
import {
  expandHoldSteps,
  estimateSimulateDurationMs,
} from './bridge/simulate-steps';

const server = new Server(
  {
    name: 'godot-mcp',
    version: '0.1.3',
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

// Minimal TCP client helper for live runtime tools.
// Supports persistent runtime (4242) and zero-footprint MCPBridge (4243).
// targetPort is resolved by getTargetRuntimePort (inject map, then live probe).
// timeoutMs is raised for long non-blocking hold simulations (JOS-15).
function sendRuntimeCmd(cmd: any, targetPort?: number, timeoutMs = 5000): Promise<any> {
  const port = targetPort ?? PERSISTENT_RUNTIME_PORT;
  return new Promise((resolve) => {
    const net = require('net');
    const client = net.createConnection({ port, host: '127.0.0.1' }, () => {
      client.write(JSON.stringify(cmd) + '\n');
    });
    client.setTimeout(timeoutMs);
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
    client.on('error', () => resolve({
      status: 'error',
      error_type: 'connection',
      message: `Cannot connect to runtime on ${port} — press Play in Godot with MCPBridge (4243 zero-footprint) or the persistent plugin (4242) listening. list_children / simulate only work while the game is running.`,
    }));
    client.on('timeout', () => { client.end(); resolve({ status: 'error', error_type: 'timeout', message: 'runtime timeout (is Godot running with autoload? long hold_ms may need more time)' }); });
    client.on('close', () => { /* future retry hook */ });
  });
}

/**
 * JOS-17: prefer in-process inject port; otherwise probe 4242 then 4243 so tools
 * work against an already-running zero-footprint bridge without re-inject.
 */
async function getTargetRuntimePort(): Promise<number | undefined> {
  const zfPort = getActiveZeroFootprintPort();
  const resolved = await resolveRuntimePort(zfPort);
  return resolved ?? undefined;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params || {};
  if (name === 'get_project_info') {
    return {
      content: [{
        type: 'text',
        text: 'Godot MCP 0.1.3 | Public general surface | Ports 4242/4243 auto-detect | JOS-15 non-blocking hold_ms | list_children shallow discovery | Tested Godot 4.6 / 4.7 / 4.8-dev1',
      }],
    };
  }
  // Live runtime tools — resolve port per call (inject map or live probe)
  const targetPort = await getTargetRuntimePort();

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
    const a = (args || {}) as { node_path?: string; max_depth?: number; limit?: number };
    const resp = await sendRuntimeCmd({
      cmd: 'list_children',
      node_path: a.node_path || '',
      max_depth: a.max_depth != null ? a.max_depth : 1,
      limit: a.limit != null ? a.limit : 200,
    }, targetPort);
    return { content: [{ type: 'text', text: JSON.stringify(resp, null, 2) }] };
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
    const a = (args || {}) as { steps?: unknown };
    const rawSteps = Array.isArray(a.steps) ? a.steps : [];
    const steps = expandHoldSteps(rawSteps as any);
    const holdMs = estimateSimulateDurationMs(steps);
    // Bridge runs holds over physics frames; keep TCP open for duration + margin
    const timeoutMs = Math.min(120000, Math.max(8000, holdMs + 5000));
    const resp = await sendRuntimeCmd({ cmd: 'simulate_input_batch', steps }, targetPort, timeoutMs);
    return { content: [{ type: 'text', text: JSON.stringify(resp, null, 2) }] };
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