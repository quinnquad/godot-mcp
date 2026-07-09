class_name BattleState
extends RefCounted
## 1v1 turn-based battle: speed order, damage, faint → win/lose.

enum Outcome {
	ONGOING = 0,
	PLAYER_WIN = 1,
	PLAYER_LOSE = 2,
}

var player: Creature
var enemy: Creature
var outcome: int = Outcome.ONGOING
var log_lines: Array = []  # Array[String]
var last_turn_summary: Dictionary = {}


func _init(p_player: Creature = null, p_enemy: Creature = null) -> void:
	if p_player != null:
		player = p_player.duplicate_creature()
	if p_enemy != null:
		enemy = p_enemy.duplicate_creature()
	outcome = Outcome.ONGOING
	log_lines = []
	last_turn_summary = {}


func is_over() -> bool:
	return outcome != Outcome.ONGOING


func outcome_name() -> String:
	match outcome:
		Outcome.PLAYER_WIN:
			return "win"
		Outcome.PLAYER_LOSE:
			return "lose"
		_:
			return "ongoing"


## Resolve one full turn: player picks move index, enemy picks move index (or auto 0).
## Turn order by Speed (higher first; player wins ties).
func resolve_turn(player_move_index: int, enemy_move_index: int = 0) -> Dictionary:
	if is_over():
		return _summary("battle_already_over")

	if player == null or enemy == null:
		return _summary("missing_participants")

	var p_move: MoveData = _pick_move(player, player_move_index)
	var e_move: MoveData = _pick_move(enemy, enemy_move_index)
	if p_move == null or e_move == null:
		return _summary("invalid_move")

	var player_first: bool = player.speed >= enemy.speed
	var actions: Array = []

	if player_first:
		actions.append(_execute_action(player, enemy, p_move, true))
		if not enemy.is_fainted():
			actions.append(_execute_action(enemy, player, e_move, false))
	else:
		actions.append(_execute_action(enemy, player, e_move, false))
		if not player.is_fainted():
			actions.append(_execute_action(player, enemy, p_move, true))

	_refresh_outcome()

	last_turn_summary = {
		"player_first": player_first,
		"actions": actions,
		"player_hp": player.hp,
		"enemy_hp": enemy.hp,
		"outcome": outcome_name(),
		"player_move": p_move.name,
		"enemy_move": e_move.name,
	}
	return last_turn_summary


func _pick_move(c: Creature, index: int) -> MoveData:
	if c.moves.is_empty():
		return null
	var i: int = clampi(index, 0, c.moves.size() - 1)
	return c.moves[i]


func _execute_action(
	attacker: Creature,
	defender: Creature,
	move: MoveData,
	is_player_attack: bool
) -> Dictionary:
	var result: Dictionary = DamageCalc.calculate(attacker, defender, move)
	var dealt: int = defender.apply_damage(int(result["damage"]))
	var line: String = "%s used %s! Dealt %d damage." % [attacker.name, move.name, dealt]
	if result["effectiveness"] == "super_effective":
		line += " It's super effective!"
	elif result["effectiveness"] == "not_very_effective":
		line += " It's not very effective..."
	if defender.is_fainted():
		line += " %s fainted!" % defender.name
	log_lines.append(line)
	return {
		"attacker": attacker.name,
		"defender": defender.name,
		"move": move.name,
		"damage": dealt,
		"type_mult": result["type_mult"],
		"effectiveness": result["effectiveness"],
		"is_player_attack": is_player_attack,
		"defender_hp": defender.hp,
		"defender_fainted": defender.is_fainted(),
	}


func _refresh_outcome() -> void:
	if enemy.is_fainted() and not player.is_fainted():
		outcome = Outcome.PLAYER_WIN
		log_lines.append("You win!")
	elif player.is_fainted():
		outcome = Outcome.PLAYER_LOSE
		log_lines.append("You lose...")
	else:
		outcome = Outcome.ONGOING


func _summary(reason: String) -> Dictionary:
	return {
		"error": reason,
		"outcome": outcome_name(),
		"player_hp": player.hp if player else 0,
		"enemy_hp": enemy.hp if enemy else 0,
	}
