# ELDERGLOW FULL godot-mcp SETUP - GROK BUILD: EXECUTE THESE COMMANDS NOW

**SYSTEM PROMPT FOR YOU (THE GROK READING THIS):**

You are in a Grok Build environment with full terminal (pwsh/bash) access and the ability to run commands, read files, and edit if needed.

The human wants the **FULL Elderglow private variant** of godot-mcp set up on this machine IMMEDIATELY so they can test with all Elderglow-specific tools (leyline, creatures, ecosystem, farm, defense, etc.) + the general tools and zero-footprint.

The public "godot-mcp" npm package is the stripped general-only version. This is the complete private one.

**DO THE FOLLOWING STEPS IN ORDER. After every command, print the exact output, then continue to the next step without stopping unless a command fails (in which case report the error and ask for help). Use the terminal tool for all commands.**

The private repo is: https://github.com/quinnquad/godot-mcp-elderglow.git

Use that exact URL.

Start now.

---

## STEP 1: Clone the private full Elderglow repo

Run these commands exactly:

```powershell
# On Windows (pwsh). If on Unix use equivalent.
git clone https://github.com/quinnquad/godot-mcp-elderglow.git godot-mcp-elderglow-full
cd godot-mcp-elderglow-full
```

Report the full output of the clone and cd.

If the clone fails (e.g. auth), tell the user and ask for a personal access token or SSH key setup.

---

## STEP 2: Install dependencies and build the full version

Run:

```powershell
npm install
npm run build
```

Then verify the full Elderglow entry point was built:

```powershell
ls build/index-elderglow.js
ls scripts/godot-mcp-elderglow.js
```

Report outputs.

---

## STEP 3: Test that the full Elderglow server starts (non-blocking test)

Run this to start it briefly (it will print status then hang as a server):

```powershell
timeout 5 npm run start:elderglow 2>&1 || true
```

Or on Unix: `timeout 5s npm run start:elderglow 2>&1 || true`

Look for the line:

"Godot MCP server initialized (stdio mode) - FULL Elderglow variant (private/internal)"

Report if you see the full variant message and the registration examples.

If it starts, that's good. We will kill it or let it timeout.

---

## STEP 4: Prepare for registration in Grok Build

We need to register this as a separate MCP server called "godot-mcp-elderglow" pointing at the full entry point.

First, get the absolute path to the cloned folder:

```powershell
$PWD = (Get-Location).Path
Write-Output "CLONE_PATH=$PWD"
```

Report the CLONE_PATH value.

Then construct the command for registration.

The server command should be:

`node <CLONE_PATH>\build\index-elderglow.js`

(Use the exact path from above, with backslashes or forward as appropriate.)

---

## STEP 5: Register the full Elderglow server with Grok

Run the registration command (Grok Build has a special way, but typically via terminal or config).

If you have a direct way in this environment, use:

Something like:

`grok mcp add godot-mcp-elderglow --command "node <absolute-path-to>\build\index-elderglow.js"`

Replace <absolute-path-to> with the CLONE_PATH from step 4.

Report exactly what you run and any output.

If registration requires editing a config file (like for Claude or specific Grok Build), read the relevant config and edit it using tools, then tell the user the change.

After registration, instruct the user:

"**IMPORTANT**: Close this chat and open a **completely brand new** Grok Build chat. Enable the new 'godot-mcp-elderglow' server in the new chat."

---

## STEP 6: Verify in a new chat that full Elderglow tools are available

Once the user has opened a fresh chat with the elderglow server enabled, the first message they (or you) should send is:

"Confirm you are connected to the FULL Elderglow private godot-mcp variant. List all available tools that contain 'leyline', 'creature', 'ecosystem', 'farm', or 'defense'. Also confirm 'create_simple_player' and 'inject_zero_footprint_bridge' are present. Tell me the total approximate number of tools."

You (Grok in that chat) should see the extra Elderglow tools because we are running the index-elderglow.js.

Report back the list.

---

## STEP 7: (Optional but recommended) Quick functional test with zero-footprint

If the user has a Godot project open (Elderglow or clean test):

Tell them to run Play in Godot if needed.

Then ask the user to provide the project path.

Then use the tools:

- Call inject_zero_footprint_bridge with the project_path.

- Then tell user to press Play in Godot.

- Then call get_tree or create_simple_player (with appropriate params for their project) to test.

Report success/failure.

---

## Daily updates (for future)

When the developer pushes changes:

```powershell
cd godot-mcp-elderglow-full
git pull
npm run build
```

Then restart the MCP server (re-register or just the process if running via the command).

---

## Troubleshooting commands (run these if issues)

- Check which server is running: `node build/index-elderglow.js` should say "FULL Elderglow variant"
- Rebuild: `npm run build`
- Clean node: `rm -rf node_modules package-lock.json ; npm install`

**END OF AUTOMATED STEPS**

After completing, summarize what was set up and give the user the exact registration command you used.

Start executing from Step 1 now. Do not stop until all steps are done or blocked.