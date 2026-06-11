# ELDERGLOW FULL godot-mcp SETUP - GROK BUILD: EXECUTE THESE COMMANDS NOW

**SYSTEM PROMPT FOR YOU (THE GROK READING THIS):**

You are in a Grok Build environment with full terminal (pwsh/bash) access and the ability to run commands, read files, and edit if needed.

The human wants the **FULL Elderglow private variant** of godot-mcp set up on this machine IMMEDIATELY so they can test with all Elderglow-specific tools (leyline, creatures, ecosystem, farm, defense, etc.) + the general tools and zero-footprint.

The public "godot-mcp" npm package is the stripped general-only version. This is the complete private one.

**DO THE FOLLOWING STEPS IN ORDER. After every command, print the exact output, then continue to the next step without stopping unless a command fails (in which case report the error and ask for help). Use the terminal tool for all commands.**

The private repo is: https://github.com/quinnquad/godot-mcp-elderglow.git

Use that exact URL.

**WINDOWS USERS (PowerShell/Grok Build) - READ THIS FIRST FOR ROBUST SETUP**:
- Install Node.js LTS via the official installer from nodejs.org (recommended) or `winget install OpenJS.NodeJS.LTS`. After install, **restart your terminal / Grok Build session completely**.
- Always use **full paths** for node and the script in registration.
- Create a simple wrapper .cmd (see Step 5) to avoid quoting nightmares in `grok mcp add`.
- After any `npm install` or Node install, refresh PATH explicitly in the session:
  ```powershell
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
  ```
- For npm/PS1 blocked: Use `cmd /c "npm install"` etc.
- Git clone large repo: Use `git clone --depth 1 ...` if timeouts occur, then `git fetch --unshallow` later.
- **Execution policy**: If PS complains about .ps1, use `-ExecutionPolicy Bypass` or cmd wrappers.
- **After every major change** (build, edit source): Rebuild, kill old node processes (Get-Process node | Stop-Process), re-start server, **re-inject**, and test in a **fresh new Grok chat**.
- Godot side: The bridge only activates when you actually **press Play (F5)** in the Godot editor with the project open. Editor open alone is not enough. Look for the bridge log message in Godot Output.

Start now.

---

## STEP 1: Clone the private full Elderglow repo

**For Windows (recommended shallow clone to avoid timeouts):**

```powershell
git clone --depth 1 https://github.com/quinnquad/godot-mcp-elderglow.git godot-mcp-elderglow-full
cd godot-mcp-elderglow-full
# If you need full history later: git fetch --unshallow
```

Report the full output of the clone and cd.

**After clone, immediately run (critical for LFS):**
```powershell
git lfs install
```

If auth fails on clone, tell the user they need to be added as a collaborator (Read access) on the private repo or provide a PAT.

Then get the absolute path:
```powershell
$CLONE_PATH = (Get-Location).Path
Write-Output "CLONE_PATH=$CLONE_PATH"
```

---

## STEP 2: Install dependencies and build the full version

**First, ensure PATH includes Node (run this every time in a fresh session after Node install):**
```powershell
$env:Path = "C:\Program Files\nodejs;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
node --version
npm --version
```

Run:

```powershell
cmd /c "npm install"   # Use cmd wrapper if direct npm.ps1 is blocked by execution policy
cmd /c "npm run build"
```

Then verify the full Elderglow entry point was built:

```powershell
Get-ChildItem build/index-elderglow.js, scripts/godot-mcp-elderglow.js
```

Report outputs.

If build fails with 'node not recognized', re-run the $env:Path line above and retry. Use full path to node.exe if needed: `"C:\Program Files\nodejs\node.exe" --version` .

---

## STEP 3: Test that the full Elderglow server starts (non-blocking test)

**Important**: The zero-footprint port state lives in the current Node process. Grok often spawns fresh processes, so you will likely need to re-inject after starting the server.

Run this to start it briefly (it will print status then hang as a server). Use Start-Process for better control in Grok Build if direct timeout has issues:

