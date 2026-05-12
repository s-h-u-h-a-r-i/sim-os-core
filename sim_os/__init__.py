"""sim_os TS4 scripting mod — browser panel companion.

Imported by the game as ``sim_os``. :mod:`~sim_os.hooks` patches zone load so the
bridge starts on the game thread after Live mode is ready.

Submodules::

    hooks      — ``VenueService.on_loading_screen_animation_finished``
    protocol   — :data:`~sim_os.protocol.DEFAULT_BRIDGE_PORT`, WS envelope helpers
    log_sink   — :func:`~sim_os.log_sink.emit` → WebSocket queues
    bridge     — HTTP static + WS (:class:`~sim_os.bridge.server.ModBridge`)
    bootstrap  — static root + bridge start (:func:`~sim_os.bootstrap.ensure_bridge_started`)
"""

from __future__ import annotations

from . import hooks
from . import bootstrap
from . import bridge
from . import log_sink
from . import protocol

__all__ = (
    "bootstrap",
    "bridge",
    "hooks",
    "log_sink",
    "protocol",
)
