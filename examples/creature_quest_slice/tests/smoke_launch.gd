extends SceneTree
## Headless smoke: combat module + main scene path + scene files exist.
## Full main-scene parse (with autoloads) is verified by:
##   godot --headless --path . --quit-after 60
## Run: godot --headless --path <project> --script res://tests/smoke_launch.gd

func _init() -> void:
	print("=== Creature Quest launch smoke ===")
	var err_count := 0

	if not FileAccess.file_exists("res://scenes/overworld.tscn"):
		print("ERROR: missing res://scenes/overworld.tscn")
		err_count += 1
	else:
		print("OK: overworld.tscn exists")

	if not FileAccess.file_exists("res://scenes/battle.tscn"):
		print("ERROR: missing res://scenes/battle.tscn")
		err_count += 1
	else:
		print("OK: battle.tscn exists")

	if not FileAccess.file_exists("res://scripts/game_state.gd"):
		print("ERROR: missing game_state.gd autoload script")
		err_count += 1
	else:
		print("OK: game_state.gd exists")

	# Drive pure combat once (same modules the battle UI uses)
	var p := CreatureDB.make_emberpup(5)
	var e := CreatureDB.make_leafcub(5)
	var b := BattleState.new(p, e)
	var s: Dictionary = b.resolve_turn(0, 0)
	if not s.has("enemy_hp"):
		print("ERROR: combat resolve_turn missing enemy_hp")
		err_count += 1
	else:
		print("OK: combat resolve_turn outcome=", s.get("outcome", "?"), " enemy_hp=", s.get("enemy_hp", -1))

	# Confirm project main scene setting
	var main_scene: String = str(ProjectSettings.get_setting("application/run/main_scene", ""))
	if main_scene != "res://scenes/overworld.tscn":
		print("ERROR: unexpected main_scene=", main_scene)
		err_count += 1
	else:
		print("OK: main_scene=", main_scene)

	var features = ProjectSettings.get_setting("application/config/features", PackedStringArray())
	print("OK: features=", features)

	if err_count == 0:
		print("=== LAUNCH SMOKE PASS ===")
		quit(0)
	else:
		print("=== LAUNCH SMOKE FAIL errors=", err_count, " ===")
		quit(1)
