/**
 * Simulate-input step helpers (JOS-15).
 * Expands agent-friendly hold_ms into press → delay → release so actions
 * stay held across physics frames on the Godot side (non-blocking delays).
 */

export type SimStep = {
  type: string;
  action?: string;
  press?: boolean;
  hold_ms?: number;
  ms?: number;
  pos?: number[];
  [key: string]: unknown;
};

/**
 * Expand action steps that include hold_ms into explicit press/delay/release.
 * Leaves other steps unchanged. Pure — used by the public MCP entry before TCP send.
 */
export function expandHoldSteps(steps: SimStep[]): SimStep[] {
  if (!Array.isArray(steps)) return [];
  const out: SimStep[] = [];
  for (const s of steps) {
    if (!s || typeof s !== 'object') continue;
    const typ = String(s.type || '');
    const hold = Number(s.hold_ms ?? 0);
    if (typ === 'action' && hold > 0 && s.action) {
      out.push({ type: 'action', action: String(s.action), press: true });
      out.push({ type: 'delay', ms: hold });
      out.push({ type: 'action', action: String(s.action), press: false });
      continue;
    }
    out.push({ ...s });
  }
  return out;
}

/**
 * Estimate how long a step list will take (ms of delay/hold only).
 * Used to size the TCP client timeout for long holds.
 */
export function estimateSimulateDurationMs(steps: SimStep[]): number {
  const expanded = expandHoldSteps(steps);
  let total = 0;
  for (const s of expanded) {
    if (String(s.type) === 'delay' || String(s.type) === 'wait') {
      total += Math.max(0, Number(s.ms ?? 0));
    }
  }
  return total;
}

/**
 * True if a press for `action` remains held after processing `steps` in order
 * (no later release). Used by unit tests of hold semantics.
 */
export function isActionHeldAfterSteps(steps: SimStep[], action: string): boolean {
  let held = false;
  for (const s of expandHoldSteps(steps)) {
    if (String(s.type) !== 'action') continue;
    if (String(s.action) !== action) continue;
    held = s.press !== false;
  }
  return held;
}
