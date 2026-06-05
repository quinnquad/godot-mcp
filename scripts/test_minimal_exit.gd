extends SceneTree

func _init():
    print("=== MINIMAL TEST SCRIPT LOADED ===")
    print("Operation would be: ", OS.get_environment("GODOT_MCP_JSON"))
    print("Calling quit now...")
    call_deferred("quit", 0)
