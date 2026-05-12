"""Periodic snapshot of instanced Sims → structured WebSocket log rows (`fields.state`)."""

from __future__ import annotations

import typing

import alarms
from alarms import AlarmHandle
from clock import interval_in_real_seconds

from . import log_sink
from .schemas.wire import world_state_to_wire
from .sim_state import get_world_state

_POLL_REAL_SECONDS = 1.0

_alarm_owner: typing.Optional[_AlarmOwner] = None
_probe_alarm: typing.Optional[AlarmHandle] = None
_started = False


def start_game_state_logging() -> None:
    """Begin repeating real-time polls that emit one log envelope per snapshot."""
    global _started, _alarm_owner, _probe_alarm
    if _started:
        return
    _started = True
    _alarm_owner = _AlarmOwner()
    owner = _alarm_owner

    _cancel_probe()
    try:
        _probe_alarm = alarms.add_alarm_real_time(
            owner,
            interval_in_real_seconds(_POLL_REAL_SECONDS),
            _on_poll_fire,
            repeating=True,
            use_sleep_time=False,
        )
    except Exception:
        _probe_alarm = None


def _cancel_probe() -> None:
    global _probe_alarm
    if _probe_alarm is not None:
        try:
            alarms.cancel_alarm(_probe_alarm)
        except Exception:
            pass
        _probe_alarm = None


def _on_poll_fire(_handle: AlarmHandle) -> None:
    try:
        world = get_world_state()
        wire = world_state_to_wire(world)
        n = len(wire.get("sims") or [])
        log_sink.emit(
            f"game_state instanced_sims={n}",
            level="info",
            key="sim_os.game_state",
            state=wire,
        )
    except Exception:
        pass


class _AlarmOwner:
    """Handle identity for ``alarms.add_alarm_real_time``."""
