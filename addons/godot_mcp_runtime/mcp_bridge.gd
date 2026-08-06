# mcp_bridge.gd
# Zero-footprint / on-demand MCP bridge (temporary, self-cleaning).
# 
# Goal: Provide a rich, near-complete general Godot runtime surface so that
# an AI assistant (Grok + MCP) can help a complete beginner build a full game
# without ever permanently installing a plugin into their project.
#
# This file is injected on-demand into a clean project (via inject_zero_footprint_bridge).
# It aims to support the same general commands as the persistent runtime_server.gd
# (inspection, scene manipulation, UI, animation, signals, physics, debugging, resources, etc.).
#
# Uses port 4243 (distinct from the persistent 4242). Self-cleaning on shutdown.
# Domain-specific tools (e.g. for particular games) are intentionally excluded for the general public surface.

extends Node

var tcp_server := TCPServer.new()
var peers: Array[StreamPeerTCP] = []
var peer_buffers := {}
const PORT := 4243  # distinct from persistent 4242
var _listen_enabled: bool = false

# JOS-15: non-blocking simulate queue — holds leave Input pressed while physics runs
var _sim_queue: Array = []
var _sim_wait: float = 0.0
var _sim_peer: StreamPeerTCP = null
var _sim_processed: int = 0
var _sim_busy: bool = false

func _ready() -> void:
	# JOS-52: headless tests must not fight a live game for the port
	if _is_headless_runtime():
		print("[MCPBridge] Headless run — TCP listen skipped (JOS-52)")
		return
	var err := tcp_server.listen(PORT, "127.0.0.1")
	if err != OK:
		push_error("[MCPBridge] Failed to listen on port %d" % PORT)
	else:
		_listen_enabled = true
		print("[MCPBridge] Zero-footprint bridge active on 127.0.0.1:%d (send {\"cmd\":\"shutdown\"} to detach + cleanup)" % PORT)


func _is_headless_runtime() -> bool:
	if OS.has_feature("headless"):
		return true
	if str(OS.get_environment("MCP_BRIDGE_SKIP")).strip_edges() in ["1", "true", "yes"]:
		return true
	# DisplayServer "headless" when no window (Godot --headless)
	if DisplayServer.get_name() == "headless":
		return true
	return false

func _process(_delta: float) -> void:
	if not _listen_enabled:
		return
	if tcp_server.is_connection_available():
		var peer := tcp_server.take_connection()
		peers.append(peer)
	
	for i in range(peers.size() - 1, -1, -1):
		var p: StreamPeerTCP = peers[i]
		if p.get_status() != StreamPeerTCP.STATUS_CONNECTED:
			if _sim_peer == p:
				_sim_busy = false
				_sim_peer = null
				_sim_queue.clear()
			peer_buffers.erase(p)
			peers.remove_at(i)
			continue
		var bytes := p.get_available_bytes()
		if bytes > 0:
			var data := p.get_string(bytes)
			if not peer_buffers.has(p):
				peer_buffers[p] = ""
			peer_buffers[p] += data
			var buf: String = peer_buffers[p]
			var lines := buf.split("\n", true)
			peer_buffers[p] = lines[lines.size()-1]
			for j in range(lines.size()-1):
				var line := lines[j].strip_edges()
				if line == "":
					continue
				var json := JSON.new()
				var parse_result := json.parse(line)
				if parse_result == OK and json.data is Dictionary:
					var cmd := json.data
					var c := str(cmd.get("cmd", ""))
					if c == "shutdown":
						p.put_string(JSON.stringify({"status": "ok", "message": "shutting down bridge"}) + "\n")
						get_tree().quit()
						return
					elif c == "simulate_input_batch":
						_begin_simulate(cmd, p)
					else:
						var resp := _handle_cmd(cmd)
						p.put_string(JSON.stringify(resp) + "\n")
				else:
					p.put_string(JSON.stringify({"status": "error", "message": "invalid json"}) + "\n")

