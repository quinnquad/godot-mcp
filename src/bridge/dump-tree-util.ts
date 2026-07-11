/**
 * get_tree dump bounding — pure structure used by tests.
 * Mirrors Godot bridge algorithm (finite depth/nodes, skip @Type@N by default).
 */

export type DumpTreeNode = {
  name: string;
  path: string;
  type: string;
  children?: DumpTreeNode[];
};

export type DumpTreeOpts = {
  max_depth?: number;
  max_nodes?: number;
  /** When true, include Godot auto-names like @Sprite2D@1. Default false. */
  include_anonymous?: boolean;
  /** Explicit override; if set, wins over include_anonymous. Default true (skip). */
  skip_anonymous?: boolean;
};

export type DumpTreeResult = {
  data: DumpTreeNode;
  truncated: boolean;
  max_depth: number;
  max_nodes: number;
  node_count: number;
  skip_anonymous: boolean;
};

/** Conservative defaults for agent-safe discovery (not full farm dumps). */
export const DEFAULT_MAX_DEPTH = 4;
export const DEFAULT_MAX_NODES = 150;

/** Godot-generated leaf names: @Sprite2D@1, @Node@2, etc. */
export function isAnonymousNodeName(name: string): boolean {
  return /^@.+@\d+$/.test(String(name || ''));
}

export function resolveDumpOpts(opts: DumpTreeOpts = {}): {
  max_depth: number;
  max_nodes: number;
  skip_anonymous: boolean;
} {
  const max_depth = Math.max(0, Math.floor(opts.max_depth ?? DEFAULT_MAX_DEPTH));
  const max_nodes = Math.max(1, Math.floor(opts.max_nodes ?? DEFAULT_MAX_NODES));
  let skip_anonymous = true;
  if (opts.include_anonymous === true) skip_anonymous = false;
  if (opts.skip_anonymous !== undefined) skip_anonymous = Boolean(opts.skip_anonymous);
  return { max_depth, max_nodes, skip_anonymous };
}

type WalkState = {
  count: number;
  truncated: boolean;
  max_depth: number;
  max_nodes: number;
  skip_anonymous: boolean;
};

/**
 * Bounded recursive dump of a fixture tree — same rules as GDScript `_dump_tree`.
 * Root is always included. Depth 0 = root; children start at depth 1.
 */
export function dumpTree(root: DumpTreeNode, opts: DumpTreeOpts = {}): DumpTreeResult {
  const resolved = resolveDumpOpts(opts);
  const state: WalkState = {
    count: 0,
    truncated: false,
    max_depth: resolved.max_depth,
    max_nodes: resolved.max_nodes,
    skip_anonymous: resolved.skip_anonymous,
  };
  const data = walk(root, 0, state);
  return {
    data,
    truncated: state.truncated,
    max_depth: state.max_depth,
    max_nodes: state.max_nodes,
    node_count: state.count,
    skip_anonymous: state.skip_anonymous,
  };
}

function walk(node: DumpTreeNode, depth: number, state: WalkState): DumpTreeNode {
  state.count += 1;
  const out: DumpTreeNode = {
    name: node.name,
    path: node.path,
    type: node.type,
    children: [],
  };

  const kids = node.children || [];
  if (depth >= state.max_depth) {
    if (kids.length > 0) state.truncated = true;
    return out;
  }

  for (const child of kids) {
    if (state.count >= state.max_nodes) {
      state.truncated = true;
      break;
    }
    if (state.skip_anonymous && isAnonymousNodeName(child.name)) {
      continue;
    }
    out.children!.push(walk(child, depth + 1, state));
  }

  // If we skipped some siblings due to max_nodes mid-loop, already truncated.
  // If anonymous-only leftovers exist past budget, not required to flag.
  return out;
}

/** Count every node in an unbounded walk (test helper only). */
export function countAllNodes(node: DumpTreeNode): number {
  let n = 1;
  for (const c of node.children || []) n += countAllNodes(c);
  return n;
}
