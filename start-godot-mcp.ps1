# start-godot-mcp.ps1
# Daily one-command prep for godot-mcp (real agent integration).
# Run: cd I:\godot-mcp ; .\start-godot-mcp.ps1  (or from repo root)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host "=== Godot MCP Daily Prep ===" -ForegroundColor Cyan

# Ensure up-to-date build (tsc)
$buildJs = Join-Path $PSScriptRoot "build\index.js"
$srcTs = Join-Path $PSScriptRoot "src\index.ts"
$needsBuild = -not (Test-Path $buildJs)
if (-not $needsBuild -and (Test-Path $srcTs)) {
    if ((Get-Item $srcTs).LastWriteTime -gt (Get-Item $buildJs).LastWriteTime) {
        $needsBuild = $true
    }
}
if ($needsBuild) {
    Write-Host "Building..." -ForegroundColor Yellow
    npm run build
} else {
    Write-Host "Build current." -ForegroundColor Green
}

Write-Host ""
Write-Host "Registered: godot-mcp (via grok mcp add; uses node build\index.js)" -ForegroundColor Green
Write-Host "Grok agents + /mcp auto-launch the server on demand."
Write-Host ""
Write-Host "LIVE RUNTIME (get_tree/set_property/call_method + 20+ general Godot tools):" -ForegroundColor Yellow
Write-Host "  REQUIRES: Godot game running + addons/godot_mcp_runtime plugin ENABLED (Project>Plugins)"
Write-Host "  - Copy addons/godot_mcp_runtime/ into your .godot project"
Write-Host "  - Toggle plugin ON"
Write-Host "  - Play the game (editor or export debug)"
Write-Host "  - Live tools use TCP 127.0.0.1:4242 only while active"
Write-Host ""
Write-Host "HEADLESS / BRIDGE (create_scene, get_project_info + Phase 1 ops):" -ForegroundColor Yellow
Write-Host "  Always available (no Godot runtime needed; uses CLI bridge)"
Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  - Agents: godot-mcp tools available automatically"
Write-Host "  - CLI: grok mcp doctor godot-mcp   (or /mcps in chat)"
Write-Host "  - Manual: node build\index.js  (for testing; expects MCP stdio)"
Write-Host ""
Write-Host "Ready for live mode. See README 'Daily Usage / Real Workflow'." -ForegroundColor Green
