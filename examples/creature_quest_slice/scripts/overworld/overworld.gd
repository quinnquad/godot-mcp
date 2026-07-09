extends Node2D
## Small top-down map with tall-grass encounter → battle.

@onready var _hint: Label = $UI/Hint
@onready var _status: Label = $UI/Status
@onready var _encounter: Area2D = $TallGrass


func _ready() -> void:
	if _encounter != null and _encounter.has_method("reset_trigger"):
		_encounter.reset_trigger()
	_update_status()


func _update_status() -> void:
	if _status == null:
		return
	var result: String = GameState.last_battle_result
	if result == "win":
		_status.text = "Last battle: WIN — walk into the green grass again anytime."
		_status.modulate = Color(0.4, 1.0, 0.5)
	elif result == "lose":
		_status.text = "Last battle: LOSE — heal up and try the grass again."
		_status.modulate = Color(1.0, 0.5, 0.4)
	else:
		_status.text = "Walk into the tall grass to start a wild encounter."
		_status.modulate = Color(1, 1, 1)
