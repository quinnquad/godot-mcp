// Elderglow-specific tools (PRIVATE - not for public repo)
// These should only exist in the private Elderglow version of the project.

export const elderglowTools = [
  { 
    name: "leyline_validate", 
    description: "Elderglow: validate leyline pattern (MVP: nodes/connections/energy flow; leverage execute_live_script for custom sim + screenshot for glow visuals; WARNING: requires Elderglow nodes; persistent 4242)", 
    inputSchema: { type: "object", properties: { pattern: { type: "object" } } } 
  },
  { 
    name: "leyline_query", 
    description: "Elderglow: query leyline network state (MVP tree dump; use with execute_live_script for sims; persistent 4242)", 
    inputSchema: { type: "object", properties: {} } 
  },
  { 
    name: "creature_spawn", 
    description: "Elderglow: spawn creature (MVP Node2D with needs/ai_state; use simulate_input_batch for interactions + screenshot for behavior; persistent 4242)", 
    inputSchema: { type: "object", properties: { type: { type: "string" }, position: { type: "array" } } } 
  },
  { 
    name: "creature_inspect", 
    description: "Elderglow: inspect creature state (needs, ai, pathing; tweak via set_property/execute_live_script; persistent 4242)", 
    inputSchema: { type: "object", properties: { path: { type: "string" } } } 
  },
  { 
    name: "simulate_ecosystem", 
    description: "Elderglow: simulate ecosystem steps (MVP generic counts/influence; leverage execute_live_script for custom logic + screenshot for visuals; WARNING: requires Elderglow nodes; persistent 4242)", 
    inputSchema: { type: "object", properties: { steps: { type: "number" } } } 
  },
  { 
    name: "ecosystem_query", 
    description: "Elderglow: query ecosystem state (MVP entity counts/leyline influence; use execute_live_script for advanced + screenshot; persistent 4242)", 
    inputSchema: { type: "object", properties: {} } 
  },
  { 
    name: "farm_plot_state", 
    description: "Elderglow: inspect farm plot (MVP state/health; leverage execute_live_script/screenshot/input_batch; persistent 4242)", 
    inputSchema: { type: "object", properties: { plot_id: { type: "string" } } } 
  },
  { 
    name: "farm_plot_update", 
    description: "Elderglow: update farm plot (MVP updates; combine with powers for validation/visuals; persistent 4242)", 
    inputSchema: { type: "object", properties: { plot_id: { type: "string" }, updates: { type: "object" } } } 
  },
  { 
    name: "trigger_defense_event", 
    description: "Elderglow: trigger defense event (MVP results; use input_batch for player sim + screenshot for visuals; persistent 4242)", 
    inputSchema: { type: "object", properties: { event_type: { type: "string" } } } 
  },
  { 
    name: "defense_structure_inspect", 
    description: "Elderglow: inspect defense structure (MVP health/upgrades; leverage screenshot for visual state; persistent 4242)", 
    inputSchema: { type: "object", properties: { struct_id: { type: "string" } } } 
  },
];