func _physics_process(delta: float) -> void:
	if not _sim_busy:
		return
	if _sim_wait > 0.0:
		_sim_wait = maxf(0.0, _sim_wait - delta)
		if _sim_wait > 0.0:
			return
	_drain_sim_queue()

func _begin_simulate(cmd: Dictionary, peer: StreamPeerTCP) -> void:
	if _sim_busy:
		peer.put_string(JSON.stringify({
			"status": "error",
			"message": "simulate_input_batch already running — wait for the previous hold to finish"
		}) + "\n")
		return
	var steps = cmd.get("steps", [])
	if typeof(steps) != TYPE_ARRAY:
		peer.put_string(JSON.stringify({"status": "error", "message": "steps must be an array"}) + "\n")
		return
	_sim_queue = _expand_hold_steps(steps)
	_sim_peer = peer
	_sim_processed = 0
	_sim_wait = 0.0
	_sim_busy = true
	_drain_sim_queue()

func _expand_hold_steps(steps: Array) -> Array:
	var out: Array = []
	for s in steps:
		if typeof(s) != TYPE_DICTIONARY:
			continue
		var typ := str(s.get("type", ""))
		var hold := float(s.get("hold_ms", 0))
		if typ == "action" and hold > 0.0 and str(s.get("action", "")) != "":
			var act := str(s.get("action", ""))
			out.append({"type": "action", "action": act, "press": true})
			out.append({"type": "delay", "ms": hold})
			out.append({"type": "action", "action": act, "press": false})
		else:
			out.append(s)
	return out

func _drain_sim_queue() -> void:
	while _sim_queue.size() > 0:
		var s: Dictionary = _sim_queue.pop_front()
		var typ := str(s.get("type", ""))
		if typ == "action":
			var act := str(s.get("action", ""))
			var press := bool(s.get("press", true))
			if act != "":
				if press:
					Input.action_press(act)
				else:
					Input.action_release(act)
			_sim_processed += 1
		elif typ == "delay" or typ == "wait":
			var ms := float(s.get("ms", 0))
			_sim_processed += 1
			if ms > 0.0:
				_sim_wait = ms / 1000.0
				return
		elif typ == "mouse_move":
			var ppos = s.get("pos", [0, 0])
			if typeof(ppos) == TYPE_ARRAY and ppos.size() >= 2:
				Input.warp_mouse(Vector2(float(ppos[0]), float(ppos[1])))
			_sim_processed += 1
		else:
			_sim_processed += 1
	# Finished — reply without having blocked the main thread
	if _sim_peer != null and _sim_peer.get_status() == StreamPeerTCP.STATUS_CONNECTED:
		_sim_peer.put_string(JSON.stringify({
			"status": "ok",
			"processed": _sim_processed,
			"mode": "non_blocking_hold",
			"note": "delays/hold_ms advance over physics frames so Input stays held while CharacterBody2D moves"
		}) + "\n")
	_sim_busy = false
	_sim_peer = null
	_sim_queue.clear()
	_sim_wait = 0.0


# --- Zero-footprint command handling (hardened in this local slice) ---
# Supports the runtime superpowers + get_tree for clean project testing loops.
# Helpers adapted from runtime_server.gd (persistent) for consistent marshaling.

