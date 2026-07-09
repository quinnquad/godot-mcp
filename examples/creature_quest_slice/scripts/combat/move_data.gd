class_name MoveData
extends RefCounted
## A single battle move (name, type, power).

var id: String = ""
var name: String = ""
var type: int = BattleTypes.Type.NORMAL
var power: int = 40


func _init(
	p_id: String = "",
	p_name: String = "",
	p_type: int = BattleTypes.Type.NORMAL,
	p_power: int = 40
) -> void:
	id = p_id
	name = p_name
	type = p_type
	power = p_power


func duplicate_move() -> MoveData:
	return MoveData.new(id, name, type, power)
