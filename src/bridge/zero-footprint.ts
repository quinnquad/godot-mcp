// Zero-footprint bridge injection tools (GENERAL / reusable / public)
// Extracted from src/index.ts as part of the public/private GitHub split restructuring
// (user directive "1" + explicit "next" after the private game-specific + general tool moves).
//
// This module contains the on-demand / temporary injection logic that allows clean
// testing of any Godot project (including private game builds on clean checkouts) by
// copying mcp_bridge.gd into a temp addons/ folder and temporarily editing project.godot
// to register a transient autoload. It is self-cleaning and leaves zero trace when
// cleanup is called.
//
// Why this file exists (AGENTS.md "absolutely necessary" justification):
// - Zero-footprint is general-purpose infrastructure, not tied to any private game IP.
// - It must live in the future public repo so the community can improve the on-demand
//   bridge experience for all Godot users.
// - Leaving the implementation inline in index.ts would either mix concerns or require
//   duplication / history leakage when splitting the monorepo into private (full) +
//   public (general only).
// - The PUBLIC_PRIVATE_SPLIT.md explicitly lists this extraction as the immediate
//   next micro-step after the first two tool moves.
// - This preserves 100% of the zero-footprint initial spike (the work started after
//   user chose option "A") so we can circle back and harden it (wire the new runtime
//   superpowers: capture_screenshot + simulate_input_batch + execute_live_script into
//   the injected bridge) without losing anything, per the user's explicit instruction
//   "I don't want to lose anything we were working on. Once we are done getting the
//   Gits settled out we need to circle around and finish anything else".
//
// Pure extraction: behavior is 100% identical. No new features, no refactors beyond
// the move itself. Matches the private handlers delegation pattern for consistency.
//
// Future: when the injected bridge (mcp_bridge.gd) is updated to support the full
// runtime command surface, these tools will automatically expose the superpowers
// (screenshots, input sim, live GDScript) on clean test projects.

const fs = require('fs');
const path = require('path');

const injectedBridges = new Map(); // projectPath -> {bridgeScriptPath, autoloadBackup}

export const zeroFootprintToolNames = [
  'inject_zero_footprint_bridge',
  'cleanup_zero_footprint_bridge',
  'list_zero_footprint_injections',
];

/**
 * True if project already ships a domain-aware bridge (e.g. Elderglow).
 * Overwriting those files with the public general bridge drops farm_plot_state /
 * creature_inspect / etc. (JOS-53).
 */
export function isDomainAwareBridge(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  try {
    const src = fs.readFileSync(filePath, 'utf8');
    return (
      src.includes('ELDERGLOW_DOMAIN_CMDS') ||
      src.includes('ElderglowMcpHandlers') ||
      /DOMAIN_CMDS\s*:=/.test(src)
    );
  } catch {
    return false;
  }
}

export function handleZeroFootprintTool(name: string, args: any) {
  if (name === 'inject_zero_footprint_bridge') {
    const project_path = (args && args.project_path) || '';
    const port = (args && args.port) || 4243;
    const force = !!(args && args.force);
    if (!project_path) return { content: [{ type: 'text', text: 'ERROR: project_path required' }], isError: true };
    const bridgeSource = path.resolve(__dirname, '..', '..', 'addons', 'godot_mcp_runtime', 'mcp_bridge.gd');
    if (!fs.existsSync(bridgeSource)) return { content: [{ type: 'text', text: 'ERROR: mcp_bridge.gd source missing' }], isError: true };
    const targetDir = path.join(project_path, 'addons', 'godot_mcp_bridge');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    const targetBridge = path.join(targetDir, 'mcp_bridge.gd');
    // JOS-53: never clobber a project domain bridge (Elderglow farm cmds) unless force=true
    const preservedDomain = !force && isDomainAwareBridge(targetBridge);
    if (!preservedDomain) {
      fs.copyFileSync(bridgeSource, targetBridge);
    }
    const pg = path.join(project_path, 'project.godot');
    const bak = injectMCPBridgeAutoload(pg);
    injectedBridges.set(project_path, {
      bridgeScriptPath: targetBridge,
      autoloadBackup: bak,
      port,
      preservedDomain,
    });
    const note = preservedDomain
      ? 'Preserved existing domain-aware mcp_bridge.gd (JOS-53); only ensured MCPBridge autoload. Play the game — do not expect public-only ZF overwrite.'
      : 'Zero-footprint general bridge injected (clean test project). Cleanup after.';
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'ok',
          injected: true,
          port,
          project: project_path,
          preserved_domain_bridge: preservedDomain,
          note,
        }),
      }],
    };
  }
  if (name === 'cleanup_zero_footprint_bridge') {
    const project_path = (args && args.project_path) || '';
    if (!project_path || !injectedBridges.has(project_path)) return { content: [{ type: 'text', text: 'ERROR: not injected' }], isError: true };
    const info = injectedBridges.get(project_path);
    const pg = path.join(project_path, 'project.godot');
    removeMCPBridgeAutoload(pg, info.autoloadBackup);
    // Do not delete a pre-existing domain bridge that inject only autoload-registered (JOS-53)
    if (!info.preservedDomain && fs.existsSync(info.bridgeScriptPath)) {
      fs.unlinkSync(info.bridgeScriptPath);
      const tdir = path.dirname(info.bridgeScriptPath);
      if (fs.existsSync(tdir) && fs.readdirSync(tdir).length === 0) fs.rmdirSync(tdir);
    }
    injectedBridges.delete(project_path);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'ok',
          cleaned: project_path,
          preserved_domain_bridge: !!info.preservedDomain,
        }),
      }],
    };
  }
  if (name === 'list_zero_footprint_injections') {
    return { content: [{ type: 'text', text: JSON.stringify({ injected: Array.from(injectedBridges.keys()) }) }] };
  }
  return { content: [{ type: 'text', text: `Unknown zero-footprint tool: ${name}` }], isError: true };
}

