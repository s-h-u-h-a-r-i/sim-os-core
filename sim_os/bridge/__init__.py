"""HTTP static host + WebSocket multiplexing."""

from __future__ import annotations

from .server import ModBridge, create_bridge

__all__ = ("ModBridge", "create_bridge")
