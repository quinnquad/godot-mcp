// Elderglow-specific tool handlers (PRIVATE - only in the Elderglow repo)
// These delegate to the runtime via sendRuntimeCmd for now.
// As Elderglow logic grows, more complex behavior can live here.

export async function handleElderglowTool(name: string, args: any, sendRuntimeCmd: (cmd: any) => Promise<any>) {
  // All current Elderglow domain tools simply forward to the runtime autoload
  const resp = await sendRuntimeCmd({ cmd: name, ...args });
  return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
}

// List of tool names that should be routed to the Elderglow handler
export const elderglowToolNames = [
  'leyline_validate',
  'leyline_query',
  'creature_spawn',
  'creature_inspect',
  'simulate_ecosystem',
  'ecosystem_query',
  'farm_plot_state',
  'farm_plot_update',
  'trigger_defense_event',
  'defense_structure_inspect',
];
