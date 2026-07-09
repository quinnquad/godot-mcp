extends Area2D
## Stepping into tall grass starts a wild battle via GameState.

@export var encounter_seed: int = 1
@export var fixed_wild: String = "leafcub"  # leafcub | tidalkip | rockbit | random

var _triggered: bool = false


func _ready() -> void:
	body_entered.connect(_on_body_entered)


func _on_body_entered(body: Node) -> void:
	if _triggered:
		return
	if body == null or not body.is_in_group("player"):
		return
	_triggered = true
	var wild: Creature = _make_wild()
	GameState.start_wild_battle(wild)


func _make_wild() -> Creature:
	match fixed_wild:
		"leafcub":
			return CreatureDB.make_leafcub(5)
		"tidalkip":
			return CreatureDB.make_tidalkip(5)
		"rockbit":
			return CreatureDB.make_rockbit(5)
		_:
			return CreatureDB.make_wild_for_encounter(encounter_seed)


## Allow re-trigger after returning from battle (called by overworld).
func reset_trigger() -> void:
	_triggered = false