/**
 * Returns the port of an active zero-footprint injection if one exists.
 * This allows the main MCP server to route general tools (get_tree, screenshot, etc.)
 * to the injected bridge (e.g. 4243) instead of always defaulting to the persistent 4242.
 */
export function getActiveZeroFootprintPort(): number | null {
  if (injectedBridges.size === 0) return null;
  // For the initial implementation we support one active injection at a time.
  // Future improvement: per-project targeting when tools carry a project_path.
  const firstEntry = Array.from(injectedBridges.values())[0];
  return firstEntry?.port ?? null;
}

// === Robust project.godot autoload editing helpers ===

/**
 * Safely injects the MCPBridge autoload into a project.godot file.
 * Returns a backup string of the original [autoload] section content (for later restoration).
 * This version works on lines instead of fragile regex to prevent the corruption bug.
 */
export function injectMCPBridgeAutoload(pgPath: string): string {
  let content = fs.readFileSync(pgPath, 'utf8');
  let lines = content.split(/\r?\n/);

  // 1. Remove any previous (possibly corrupted) MCPBridge entries
  lines = lines.filter((line: string) => !line.includes('MCPBridge') && !line.includes('godot_mcp_bridge'));

  // 2. Find the [autoload] section
  let autoloadIndex = lines.findIndex((line: string) => line.trim() === '[autoload]');

  const bridgeLine = 'MCPBridge="*res://addons/godot_mcp_bridge/mcp_bridge.gd"';
  let backup = '';

  if (autoloadIndex !== -1) {
    // Capture the original autoload section for backup
    const sectionStart = autoloadIndex;
    let sectionEnd = lines.length;
    for (let i = sectionStart + 1; i < lines.length; i++) {
      if (lines[i].trim().startsWith('[')) {
        sectionEnd = i;
        break;
      }
    }
    backup = lines.slice(sectionStart, sectionEnd).join('\n');

    // Insert the clean bridge line as the first entry in the section
    lines.splice(autoloadIndex + 1, 0, bridgeLine);
  } else {
    // No [autoload] section exists — append a clean one
    if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
      lines.push('');
    }
    lines.push('[autoload]');
    lines.push(bridgeLine);
    backup = '[autoload]';
  }

  fs.writeFileSync(pgPath, lines.join('\n'));
  return backup;
}

/**
 * Removes the MCPBridge autoload from project.godot.
 * If a backup string is provided, it will attempt to restore the previous state of the [autoload] section.
 */
export function removeMCPBridgeAutoload(pgPath: string, backup: string): void {
  let content = fs.readFileSync(pgPath, 'utf8');
  let lines = content.split(/\r?\n/);

  // Remove any lines mentioning the bridge
  lines = lines.filter((line: string) => !line.includes('MCPBridge') && !line.includes('godot_mcp_bridge'));

  if (backup && backup.trim().length > 0) {
    // Best-effort restoration of the previous autoload section
    const backupLines = backup.split(/\r?\n/).filter(l => l.trim() !== '');

    // If there's still an [autoload] section, replace its content with the backup
    const autoIdx = lines.findIndex((l: string) => l.trim() === '[autoload]');

    if (autoIdx !== -1) {
      let endIdx = lines.length;
      for (let i = autoIdx + 1; i < lines.length; i++) {
        if (lines[i].trim().startsWith('[')) {
          endIdx = i;
          break;
        }
      }
      lines.splice(autoIdx, endIdx - autoIdx, ...backupLines);
    } else {
      // Append the backup section if none exists
      if (lines.length > 0 && lines[lines.length - 1].trim() !== '') lines.push('');
      lines.push(...backupLines);
    }
  }

  fs.writeFileSync(pgPath, lines.join('\n'));
}
