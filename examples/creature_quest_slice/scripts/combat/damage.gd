class_name DamageCalc
extends RefCounted
## Pokémon-like damage (simplified Gen formula, original constants).
## damage = floor(((2*L/5+2) * Power * Atk/Def) / 50 + 2) * type_mult
## Minimum 1 when power > 0 and type_mult > 0.

static func calculate(
	attacker: Creature,
	defender: Creature,
	move: MoveData
) -> Dictionary:
	## Returns { damage: int, type_mult: float, effectiveness: String }
	var type_mult: float = BattleTypes.type_multiplier(move.type, defender.type)
	var effectiveness: String = _effectiveness_label(type_mult)

	if move.power <= 0 or type_mult <= 0.0:
		return {
			"damage": 0,
			"type_mult": type_mult,
			"effectiveness": effectiveness,
		}

	var level_term: float = (2.0 * float(attacker.level) / 5.0) + 2.0
	var atk: float = float(maxi(1, attacker.attack))
	var defn: float = float(maxi(1, defender.defense))
	var base: float = ((level_term * float(move.power) * atk / defn) / 50.0) + 2.0
	var raw: float = base * type_mult
	var dmg: int = maxi(1, int(floor(raw)))

	return {
		"damage": dmg,
		"type_mult": type_mult,
		"effectiveness": effectiveness,
	}


static func _effectiveness_label(mult: float) -> String:
	if mult > 1.0:
		return "super_effective"
	if mult < 1.0 and mult > 0.0:
		return "not_very_effective"
	if mult <= 0.0:
		return "no_effect"
	return "normal"
