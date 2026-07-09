extends Control
## Turn-based battle UI: move buttons, HP bars, win/lose.

var _battle: BattleState = null
var _busy: bool = false

@onready var _player_name: Label = $Panel/VBox/Fighters/PlayerBox/PlayerName
@onready var _player_hp: Label = $Panel/VBox/Fighters/PlayerBox/PlayerHP
@onready var _player_bar: ProgressBar = $Panel/VBox/Fighters/PlayerBox/PlayerBar
@onready var _enemy_name: Label = $Panel/VBox/Fighters/EnemyBox/EnemyName
@onready var _enemy_hp: Label = $Panel/VBox/Fighters/EnemyBox/EnemyHP
@onready var _enemy_bar: ProgressBar = $Panel/VBox/Fighters/EnemyBox/EnemyBar
@onready var _log: Label = $Panel/VBox/Log
@onready var _moves: HBoxContainer = $Panel/VBox/Moves
@onready var _result: Label = $Panel/VBox/Result
@onready var _return_btn: Button = $Panel/VBox/ReturnButton
@onready var _player_visual: ColorRect = $Arena/PlayerSprite
@onready var _enemy_visual: ColorRect = $Arena/EnemySprite


func _ready() -> void:
	var parts: Dictionary = GameState.get_battle_participants()
	var p: Creature = parts["player"]
	var e: Creature = parts["enemy"]
	_battle = BattleState.new(p, e)
	_return_btn.visible = false
	_return_btn.pressed.connect(_on_return)
	_result.text = ""
	_build_move_buttons()
	_refresh_ui("A wild %s appeared!" % _battle.enemy.name)
	_tint_sprites()


func _tint_sprites() -> void:
	if _player_visual:
		_player_visual.color = _color_for_type(_battle.player.type)
	if _enemy_visual:
		_enemy_visual.color = _color_for_type(_battle.enemy.type)


func _color_for_type(t: int) -> Color:
	match t:
		BattleTypes.Type.FIRE:
			return Color(0.95, 0.35, 0.2)
		BattleTypes.Type.WATER:
			return Color(0.25, 0.55, 0.95)
		BattleTypes.Type.GRASS:
			return Color(0.3, 0.8, 0.35)
		BattleTypes.Type.ROCK:
			return Color(0.65, 0.55, 0.4)
		_:
			return Color(0.8, 0.8, 0.8)


func _build_move_buttons() -> void:
	for child in _moves.get_children():
		child.queue_free()
	var moves: Array = _battle.player.moves
	for i in range(moves.size()):
		var m: MoveData = moves[i]
		var btn := Button.new()
		btn.name = "Move%d" % i
		btn.text = "%s (%s %d)" % [m.name, BattleTypes.type_name(m.type), m.power]
		btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var idx: int = i
		btn.pressed.connect(func() -> void: _on_move_pressed(idx))
		_moves.add_child(btn)


func _on_move_pressed(index: int) -> void:
	if _busy or _battle.is_over():
		return
	_busy = true
	# Enemy always uses first move for predictable demo (still speed-ordered)
	var summary: Dictionary = _battle.resolve_turn(index, 0)
	_apply_summary(summary)
	_busy = false


func _apply_summary(summary: Dictionary) -> void:
	if summary.has("error"):
		_refresh_ui(str(summary["error"]))
		return
	var lines: PackedStringArray = PackedStringArray()
	if summary.get("player_first", true):
		lines.append("You moved first (higher Speed).")
	else:
		lines.append("Foe moved first (higher Speed).")
	for action in summary.get("actions", []):
		var a: Dictionary = action
		var line: String = "%s used %s → %d dmg" % [a["attacker"], a["move"], a["damage"]]
		if a.get("effectiveness") == "super_effective":
			line += " (super effective!)"
		elif a.get("effectiveness") == "not_very_effective":
			line += " (not very effective)"
		lines.append(line)
	_refresh_ui("\n".join(lines))

	if _battle.is_over():
		_set_moves_enabled(false)
		_return_btn.visible = true
		if _battle.outcome == BattleState.Outcome.PLAYER_WIN:
			_result.text = "YOU WIN!"
			_result.modulate = Color(0.4, 1.0, 0.5)
		else:
			_result.text = "YOU LOSE..."
			_result.modulate = Color(1.0, 0.45, 0.4)


func _refresh_ui(log_text: String) -> void:
	_player_name.text = "%s  Lv%d  [%s]" % [
		_battle.player.name, _battle.player.level, BattleTypes.type_name(_battle.player.type)
	]
	_enemy_name.text = "%s  Lv%d  [%s]" % [
		_battle.enemy.name, _battle.enemy.level, BattleTypes.type_name(_battle.enemy.type)
	]
	_player_hp.text = "HP %d / %d" % [_battle.player.hp, _battle.player.max_hp]
	_enemy_hp.text = "HP %d / %d" % [_battle.enemy.hp, _battle.enemy.max_hp]
	_player_bar.max_value = _battle.player.max_hp
	_player_bar.value = _battle.player.hp
	_enemy_bar.max_value = _battle.enemy.max_hp
	_enemy_bar.value = _battle.enemy.hp
	_log.text = log_text


func _set_moves_enabled(enabled: bool) -> void:
	for child in _moves.get_children():
		if child is Button:
			(child as Button).disabled = not enabled


func _on_return() -> void:
	var result: String = _battle.outcome_name()
	GameState.end_battle(result)


## Used by MCP / tests: pick move 0 without UI click.
func mcp_pick_move(index: int = 0) -> Dictionary:
	if _battle == null or _battle.is_over():
		return {"ok": false, "reason": "battle_over_or_missing"}
	var summary: Dictionary = _battle.resolve_turn(index, 0)
	_apply_summary(summary)
	return {"ok": true, "summary": summary}
