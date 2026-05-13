"""Enqueue structured logs for the bridge WebSocket subscriber.

Implementations consume :func:`attach_log_queue`; until attached, emits are dropped.
"""

from __future__ import annotations

import json
import queue
import typing

from .envelope import build_log_envelope

_sink: typing.Optional[queue.Queue[str]] = None


def attach_log_queue(q: queue.Queue[str]) -> None:
    global _sink
    _sink = q


def is_ready() -> bool:
    return _sink is not None


def emit(
    message: str,
    *,
    level: str,
    key: str,
    **fields: typing.Any,
) -> None:
    if _sink is None:
        return
    envelope = build_log_envelope(level=level, key=key, message=message, **fields)
    line = json.dumps(envelope, separators=(",", ":"), sort_keys=False)
    try:
        _sink.put_nowait(line)
    except queue.Full:
        pass
