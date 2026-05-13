"""Structured log envelope: TypedDict shape and builder."""

from __future__ import annotations

import time
import typing

from .constants import (
    LOG_LEVEL_DEBUG,
    LOG_LEVEL_ERROR,
    LOG_LEVEL_INFO,
    LOG_LEVEL_WARN,
    WS_MSG_LOG,
)

if typing.TYPE_CHECKING:
    class LogEnvelope(typing.TypedDict, total=False):
        type: str
        ts: float
        level: str
        key: str
        message: str
        fields: typing.Dict[str, typing.Any]


def build_log_envelope(
    *, level: str, key: str, message: str, **fields: typing.Any
) -> LogEnvelope:
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
    n = level.strip().lower()
    allowed = frozenset({LOG_LEVEL_INFO, LOG_LEVEL_DEBUG, LOG_LEVEL_WARN, LOG_LEVEL_ERROR})
    return n if n in allowed else LOG_LEVEL_INFO
