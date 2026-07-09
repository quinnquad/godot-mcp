extends CharacterBody2D
## Top-down overworld player. Actions: move_up/down/left/right.

@export var speed: float = 120.0

@onready var _sprite: ColorRect = $Visual


func _physics_process(_delta: float) -> void:
	var dir := Vector2(
		Input.get_axis("move_left", "move_right"),
		Input.get_axis("move_up", "move_down")
	)
	if dir.length_squared() > 1.0:
		dir = dir.normalized()
	velocity = dir * speed
	move_and_slide()

	if dir != Vector2.ZERO and _sprite != null:
		# Tiny facing tint so MCP/screenshots show motion intent
		_sprite.color = Color(0.95, 0.35, 0.25, 1.0)
	elif _sprite != null:
		_sprite.color = Color(0.9, 0.3, 0.2, 1.0)
