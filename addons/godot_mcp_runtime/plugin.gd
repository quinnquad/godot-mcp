@tool
extends EditorPlugin

const AUTOLOAD_NAME := "GodotMCPRuntime"
const AUTOLOAD_PATH := "res://addons/godot_mcp_runtime/runtime_server.gd"

func _enter_tree() -> void:
	add_autoload_singleton(AUTOLOAD_NAME, AUTOLOAD_PATH)
	print("[GodotMCPRuntime] Plugin enabled — autoload 'GodotMCPRuntime' registered automatically")

func _exit_tree() -> void:
	remove_autoload_singleton(AUTOLOAD_NAME)
	print("[GodotMCPRuntime] Plugin disabled — autoload removed")
