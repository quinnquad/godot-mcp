class_name CreatureDB
extends RefCounted
## Original creatures and moves for the vertical slice (no Nintendo names).


static func move_spark_bite() -> MoveData:
	return MoveData.new("spark_bite", "Spark Bite", BattleTypes.Type.FIRE, 40)


static func move_ember_rush() -> MoveData:
	return MoveData.new("ember_rush", "Ember Rush", BattleTypes.Type.FIRE, 55)


static func move_tide_slap() -> MoveData:
	return MoveData.new("tide_slap", "Tide Slap", BattleTypes.Type.WATER, 40)


static func move_splash_jet() -> MoveData:
	return MoveData.new("splash_jet", "Splash Jet", BattleTypes.Type.WATER, 55)


static func move_leaf_nudge() -> MoveData:
	return MoveData.new("leaf_nudge", "Leaf Nudge", BattleTypes.Type.GRASS, 40)


static func move_vine_snap() -> MoveData:
	return MoveData.new("vine_snap", "Vine Snap", BattleTypes.Type.GRASS, 55)


static func move_pebble_toss() -> MoveData:
	return MoveData.new("pebble_toss", "Pebble Toss", BattleTypes.Type.ROCK, 40)


static func move_tackle() -> MoveData:
	return MoveData.new("tackle", "Tackle", BattleTypes.Type.NORMAL, 35)


## Starter: fire cub — slightly faster than average.
static func make_emberpup(level: int = 5) -> Creature:
	return Creature.new(
		"emberpup",
		"Emberpup",
		BattleTypes.Type.FIRE,
		level,
		22 + level * 2,
		12 + level,
		9 + level,
		12 + level,
		[move_spark_bite(), move_ember_rush(), move_tackle()]
	)


## Wild grass-type — weak to fire (good demo of super-effective).
static func make_leafcub(level: int = 5) -> Creature:
	return Creature.new(
		"leafcub",
		"Leafcub",
		BattleTypes.Type.GRASS,
		level,
		20 + level * 2,
		10 + level,
		10 + level,
		10 + level,
		[move_leaf_nudge(), move_vine_snap(), move_tackle()]
	)


## Wild water-type — resists fire.
static func make_tidalkip(level: int = 5) -> Creature:
	return Creature.new(
		"tidalkip",
		"Tidalkip",
		BattleTypes.Type.WATER,
		level,
		21 + level * 2,
		11 + level,
		11 + level,
		9 + level,
		[move_tide_slap(), move_splash_jet(), move_tackle()]
	)


## Slow rock-type for speed-order demos.
static func make_rockbit(level: int = 5) -> Creature:
	return Creature.new(
		"rockbit",
		"Rockbit",
		BattleTypes.Type.ROCK,
		level,
		24 + level * 2,
		13 + level,
		14 + level,
		6 + level,
		[move_pebble_toss(), move_tackle()]
	)


static func make_wild_for_encounter(seed_value: int = -1) -> Creature:
	var rng := RandomNumberGenerator.new()
	if seed_value >= 0:
		rng.seed = seed_value
	else:
		rng.randomize()
	var pick: int = rng.randi_range(0, 2)
	var level: int = rng.randi_range(4, 6)
	match pick:
		0:
			return make_leafcub(level)
		1:
			return make_tidalkip(level)
		_:
			return make_rockbit(level)
