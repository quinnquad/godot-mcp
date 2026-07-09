class_name Creature
extends RefCounted
## Combatant stats + current HP. Pure data — no scene dependency.

var id: String = ""
var name: String = ""
var type: int = BattleTypes.Type.NORMAL
var level: int = 5
var max_hp: int = 20
var hp: int = 20
var attack: int = 10
var defense: int = 10
var speed: int = 10
var moves: Array = []  # Array[MoveData]


func _init(
	p_id: String = "",
	p_name: String = "",
	p_type: int = BattleTypes.Type.NORMAL,
	p_level: int = 5,
	p_max_hp: int = 20,
	p_attack: int = 10,
	p_defense: int = 10,
	p_speed: int = 10,
	p_moves: Array = []
) -> void:
	id = p_id
	name = p_name
	type = p_type
	level = p_level
	max_hp = p_max_hp
	hp = p_max_hp
	attack = p_attack
	defense = p_defense
	speed = p_speed
	moves = []
	for m in p_moves:
		if m is MoveData:
			moves.append(m.duplicate_move())


func is_fainted() -> bool:
	return hp <= 0


func apply_damage(amount: int) -> int:
	var dealt: int = maxi(0, amount)
	hp = maxi(0, hp - dealt)
	return dealt


func heal_full() -> void:
	hp = max_hp


func duplicate_creature() -> Creature:
	var copy := Creature.new(id, name, type, level, max_hp, attack, defense, speed, moves)
	copy.hp = hp
	return copy
