"""Enqueue structured logs for the bridge WebSocket subscriber.

Implementations consume :func:`attach_log_queue`; until attached, emits are dropped.
"""

from __future__ import annotations

import json
import queue
import typing

from .protocol import build_log_envelope

_sink: queue.Queue[str] | None = None


def attach_log_queue(q: queue.Queue[str]) -> None:
    global _sink
    _sink = q


def detach_log_queue() -> None:
    global _sink
    _sink = None


def emit(
    message: str,
    *,
    level: str,
    key: str,
    **fields: typing.Any,
) -> None:
    """Record one log row (timestamp + level + source key + optional fields)."""
    if _sink is None:
        return
    envelope = build_log_envelope(level=level, key=key, message=message, **fields)
    line = json.dumps(envelope, separators=(",", ":"), sort_keys=False)
    try:
        _sink.put_nowait(line)
    except queue.Full:
        pass


def emit_mapping(payload: typing.Mapping[str, typing.Any]) -> None:
    """Emit from an already-validated envelope-like mapping (advanced / tests)."""
    if _sink is None:
        return
    try:
        line = json.dumps(dict(payload), separators=(",", ":"))
    except (TypeError, ValueError):
        return
    try:
        _sink.put_nowait(line)
    except queue.Full:
        pass
