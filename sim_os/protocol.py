"""Wire protocol constants and structured log payloads (WebSocket JSON).

Synced with panel expectations in ``panel/src/features/logs/types.ts``.
"""

from __future__ import annotations

import time
from typing import Any, TypedDict

# Prefer default port fallback in bridge; mirror in ``panel/vite.config.ts``.
DEFAULT_BRIDGE_PORT = 8765

# WebSocket envelope ``type`` field (see docs/mod-browser-bridge.md).
WS_MSG_LOG = "log"
WS_MSG_PING = "ping"

# Canonical log severity strings (parallel to TS ``LogLevel``).
LOG_LEVEL_INFO = "info"
LOG_LEVEL_DEBUG = "debug"
LOG_LEVEL_WARN = "warn"
LOG_LEVEL_ERROR = "error"


def build_log_envelope(
    *, level: str, key: str, message: str, **fields: Any
) -> LogEnvelope:
    """One WebSocket UTF-8 JSON line describing a log row (RFC 7493 safe subset)."""
    env: LogEnvelope = {
        "type": WS_MSG_LOG,
        "ts": time.time(),
        "level": _normalize_log_level(level),
        "key": key.strip() or "unknown",
        "message": message,
    }
    if fields:
        env["fields"] = fields
    return env


def _normalize_log_level(level: str) -> str:
    """Return a lowercase level token; unknown values collapse to ``info``."""
    n = level.strip().lower()
    allowed = frozenset(
        {
            LOG_LEVEL_INFO,
            LOG_LEVEL_DEBUG,
            LOG_LEVEL_WARN,
            LOG_LEVEL_ERROR,
        }
    )
    return n if n in allowed else LOG_LEVEL_INFO


class _LogEnvelopeBase(TypedDict):
    """Wire shape for ``WS_MSG_LOG`` (see ``panel RawLogEnvelope``)."""

    type: str
    ts: float
    level: str
    key: str
    message: str


class LogEnvelope(_LogEnvelopeBase, total=False):
    fields: dict[str, Any]
