"""WebSocket protocol constants (mirrored in ``panel/src/features/logs/types.ts``)."""

from __future__ import annotations

DEFAULT_BRIDGE_PORT = 8765

WS_MSG_LOG = "log"
WS_MSG_PING = "ping"

LOG_LEVEL_INFO = "info"
LOG_LEVEL_DEBUG = "debug"
LOG_LEVEL_WARN = "warn"
LOG_LEVEL_ERROR = "error"
