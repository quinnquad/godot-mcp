// Godot MCP Server - Elderglow Base
// This is the starting skeleton. We will expand it significantly.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// TODO: Register all tools from base + advanced forks

const server = new Server(
  {
    name: 'godot-mcp-elderglow',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

console.log('Godot MCP Elderglow base server initialized');

// Future: server.connect(transport);