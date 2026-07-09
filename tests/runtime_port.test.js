/**
 * JOS-17 / runtime port selection — drives the real shipped helper.
 * Run: node --test tests/runtime_port.test.js
 * (requires `npm run build` first so build/bridge/runtime-port.js exists)
 */
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const path = require('node:path');

const built = path.join(__dirname, '..', 'build', 'bridge', 'runtime-port.js');
const {
  PERSISTENT_RUNTIME_PORT,
  ZERO_FOOTPRINT_RUNTIME_PORT,
  selectRuntimePort,
  resolveRuntimePort,
  probeLocalPort,
} = require(built);

function listen(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer(() => {
      /* accept and drop — probe only needs connect success */
    });
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function close(server) {
  return new Promise((resolve) => {
    if (!server) return resolve();
    server.close(() => resolve());
  });
}

describe('selectRuntimePort (pure)', () => {
  it('uses injected port even when neither default is listed as listening', () => {
    assert.equal(selectRuntimePort(4243, []), 4243);
    assert.equal(selectRuntimePort(9999, [4242]), 9999);
  });

  it('prefers 4242 when only persistent is listening', () => {
    assert.equal(selectRuntimePort(null, [4242]), PERSISTENT_RUNTIME_PORT);
    assert.equal(selectRuntimePort(undefined, new Set([4242])), PERSISTENT_RUNTIME_PORT);
  });

  it('uses 4243 when only zero-footprint is listening (JOS-17)', () => {
    assert.equal(selectRuntimePort(null, [4243]), ZERO_FOOTPRINT_RUNTIME_PORT);
    assert.equal(selectRuntimePort(undefined, new Set([4243])), ZERO_FOOTPRINT_RUNTIME_PORT);
  });

  it('prefers 4242 when both are listening (persistent default)', () => {
    assert.equal(selectRuntimePort(null, [4242, 4243]), PERSISTENT_RUNTIME_PORT);
  });

  it('returns null when neither is listening and no inject', () => {
    assert.equal(selectRuntimePort(null, []), null);
    assert.equal(selectRuntimePort(undefined, new Set()), null);
  });
});

describe('resolveRuntimePort + real TCP probes', () => {
  let s4242 = null;
  let s4243 = null;

  after(async () => {
    await close(s4242);
    await close(s4243);
    s4242 = null;
    s4243 = null;
  });

  it('4243-only: resolves to zero-footprint without inject', async () => {
    await close(s4242);
    await close(s4243);
    s4242 = null;
    s4243 = await listen(ZERO_FOOTPRINT_RUNTIME_PORT);
    const port = await resolveRuntimePort(null, (p) => probeLocalPort(p, 300));
    assert.equal(port, ZERO_FOOTPRINT_RUNTIME_PORT);
  });

  it('4242-only: resolves to persistent', async () => {
    await close(s4242);
    await close(s4243);
    s4243 = null;
    s4242 = await listen(PERSISTENT_RUNTIME_PORT);
    const port = await resolveRuntimePort(null, (p) => probeLocalPort(p, 300));
    assert.equal(port, PERSISTENT_RUNTIME_PORT);
  });

  it('neither: resolves to null', async () => {
    await close(s4242);
    await close(s4243);
    s4242 = null;
    s4243 = null;
    // Use a probe that always says down so we do not race on leftover listeners
    const port = await resolveRuntimePort(null, async () => false);
    assert.equal(port, null);
  });

  it('inject wins over live probes', async () => {
    const port = await resolveRuntimePort(5555, async () => true);
    assert.equal(port, 5555);
  });
});
