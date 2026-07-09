extends Node
## Autoload: shared state for overworld → battle → overworld flow.

signal battle_started
signal battle_ended(result: String)

var player_creature: Creature = null
var wild_creature: Creature = null
var last_battle_result: String = ""
var pending_battle: bool = false


func _ready() -> void:
	ensure_player_creature()


func ensure_player_creature() -> void:
	if player_creature == null:
		player_creature = CreatureDB.make_emberpup(5)


func start_wild_battle(wild: Creature = null) -> void:
	ensure_player_creature()
	# Fresh HP for demo slice each fight
	player_creature.heal_full()
	if wild != null:
		wild_creature = wild.duplicate_creature()
	else:
		wild_creature = CreatureDB.make_wild_for_encounter()
	pending_battle = true
	battle_started.emit()
	get_tree().change_scene_to_file("res://scenes/battle.tscn")


func end_battle(result: String) -> void:
	last_battle_result = result
	pending_battle = false
	wild_creature = null
	if player_creature != null and result == "win":
		player_creature.heal_full()
	elif player_creature != null and result == "lose":
		player_creature.heal_full()
	battle_ended.emit(result)
	get_tree().change_scene_to_file("res://scenes/overworld.tscn")


func get_battle_participants() -> Dictionary:
	ensure_player_creature()
	return {
		"player": player_creature,
		"enemy": wild_creature if wild_creature != null else CreatureDB.make_leafcub(5),
	}
