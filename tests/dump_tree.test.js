/**
 * get_tree dump bounds — drives real shipped dumpTree / isAnonymousNodeName.
 * Fixture: deep nesting + hundreds of nodes + @Sprite2D@N / @Node@N names.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const built = path.join(__dirname, '..', 'build', 'bridge', 'dump-tree-util.js');
const {
  dumpTree,
  isAnonymousNodeName,
  countAllNodes,
  DEFAULT_MAX_DEPTH,
  DEFAULT_MAX_NODES,
  resolveDumpOpts,
} = require(built);

/** Build a large farm-like fixture: named plots with many anonymous sprites. */
function buildLargeFixture() {
  const root = {
    name: 'root',
    path: '/root',
    type: 'Window',
    children: [
      {
        name: 'Main',
        path: '/root/Main',
        type: 'Node2D',
        children: [],
      },
    ],
  };
  const main = root.children[0];

  // Named structure + deep chain
  let deep = {
    name: 'Farm',
    path: '/root/Main/Farm',
    type: 'Node2D',
    children: [],
  };
  main.children.push(deep);
  for (let d = 0; d < 12; d++) {
    const next = {
      name: `Layer${d}`,
      path: `${deep.path}/Layer${d}`,
      type: 'Node2D',
      children: [],
    };
    deep.children.push(next);
    deep = next;
  }

  // Hundreds of plot nodes each with anonymous sprites + one named label
  const plots = {
    name: 'Plots',
    path: '/root/Main/Plots',
    type: 'Node2D',
    children: [],
  };
  main.children.push(plots);
  for (let i = 0; i < 80; i++) {
    const plot = {
      name: `Plot${i}`,
      path: `/root/Main/Plots/Plot${i}`,
      type: 'Node2D',
      children: [
        {
          name: `@Sprite2D@${i + 1}`,
          path: `/root/Main/Plots/Plot${i}/@Sprite2D@${i + 1}`,
          type: 'Sprite2D',
        },
        {
          name: `@Node@${i + 2}`,
          path: `/root/Main/Plots/Plot${i}/@Node@${i + 2}`,
          type: 'Node',
        },
        {
          name: 'Label',
          path: `/root/Main/Plots/Plot${i}/Label`,
          type: 'Label',
        },
      ],
    };
    plots.children.push(plot);
  }

  // Extra anonymous under Main
  main.children.push({
    name: '@Sprite2D@99',
    path: '/root/Main/@Sprite2D@99',
    type: 'Sprite2D',
  });

  return root;
}

function collectNames(node, out = []) {
  out.push(node.name);
  for (const c of node.children || []) collectNames(c, out);
  return out;
}

describe('dumpTree (get_tree bounds)', () => {
  const fixture = buildLargeFixture();
  const total = countAllNodes(fixture);

  it('fixture is large (hundreds of nodes / deep nesting)', () => {
    assert.ok(total >= 200, `expected >=200 nodes, got ${total}`);
    assert.ok(total > DEFAULT_MAX_NODES, 'fixture must exceed default max_nodes budget');
  });

  it('isAnonymousNodeName matches Godot @Type@N pattern', () => {
    assert.equal(isAnonymousNodeName('@Sprite2D@1'), true);
    assert.equal(isAnonymousNodeName('@Node@2'), true);
    assert.equal(isAnonymousNodeName('Plot0'), false);
    assert.equal(isAnonymousNodeName('Label'), false);
    assert.equal(isAnonymousNodeName('@weird'), false);
  });

  it('default stays under node budget and sets truncated when over', () => {
    const r = dumpTree(fixture);
    assert.equal(r.max_depth, DEFAULT_MAX_DEPTH);
    assert.equal(r.max_nodes, DEFAULT_MAX_NODES);
    assert.ok(r.node_count <= DEFAULT_MAX_NODES, `node_count ${r.node_count} > budget`);
    assert.equal(r.truncated, true);
    assert.equal(r.skip_anonymous, true);
    assert.ok(r.data && r.data.name === 'root');
  });

  it('default excludes @Sprite2D@N / @Node@N names', () => {
    const r = dumpTree(fixture);
    const names = collectNames(r.data);
    const anon = names.filter((n) => isAnonymousNodeName(n));
    assert.equal(anon.length, 0, `unexpected anonymous: ${anon.slice(0, 5)}`);
  });

  it('include_anonymous true includes @Sprite2D@N-style names', () => {
    const r = dumpTree(fixture, {
      max_depth: 6,
      max_nodes: 500,
      include_anonymous: true,
    });
    assert.equal(r.skip_anonymous, false);
    const names = collectNames(r.data);
    assert.ok(names.some((n) => /^@Sprite2D@\d+$/.test(n)), 'expected @Sprite2D@N in dump');
    assert.ok(names.some((n) => /^@Node@\d+$/.test(n)), 'expected @Node@N in dump');
  });

  it('max_depth truncates deep chains with truncated flag', () => {
    const r = dumpTree(fixture, { max_depth: 2, max_nodes: 10000, include_anonymous: true });
    assert.equal(r.max_depth, 2);
    assert.equal(r.truncated, true);
    const names = collectNames(r.data);
    // Layer0 is under Farm under Main under root → depth 3 from root; with max_depth 2:
    // depth0 root, depth1 Main, depth2 Farm/Plots — Layer0 is depth 3 so not walked as content deeper
    assert.ok(!names.includes('Layer5'), 'should not reach deep layers');
  });

  it('max_nodes truncates and sets truncated flag', () => {
    const r = dumpTree(fixture, { max_depth: 20, max_nodes: 25, include_anonymous: false });
    assert.equal(r.node_count, 25);
    assert.equal(r.truncated, true);
  });

  it('resolveDumpOpts mirrors GDScript defaults', () => {
    const d = resolveDumpOpts({});
    assert.equal(d.max_depth, 4);
    assert.equal(d.max_nodes, 150);
    assert.equal(d.skip_anonymous, true);
    const open = resolveDumpOpts({ include_anonymous: true, max_depth: 10, max_nodes: 999 });
    assert.equal(open.skip_anonymous, false);
    assert.equal(open.max_depth, 10);
    assert.equal(open.max_nodes, 999);
  });
});