func _handle_cmd(cmd: Dictionary) -> Dictionary:
	var c := str(cmd.get("cmd", ""))
	match c:
		"get_tree":
			var root_path := str(cmd.get("root", "/root"))
			var root := get_tree().get_root().get_node_or_null(root_path)
			if root:
				var dump_opts := {
					"max_depth": cmd.get("max_depth", 4),
					"max_nodes": cmd.get("max_nodes", 150),
					"include_anonymous": cmd.get("include_anonymous", false),
				}
				if cmd.has("skip_anonymous"):
					dump_opts["skip_anonymous"] = cmd.get("skip_anonymous")
				return _dump_tree_response(root, dump_opts)
			return {"status": "error", "message": "root not found"}
		"set_property":
			var node_path := str(cmd.get("node_path", ""))
			var prop := str(cmd.get("property", ""))
			var value = cmd.get("value")
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node and prop != "":
				node.set(prop, _variant_from_json(value))
				return {"status": "ok"}
			return {"status": "error", "message": "node or property not found"}
		"call_method":
			var node_path := str(cmd.get("node_path", ""))
			var method := str(cmd.get("method", ""))
			var args := cmd.get("args", [])
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node and node.has_method(method):
				var result = node.callv(method, args)
				return {"status": "ok", "result": _json_from_variant(result)}
			return {"status": "error", "message": "node or method not found"}
		"instantiate_scene":
			var scene_path := str(cmd.get("scene_path", ""))
			var parent_path := str(cmd.get("parent_path", ""))
			var inst_name := str(cmd.get("name", ""))
			var parent := get_tree().get_root().get_node_or_null(parent_path)
			if parent == null or scene_path == "":
				return {"status": "error", "message": "parent or scene_path invalid"}
			var packed = load(scene_path)
			if packed == null or not packed is PackedScene:
				return {"status": "error", "message": "failed to load PackedScene"}
			var instance = packed.instantiate()
			if inst_name != "":
				instance.name = inst_name
			# Defer tree mutation to avoid blocking the TCP/_process response loop
			parent.call_deferred("add_child", instance)
			return {"status": "ok", "path": instance.get_path(), "note": "add scheduled via call_deferred"}
		"capture_screenshot":
			var img = get_viewport().get_texture().get_image()
			if img == null:
				return {"status": "error", "message": "viewport capture failed"}
			var path := "user://mcp_screenshot.png"
			img.save_png(path)
			return {"status": "ok", "path": path, "width": img.get_width(), "height": img.get_height()}
		# simulate_input_batch is handled async in _process/_physics_process (JOS-15)

		# === Input Map (for creating controllable characters) ===
		"list_input_actions":
			var actions := []
			for action in InputMap.get_actions():
				var events := []
				for ev in InputMap.action_get_events(action):
					if ev is InputEventKey:
						events.append({"type": "key", "keycode": OS.get_keycode_string(ev.keycode)})
					elif ev is InputEventMouseButton:
						events.append({"type": "mouse", "button": ev.button_index})
					else:
						events.append({"type": "other"})
				actions.append({"name": action, "events": events})
			return {"status": "ok", "actions": actions}

		"add_input_action":
			var action_name := str(cmd.get("name", ""))
			if action_name == "":
				return {"status": "error", "message": "name required"}
			if InputMap.has_action(action_name):
				return {"status": "ok", "message": "action already exists"}
			var deadzone := float(cmd.get("deadzone", 0.2))
			InputMap.add_action(action_name, deadzone)
			var events := cmd.get("events", [])
			for ev_data in events:
				var ev
				if typeof(ev_data) == TYPE_STRING:
					# Simple string like "KEY_A" or "KEY_SPACE"
					ev = InputEventKey.new()
					ev.keycode = OS.find_keycode_from_string(ev_data)
				elif ev_data is Dictionary:
					if ev_data.get("type") == "key":
						ev = InputEventKey.new()
						ev.keycode = OS.find_keycode_from_string(str(ev_data.get("keycode", "KEY_A")))
					elif ev_data.get("type") == "mouse":
						ev = InputEventMouseButton.new()
						ev.button_index = int(ev_data.get("button", 1))
				if ev:
					InputMap.action_add_event(action_name, ev)
			return {"status": "ok", "message": "action added"}

		"remove_input_action":
			var action_name := str(cmd.get("name", ""))
			if action_name == "":
				return {"status": "error", "message": "name required"}
			if not InputMap.has_action(action_name):
				return {"status": "ok", "message": "action did not exist"}
			InputMap.erase_action(action_name)
			return {"status": "ok", "message": "action removed"}

		"has_input_action":
			var action_name := str(cmd.get("name", ""))
			if action_name == "":
				return {"status": "error", "message": "name required"}
			return {"status": "ok", "exists": InputMap.has_action(action_name)}

		"create_simple_player":
			var parent_path := str(cmd.get("parent_path", "/root"))
			var player_name := str(cmd.get("name", "Player"))
			var movement_type := str(cmd.get("movement_type", "platformer"))  # "platformer" or "topdown"
			var speed := float(cmd.get("speed", 300.0))
			var jump_velocity := float(cmd.get("jump_velocity", -420.0))
			var left_action := str(cmd.get("left_action", "ui_left"))
			var right_action := str(cmd.get("right_action", "ui_right"))
			var jump_action := str(cmd.get("jump_action", "ui_accept"))
			var texture_path := str(cmd.get("texture_path", ""))  # optional Sprite2D texture

			var parent := get_tree().get_root().get_node_or_null(parent_path)
			if parent == null:
				return {"status": "error", "message": "parent not found"}

			# Create the player body
			var player = CharacterBody2D.new()
			player.name = player_name

			# Collision shape
			var collision = CollisionShape2D.new()
			var shape = RectangleShape2D.new()
			shape.size = Vector2(28, 52)
			collision.shape = shape
			collision.position = Vector2(0, 6)  # slight offset so feet are at origin
			player.add_child(collision)

			# Visual
			if texture_path != "" and ResourceLoader.exists(texture_path):
				var sprite = Sprite2D.new()
				sprite.name = "Sprite"
				sprite.texture = load(texture_path)
				player.add_child(sprite)
			else:
				# Fallback placeholder
				var visual = ColorRect.new()
				visual.name = "Visual"
				visual.color = Color(0.3, 0.7, 0.95)
				visual.size = Vector2(28, 52)
				visual.position = Vector2(-14, -26)
				player.add_child(visual)

			# Generate a much better movement script
			var script = GDScript.new()
			var script_code := ""

			if movement_type == "topdown":
				script_code = """
extends CharacterBody2D

@export var speed: float = %.1f
@export var acceleration: float = 1200.0
@export var friction: float = 900.0

func _physics_process(delta: float) -> void:
	var input_dir := Input.get_vector("%s", "%s", "ui_up", "ui_down")
	var target_velocity := input_dir * speed

	# Smooth acceleration / friction
	if input_dir != Vector2.ZERO:
		velocity = velocity.move_toward(target_velocity, acceleration * delta)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, friction * delta)

	move_and_slide()
""" % [speed, left_action, right_action]

			else:
				# Platformer with coyote time + jump cut
				script_code = """
extends CharacterBody2D

@export var speed: float = %.1f
@export var jump_velocity: float = %.1f
@export var coyote_time: float = 0.12
@export var jump_cut_multiplier: float = 0.5   # how much velocity is kept when releasing jump early

var gravity: float = ProjectSettings.get_setting("physics/2d/default_gravity")
var coyote_timer: float = 0.0
var was_on_floor: bool = false

func _physics_process(delta: float) -> void:
	# Apply gravity
	if not is_on_floor():
		velocity.y += gravity * delta
		coyote_timer = max(coyote_timer - delta, 0.0)
	else:
		coyote_timer = coyote_time

	# Jump (with coyote time)
	if Input.is_action_just_pressed("%s") and (is_on_floor() or coyote_timer > 0.0):
		velocity.y = jump_velocity
		coyote_timer = 0.0

	# Variable jump height (jump cut)
	if Input.is_action_just_released("%s") and velocity.y < 0.0:
		velocity.y *= jump_cut_multiplier

	# Horizontal movement
	var direction := Input.get_axis("%s", "%s")
	if direction:
		velocity.x = direction * speed
	else:
		velocity.x = move_toward(velocity.x, 0.0, speed * 8.0 * delta)  # quick stop

	move_and_slide()

	# Track floor state for coyote time
	was_on_floor = is_on_floor()
""" % [speed, jump_velocity, jump_action, jump_action, left_action, right_action]

			script.source_code = script_code
			var err := script.reload()
			if err != OK:
				return {"status": "error", "message": "failed to create player script: " + str(err)}

			player.set_script(script)

			# Add the player to the scene
			parent.add_child(player)

			var note := "Simple %s player created at %s." % [movement_type, player.get_path()]
			if texture_path == "":
				note += " Using ColorRect placeholder. Pass texture_path to use a real sprite."

			return {"status": "ok", "path": player.get_path(), "message": note}

		"execute_live_script":
			var code := str(cmd.get("code", ""))
			if code.strip_edges() == "":
				return {"status": "error", "message": "code required"}
			var script = GDScript.new()
			# wrap arbitrary statements for full exec (rapid prototyping/debug)
			script.source_code = "extends Node\nfunc _exec():\n\t" + code.replace("\n", "\n\t") + "\n"
			var err := script.reload()
			if err != OK:
				return {"status": "error", "message": "compile error: " + str(err)}
			var instance = script.new()
			# Use call_deferred for both attachment and execution.
			# This prevents blocking _process / the TCP response loop, which was causing
			# timeouts on node creation and other non-trivial live scripts.
			get_tree().get_root().call_deferred("add_child", instance)
			instance.call_deferred("_exec")
			# We can't easily capture the return value when deferred.
			# For creation/debug scripts the caller usually inspects the scene afterward
			# via get_tree / get_node / list_children anyway.
			return {"status": "ok", "result": "script_scheduled", "note": "Live script scheduled via call_deferred. Inspect results with get_tree/get_node/list_children or watch Godot Output."}

		# === High-value general commands for building complete games ===
		"get_property":
			var node_path := str(cmd.get("node_path", ""))
			var prop := str(cmd.get("property", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node and prop != "":
				return {"status": "ok", "value": _json_from_variant(node.get(prop))}
			return {"status": "error", "message": "node or property not found"}

		"list_children":
			var node_path := str(cmd.get("node_path", ""))
			if node_path == "":
				return {
					"status": "error",
					"message": "node_path required. Prefer list_children (shallow) over get_tree on large scenes. Game must be in Play with bridge listening."
				}
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node == null:
				return {
					"status": "error",
					"message": "node not found: %s — check the path, and ensure the game is in Play with the MCP bridge listening (4243 zero-footprint or 4242 persistent)" % node_path
				}
			var max_depth := int(cmd.get("max_depth", 1))
			if max_depth < 1:
				max_depth = 1
			var limit := int(cmd.get("limit", 200))
			if limit < 1:
				limit = 1
			var children: Array = []
			_collect_children_list(node, children, 1, max_depth, limit)
			return {
				"status": "ok",
				"children": children,
				"count": children.size(),
				"truncated": children.size() >= limit,
				"max_depth": max_depth,
				"note": "Shallow by default (max_depth=1). Prefer this over get_tree on large scenes."
			}

		"find_node_by_name":
			var root_path := str(cmd.get("root_path", "/root"))
			var target_name := str(cmd.get("name", ""))
			var root := get_tree().get_root().get_node_or_null(root_path)
			if root and target_name != "":
				var found := _find_node_by_name_recursive(root, target_name)
				if found:
					return {"status": "ok", "path": found.get_path(), "type": found.get_class()}
			return {"status": "error", "message": "not found"}

		"get_node":
			var node_path := str(cmd.get("node_path", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node:
				return {"status": "ok", "data": {"name": node.name, "path": node.get_path(), "type": node.get_class(), "script": node.get_script() != null}}
			return {"status": "error", "message": "node not found"}

		"get_all_properties":
			var node_path := str(cmd.get("node_path", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node:
				var props = {}
				for p in node.get_property_list():
					var n = p.name
					props[n] = _json_from_variant(node.get(n))
				return {"status": "ok", "properties": props}
			return {"status": "error", "message": "node not found"}

		"add_child":
			var parent_path := str(cmd.get("parent_path", ""))
			var child_path := str(cmd.get("child_path", ""))
			var parent := get_tree().get_root().get_node_or_null(parent_path)
			var child := get_tree().get_root().get_node_or_null(child_path)
			if parent and child:
				if child.get_parent():
					child.get_parent().remove_child(child)
				# Defer to keep the TCP response loop responsive
				parent.call_deferred("add_child", child)
				return {"status": "ok"}
			return {"status": "error", "message": "parent or child not found"}

		"remove_node":
			var node_path := str(cmd.get("node_path", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node:
				if node.get_parent():
					node.get_parent().remove_child(node)
				# Defer the actual free
				node.call_deferred("queue_free")
				return {"status": "ok"}
			return {"status": "error", "message": "node not found"}

		"reparent_node":
			var node_path := str(cmd.get("node_path", ""))
			var new_parent_path := str(cmd.get("new_parent_path", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			var new_parent := get_tree().get_root().get_node_or_null(new_parent_path)
			if node and new_parent:
				if node.get_parent(): node.get_parent().remove_child(node)
				# Defer the add to keep the bridge responsive
				new_parent.call_deferred("add_child", node)
				return {"status": "ok"}
			return {"status": "error", "message": "node or parent not found"}

		"duplicate_node":
			var node_path := str(cmd.get("node_path", ""))
			var new_name := str(cmd.get("new_name", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node:
				var dup = node.duplicate()
				if new_name: dup.name = new_name
				if node.get_parent():
					# Defer the add
					node.get_parent().call_deferred("add_child", dup)
				return {"status": "ok", "path": dup.get_path()}
			return {"status": "error", "message": "node not found"}

		# === UI & Animation (very high value for game development) ===
		"get_ui_tree":
			var root_path := str(cmd.get("root_path", "/root"))
			var root := get_tree().get_root().get_node_or_null(root_path)
			if root:
				return {"status": "ok", "data": _dump_tree(root)}
			return {"status": "error", "message": "root not found"}

		"set_control_text":
			var node_path := str(cmd.get("node_path", ""))
			var text := str(cmd.get("text", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node:
				if node.has_method("set_text"):
					node.set_text(text)
				else:
					node.text = text
				return {"status": "ok"}
			return {"status": "error", "message": "node not found"}

		"play_animation":
			var player_path := str(cmd.get("player_path", ""))
			var anim_name := str(cmd.get("anim_name", ""))
			var player := get_tree().get_root().get_node_or_null(player_path)
			if player and player is AnimationPlayer:
				player.play(anim_name)
				return {"status": "ok"}
			return {"status": "error", "message": "AnimationPlayer not found"}

		"get_animation_list":
			var player_path := str(cmd.get("player_path", ""))
			var player := get_tree().get_root().get_node_or_null(player_path)
			if player and player is AnimationPlayer:
				return {"status": "ok", "animations": player.get_animation_list()}
			return {"status": "error", "message": "AnimationPlayer not found"}

		# === Signals ===
		"connect_signal":
			var emitter_path := str(cmd.get("emitter_path", ""))
			var signal_name := str(cmd.get("signal", ""))
			var target_path := str(cmd.get("target_path", ""))
			var method := str(cmd.get("method", ""))
			var emitter := get_tree().get_root().get_node_or_null(emitter_path)
			var target := get_tree().get_root().get_node_or_null(target_path)
			if emitter and target:
				emitter.connect(signal_name, Callable(target, method))
				return {"status": "ok"}
			return {"status": "error", "message": "emitter or target not found"}

		"emit_signal":
			var node_path := str(cmd.get("node_path", ""))
			var signal_name := str(cmd.get("signal", ""))
			var args := cmd.get("args", [])
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node:
				node.emit_signalv(signal_name, args)
				return {"status": "ok"}
			return {"status": "error", "message": "node not found"}

		"get_signals":
			var node_path := str(cmd.get("node_path", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node:
				var sigs = []
				if node.get_script():
					for s in node.get_script().get_script_signal_list():
						sigs.append(s.name)
				return {"status": "ok", "signals": sigs}
			return {"status": "error", "message": "node not found"}

		"get_node_signals":
			var node_path := str(cmd.get("node_path", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node:
				return {"status": "ok", "signals": node.get_signal_list()}
			return {"status": "error", "message": "node not found"}

		"ui_set_text":
			var node_path := str(cmd.get("node_path", ""))
			var text := str(cmd.get("text", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node:
				if node.has_method("set_text"):
					node.set_text(text)
				else:
					node.text = text
				return {"status": "ok"}
			return {"status": "error", "message": "node not found"}

		# === Physics & Control ===
		"raycast_2d":
			var from := cmd.get("from", [0,0])
			var to := cmd.get("to", [0,0])
			var mask := cmd.get("collision_mask", 1)
			var space = get_viewport().get_world_2d().get_direct_space_state()
			var query = PhysicsRayQueryParameters2D.create(Vector2(from[0], from[1]), Vector2(to[0], to[1]), mask)
			var hit = space.intersect_ray(query)
			return {"status": "ok", "hit": hit.has("position"), "result": hit}

		"pause_game":
			var action := str(cmd.get("action", "toggle"))
			if action == "pause" or action == "toggle":
				get_tree().paused = true
			elif action == "unpause":
				get_tree().paused = false
			return {"status": "ok", "paused": get_tree().paused}

		"debug_print":
			var msg := str(cmd.get("message", ""))
			var lvl := str(cmd.get("level", "info"))
			if lvl == "error":
				push_error(msg)
			else:
				print(msg)
			return {"status": "ok"}

		# === Resources & Scenes ===
		"load_resource":
			var res_path := str(cmd.get("resource_path", ""))
			if res_path == "":
				return {"status": "error", "message": "resource_path required"}
			var res = load(res_path)
			if res:
				return {"status": "ok", "loaded": true, "type": res.get_class()}
			return {"status": "error", "message": "failed to load"}

		"load_scene":
			var scene_path := str(cmd.get("scene_path", ""))
			if scene_path == "":
				return {"status": "error", "message": "scene_path required"}
			var s = load(scene_path)
			if s == null:
				return {"status": "error", "message": "failed to load scene at: " + scene_path}
			return {"status": "ok", "loaded": true, "type": s.get_class(), "path": scene_path}

		"save_scene":
			var node_path := str(cmd.get("node_path", ""))
			var scene_path := str(cmd.get("scene_path", ""))
			var node := get_tree().get_root().get_node_or_null(node_path)
			if node == null:
				return {"status": "error", "message": "node not found: " + node_path}
			if scene_path == "":
				return {"status": "error", "message": "scene_path required"}
			var packed = PackedScene.new()
			var err = packed.pack(node)
			if err != OK:
				return {"status": "error", "message": "failed to pack scene"}
			err = ResourceSaver.save(packed, scene_path)
			if err != OK:
				return {"status": "error", "message": "failed to save scene to: " + scene_path}
			return {"status": "ok", "saved": scene_path}

		"get_autoloads":
			# Note: In a runtime context we have limited visibility into the full autoload list.
			# We return what we can + the injected bridge itself.
			var known = ["MCPBridge (this zero-footprint bridge)"]
			return {"status": "ok", "autoloads": known, "note": "Limited visibility in runtime. Use get_tree on /root for more context."}

		_:
			return {"status": "error", "message": "unknown cmd: " + c + " (zero-footprint bridge)"}


func _collect_children_list(node: Node, out: Array, depth: int, max_depth: int, limit: int) -> void:
	if out.size() >= limit or depth > max_depth:
		return
	for child in node.get_children():
		if out.size() >= limit:
			return
		out.append({
			"name": child.name,
			"path": str(child.get_path()),
			"type": child.get_class(),
			"depth": depth
		})
		if depth < max_depth:
			_collect_children_list(child, out, depth + 1, max_depth, limit)


# JOS-18: bounded tree dump (defaults match dump-tree-util.ts)
func _is_anonymous_node_name(n: String) -> bool:
	var re := RegEx.new()
	re.compile("^@.+@\\d+$")
	return re.search(n) != null


func _dump_tree_state_init(opts: Dictionary) -> Dictionary:
	var skip_anon := true
	if bool(opts.get("include_anonymous", false)):
		skip_anon = false
	if opts.has("skip_anonymous"):
		skip_anon = bool(opts.get("skip_anonymous"))
	return {
		"count": 0,
		"truncated": false,
		"max_depth": maxi(0, int(opts.get("max_depth", 4))),
		"max_nodes": maxi(1, int(opts.get("max_nodes", 150))),
		"skip_anonymous": skip_anon,
	}


func _dump_tree_walk(node: Node, depth: int, state: Dictionary) -> Dictionary:
	state["count"] = int(state["count"]) + 1
	var d := {
		"name": str(node.name),
		"path": str(node.get_path()),
		"type": node.get_class(),
		"children": []
	}
	var max_depth: int = int(state["max_depth"])
	var max_nodes: int = int(state["max_nodes"])
	if depth >= max_depth:
		if node.get_child_count() > 0:
			state["truncated"] = true
		return d
	for child in node.get_children():
		if int(state["count"]) >= max_nodes:
			state["truncated"] = true
			break
		var cname := str(child.name)
		if bool(state["skip_anonymous"]) and _is_anonymous_node_name(cname):
			continue
		d.children.append(_dump_tree_walk(child, depth + 1, state))
	return d


func _dump_tree(node: Node, opts: Dictionary = {}) -> Dictionary:
	## Returns tree dict only (for get_ui_tree). Always applies finite defaults.
	var state := _dump_tree_state_init(opts)
	return _dump_tree_walk(node, 0, state)


func _dump_tree_response(node: Node, opts: Dictionary = {}) -> Dictionary:
	var state := _dump_tree_state_init(opts)
	var data := _dump_tree_walk(node, 0, state)
	return {
		"status": "ok",
		"data": data,
		"truncated": bool(state["truncated"]),
		"max_depth": int(state["max_depth"]),
		"max_nodes": int(state["max_nodes"]),
		"node_count": int(state["count"]),
		"skip_anonymous": bool(state["skip_anonymous"]),
	}


func _find_node_by_name_recursive(node: Node, target: String) -> Node:
	if node.name == target:
		return node
	for child in node.get_children():
		var found := _find_node_by_name_recursive(child, target)
		if found:
			return found
	return null


# Basic Variant marshaling for complex types (Vector2/position, Color, Dict/Array, Resource path)
func _variant_from_json(v):
	if v is Array and v.size() == 2:
		return Vector2(v[0], v[1])
	if v is Array and v.size() == 4:
		return Color(v[0], v[1], v[2], v[3])
	if v is Dictionary:
		var d = {}
		for k in v: d[k] = _variant_from_json(v[k])
		return d
	if v is Array:
		var a = []
		for item in v: a.append(_variant_from_json(item))
		return a
	if typeof(v) == TYPE_STRING and str(v).begins_with("res://"):
		var loaded = load(v)
		return loaded if loaded else v
	return v


func _json_from_variant(v):
	if v is Vector2:
		return [v.x, v.y]
	if v is Color:
		return [v.r, v.g, v.b, v.a]
	if v is Dictionary or v is Array:
		if v is Dictionary:
			var d = {}
			for k in v: d[k] = _json_from_variant(v[k])
			return d
		var a = []
		for item in v: a.append(_json_from_variant(item))
		return a
	if typeof(v) == TYPE_OBJECT and v is Resource:
		var info = {"type": v.get_class()}
		if v.resource_path: info["path"] = v.resource_path
		if v.has_method("get_path") and v.get_path() != v.resource_path: info["sub_path"] = v.get_path()
		return info
	return v
