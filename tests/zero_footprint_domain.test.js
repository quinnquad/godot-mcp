/**
 * JOS-53: inject must not overwrite domain-aware project bridges.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  isDomainAwareBridge,
  handleZeroFootprintTool,
} = require('../build/bridge/zero-footprint.js');

describe('zero-footprint domain preserve (JOS-53)', () => {
  it('detects Elderglow-style domain bridge', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zf-domain-'));
    const f = path.join(dir, 'mcp_bridge.gd');
    fs.writeFileSync(f, 'const ELDERGLOW_DOMAIN_CMDS := {"farm_plot_state": true}\n');
    assert.equal(isDomainAwareBridge(f), true);
    fs.writeFileSync(f, '# general only\nconst PORT := 4243\n');
    assert.equal(isDomainAwareBridge(f), false);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('inject preserves domain bridge file contents', () => {
    const project = fs.mkdtempSync(path.join(os.tmpdir(), 'zf-proj-'));
    const bridgeDir = path.join(project, 'addons', 'godot_mcp_bridge');
    fs.mkdirSync(bridgeDir, { recursive: true });
    const bridgePath = path.join(bridgeDir, 'mcp_bridge.gd');
    const marker = 'const ELDERGLOW_DOMAIN_CMDS := {"farm_plot_state": true}\n# DOMAIN_MARKER_JOS53\n';
    fs.writeFileSync(bridgePath, marker);
    fs.writeFileSync(path.join(project, 'project.godot'), '; Engine configuration file.\n\n[application]\n\n');

    const res = handleZeroFootprintTool('inject_zero_footprint_bridge', { project_path: project, port: 4243 });
    const text = res.content[0].text;
    const parsed = JSON.parse(text);
    assert.equal(parsed.status, 'ok');
    assert.equal(parsed.preserved_domain_bridge, true);
    const after = fs.readFileSync(bridgePath, 'utf8');
    assert.ok(after.includes('DOMAIN_MARKER_JOS53'), 'domain bridge must not be overwritten');
    assert.ok(after.includes('ELDERGLOW_DOMAIN_CMDS'));

    // cleanup must not delete preserved domain bridge
    handleZeroFootprintTool('cleanup_zero_footprint_bridge', { project_path: project });
    assert.ok(fs.existsSync(bridgePath), 'domain bridge file remains after cleanup');
    assert.ok(fs.readFileSync(bridgePath, 'utf8').includes('DOMAIN_MARKER_JOS53'));

    fs.rmSync(project, { recursive: true, force: true });
  });
});
