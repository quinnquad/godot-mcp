/**
 * JOS-15 hold semantics — drives real shipped expandHoldSteps / isActionHeldAfterSteps.
 * Run: npm test  (or node --test tests/simulate_steps.test.js after build)
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const built = path.join(__dirname, '..', 'build', 'bridge', 'simulate-steps.js');
const {
  expandHoldSteps,
  estimateSimulateDurationMs,
  isActionHeldAfterSteps,
} = require(built);

describe('expandHoldSteps (JOS-15)', () => {
  it('expands hold_ms into press → delay → release', () => {
    const out = expandHoldSteps([
      { type: 'action', action: 'move_right', hold_ms: 500 },
    ]);
    assert.equal(out.length, 3);
    assert.deepEqual(out[0], { type: 'action', action: 'move_right', press: true });
    assert.equal(out[1].type, 'delay');
    assert.equal(out[1].ms, 500);
    assert.deepEqual(out[2], { type: 'action', action: 'move_right', press: false });
  });

  it('leaves explicit press without hold_ms pressed (no auto-release)', () => {
    const out = expandHoldSteps([
      { type: 'action', action: 'move_right', press: true },
      { type: 'delay', ms: 200 },
    ]);
    assert.equal(out.length, 2);
    assert.equal(out[0].press, true);
    assert.equal(isActionHeldAfterSteps(out, 'move_right'), true);
  });

  it('press then release leaves action not held', () => {
    const steps = [
      { type: 'action', action: 'move_left', press: true },
      { type: 'delay', ms: 100 },
      { type: 'action', action: 'move_left', press: false },
    ];
    assert.equal(isActionHeldAfterSteps(steps, 'move_left'), false);
  });

  it('hold_ms path ends released but spent time held (duration includes hold)', () => {
    const steps = [{ type: 'action', action: 'move_right', hold_ms: 400 }];
    assert.equal(estimateSimulateDurationMs(steps), 400);
    // After full expand sequence, final state is released
    assert.equal(isActionHeldAfterSteps(steps, 'move_right'), false);
    // Mid-sequence: after only first expanded step, would be held — check expand
    const mid = expandHoldSteps(steps).slice(0, 1);
    assert.equal(isActionHeldAfterSteps(mid, 'move_right'), true);
  });

  it('does not use a single instantaneous press/release for hold_ms', () => {
    const out = expandHoldSteps([{ type: 'action', action: 'jump', hold_ms: 80 }]);
    // Must not be a single step that press+releases
    assert.ok(out.length >= 3);
    const presses = out.filter((s) => s.type === 'action' && s.press === true);
    const releases = out.filter((s) => s.type === 'action' && s.press === false);
    const delays = out.filter((s) => s.type === 'delay');
    assert.equal(presses.length, 1);
    assert.equal(releases.length, 1);
    assert.equal(delays.length, 1);
    assert.ok(delays[0].ms > 0);
  });

  it('estimates multi-step duration for TCP timeout sizing', () => {
    const ms = estimateSimulateDurationMs([
      { type: 'action', action: 'move_right', hold_ms: 300 },
      { type: 'action', action: 'jump', hold_ms: 50 },
      { type: 'delay', ms: 100 },
    ]);
    assert.equal(ms, 450);
  });
});