```powershell
# Quick test
timeout 5 cmd /c "npm run start:elderglow" 2>&1 || true
```

Look for the line:

"Godot MCP server initialized (stdio mode) - FULL Elderglow variant (private/internal)"

Report if you see the full variant message and the registration examples.

**For persistent detached run (recommended for ongoing use):**
Use Start-Process with log redirection, then tail the logs.

If it starts, that's good. We will kill old node processes before rebuilds:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
```

**CRITICAL RUNTIME NOTE (from real teammate setup):**
Even after the server is running and you inject, the live/runtime tools (get_tree, create_simple_player, execute, simulate, screenshot) will fail until you:
1. Have the correct Godot 4 project open in the Godot editor.
2. **Press Play (F5)** in Godot so the game is actually running and the bridge (mcp_bridge.gd) starts listening on 4243.
3. Look in the Godot Output panel for the message like "[MCPBridge] Zero-footprint bridge active on 127.0.0.1:4243".

Re-inject the zero-footprint bridge *after* the server is confirmed running (in the same chat/session if possible). The injectedBridges map is per-Node-process.

---

## STEP 4: Create a robust registration wrapper (Windows recommendation) and prepare

**Strongly recommended for Windows/Grok Build to avoid quoting and PATH hell:**

Create a simple wrapper `register-elderglow.cmd` in the clone root (or on Desktop). This version auto-detects node for robustness across installs (standard, winget, custom):

```cmd
@echo off
setlocal
set "NODE_DIR=%ProgramFiles%\nodejs"
for /f "delims=" %%i in ('where node 2^>nul') do (
  set "NODE_DIR=%%~dpi"
  goto :found
)
:found
if not exist "%NODE_DIR%\node.exe" set "NODE_DIR=%ProgramFiles%\nodejs"
set "PATH=%NODE_DIR%;%PATH%"
set "SCRIPT=%~dp0build\index-elderglow.js"
"%NODE_DIR%\node.exe" "%SCRIPT%" %*
endlocal
```

Save it as a .cmd file. (Edit the paths inside if your node is in a non-standard location.)

Then, the registration command becomes much simpler and reliable:

`grok mcp add godot-mcp-elderglow --command "C:\full\path\to\your\clone\register-elderglow.cmd"`

(Adjust the path to wherever you saved the .cmd. Put the .cmd next to the clone or in a fixed location.)

This wrapper ensures correct node and handles args without PowerShell quoting nightmares.

**Alternative direct (if no spaces or after testing):**
Use the full node path in the command, escaped carefully, or edit ~/.grok/config.toml directly.

Get your clone path first:
```powershell
$CLONE_PATH = (Get-Location).Path
Write-Output "CLONE_PATH=$CLONE_PATH"
```

Report it.

---

## STEP 5: Register the full Elderglow server with Grok

**Use the wrapper .cmd you created earlier for reliability on Windows.**

Example (replace with your actual full path to the .cmd):

```powershell
grok mcp add godot-mcp-elderglow --command "C:\Users\YOURNAME\Projects\godot-mcp-elderglow-full\register-elderglow.cmd"
```

Report the exact command and the output of `grok mcp list` (or equivalent) afterward to confirm registration.

If CLI quoting still fails, edit the Grok config file directly (~/.grok/config.toml or similar) and add the server entry with the command.

**After registration**:

**Tell the user**:

"**CRITICAL**: Completely close this chat. Open a **brand new fresh Grok Build chat**. Enable/select the 'godot-mcp-elderglow' server for the new chat before proceeding. Do not continue testing in this old chat."

---

## STEP 6: Verify in a new chat that full Elderglow tools are available

Once the user has opened a fresh chat with the elderglow server enabled, the first message they (or you) should send is:

"Confirm you are connected to the FULL Elderglow private godot-mcp variant. List all available tools that contain 'leyline', 'creature', 'ecosystem', 'farm', or 'defense'. Also confirm 'create_simple_player' and 'inject_zero_footprint_bridge' are present. Tell me the total approximate number of tools."

You (Grok in that chat) should see the extra Elderglow tools because we are running the index-elderglow.js.

Report back the list.

---

## STEP 7: (Optional but recommended) Quick functional test with zero-footprint

**MANDATORY PREREQUISITE (the most common failure point):**
- The Godot 4 project must be open in the Godot editor.
- You **must** press the Play button (F5 or the Play icon) so the game is actually running. The bridge (in mcp_bridge.gd) only starts listening on 4243 once the game is playing.
- Watch the Godot "Output" panel (bottom) for a message like "[MCPBridge] Zero-footprint bridge active on 127.0.0.1:4243" or similar.

If the user has a Godot project open (Elderglow or clean test project):

1. Tell them the exact steps: open project, press Play.
2. Ask for the project path.
3. Use the inject tool: call inject_zero_footprint_bridge with the project_path.
4. Tell user to press Play (confirm the bridge log appears in Godot).
5. Re-inject if this is a new server spawn.
6. Then test tools: get_tree, create_simple_player (with good params like movement_type="platformer", appropriate actions), simulate_input_batch, etc.

Report success/failure and any error messages exactly.

**Note**: Some tools may still need the game scene to be in a state where the player etc. exist. Start simple. Use execute_live_script for quick setup if needed.

---

## Daily updates (for future)

When the developer pushes changes:

```powershell
cd godot-mcp-elderglow-full
git pull
cmd /c "npm install"
cmd /c "npm run build"
```

Then: kill any running node processes for this, re-start the server (via the wrapper or direct), re-inject in a fresh chat, and test.

---

## WINDOWS-SPECIFIC TROUBLESHOOTING (from real teammate runs)

**PATH / "node not recognized"**:
- After winget or installer: Fully restart the Grok Build / terminal session.
- In every new session before npm/node commands:
  ```powershell
  $env:Path = "C:\Program Files\nodejs;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
  ```
- Use `cmd /c "npm ..."` wrappers if direct npm.ps1 is blocked.

**Quoting / "unexpected argument" in grok mcp add**:
- Create and use the `register-elderglow.cmd` wrapper as shown in Step 4. This is the most reliable.
- Alternative: Edit the Grok config file directly instead of relying on the CLI parser.

**Port 4242 vs 4243 / "Cannot connect to runtime"**:
- This variant defaults to 4243.
- The zero-footprint injection only affects the specific Node process that handled the inject tool call.
- **Always**: Start/restart the elderglow server first, then inject, then test in the same or a fresh chat. Re-inject after rebuilds or new spawns.
- Persistent tools may still hit 4242 if not using zf.

**Runtime tools fail until "Play"**:
- This is by design. The Godot bridge only listens when the game is actually running.
- Open project in Godot editor → inject (via agent) → **press Play (F5)** → watch Godot Output for bridge active message on 4243.
- Only then will get_tree, create_simple_player, execute_live_script, simulate, screenshot, etc. work.

**PowerShell execution policy**:
- Use `cmd /c "..."` for npm and other commands.
- Or run Grok/Build with appropriate policy if allowed.

**Clone timeouts / large repo**:
- `git clone --depth 1 ...` then `git fetch --unshallow` later.

**Multiple node processes**:
- Before rebuilds/tests: `Get-Process node | Where-Object {$_.Path -like "*your-clone*"} | Stop-Process -Force`

If you hit any of the above, follow the exact sequence: fresh session → PATH refresh → wrapper registration → server start (confirm "FULL Elderglow variant" in logs) → inject → **Godot Play** → test tools in new chat.

Report the exact error + what step you were on.

---

## Troubleshooting commands (run these if issues)

- Check which server is running: `node build/index-elderglow.js` should say "FULL Elderglow variant"
- Rebuild: `npm run build`
- Clean node: `rm -rf node_modules package-lock.json ; npm install`

**END OF AUTOMATED STEPS**

After completing, summarize what was set up and give the user the exact registration command you used.

Start executing from Step 1 now. Do not stop until all steps are done or blocked.