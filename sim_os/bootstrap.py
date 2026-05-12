"""Locate ``sim_os_panel`` static root and start ``ModBridge`` once."""

from __future__ import annotations

import threading
from pathlib import Path

from . import log_sink

_bridge = None  # Holds :class:`~sim_os.bridge.server.ModBridge` once started.
_bridge_url: str | None = None
_bridge_lock = threading.Lock()

_PANEL_DIR = Path("~/Documents/Electronic Arts/The Sims 4/Mods/sim_os/sim_os_panel")

def resolve_static_root() -> Path | None:
    resolved = _PANEL_DIR.expanduser().resolve()
    return resolved if resolved.is_dir() else None


def ensure_bridge_started() -> str | None:
    """Bind HTTP+WS listener, attach :mod:`~sim_os.log_sink`, emit startup logs."""
    global _bridge, _bridge_url

    with _bridge_lock:
        if _bridge_url is not None:
            return _bridge_url

        root = resolve_static_root()
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

        return panel_url
