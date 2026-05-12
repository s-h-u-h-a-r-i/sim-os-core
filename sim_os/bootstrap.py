"""Locate ``sim_os_panel`` static root and start ``ModBridge`` once."""

from __future__ import annotations

import threading
import typing
from pathlib import Path

from . import log_sink
from .bridge.server import ModBridge

_bridge: typing.Optional[ModBridge] = None
_bridge_url: typing.Optional[str] = None
_bridge_lock = threading.Lock()

_PANEL_DIR = Path("~/Documents/Electronic Arts/The Sims 4/Mods/sim_os/sim_os_panel")


def ensure_bridge_started() -> typing.Optional[str]:
    """Bind HTTP+WS listener, attach :mod:`~sim_os.log_sink`, emit startup logs."""
    global _bridge, _bridge_url

    with _bridge_lock:
        if _bridge_url is not None:
            return _bridge_url

        root = _resolve_static_root()
        if root is None:
            return None

        from .bridge import create_bridge

        bridge_inst = create_bridge(static_root=root)
        panel_url = bridge_inst.start()

        _bridge = bridge_inst
        _bridge_url = panel_url

        log_sink.emit(
            "Bridge online — first streamed game log.",
            level="info",
            key="sim_os.startup",
        )

        from .state_poll import start_game_state_logging

        start_game_state_logging()

        return panel_url


def _resolve_static_root() -> typing.Optional[Path]:
    resolved = _PANEL_DIR.expanduser().resolve()
    return resolved if resolved.is_dir() else None
