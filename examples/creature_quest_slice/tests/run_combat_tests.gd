extends SceneTree
## Headless combat unit tests — call shipped combat modules only.
## Run: godot --headless --path <project> --script res://tests/run_combat_tests.gd

var _failed: int = 0
var _passed: int = 0


func _init() -> void:
	print("=== Creature Quest combat tests ===")
	_test_type_chart()
	_test_damage_super_effective()
	_test_damage_resist()
	_test_speed_order_player_first()
	_test_speed_order_enemy_first()
	_test_faint_player_win()
	_test_faint_player_lose()
	_test_damage_uses_attack_defense_level()
	print("=== Results: %d passed, %d failed ===" % [_passed, _failed])
	var code: int = 0 if _failed == 0 else 1
	quit(code)


func _assert(cond: bool, msg: String) -> void:
	if cond:
		_passed += 1
		print("  PASS: ", msg)
	else:
		_failed += 1
		print("  FAIL: ", msg)


func _test_type_chart() -> void:
	print("-- type chart --")
	_assert(
		is_equal_approx(BattleTypes.type_multiplier(BattleTypes.Type.FIRE, BattleTypes.Type.GRASS), 2.0),
		"Fire vs Grass = 2.0"
	)
	_assert(
		is_equal_approx(BattleTypes.type_multiplier(BattleTypes.Type.FIRE, BattleTypes.Type.WATER), 0.5),
		"Fire vs Water = 0.5"
	)
	_assert(
		is_equal_approx(BattleTypes.type_multiplier(BattleTypes.Type.WATER, BattleTypes.Type.FIRE), 2.0),
		"Water vs Fire = 2.0"
	)
	_assert(
		is_equal_approx(BattleTypes.type_multiplier(BattleTypes.Type.NORMAL, BattleTypes.Type.ROCK), 1.0),
		"Normal vs Rock = 1.0"
	)


func _test_damage_super_effective() -> void:
	print("-- super-effective damage --")
	var atk := CreatureDB.make_emberpup(5)
	var dfn := CreatureDB.make_leafcub(5)
	var move := CreatureDB.move_ember_rush()
	var se := DamageCalc.calculate(atk, dfn, move)
	var resist_target := CreatureDB.make_tidalkip(5)
	var nv := DamageCalc.calculate(atk, resist_target, move)
	_assert(int(se["damage"]) > 0, "super-effective damage > 0")
	_assert(is_equal_approx(float(se["type_mult"]), 2.0), "super-effective mult is 2.0")
	_assert(
		int(se["damage"]) > int(nv["damage"]),
		"super-effective (%d) > resist (%d)" % [int(se["damage"]), int(nv["damage"])]
	)


func _test_damage_resist() -> void:
	print("-- resist damage --")
	var atk := CreatureDB.make_emberpup(5)
	var dfn := CreatureDB.make_tidalkip(5)
	var move := CreatureDB.move_spark_bite()
	var r := DamageCalc.calculate(atk, dfn, move)
	_assert(is_equal_approx(float(r["type_mult"]), 0.5), "Fire vs Water mult 0.5")
	_assert(int(r["damage"]) >= 1, "resist still deals at least 1")


func _test_speed_order_player_first() -> void:
	print("-- speed: player first --")
	var p := CreatureDB.make_emberpup(5)  # higher speed
	var e := CreatureDB.make_rockbit(5)   # low speed
	# Cap HP so one hit doesn't end fight mid-assertion of order
	p.max_hp = 200
	p.hp = 200
	e.max_hp = 200
	e.hp = 200
	var battle := BattleState.new(p, e)
	var summary: Dictionary = battle.resolve_turn(0, 0)
	_assert(summary.get("player_first", false) == true, "player_first when player.speed >= enemy.speed")
	var actions: Array = summary.get("actions", [])
	_assert(actions.size() >= 1, "at least one action")
	if actions.size() >= 1:
		_assert(actions[0].get("is_player_attack", false) == true, "first action is player attack")


