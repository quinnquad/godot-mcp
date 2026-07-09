/**
 * list_children discovery helpers — pure structure used by tests and docs.
 * Mirrors the Godot bridge algorithm (shallow-by-default, optional depth/limit).
 */

export type NodeInfo = {
  name: string;
  path: string;
  type: string;
  depth?: number;
};

export type TreeNode = {
  name: string;
  path: string;
  type: string;
  children?: TreeNode[];
};

/**
 * Collect children from a fixture tree with max_depth (1 = direct children only)
 * and a hard limit. Returns the same shape the bridge returns in `children`.
 */
export function collectChildren(
  root: TreeNode,
  opts: { max_depth?: number; limit?: number } = {}
): { children: NodeInfo[]; count: number; truncated: boolean; max_depth: number } {
  const maxDepth = Math.max(1, Math.floor(opts.max_depth ?? 1));
  const limit = Math.max(1, Math.floor(opts.limit ?? 200));
  const children: NodeInfo[] = [];

  function walk(node: TreeNode, depth: number) {
    if (children.length >= limit) return;
    if (depth > maxDepth) return;
    const kids = node.children || [];
    for (const child of kids) {
      if (children.length >= limit) break;
      children.push({
        name: child.name,
        path: child.path,
        type: child.type,
        depth,
      });
      if (depth < maxDepth) {
        walk(child, depth + 1);
      }
    }
  }

  walk(root, 1);
  return {
    children,
    count: children.length,
    truncated: children.length >= limit,
    max_depth: maxDepth,
  };
}

/** Missing-node error message — must match agent-facing clarity bar. */
export function missingNodeMessage(nodePath: string): string {
  const p = nodePath || '(empty)';
  return `node not found: ${p} — check the path, and ensure the game is in Play with the MCP bridge listening (4243 zero-footprint or 4242 persistent)`;
}
