class_name BattleTypes
extends RefCounted
## Original type system for Creature Quest (not Nintendo IP).
## Small chart: Normal, Fire, Water, Grass, Rock.

enum Type {
	NORMAL = 0,
	FIRE = 1,
	WATER = 2,
	GRASS = 3,
	ROCK = 4,
}

const TYPE_NAMES := {
	Type.NORMAL: "Normal",
	Type.FIRE: "Fire",
	Type.WATER: "Water",
	Type.GRASS: "Grass",
	Type.ROCK: "Rock",
}

## attack_type -> defend_type -> multiplier
## Super-effective = 2.0, resist = 0.5, immune not used.
static func type_multiplier(attack_type: int, defend_type: int) -> float:
	# Fire
	if attack_type == Type.FIRE:
		if defend_type == Type.GRASS:
			return 2.0
		if defend_type == Type.WATER or defend_type == Type.ROCK or defend_type == Type.FIRE:
			return 0.5
		return 1.0
	# Water
	if attack_type == Type.WATER:
		if defend_type == Type.FIRE or defend_type == Type.ROCK:
			return 2.0
		if defend_type == Type.WATER or defend_type == Type.GRASS:
			return 0.5
		return 1.0
	# Grass
	if attack_type == Type.GRASS:
		if defend_type == Type.WATER or defend_type == Type.ROCK:
			return 2.0
		if defend_type == Type.FIRE or defend_type == Type.GRASS:
			return 0.5
		return 1.0
	# Rock
	if attack_type == Type.ROCK:
		if defend_type == Type.FIRE:
			return 2.0
		if defend_type == Type.WATER or defend_type == Type.GRASS or defend_type == Type.ROCK:
			return 0.5
		return 1.0
	# Normal
	return 1.0


static func type_name(t: int) -> String:
	return TYPE_NAMES.get(t, "Unknown")
