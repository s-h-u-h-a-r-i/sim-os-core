"""Periodic snapshot of instanced Sims → structured WebSocket log rows (`fields.state`)."""

from __future__ import annotations

import typing

import alarms
from alarms import AlarmHandle
from clock import interval_in_real_seconds

from ..protocol import log_sink
from ..subsystems.sims import get_world_state
from ..subsystems.sims.wire import world_state_to_wire

_POLL_REAL_SECONDS = 1.0

_alarm_owner: typing.Optional[_AlarmOwner] = None
_probe_alarm: typing.Optional[AlarmHandle] = None
_started = False

# sim_id_str → frozenset of active interaction class_names from the previous tick
_prev_active: typing.Dict[str, typing.FrozenSet[str]] = {}
# sim_id_str → full name from the previous tick (for off-lot sims that disappear)
_prev_names: typing.Dict[str, str] = {}


def start_game_state_logging() -> None:
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
            "game_state instanced_sims={}".format(n),
            level="info",
            key="sim_os.game_state",
            state=wire,
        )
        _emit_interaction_events(wire)
    except Exception:
        pass


def _fmt_interaction(class_name: str) -> str:
    import re
    s = re.sub(r"([A-Z])", r" \1", class_name)
    s = re.sub(r"[_\-]+", " ", s)
    return re.sub(r"\s{2,}", " ", s).strip()


def _emit_interaction_events(wire: typing.Any) -> None:
    sims = wire.get("sims") or []
    current_ids: typing.Set[str] = set()

    for sim in sims:
        sim_id = sim.get("sim_id_str", "")
        if not sim_id:
            continue
        current_ids.add(sim_id)

        first = sim.get("first_name") or ""
        last = sim.get("last_name") or ""
        name = "{} {}".format(first, last).strip() or sim_id
        _prev_names[sim_id] = name

        active_now: typing.FrozenSet[str] = frozenset(
            i["class_name"]
            for i in (sim.get("interactions_running") or [])
            if i.get("category") == "active"
        )
        active_prev = _prev_active.get(sim_id)

        if active_prev is None:
            # First time we see this sim — no diff, just record baseline
            _prev_active[sim_id] = active_now
            continue

        for cn in active_now - active_prev:
            log_sink.emit(
                "{} started {}".format(name, _fmt_interaction(cn)),
                level="info",
                key="sim_os.interaction.started",
                sim_id=sim_id,
                class_name=cn,
            )
        for cn in active_prev - active_now:
            log_sink.emit(
                "{} stopped {}".format(name, _fmt_interaction(cn)),
                level="info",
                key="sim_os.interaction.stopped",
                sim_id=sim_id,
                class_name=cn,
            )

        _prev_active[sim_id] = active_now

    # Sims that left the lot
    for sim_id in list(_prev_active):
        if sim_id not in current_ids:
            name = _prev_names.pop(sim_id, sim_id)
            log_sink.emit(
                "{} left the lot".format(name),
                level="info",
                key="sim_os.sim.left_lot",
                sim_id=sim_id,
            )
            del _prev_active[sim_id]


class _AlarmOwner:
    """Handle identity for ``alarms.add_alarm_real_time``."""
