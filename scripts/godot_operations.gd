# Godot MCP Operations Script (Phase 1 direct bridge for Elderglow)
# Adapted for bridge style: single JSON blob after -- containing {"operation": "...", ...}
# Core: create_scene using patterns from reference (instantiate, DirAccess, ResourceSaver)

extends SceneTree

var debug_mode = false

func _init():
    var args = OS.get_cmdline_args()
    debug_mode = "--debug-godot" in args

    log_info("Elderglow Godot MCP operations script starting (Phase 1)")

    log_debug("All args: " + str(args))

    # Locate the JSON blob passed after -- (our bridge style: one arg containing the full {"operation": , ...})
    var json_str = ""
    var dash_idx = args.find("--")
    if dash_idx != -1 and args.size() > dash_idx + 1:
        json_str = args[args.size() - 1]
    else:
        for i in range(args.size() - 1, -1, -1):
            var a = args[i].strip_edges()
            if a.begins_with("{") and a.ends_with("}"):
                json_str = a
                break

    if json_str.is_empty():
        log_error("No JSON operation blob found after -- or as last arg")
        log_error("Usage example: godot --headless --path <proj> --script res://scripts/godot_operations.gd -- '{\"operation\":\"create_scene\",\"scene_path\":\"res://scenes/test.tscn\",\"root_node_type\":\"Node2D\"}'")
        quit(1)

    log_debug("JSON blob: " + json_str)

    var json = JSON.new()
    var parse_err = json.parse(json_str)
    if parse_err != OK:
        log_error("JSON parse failed: " + json.get_error_message() + " at line " + str(json.get_error_line()))
        quit(1)

    var data = json.get_data()
    if typeof(data) != TYPE_DICTIONARY:
        log_error("Parsed JSON is not a Dictionary")
        quit(1)

    var operation = str(data.get("operation", ""))
    if operation.is_empty():
        log_error("Missing 'operation' key in JSON params")
        quit(1)

    log_info("Executing operation: " + operation)

    match operation:
        "create_scene":
            create_scene(data)
        _:
            log_error("Unknown operation: " + operation)
            quit(1)

    # If not quit inside op, success
    quit(0)

# Logging (structured for agents)
func log_debug(message: String):
    if debug_mode:
        print("[DEBUG] " + message)

func log_info(message: String):
    print("[INFO] " + message)

func log_error(message: String):
    printerr("[ERROR] " + message)

# Minimal instantiate: only built-in ClassDB classes (sufficient for Node2D, Node etc in Phase 1)
func instantiate_class(name_of_class: String):
    if name_of_class.is_empty():
        log_error("Cannot instantiate: class name empty")
        return null
    if ClassDB.class_exists(name_of_class):
        if ClassDB.can_instantiate(name_of_class):
            var result = ClassDB.instantiate(name_of_class)
            if result:
                log_debug("Instantiated: " + name_of_class)
                return result
            else:
                log_error("ClassDB.instantiate returned null for: " + name_of_class)
        else:
            log_error("Class exists but cannot instantiate (abstract?): " + name_of_class)
    else:
        log_error("Class not in ClassDB: " + name_of_class)
    return null

# create_scene: core Phase 1 op. Minimal reliable impl adapted from reference patterns.
func create_scene(params: Dictionary):
    var scene_path = str(params.get("scene_path", ""))
    if scene_path.is_empty():
        log_error("create_scene: 'scene_path' param is required")
        quit(1)

    if not scene_path.begins_with("res://"):
        scene_path = "res://" + scene_path

    var root_type = str(params.get("root_node_type", params.get("root_class", "Node2D")))

    log_info("Creating scene: " + scene_path + " root=" + root_type)

    var scene_root = instantiate_class(root_type)
    if not scene_root:
        log_error("Failed to create root node of type: " + root_type)
        quit(1)

    scene_root.name = "root"
    scene_root.owner = scene_root

    var packed_scene = PackedScene.new()
    var pack_result = packed_scene.pack(scene_root)
    if pack_result != OK:
        log_error("PackedScene.pack failed: " + str(pack_result))
        quit(1)

    # Ensure scene directory exists (DirAccess patterns)
    var scene_dir_res = scene_path.get_base_dir()
    var scene_dir_abs = ProjectSettings.globalize_path(scene_dir_res)
    if scene_dir_res != "res://":
        if not DirAccess.dir_exists_absolute(scene_dir_abs):
            var dir = DirAccess.open("res://")
            if dir != null:
                var rel_dir = scene_dir_res.substr(6)  # strip res://
                var mk_err = dir.make_dir_recursive(rel_dir)
                if mk_err != OK:
                    log_error("Dir make recursive (res://) failed for " + rel_dir + " code=" + str(mk_err))
                    quit(1)
            else:
                var mk_abs_err = DirAccess.make_dir_recursive_absolute(scene_dir_abs)
                if mk_abs_err != OK:
                    log_error("Dir make recursive (abs) failed code=" + str(mk_abs_err))
                    quit(1)
            log_debug("Created directory: " + scene_dir_abs)

    # Save via ResourceSaver (res:// path preferred)
    var save_err = ResourceSaver.save(packed_scene, scene_path)
    if save_err != OK:
        log_error("ResourceSaver.save failed for " + scene_path + " code=" + str(save_err))
        # Fallback to absolute
        var abs_scene = ProjectSettings.globalize_path(scene_path)
        save_err = ResourceSaver.save(packed_scene, abs_scene)
        if save_err != OK:
            log_error("Fallback save to absolute also failed: " + str(save_err))
            quit(1)
        log_debug("Saved via absolute fallback")

    # Verify on disk
    var abs_check = ProjectSettings.globalize_path(scene_path)
    if FileAccess.file_exists(scene_path) or FileAccess.file_exists(abs_check):
        log_info("Scene created and verified on disk: " + scene_path)
    else:
        log_error("Scene file missing after save!")
        quit(1)

    # Optional load test (light)
    var loaded = ResourceLoader.load(scene_path)
    if loaded:
        log_debug("Scene loads successfully via ResourceLoader")
    else:
        log_error("Warning: saved scene could not be loaded back (possible corruption)")

    log_info("create_scene completed successfully")
