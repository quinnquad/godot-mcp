# godot_operations.gd
# Robust direct bridge operations for Godot 4 (Phase 1)
# Receives JSON via GODOT_MCP_JSON env var (reliable, avoids all cmdline/--script arg passing quirks).

extends SceneTree

var operation_data: Dictionary = {}
var success: bool = false

func _init():
	var json_str = OS.get_environment("GODOT_MCP_JSON")
	if json_str == null:
		json_str = ""
	if json_str != "":
		var json = JSON.new()
		var parse_result = json.parse(json_str)
		if parse_result == OK and json.data is Dictionary:
			operation_data = json.data
		else:
			push_error("Failed to parse JSON blob: " + json_str)
	else:
		push_error("No JSON operation blob found (GODOT_MCP_JSON env not set)")

func _ready():
	print("=== GODOT BRIDGE START ===")
	print("Operation data received: ", operation_data)

	if operation_data.is_empty():
		print("ERROR: No valid operation data")
		call_deferred("quit", 1)
		return

	var op = operation_data.get("operation", "")
	match op:
		"create_scene":
			success = _create_scene(operation_data)
		_:
			print("ERROR: Unknown operation: ", op)
			success = false

	print("=== Return code: ", 0 if success else 1, " ===")
	call_deferred("quit", 0 if success else 1)

func _create_scene(params: Dictionary) -> bool:
	var scene_path: String = params.get("scene_path", "")
	var root_node_type: String = params.get("root_node_type", "Node2D")

	if scene_path == "":
		print("ERROR: Missing scene_path")
		return false

	print("Creating scene: ", scene_path, " with root: ", root_node_type)

	# Ensure directory exists
	var dir = DirAccess.open("res://")
	if dir == null:
		print("ERROR: Cannot open res://")
		return false

	var dir_path = scene_path.get_base_dir()
	if dir_path != "" and not dir.dir_exists(dir_path):
		var err = dir.make_dir_recursive(dir_path)
		if err != OK:
			print("ERROR: Failed to create directory ", dir_path, " (", err, ")")
			return false

	# Create root node
	var root = null
	if ClassDB.class_exists(root_node_type):
		root = ClassDB.instantiate(root_node_type)
	else:
		print("WARNING: Unknown root type '", root_node_type, "', falling back to Node2D")
		root = Node2D.new()

	if root == null:
		print("ERROR: Failed to create root node")
		return false

	# Create scene
	var packed_scene = PackedScene.new()
	var scene_err = packed_scene.pack(root)
	if scene_err != OK:
		print("ERROR: Failed to pack scene (", scene_err, ")")
		return false

	# Save scene
	var save_err = ResourceSaver.save(packed_scene, scene_path)
	if save_err != OK:
		print("ERROR: Failed to save scene to ", scene_path, " (", save_err, ")")
		return false

	print("Scene created and saved successfully to ", scene_path)

	# Verify by loading it back
	var loaded = load(scene_path)
	if loaded == null or not loaded is PackedScene:
		print("ERROR: Verification load failed for ", scene_path)
		return false

	print("Verification load successful")
	return true

func log_info(msg: String):
	print("[INFO] ", msg)

func log_error(msg: String):
	push_error(msg)
	print("[ERROR] ", msg)