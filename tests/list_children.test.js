/**
 * list_children discovery — drives real shipped collectChildren / missingNodeMessage.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const built = path.join(__dirname, '..', 'build', 'bridge', 'list-children-util.js');
const { collectChildren, missingNodeMessage } = require(built);

const fixture = {
  name: 'Main',
  path: '/root/Main',
  type: 'Node2D',
  children: [
    {
      name: 'Ground',
      path: '/root/Main/Ground',
      type: 'StaticBody2D',
      children: [
        { name: 'CollisionShape2D', path: '/root/Main/Ground/CollisionShape2D', type: 'CollisionShape2D' },
        { name: 'Visual', path: '/root/Main/Ground/Visual', type: 'ColorRect' },
      ],
    },
    {
      name: 'Sonic',
      path: '/root/Main/Sonic',
      type: 'CharacterBody2D',
      children: [
        { name: 'Camera2D', path: '/root/Main/Sonic/Camera2D', type: 'Camera2D' },
      ],
    },
    { name: 'Ring0', path: '/root/Main/Ring0', type: 'Area2D' },
  ],
};

describe('collectChildren (list_children shape)', () => {
  it('default max_depth=1 is shallow only (name/path/type)', () => {
    const r = collectChildren(fixture, { max_depth: 1, limit: 200 });
    assert.equal(r.max_depth, 1);
    assert.equal(r.count, 3);
    assert.equal(r.truncated, false);
    const names = r.children.map((c) => c.name).sort();
    assert.deepEqual(names, ['Ground', 'Ring0', 'Sonic']);
    for (const c of r.children) {
      assert.ok(c.name && c.path && c.type);
      assert.equal(c.depth, 1);
    }
    // Must not require full recursive dump of CollisionShape grandchildren
    assert.ok(!r.children.some((c) => c.name === 'CollisionShape2D'));
  });

  it('max_depth=2 includes grandchildren without full get_tree dump requirement', () => {
    const r = collectChildren(fixture, { max_depth: 2, limit: 200 });
    assert.ok(r.children.some((c) => c.name === 'Camera2D'));
    assert.ok(r.children.some((c) => c.name === 'Visual'));
    assert.ok(r.count > 3);
  });

  it('limit truncates and sets truncated flag', () => {
    const r = collectChildren(fixture, { max_depth: 2, limit: 2 });
    assert.equal(r.count, 2);
    assert.equal(r.truncated, true);
  });

  it('missing node message tells agent to Play + bridge', () => {
    const msg = missingNodeMessage('/root/Main/Missing');
    assert.match(msg, /node not found: \/root\/Main\/Missing/);
    assert.match(msg, /Play/);
    assert.match(msg, /4243|4242|bridge/i);
  });
});