func _test_speed_order_enemy_first() -> void:
	print("-- speed: enemy first --")
	var p := CreatureDB.make_rockbit(5)
	var e := CreatureDB.make_emberpup(5)
	p.max_hp = 200
	p.hp = 200
	e.max_hp = 200
	e.hp = 200
	var battle := BattleState.new(p, e)
	var summary: Dictionary = battle.resolve_turn(0, 0)
	_assert(summary.get("player_first", true) == false, "enemy first when enemy.speed > player.speed")
	var actions: Array = summary.get("actions", [])
	_assert(actions.size() >= 1, "at least one action")
	if actions.size() >= 1:
		_assert(actions[0].get("is_player_attack", true) == false, "first action is enemy attack")


func _test_faint_player_win() -> void:
	print("-- faint → player win --")
	var p := CreatureDB.make_emberpup(10)
	var e := CreatureDB.make_leafcub(1)
	e.max_hp = 5
	e.hp = 5
	p.attack = 50
	var battle := BattleState.new(p, e)
	var summary: Dictionary = battle.resolve_turn(1, 0)  # Ember Rush
	_assert(battle.is_over(), "battle over after decisive hit")
	_assert(battle.outcome == BattleState.Outcome.PLAYER_WIN, "outcome PLAYER_WIN")
	_assert(summary.get("outcome", "") == "win", "summary outcome win")
	_assert(battle.enemy.is_fainted(), "enemy fainted")


func _test_faint_player_lose() -> void:
	print("-- faint → player lose --")
	var p := CreatureDB.make_leafcub(1)
	var e := CreatureDB.make_emberpup(10)
	p.max_hp = 5
	p.hp = 5
	p.speed = 1  # enemy moves first
	e.speed = 99
	e.attack = 50
	var battle := BattleState.new(p, e)
	var summary: Dictionary = battle.resolve_turn(0, 1)
	_assert(battle.is_over(), "battle over after enemy decisive hit")
	_assert(battle.outcome == BattleState.Outcome.PLAYER_LOSE, "outcome PLAYER_LOSE")
	_assert(summary.get("outcome", "") == "lose", "summary outcome lose")
	_assert(battle.player.is_fainted(), "player fainted")


func _test_damage_uses_attack_defense_level() -> void:
	print("-- formula uses Atk/Def/Level --")
	var low := Creature.new("a", "A", BattleTypes.Type.NORMAL, 5, 50, 5, 20, 10, [CreatureDB.move_tackle()])
	var high := Creature.new("b", "B", BattleTypes.Type.NORMAL, 5, 50, 40, 20, 10, [CreatureDB.move_tackle()])
	var tank := Creature.new("t", "T", BattleTypes.Type.NORMAL, 5, 50, 10, 40, 10, [])
	var glass := Creature.new("g", "G", BattleTypes.Type.NORMAL, 5, 50, 10, 5, 10, [])
	var move := CreatureDB.move_tackle()
	var d_low := int(DamageCalc.calculate(low, glass, move)["damage"])
	var d_high := int(DamageCalc.calculate(high, glass, move)["damage"])
	_assert(d_high > d_low, "higher Attack deals more (%d > %d)" % [d_high, d_low])
	var d_tank := int(DamageCalc.calculate(high, tank, move)["damage"])
	var d_glass := int(DamageCalc.calculate(high, glass, move)["damage"])
	_assert(d_glass > d_tank, "lower Defense takes more (%d > %d)" % [d_glass, d_tank])
	var young := Creature.new("y", "Y", BattleTypes.Type.NORMAL, 1, 50, 20, 10, 10, [move])
	var old := Creature.new("o", "O", BattleTypes.Type.NORMAL, 20, 50, 20, 10, 10, [move])
	var d_young := int(DamageCalc.calculate(young, glass, move)["damage"])
	var d_old := int(DamageCalc.calculate(old, glass, move)["damage"])
	_assert(d_old > d_young, "higher Level deals more (%d > %d)" % [d_old, d_young])
