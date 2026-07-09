/**
 * Runtime TCP port selection for live Godot tools.
 *
 * Persistent plugin / runtime_server listens on 4242.
 * Zero-footprint MCPBridge listens on 4243.
 *
 * JOS-17: when tools run in a process that never called inject, we must still
 * reach a live 4243 bridge instead of hard-failing on 4242 only.
 */

export const PERSISTENT_RUNTIME_PORT = 4242;
export const ZERO_FOOTPRINT_RUNTIME_PORT = 4243;

/**
 * Pure decision function — fully unit-testable without network I/O.
 *
 * Priority:
 * 1. Explicit in-process zero-footprint injection port (if set)
 * 2. Persistent runtime (4242) when that port is listening
 * 3. Zero-footprint (4243) when that port is listening
 * 4. null when neither is listening (caller should surface a clear error)
 */
export function selectRuntimePort(
  injectedPort: number | null | undefined,
  listeningPorts: ReadonlySet<number> | readonly number[]
): number | null {
  const listening =
    listeningPorts instanceof Set ? listeningPorts : new Set(listeningPorts);

  if (injectedPort != null && Number.isFinite(injectedPort) && injectedPort > 0) {
    return injectedPort;
  }
  if (listening.has(PERSISTENT_RUNTIME_PORT)) {
    return PERSISTENT_RUNTIME_PORT;
  }
  if (listening.has(ZERO_FOOTPRINT_RUNTIME_PORT)) {
    return ZERO_FOOTPRINT_RUNTIME_PORT;
  }
  return null;
}

/**
 * Probe whether a TCP port accepts connections on localhost.
 * Used by the live server path; unit tests inject a fake probe instead.
 */
export function probeLocalPort(port: number, timeoutMs = 250): Promise<boolean> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const net = require('net') as typeof import('net');
    const client = net.createConnection({ port, host: '127.0.0.1' }, () => {
      client.end();
      resolve(true);
    });
    client.setTimeout(timeoutMs);
    const fail = () => {
      try {
        client.destroy();
      } catch {
        /* ignore */
      }
      resolve(false);
    };
    client.on('error', fail);
    client.on('timeout', fail);
  });
}

/**
 * Resolve the port to use for a live tool call.
 * Prefer inject map, then probe 4242, then probe 4243.
 */
export async function resolveRuntimePort(
  injectedPort: number | null | undefined,
  probe: (port: number) => Promise<boolean> = probeLocalPort
): Promise<number | null> {
  if (injectedPort != null && Number.isFinite(injectedPort) && injectedPort > 0) {
    return injectedPort;
  }
  if (await probe(PERSISTENT_RUNTIME_PORT)) {
    return PERSISTENT_RUNTIME_PORT;
  }
  if (await probe(ZERO_FOOTPRINT_RUNTIME_PORT)) {
    return ZERO_FOOTPRINT_RUNTIME_PORT;
  }
  return null;
}
