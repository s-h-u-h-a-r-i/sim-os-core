"""WebSocket protocol: constants, log envelope, and log sink."""

from __future__ import annotations

from . import log_sink
from .constants import (
    DEFAULT_BRIDGE_PORT,
    LOG_LEVEL_DEBUG,
    LOG_LEVEL_ERROR,
    LOG_LEVEL_INFO,
    LOG_LEVEL_WARN,
    WS_MSG_LOG,
    WS_MSG_PING,
)
from .envelope import build_log_envelope

__all__ = (
    "DEFAULT_BRIDGE_PORT",
    "WS_MSG_LOG",
    "WS_MSG_PING",
    "LOG_LEVEL_INFO",
    "LOG_LEVEL_DEBUG",
    "LOG_LEVEL_WARN",
    "LOG_LEVEL_ERROR",
    "build_log_envelope",
    "log_sink",
)
